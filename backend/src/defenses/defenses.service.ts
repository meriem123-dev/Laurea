import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  JuryResponse,
  Prisma,
  ProjectStatus,
  Role,
} from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../auth/mail.service";
import {
  buildDeclineNotice,
  buildNotice,
  buildRecipients,
  teacherLabel,
  type DefenseDetails,
  type NoticeKind,
  type Recipient,
} from "./defense-notice";
import { CreateDefenseDto } from "./dto/create-defense.dto";
import { UpdateDefenseDto } from "./dto/update-defense.dto";
import {
  DAY_END,
  DAY_START,
  DEFAULT_DURATION,
  formatTime,
  fitsInDay,
  isRealDate,
  isWeekend,
  slotsOverlap,
  toSlot,
  isInPast,
} from "./defense.rules";

// jurés dans l'ordre Juré 1, Juré 2, Juré 3 + réponses du jury
const include = {
  members: { orderBy: { position: "asc" } },
  confirmations: { select: { teacherId: true, status: true } },
} as const;
type DefenseWithMembers = Prisma.DefenseGetPayload<{ include: typeof include }>;

// une fois la soutenance passée, on ne peut plus la modifier ni la supprimer
const LOCKED: ProjectStatus[] = ["defended", "graded", "closed"];
// statuts du projet qui permettent de le planifier
const PLANNABLE: ProjectStatus[] = ["validated", "planned"];

// même forme que l'interface Defense du front
// + responses : réponse de chaque membre du jury { [teacherId]: "PENDING" | "ACCEPTED" | "DECLINED" }
// + status : "confirmed" quand tout le jury a accepté, sinon "planned" (comme DefenseStatus du front)
const toApi = (d: DefenseWithMembers) => {
  const memberIds = d.members.map((m) => m.teacherId);
  const responses: Record<string, JuryResponse> = Object.fromEntries(
    d.confirmations.map((c) => [c.teacherId, c.status]),
  );
  const confirmed = [d.presidentId, ...memberIds].every(
    (id) => responses[id] === "ACCEPTED",
  );
  return {
    id: d.id,
    projectId: d.projectId,
    date: d.date.toISOString().slice(0, 10), // "2026-06-18"
    time: d.time,
    duration: d.duration,
    roomId: d.roomId,
    presidentId: d.presidentId,
    memberIds,
    responses,
    status: confirmed ? ("confirmed" as const) : ("planned" as const),
  };
};
export type DefenseApi = ReturnType<typeof toApi>;

// les champs de planification (pour savoir si une modification change vraiment quelque chose)
const planOf = (d: PlanData) =>
  JSON.stringify([
    d.projectId,
    d.date,
    d.time,
    d.duration,
    d.roomId,
    d.presidentId,
    d.memberIds,
  ]);

// lien de réponse envoyé au jury : jeton aléatoire, on ne garde que son hash en base
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const newToken = () => {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: sha256(raw) };
};
// URL publique de l'API : API_URL, sinon celle fournie par Render, sinon le local
const confirmLink = (raw: string) => {
  const base =
    process.env.API_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;
  return `${base.replace(/\/$/, "")}/api/jury-confirmations/${raw}`;
};
const todayISO = () => new Date().toISOString().slice(0, 10);

// "2026-06-18" -> Date (colonne @db.Date)
const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

const teacherName = (t: {
  title: string | null;
  user: { firstName: string; lastName: string };
}) => `${t.title ? `${t.title} ` : ""}${t.user.firstName} ${t.user.lastName}`;

// tout ce qu'il faut pour écrire les mails (étudiants, jury, encadrants, salle)
const withUser = { include: { user: true } } as const;
const detailsInclude = {
  room: true,
  president: withUser,
  members: { orderBy: { position: "asc" }, include: { teacher: withUser } },
  project: {
    include: {
      students: withUser,
      supervisor: withUser,
      coSupervisor: withUser,
    },
  },
} as const;

type PlanData = {
  projectId: string;
  date: string;
  time: string;
  duration: number;
  roomId: string;
  presidentId: string;
  memberIds: string[];
};

