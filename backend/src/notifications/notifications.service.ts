import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { NotificationType, Role } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// contenu d'une notification (le destinataire est choisi par la méthode appelée)
export interface NotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // page ouverte au clic
}

// nombre de notifications renvoyées (les plus récentes)
const LIST_LIMIT = 50;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /* ---------- Création (appelée par les autres modules) ---------- */

  // une notification ne doit jamais faire échouer l'action principale (planifier, valider…) :
  // en cas d'erreur on l'écrit dans les logs et on continue
  async notifyUsers(userIds: string[], input: NotificationInput) {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (ids.length === 0) return;
    try {
      await this.prisma.notification.createMany({
        data: ids.map((userId) => ({ userId, ...input })),
      });
    } catch (e) {
      this.logger.error(`Notification non créée : ${input.title}`, e as Error);
    }
  }

  // tous les comptes administrateur
  async notifyAdmins(input: NotificationInput) {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN_STAFF },
      select: { id: true },
    });
    await this.notifyUsers(
      admins.map((a) => a.id),
      input,
    );
  }

  // enseignants (ids de la table Teacher)
  async notifyTeachers(
    teacherIds: (string | null | undefined)[],
    input: NotificationInput,
  ) {
    const ids = teacherIds.filter((id): id is string => !!id);
    if (ids.length === 0) return;
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: ids } },
      select: { userId: true },
    });
    await this.notifyUsers(
      teachers.map((t) => t.userId),
      input,
    );
  }

  // étudiants d'un projet
  async notifyProjectStudents(projectId: string, input: NotificationInput) {
    const students = await this.prisma.student.findMany({
      where: { projectId },
      select: { userId: true },
    });
    await this.notifyUsers(
      students.map((s) => s.userId),
      input,
    );
  }

  /* ---------- Lecture / mise à jour (routes /notifications) ---------- */

  async findMine(userId: string) {
    const items = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    });
    // même format que le type AppNotification du front
    return items.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      title: n.title,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
      read: n.read,
      to: n.link ?? undefined,
    }));
  }

  async markAsRead(userId: string, id: number) {
    await this.ensureMine(userId, id);
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { read: true };
  }

  async markAllAsRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: count };
  }

  async remove(userId: string, id: number) {
    await this.ensureMine(userId, id);
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }

  // on ne touche qu'à ses propres notifications (sinon 404, sans dire qu'elle existe)
  private async ensureMine(userId: string, id: number) {
    const found = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!found) throw new NotFoundException("Notification introuvable.");
  }
}
