import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { UsersService } from "../users/users.service";
import { Role } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "./mail.service";
import { AccountStatus } from "../generated/prisma/client";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  //logique login
  async login(email: string, password: string, role?: Role) {
    const user = await this.users.findByEmail(email);

    if (
      !user ||
      !user.isActive ||
      !(await argon2.verify(user.passwordHash, password)) ||
      (role && user.role !== role)
    ) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const payload = { sub: user.id, role: user.role };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  //logique forgot password
  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return; // même réponse dans tous les cas

    const token = randomBytes(32).toString("hex");
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const origin = process.env.FRONTEND_URL!.split(",")[0].trim();
    await this.mail.sendResetLink(
      user.email,
      `${origin}/reset-password?token=${token}`,
    );
  }

  //logique réinitailisation mdp

  //logique réinitailisation mdp
  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: { include: { student: true, teacher: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("Lien invalide ou expiré");
    }

    const { user } = record;
    // premier mot de passe défini = activation du compte (étudiant ou enseignant)
    const activateStudent =
      user.student?.accountStatus === AccountStatus.PENDING;
    const activateTeacher =
      user.teacher?.accountStatus === AccountStatus.PENDING;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await argon2.hash(newPassword),
          ...(activateStudent && {
            student: { update: { accountStatus: AccountStatus.ACTIVE } },
          }),
          ...(activateTeacher && {
            teacher: { update: { accountStatus: AccountStatus.ACTIVE } },
          }),
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // même format de retour que login
    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  //activation compte étudiant
  async sendActivationLink(user: {
    id: string;
    email: string;
    firstName: string;
  }) {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // une expiration de 48h
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return this.mail.sendActivationLink(user.email, link, user.firstName);
  }
}