@Injectable()
export class DefensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /* ---------- Lecture ---------- */

  // liste triée par date puis heure, filtrable par période, salle ou professeur
  async findAll(filters: {
    from?: string;
    to?: string;
    roomId?: string;
    teacherId?: string;
  }) {
    for (const d of [filters.from, filters.to]) {
      if (d && !isRealDate(d)) {
        throw new BadRequestException("Date invalide (format 2026-06-18)");
      }
    }
    const defenses = await this.prisma.defense.findMany({
      where: {
        date: {
          gte: filters.from ? toDate(filters.from) : undefined,
          lte: filters.to ? toDate(filters.to) : undefined,
        },
        roomId: filters.roomId,
        ...(filters.teacherId && {
          OR: [
            { presidentId: filters.teacherId },
            { members: { some: { teacherId: filters.teacherId } } },
          ],
        }),
      },
      include,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return defenses.map(toApi);
  }

  async findOne(id: number) {
    return toApi(await this.get(id));
  }

  // enseignant : soutenances où il est président, juré, encadrant ou co-encadrant
  // étudiant : la soutenance de son projet (liste vide si pas encore planifiée)
  async findMine(user: { id: string; role: Role }) {
    let where: Prisma.DefenseWhereInput;
    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher)
        throw new NotFoundException("Profil enseignant introuvable");
      where = {
        OR: [
          { presidentId: teacher.id },
          { members: { some: { teacherId: teacher.id } } },
          { project: { supervisorId: teacher.id } },
          { project: { coSupervisorId: teacher.id } },
        ],
      };
    } else if (user.role === Role.STUDENT) {
      where = { project: { students: { some: { userId: user.id } } } };
    } else {
      throw new ForbiddenException();
    }
    const defenses = await this.prisma.defense.findMany({
      where,
      include,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return defenses.map(toApi);
  }

  /* ---------- Écriture ---------- */

  // planifier une soutenance : le projet passe à « planifié »
  async create(dto: CreateDefenseDto) {
    const data: PlanData = {
      ...dto,
      duration: dto.duration ?? DEFAULT_DURATION,
    };
    await this.check(data);

    // un lien de confirmation par membre du jury
    const tokens = new Map<string, string>(); // teacherId -> jeton en clair (pour le mail)
    const defense = await this.prisma.$transaction(async (tx) => {
      const created = await tx.defense.create({
        data: {
          projectId: data.projectId,
          date: toDate(data.date),
          time: data.time,
          duration: data.duration,
          roomId: data.roomId,
          presidentId: data.presidentId,
          members: {
            create: data.memberIds.map((teacherId, position) => ({
              teacherId,
              position,
            })),
          },
        },
        include,
      });
      await tx.juryConfirmation.createMany({
        data: [data.presidentId, ...data.memberIds].map((teacherId) => {
          const token = newToken();
          tokens.set(teacherId, token.raw);
          return { defenseId: created.id, teacherId, tokenHash: token.hash };
        }),
      });
      await tx.project.updateMany({
        where: { id: data.projectId, status: "validated" },
        data: { status: "planned" },
      });
      return tx.defense.findUniqueOrThrow({
        where: { id: created.id },
        include,
      });
    });

    // convocation des étudiants, du jury (avec le lien de réponse) et des encadrants
    const details = await this.loadDetails(defense.id);
    const notifications = await this.notify(
      "planned",
      details,
      buildRecipients(details),
      tokens,
    );
    return { ...toApi(defense), notifications };
  }

  // modifier (date, heure, salle, jury ou projet) : seuls les champs envoyés changent
  async update(id: number, dto: UpdateDefenseDto) {
    const current = await this.get(id);
    await this.ensureNotLocked(current.projectId);

    const previous = toApi(current);
    const data: PlanData = { ...previous, ...dto };
    // rien ne change : pas d'écriture, pas de mail
    if (planOf(data) === planOf(previous)) {
      return { ...previous, notifications: { sent: 0, failed: 0 } };
    }
    // la date ou l'heure change : elle doit être dans le futur
    const moved = data.date !== previous.date || data.time !== previous.time;
    await this.check(data, id, moved);
    const before = await this.loadDetails(id); // pour prévenir ceux qui ne sont plus concernés

    // nouvelle date / heure / durée : tout le jury doit reconfirmer
    const resetConfirmations =
      data.date !== previous.date ||
      data.time !== previous.time ||
      data.duration !== previous.duration;
    const tokens = new Map<string, string>();

    const defense = await this.prisma.$transaction(async (tx) => {
      if (dto.memberIds) {
        await tx.defenseMember.deleteMany({ where: { defenseId: id } });
      }
      await tx.defense.update({
        where: { id },
        data: {
          projectId: data.projectId,
          date: toDate(data.date),
          time: data.time,
          duration: data.duration,
          roomId: data.roomId,
          presidentId: data.presidentId,
          ...(dto.memberIds && {
            members: {
              create: dto.memberIds.map((teacherId, position) => ({
                teacherId,
                position,
              })),
            },
          }),
        },
      });
      // changement de projet : l'ancien redevient « validé », le nouveau passe à « planifié »
      if (data.projectId !== current.projectId) {
        await tx.project.updateMany({
          where: { id: current.projectId, status: "planned" },
          data: { status: "validated" },
        });
        await tx.project.updateMany({
          where: { id: data.projectId, status: "validated" },
          data: { status: "planned" },
        });
      }

      // confirmations du jury
      const jury = [data.presidentId, ...data.memberIds];
      await tx.juryConfirmation.deleteMany({
        where: resetConfirmations
          ? { defenseId: id }
          : { defenseId: id, teacherId: { notIn: jury } }, // retirés du jury
      });
      const kept = await tx.juryConfirmation.findMany({
        where: { defenseId: id },
      });
      // nouveaux membres : à confirmer
      for (const teacherId of jury.filter(
        (t) => !kept.some((c) => c.teacherId === t),
      )) {
        const token = newToken();
        tokens.set(teacherId, token.raw);
        await tx.juryConfirmation.create({
          data: { defenseId: id, teacherId, tokenHash: token.hash },
        });
      }
      // ceux qui n'ont pas encore répondu reçoivent un nouveau lien (l'ancien ne marche plus)
      for (const c of kept.filter((c) => c.status === "PENDING")) {
        const token = newToken();
        tokens.set(c.teacherId, token.raw);
        await tx.juryConfirmation.update({
          where: {
            defenseId_teacherId: { defenseId: id, teacherId: c.teacherId },
          },
          data: { tokenHash: token.hash },
        });
      }
      return tx.defense.findUniqueOrThrow({ where: { id }, include });
    });

    // - déjà concernés : convocation rectificative
    // - nouveaux (ajoutés au jury, autre projet…) : convocation
    // - plus concernés (retirés du jury…) : annulation
    const after = await this.loadDetails(id);
    const key = (r: Recipient) => r.email.toLowerCase();
    const oldKeys = new Set(buildRecipients(before).map(key));
    const newKeys = new Set(buildRecipients(after).map(key));
    const results = await Promise.all([
      this.notify(
        "updated",
        after,
        buildRecipients(after).filter((r) => oldKeys.has(key(r))),
        tokens,
      ),
      this.notify(
        "planned",
        after,
        buildRecipients(after).filter((r) => !oldKeys.has(key(r))),
        tokens,
      ),
      this.notify(
        "cancelled",
        before,
        buildRecipients(before).filter((r) => !newKeys.has(key(r))),
      ),
    ]);
    return {
      ...toApi(defense),
      notifications: {
        sent: results.reduce((n, r) => n + r.sent, 0),
        failed: results.reduce((n, r) => n + r.failed, 0),
      },
    };
  }

  // supprimer : le projet redevient « validé »
  async remove(id: number) {
    const current = await this.get(id);
    await this.ensureNotLocked(current.projectId);
    const details = await this.loadDetails(id); // avant suppression, pour le mail

    await this.prisma.$transaction([
      this.prisma.defense.delete({ where: { id } }),
      this.prisma.project.updateMany({
        where: { id: current.projectId, status: "planned" },
        data: { status: "validated" },
      }),
    ]);

    // annulation envoyée aux étudiants, au jury et aux encadrants
    const notifications = await this.notify("cancelled", details);
    return { deleted: true, notifications };
  }

  /* ---------- Mails ---------- */

  private async loadDetails(id: number): Promise<DefenseDetails> {
    const d = await this.prisma.defense.findUniqueOrThrow({
      where: { id },
      include: detailsInclude,
    });
    return {
      date: d.date.toISOString().slice(0, 10),
      time: d.time,
      duration: d.duration,
      room: d.room,
      project: d.project,
      president: d.president,
      members: d.members.map((m) => m.teacher),
    };
  }

  // envoie un mail à chaque destinataire (par défaut : tous les concernés)
  // tokens : membres du jury qui doivent (re)confirmer -> leur mail contient le lien de réponse
  // un échec d'envoi ne bloque jamais la planification : on renvoie juste le décompte
  private async notify(
    kind: NoticeKind,
    details: DefenseDetails,
    recipients: Recipient[] = buildRecipients(details),
    tokens?: Map<string, string>,
  ) {
    const results = await Promise.all(
      recipients.map((r) => {
        const token = r.juryTeacherId
          ? tokens?.get(r.juryTeacherId)
          : undefined;
        const link = token ? confirmLink(token) : undefined;
        return this.mail.sendDefenseNotice(
          r.email,
          buildNotice(kind, details, r, link),
        );
      }),
    );
    const sent = results.filter(Boolean).length;
    return { sent, failed: results.length - sent };
  }

  /* ---------- Réponse du jury ---------- */

  // page ouverte depuis le lien du mail (pas de connexion : le jeton fait foi)
  async getInvitation(token: string) {
    const c = await this.findByToken(token);
    const details = await this.loadDetails(c.defenseId);
    const recipient = buildRecipients(details).find(
      (r) => r.juryTeacherId === c.teacherId,
    );
    return {
      teacher: teacherLabel(c.teacher),
      role: c.teacherId === details.president.id ? "Président du jury" : "Juré",
      details: recipient
        ? buildNotice("planned", details, recipient).details
        : [],
      status: c.status,
      canRespond: this.canRespond(c.defense.date, c.defense.project.status),
    };
  }

  // réponse envoyée depuis la page du lien
  async respondByToken(token: string, answer: "accept" | "decline") {
    return this.applyResponse(await this.findByToken(token), answer);
  }

  // réponse depuis l'espace enseignant (connecté)
  async respondAsTeacher(
    defenseId: number,
    userId: string,
    answer: "accept" | "decline",
  ) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new NotFoundException("Profil enseignant introuvable");
    const c = await this.prisma.juryConfirmation.findUnique({
      where: { defenseId_teacherId: { defenseId, teacherId: teacher.id } },
      include: this.confirmationInclude,
    });
    if (!c) {
      throw new ForbiddenException(
        "Vous ne faites pas partie du jury de cette soutenance.",
      );
    }
    return this.applyResponse(c, answer);
  }

  private readonly confirmationInclude = {
    teacher: withUser,
    defense: { include: { project: true } },
  } as const;

  private async findByToken(token: string) {
    const c = await this.prisma.juryConfirmation.findUnique({
      where: { tokenHash: sha256(token) },
      include: this.confirmationInclude,
    });
    if (!c) {
      throw new NotFoundException(
        "Ce lien n'est plus valable. Si la soutenance a été modifiée, un nouveau lien vous a été envoyé par mail.",
      );
    }
    return c;
  }

  // on ne répond plus une fois la soutenance passée ou clôturée
  private canRespond(date: Date, status: ProjectStatus) {
    return (
      !LOCKED.includes(status) && date.toISOString().slice(0, 10) >= todayISO()
    );
  }

  private async applyResponse(
    c: Prisma.JuryConfirmationGetPayload<{
      include: DefensesService["confirmationInclude"];
    }>,
    answer: "accept" | "decline",
  ) {
    if (!this.canRespond(c.defense.date, c.defense.project.status)) {
      throw new BadRequestException(
        "Cette soutenance a déjà eu lieu : la réponse n'est plus modifiable.",
      );
    }
    const status: JuryResponse = answer === "accept" ? "ACCEPTED" : "DECLINED";
    await this.prisma.juryConfirmation.update({
      where: {
        defenseId_teacherId: { defenseId: c.defenseId, teacherId: c.teacherId },
      },
      data: { status, respondedAt: new Date() },
    });

    // refus : on prévient l'administration pour qu'elle remplace le membre
    if (status === "DECLINED" && c.status !== "DECLINED") {
      const details = await this.loadDetails(c.defenseId);
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN_STAFF, isActive: true },
        select: { email: true },
      });
      const notice = buildDeclineNotice(details, c.teacher);
      await Promise.all(
        admins.map((a) => this.mail.sendDefenseNotice(a.email, notice)),
      );
    }
    return toApi(await this.get(c.defenseId));
  }

  /* ---------- Vérifications ---------- */

  private async get(id: number) {
    const defense = await this.prisma.defense.findUnique({
      where: { id },
      include,
    });
    if (!defense) throw new NotFoundException(`Soutenance ${id} introuvable`);
    return defense;
  }

  private async ensureNotLocked(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (project && LOCKED.includes(project.status)) {
      throw new BadRequestException(
        "Cette soutenance a déjà eu lieu : elle ne peut plus être modifiée ni supprimée.",
      );
    }
  }

  // toutes les règles de planification (excludeId = la soutenance modifiée)
  // checkFuture = false : modification sans changement de date/heure (on peut corriger le jury)
  private async check(data: PlanData, excludeId?: number, checkFuture = true) {
    const slot = toSlot(data.date, data.time, data.duration);

    // 1. date et heure
    if (!isRealDate(data.date)) {
      throw new BadRequestException("Cette date n'existe pas.");
    }
    if (checkFuture && isInPast(data.date, data.time)) {
      throw new BadRequestException(
        "Cette date est déjà passée : choisissez une date et une heure à venir.",
      );
    }
    if (isWeekend(data.date)) {
      throw new BadRequestException(
        "Choisissez un jour ouvré (du dimanche au jeudi).",
      );
    }
    if (!fitsInDay(slot)) {
      throw new BadRequestException(
        `Les soutenances ont lieu entre ${formatTime(DAY_START * 60)} et ${formatTime(DAY_END * 60)}.`,
      );
    }

    // 2. jury : président + jurés, tous différents
    const juryIds = [data.presidentId, ...data.memberIds];
    if (new Set(juryIds).size !== juryIds.length) {
      throw new BadRequestException(
        "Un professeur apparaît deux fois dans le jury.",
      );
    }
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: juryIds } },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (teachers.length !== juryIds.length) {
      throw new BadRequestException("Membre du jury introuvable.");
    }

    // 3. projet : existe, validé, pas déjà planifié ailleurs
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      include: { defense: { select: { id: true } } },
    });
    if (!project) throw new BadRequestException("Projet introuvable.");
    if (project.defense && project.defense.id !== excludeId) {
      throw new ConflictException("Ce projet a déjà une soutenance.");
    }
    if (!project.defense && !PLANNABLE.includes(project.status)) {
      throw new BadRequestException(
        "Le projet doit être validé avant de planifier sa soutenance.",
      );
    }
    // l'encadrant et le co-encadrant assistent déjà à la soutenance : ils ne font pas partie du jury
    const supervisors = [project.supervisorId, project.coSupervisorId];
    if (supervisors.includes(data.presidentId)) {
      throw new BadRequestException(
        "L'encadrant du projet ne peut pas présider le jury.",
      );
    }
    if (data.memberIds.some((id) => supervisors.includes(id))) {
      throw new BadRequestException(
        "L'encadrant du projet ne peut pas être membre du jury.",
      );
    }
    // 4. salle
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });
    if (!room) throw new BadRequestException("Salle introuvable.");

    // 5. conflits avec les autres soutenances du même jour
    const sameDay = await this.prisma.defense.findMany({
      where: {
        date: toDate(data.date),
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      include,
    });
    const problems: string[] = [];
    for (const other of sameDay) {
      const otherSlot = toSlot(data.date, other.time, other.duration);
      if (!slotsOverlap(slot, otherSlot)) continue;
      const when = `de ${formatTime(otherSlot.start)} à ${formatTime(otherSlot.end)}`;

      if (other.roomId === data.roomId) {
        problems.push(`La salle « ${room.name} » est déjà réservée ${when}.`);
      }
      const otherJury = [
        other.presidentId,
        ...other.members.map((m) => m.teacherId),
      ];
      for (const t of teachers) {
        if (otherJury.includes(t.id)) {
          problems.push(
            `${teacherName(t)} est déjà dans le jury d'une autre soutenance ${when}.`,
          );
        }
      }
    }
    if (problems.length) throw new ConflictException(problems);
  }
}
