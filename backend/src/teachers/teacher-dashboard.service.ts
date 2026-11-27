import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { isInPast, nowInAlgiers } from "../defenses/defense.rules";

// rôle affiché sur la carte « Mes prochaines soutenances » (président > encadrant > examinateur)
type DashboardRole = "president" | "supervisor" | "examiner";

// nombre de soutenances à venir affichées sur le tableau de bord
const UPCOMING_LIMIT = 4;

// colonne @db.Date -> "2026-06-18"
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

@Injectable()
export class TeacherDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // tout le tableau de bord de l'enseignant connecté, en une seule requête
  async forUser(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new NotFoundException("Enseignant introuvable");
    const id = teacher.id;
    const today = nowInAlgiers().date;

    const [projects, defenses, criteriaCount] = await Promise.all([
      // projets encadrés ou co-encadrés, avec leurs dépôts pas encore notés
      this.prisma.project.findMany({
        where: { OR: [{ supervisorId: id }, { coSupervisorId: id }] },
        select: {
          id: true,
          _count: { select: { documents: { where: { status: "PENDING" } } } },
        },
      }),
      // toutes les soutenances où il intervient (jury, encadrant ou co-encadrant)
      this.prisma.defense.findMany({
        where: {
          OR: [
            { presidentId: id },
            { members: { some: { teacherId: id } } },
            { project: { OR: [{ supervisorId: id }, { coSupervisorId: id }] } },
          ],
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        include: {
          room: { select: { name: true } },
          project: {
            select: {
              title: true,
              supervisorId: true,
              coSupervisorId: true,
              students: {
                select: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
          members: { select: { teacherId: true } },
          confirmations: { where: { teacherId: id }, select: { status: true } },
          evaluation: { select: { locked: true } },
          _count: { select: { scores: { where: { teacherId: id } } } },
        },
      }),
      this.prisma.criterion.count(),
    ]);

    const isJury = (d: (typeof defenses)[number]) =>
      d.presidentId === id || d.members.some((m) => m.teacherId === id);
    const roleOf = (d: (typeof defenses)[number]): DashboardRole => {
      if (d.presidentId === id) return "president";
      if (d.project.supervisorId === id || d.project.coSupervisorId === id)
        return "supervisor";
      return "examiner";
    };

    const upcoming = defenses.filter((d) => isoDay(d.date) >= today);
    const juries = defenses.filter(isJury);

    // évaluations à saisir : soutenance de jury déjà commencée, note pas encore verrouillée,
    // et il n'a pas noté tous les critères
    const toEvaluate = juries.filter(
      (d) =>
        isInPast(isoDay(d.date), d.time) &&
        !d.evaluation?.locked &&
        d._count.scores < criteriaCount,
    );

    return {
      supervised: projects.length,
      pendingDocuments: projects.reduce(
        (sum, p) => sum + p._count.documents,
        0,
      ),
      upcomingCount: upcoming.length,
      nextDefenseDate: upcoming[0] ? isoDay(upcoming[0].date) : null,
      juryCount: juries.length,
      // invitations au jury auxquelles il n'a pas encore répondu (soutenances à venir)
      toConfirm: juries.filter(
        (d) =>
          isoDay(d.date) >= today && d.confirmations[0]?.status === "PENDING",
      ).length,
      evaluationsToEnter: toEvaluate.length,
      oldestEvaluationDate: toEvaluate[0] ? isoDay(toEvaluate[0].date) : null,
      upcoming: upcoming.slice(0, UPCOMING_LIMIT).map((d) => ({
        id: d.id,
        date: isoDay(d.date),
        time: d.time,
        room: d.room.name,
        student: d.project.students
          .map((s) => `${s.user.firstName} ${s.user.lastName}`)
          .join(", "),
        project: d.project.title,
        role: roleOf(d),
      })),
    };
  }
}
