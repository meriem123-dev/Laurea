import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// colonne @db.Date -> "2026-06-18"
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

const teacherName = (t: {
  title: string | null;
  user: { firstName: string; lastName: string };
}) => [t.title, t.user.firstName, t.user.lastName].filter(Boolean).join(" ");

@Injectable()
export class StudentDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // tout le tableau de bord de l'étudiant connecté, en une seule requête
  async forUser(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true } },
        project: {
          include: {
            supervisor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            defense: { include: { room: { select: { name: true } } } },
            // le dernier dépôt d'abord
            documents: {
              orderBy: { createdAt: "desc" },
              select: { createdAt: true, status: true, grade: true },
            },
          },
        },
      },
    });
    if (!student) throw new NotFoundException("Profil étudiant introuvable");

    const p = student.project;
    const last = p?.documents[0];
    return {
      firstName: student.user.firstName,
      cursus: student.cursus,
      speciality: student.speciality,
      project: p
        ? {
            id: p.id,
            title: p.title,
            status: p.status,
            supervisor: teacherName(p.supervisor),
          }
        : null,
      defense: p?.defense
        ? {
            date: isoDay(p.defense.date),
            time: p.defense.time,
            room: p.defense.room.name,
          }
        : null,
      documents: {
        count: p?.documents.length ?? 0,
        evaluatedCount:
          p?.documents.filter((d) => d.status === "EVALUATED").length ?? 0,
        // dernier dépôt : date, état et note (si évalué)
        last: last
          ? {
              date: isoDay(last.createdAt),
              status: last.status,
              grade: last.grade,
            }
          : null,
      },
    };
  }
}
