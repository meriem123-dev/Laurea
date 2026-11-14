import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Cursus, Prisma, ProjectStatus, Role } from "../generated/prisma/client";
import { UpsertMyScoresDto } from "./dto/upsert-my-scores.dto";
import { UpdateDeliberationDto } from "./dto/update-deliberation.dto";
import { juryAverage, weightedGrade } from "./grading.utils";

type AuthUser = { id: string; role: Role };

const DEFAULT_GRID = [
  {
    key: "demarche",
    label: "Démarche et méthode",
    description: "Problématique, état de l'art, méthodologie suivie",
    coefficient: 3,
    position: 1,
  },
  {
    key: "qualite",
    label: "Qualité de la solution / résultats",
    description: "Pertinence technique, résultats obtenus, validation",
    coefficient: 5,
    position: 2,
  },
  {
    key: "presentation",
    label: "Présentation",
    description: "Clarté, structure, respect du temps, supports",
    coefficient: 3,
    position: 3,
  },
  {
    key: "memoire",
    label: "Mémoire",
    description: "Qualité rédactionnelle, structure, références",
    coefficient: 4,
    position: 4,
  },
  {
    key: "reponses",
    label: "Réponses",
    description: "Pertinence des réponses aux questions du jury",
    coefficient: 5,
    position: 5,
  },
];

