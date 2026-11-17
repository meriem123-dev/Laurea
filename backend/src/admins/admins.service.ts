import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AccountStatus, AdminType, Prisma, Role } from "../generated/prisma/client";
// On n'expose jamais le passwordHash : sélection explicite des champs
const select = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  isSystemAdmin: true,
  adminType: true,
  createdAt: true,
  resetTokens: { select: { usedAt: true } },
} as const;

interface AdminRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isSystemAdmin: boolean;
  adminType: AdminType | null;
  createdAt: Date;
  resetTokens: { usedAt: Date | null }[];
}

// Un admin n'a pas de table de profil : le statut est déduit des liens d'activation
function toAdmin({ resetTokens, ...user }: AdminRow) {
  const pending =
    resetTokens.length > 0 && resetTokens.every((t) => !t.usedAt);
  const accountStatus = !user.isActive
    ? AccountStatus.DISABLED
    : pending
      ? AccountStatus.PENDING
      : AccountStatus.ACTIVE;
  return { ...user, accountStatus };
}

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly notifications: NotificationsService,
  ) {}

  // création : mot de passe aléatoire inutilisable + mail d'activation
  // isSystemAdmin n'est jamais repris du body : un admin créé ici n'est jamais admin système
  async create(dto: CreateAdminDto) {
    const passwordHash = await argon2.hash(randomBytes(32).toString("hex"));

    let user: AdminRow;
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.trim().toLowerCase(),
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: Role.ADMIN_STAFF,
          adminType: dto.adminType,
        },
        select,
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }

    const emailSent = await this.auth.sendActivationLink(user);
    await this.notifications.notifyUsers([user.id], {
      type: "SYSTEM",
      title: "Bienvenue sur Laurea",
      message: `Bonjour ${user.firstName}, votre compte administrateur est prêt.`,
      link: "/admin/dashboard",
    });

    return {
      ...toAdmin(user),
      accountStatus: AccountStatus.PENDING,
      emailSent,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { role: Role.ADMIN_STAFF },
      select,
      orderBy: { lastName: "asc" },
    });
    return users.map(toAdmin);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.ADMIN_STAFF },
      select,
    });
    if (!user) throw new NotFoundException(`Administrateur ${id} introuvable`);
    return toAdmin(user);
  }

  async update(id: string, dto: UpdateAdminDto) {
    await this.findOne(id); // 404 si inexistant ou pas admin
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email?.trim().toLowerCase(),
          firstName: dto.firstName?.trim(),
          lastName: dto.lastName?.trim(),
          adminType: dto.adminType,
        },
        select,
      });
      return toAdmin(user);
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  async remove(id: string) {
    const admin = await this.findOne(id);
    if (admin.isSystemAdmin) {
      throw new ForbiddenException(
        "L'administrateur système ne peut pas être supprimé.",
      );
    }
    try {
      // les liens et notifications du compte partent avec lui (onDelete: Cascade)
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2003"
      ) {
        throw new ConflictException(
          "Ce compte est lié à d'autres données : suppression impossible.",
        );
      }
      throw e;
    }
    return { deleted: true };
  }

  private handleUniqueError(e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new ConflictException("Email déjà utilisé");
    }
  }
}