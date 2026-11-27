import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { isInPast, nowInAlgiers } from "../defenses/defense.rules";

// prochaines soutenances affichées : sur 7 jours, 5 au maximum
const UPCOMING_DAYS = 7;
const UPCOMING_LIMIT = 5;

// colonne @db.Date -> "2026-06-18"
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

// "2026-06-18" + 7 -> "2026-06-25"
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // tout le tableau de bord admin en un seul appel (chiffres bruts : le front fait les libellés)
  async get() {
    const now = nowInAlgiers();
    const lastUpcomingDay = addDays(now.date, UPCOMING_DAYS);

    const [
      studentsCount,
      studentsWithoutProject,
      teachersCount,
      activeTeachers,
      projectsByStatus,
      defenses,
      resultsToPublish,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { projectId: null } }),
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { accountStatus: "ACTIVE" } }),
      this.prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      // uniquement les champs utiles, triés par date puis heure
      this.prisma.defense.findMany({
        orderBy: [{ date: "asc" }, { time: "asc" }],
        select: {
          id: true,
          date: true,
          time: true,
          room: { select: { name: true } },
          project: {
            select: {
              title: true,
              students: {
                select: { user: { select: { firstName: true, lastName: true } } },
              },
            },
          },
          confirmations: { select: { status: true } },
        },
      }),
      // délibération verrouillée par le président mais pas encore publiée
      this.prisma.defenseEvaluation.count({
        where: { locked: true, publishedAt: null },
      }),
    ]);

    const projectsWith = (status: string) =>
      projectsByStatus.find((p) => p.status === status)?._count._all ?? 0;
    const projectsCount = projectsByStatus.reduce(
      (sum, p) => sum + p._count._all,
      0,
    );

    const upcoming = defenses.filter(
      (d) => !isInPast(isoDay(d.date), d.time, now),
    );

    return {
      studentsCount,
      studentsWithoutProject,
      teachersCount,
      activeTeachers,
      projectsCount,
      pendingProjects: projectsWith("deposited"), // à valider
      projectsToPlan: projectsWith("validated"), // validés, sans soutenance
      defensesCount: defenses.length,
      upcomingDefenses: upcoming.length,
      doneDefenses: defenses.length - upcoming.length,
      // un membre du jury a refusé : il faut le remplacer avant la soutenance
      incompleteJuries: upcoming.filter((d) =>
        d.confirmations.some((c) => c.status === "DECLINED"),
      ).length,
      resultsToPublish,
      upcoming: upcoming
        .filter((d) => isoDay(d.date) <= lastUpcomingDay)
        .slice(0, UPCOMING_LIMIT)
        .map((d) => ({
          id: d.id,
          date: isoDay(d.date),
          time: d.time,
          room: d.room.name,
          student: d.project.students
            .map((s) => `${s.user.firstName} ${s.user.lastName}`)
            .join(", "),
          project: d.project.title,
          // même règle que DefensesService : confirmée quand tout le jury a accepté
          status:
            d.confirmations.length > 0 &&
            d.confirmations.every((c) => c.status === "ACCEPTED")
              ? ("confirmed" as const)
              : ("planned" as const),
        })),
    };
  }
}