@Injectable()
export class GradingService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // s'exécute à chaque démarrage : crée les critères manquants, ne touche jamais à ceux qui existent
  async onModuleInit() {
    for (const c of DEFAULT_GRID) {
      await this.prisma.criterion.upsert({
        where: { key: c.key },
        update: {},
        create: c,
      });
    }
  }

  //liste critères
  async listCriteria() {
    const criteria = await this.prisma.criterion.findMany({
      orderBy: { position: "asc" },
    });
    return criteria.map((c) => ({
      id: c.id,
      key: c.key,
      label: c.label,
      description: c.description,
      coefficient: c.coefficient,
    }));
  }

  // ---------- lecture evaluation ----------

  async getEvaluation(defenseId: number, user: AuthUser) {
    const defense = await this.loadDefense(defenseId);
    const teacher = await this.teacherOf(user.id);
    const teacherId = teacher?.id ?? null;
    const isJuror =
      teacherId !== null && this.juryIds(defense).includes(teacherId);

    if (
      user.role === Role.TEACHER &&
      !isJuror &&
      !this.isSupervisorOf(defense, teacherId)
    ) {
      throw new ForbiddenException("Vous n'avez pas accès à cette soutenance.");
    }
    return this.buildView(defense, teacherId);
  }

  // ---------- saisie des notes (chaque juré, sa propre colonne) ----------

  async saveMyScores(
    defenseId: number,
    userId: string,
    dto: UpsertMyScoresDto,
  ) {
    const defense = await this.loadDefense(defenseId);
    const teacher = await this.requireJuror(defense, userId);

    if (defense.evaluation?.locked) {
      throw new ConflictException("La note est verrouillée.");
    }

    const criteria = await this.criteriaOf();
    const validIds = new Set(criteria.map((c) => c.id));
    for (const item of dto.scores) {
      if (!validIds.has(item.criterionId)) {
        throw new BadRequestException(`Critère inconnu : ${item.criterionId}`);
      }
    }

    await this.prisma.$transaction(
      dto.scores.map((item) =>
        item.value === null
          ? this.prisma.defenseScore.deleteMany({
              where: {
                defenseId,
                teacherId: teacher.id,
                criterionId: item.criterionId,
              },
            })
          : this.prisma.defenseScore.upsert({
              where: {
                defenseId_teacherId_criterionId: {
                  defenseId,
                  teacherId: teacher.id,
                  criterionId: item.criterionId,
                },
              },
              create: {
                defenseId,
                teacherId: teacher.id,
                criterionId: item.criterionId,
                value: item.value,
              },
              update: { value: item.value },
            }),
      ),
    );

    return this.getEvaluation(defenseId, { id: userId, role: Role.TEACHER });
  }

  // ---------- délibération (président uniquement) ----------

  async updateDeliberation(
    defenseId: number,
    userId: string,
    dto: UpdateDeliberationDto,
  ) {
    const defense = await this.loadDefense(defenseId);
    await this.requirePresident(defense, userId);

    if (defense.evaluation?.locked) {
      throw new ConflictException("La note est verrouillée.");
    }

    const data = {
      ...(dto.finalGrade !== undefined && { finalGrade: dto.finalGrade }),
      ...(dto.justification !== undefined && {
        justification: dto.justification,
      }),
      ...(dto.observations !== undefined && { observations: dto.observations }),
    };

    await this.prisma.defenseEvaluation.upsert({
      where: { defenseId },
      create: { defenseId, ...data },
      update: data,
    });

    return this.getEvaluation(defenseId, { id: userId, role: Role.TEACHER });
  }

  // ---------- verrouillage (président uniquement, recalcul côté serveur) ----------

  async lock(defenseId: number, userId: string) {
    const defense = await this.loadDefense(defenseId);
    const president = await this.requirePresident(defense, userId);

    if (defense.evaluation?.locked) {
      throw new ConflictException("La note est déjà verrouillée.");
    }

    const view = await this.buildView(defense, president.id);
    if (view.average === null) {
      throw new BadRequestException(
        "Tous les jurés doivent d'abord compléter leur grille.",
      );
    }

    const finalGrade = defense.evaluation?.finalGrade ?? view.average;
    const deviation = Math.abs(finalGrade - view.average) > 0.001;
    if (deviation && !(defense.evaluation?.justification ?? "").trim()) {
      throw new BadRequestException(
        "Justifiez l'ajustement de la note pour pouvoir valider.",
      );
    }

    await this.prisma.$transaction([
      this.prisma.defenseEvaluation.upsert({
        where: { defenseId },
        create: {
          defenseId,
          finalGrade,
          locked: true,
          lockedAt: new Date(),
          lockedById: president.id,
        },
        update: {
          finalGrade,
          locked: true,
          lockedAt: new Date(),
          lockedById: president.id,
        },
      }),
      // workflow : soutenu -> noté
      this.prisma.project.update({
        where: { id: defense.projectId },
        data: { status: ProjectStatus.graded },
      }),
    ]);

    return this.getEvaluation(defenseId, { id: userId, role: Role.TEACHER });
  }

  // ---------- helpers ----------

  private async loadDefense(defenseId: number) {
    const defense = await this.prisma.defense.findUnique({
      where: { id: defenseId },
      include: {
        president: { include: { user: true } },
        members: {
          include: { teacher: { include: { user: true } } },
          orderBy: { position: "asc" },
        },
        project: { include: { students: { include: { user: true } } } },
        room: true,
        evaluation: true,
        scores: true,
      },
    });
    if (!defense) throw new NotFoundException("Soutenance introuvable.");
    return defense;
  }

  // check si on est encadrant
  private isSupervisorOf(
    defense: Awaited<ReturnType<GradingService["loadDefense"]>>,
    teacherId: string | null,
  ) {
    return (
      teacherId !== null &&
      [defense.project.supervisorId, defense.project.coSupervisorId].includes(
        teacherId,
      )
    );
  }

    // check si on est teacher
  private teacherOf(userId: string) {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }

  private juryIds(defense: Awaited<ReturnType<GradingService["loadDefense"]>>) {
    return [defense.presidentId, ...defense.members.map((m) => m.teacherId)];
  }

    // check si on est jury
  private async requireJuror(
    defense: Awaited<ReturnType<GradingService["loadDefense"]>>,
    userId: string,
  ) {
    const teacher = await this.teacherOf(userId);
    if (!teacher || !this.juryIds(defense).includes(teacher.id)) {
      throw new ForbiddenException(
        "Vous n'êtes pas membre du jury de cette soutenance.",
      );
    }
    return teacher;
  }

    // check si on est president
  private async requirePresident(
    defense: Awaited<ReturnType<GradingService["loadDefense"]>>,
    userId: string,
  ) {
    const teacher = await this.teacherOf(userId);
    if (!teacher || teacher.id !== defense.presidentId) {
      throw new ForbiddenException(
        "Seul le président du jury peut effectuer cette action.",
      );
    }
    return teacher;
  }

  //recup critéres
  private criteriaOf() {
    return this.prisma.criterion.findMany({ orderBy: { position: "asc" } });
  }

  // tous les champs pour le front
  private async buildView(
    defense: Awaited<ReturnType<GradingService["loadDefense"]>>,
    currentTeacherId: string | null,
  ) {
    const criteria = await this.criteriaOf();

    const jury = [
      { teacher: defense.president, role: "president" as const },
      ...defense.members.map((m) => ({
        teacher: m.teacher,
        role: "examiner" as const,
      })),
    ];

    const jurors = jury.map(({ teacher, role }) => {
      const scores: Record<string, number> = {};
      for (const s of defense.scores) {
        if (s.teacherId === teacher.id) scores[s.criterionId] = s.value;
      }
      return {
        id: teacher.id,
        title: teacher.title,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        name: `${teacher.title ?? ""} ${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
        role,
        scores,
        filled: Object.keys(scores).length,
        grade: weightedGrade(scores, criteria),
      };
    });

    const average = juryAverage(jurors.map((j) => j.grade));
    const evaluation = defense.evaluation;
    const adjusted = evaluation?.finalGrade != null;
    const finalGrade = evaluation?.finalGrade ?? average;

    const [h, m] = defense.time.split(":").map(Number);
    const endMin = h * 60 + m + defense.duration;
    const endTime = `${String(Math.floor(endMin / 60) % 24).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    return {
      defenseId: defense.id,
      cursus: defense.project.students[0]?.cursus ?? Cursus.MASTER,
      defense: {
        date: defense.date.toISOString().slice(0, 10),
        time: defense.time,
        endTime,
        duration: defense.duration,
        room: {
          name: defense.room.name,
          block: defense.room.block,
          pole: defense.room.pole,
        },
        project: {
          id: defense.project.id,
          title: defense.project.title,
          domain: defense.project.domain,
          academicYear: defense.project.academicYear,
          status: defense.project.status,
        },
        students: defense.project.students.map((s) => ({
          id: s.id,
          firstName: s.user.firstName,
          lastName: s.user.lastName,
          matricule: s.matricule,
          cursus: s.cursus,
          speciality: s.speciality,
        })),
      },
      criteria: criteria.map((c) => ({
        id: c.id,
        label: c.label,
        description: c.description,
        coefficient: c.coefficient,
      })),
      jurors,
      average,
      finalGrade,
      adjusted, // true = le président a modifié la note (sinon la note retenue = la moyenne)
      deviation:
        adjusted &&
        finalGrade !== null &&
        average !== null &&
        Math.abs(finalGrade - average) > 0.001,
      justification: evaluation?.justification ?? "",
      observations: evaluation?.observations ?? "",
      locked: evaluation?.locked ?? false,
      published: evaluation?.publishedAt != null,
      publishedAt: evaluation?.publishedAt ?? null,
      me: {
        teacherId: currentTeacherId,
        isJuror:
          currentTeacherId !== null &&
          jurors.some((j) => j.id === currentTeacherId),
        isPresident:
          currentTeacherId !== null && currentTeacherId === defense.presidentId,
        isSupervisor: this.isSupervisorOf(defense, currentTeacherId),
      },
    };
  }

  // ---------- publication (administration aprés le lock) ----------

  async setPublished(defenseId: number, published: boolean, user: AuthUser) {
    const defense = await this.loadDefense(defenseId);
    if (!defense.evaluation?.locked) {
      throw new BadRequestException(
        "La note doit d'abord être verrouillée par le président du jury.",
      );
    }
    await this.prisma.defenseEvaluation.update({
      where: { defenseId },
      data: { publishedAt: published ? new Date() : null },
    });
    return this.getEvaluation(defenseId, user);
  }



  // ---------- résultats ----------

  private findForResults(where?: Prisma.DefenseWhereInput) {
    return this.prisma.defense.findMany({
      where,
      include: {
        project: { include: { students: { include: { user: true } } } },
        president: { include: { user: true } },
        members: {
          include: { teacher: { include: { user: true } } },
          orderBy: { position: "asc" },
        },
        evaluation: true,
        scores: true,
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });
  }

  private toResultRow(
    d: Awaited<ReturnType<GradingService["findForResults"]>>[number],
    criteria: Awaited<ReturnType<GradingService["criteriaOf"]>>,
  ) {
    const jury = [
      { teacher: d.president, role: "president" as const },
      ...d.members.map((m) => ({
        teacher: m.teacher,
        role: "examiner" as const,
      })),
    ].map(({ teacher, role }) => {
      const scores: Record<string, number> = {};
      for (const s of d.scores) {
        if (s.teacherId === teacher.id) scores[s.criterionId] = s.value;
      }
      return {
        id: teacher.id,
        title: teacher.title,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        role,
        grade: weightedGrade(scores, criteria),
      };
    });

    const evaluation = d.evaluation;
    const locked = evaluation?.locked ?? false;
    // pending = note pas verrouillée, ready = verrouillée mais pas publiée, published = visible par l'étudiant
    const state = !locked
      ? "pending"
      : evaluation?.publishedAt
        ? "published"
        : "ready";

    return {
      defenseId: d.id,
      date: d.date.toISOString().slice(0, 10),
      state,
      finalGrade: locked ? (evaluation?.finalGrade ?? null) : null,
      observations: evaluation?.observations ?? "",
      project: {
        id: d.project.id,
        title: d.project.title,
        domain: d.project.domain,
        academicYear: d.project.academicYear,
      },
      students: d.project.students.map((s) => ({
        id: s.id,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        matricule: s.matricule,
        cursus: s.cursus,
        speciality: s.speciality,
      })),
      jury,
    };
  }

  // administration : toutes les soutenances avec leur état de publication
  async listResults() {
    const [defenses, criteria] = await Promise.all([
      this.findForResults(),
      this.criteriaOf(),
    ]);
    return defenses.map((d) => this.toResultRow(d, criteria));
  }

  // étudiant : rien du tout tant que l'administration n'a pas publié
  async getMyResult(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { project: { select: { defense: { select: { id: true } } } } },
    });
    const defenseId = student?.project?.defense?.id;
    if (!student || defenseId === undefined) {
      return { published: false as const, hasDefense: false };
    }

    const [defense] = await this.findForResults({ id: defenseId });
    const evaluation = defense?.evaluation;
    if (
      !defense ||
      !evaluation?.locked ||
      !evaluation.publishedAt ||
      evaluation.finalGrade === null
    ) {
      return { published: false as const, hasDefense: true };
    }

    const criteria = await this.criteriaOf();
    return {
      published: true as const,
      hasDefense: true,
      studentId: student.id,
      // pondérations uniquement : pas de notes par critère
      criteria: criteria.map((c) => ({
        id: c.id,
        label: c.label,
        description: c.description,
        coefficient: c.coefficient,
      })),
      row: this.toResultRow(defense, criteria),
    };
  }
}
