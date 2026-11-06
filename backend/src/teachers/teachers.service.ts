import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { Prisma, Role } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

// On n'expose jamais le passwordHash
const include = { user: { omit: { passwordHash: true } } } as const;

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  // création enseignant avec compte non actif + mail d'activation (même mail que les étudiants)
  async create(dto: CreateTeacherDto) {
    const passwordHash = await argon2.hash(randomBytes(32).toString("hex"));
    try {
      const teacher = await this.prisma.teacher.create({
        data: {
          title: dto.title,
          specialty: dto.specialty,
          user: {
            create: {
              email: dto.email.toLowerCase(),
              passwordHash,
              firstName: dto.firstName,
              lastName: dto.lastName,
              role: Role.TEACHER,
            },
          },
        },
        include,
      });

      const emailSent = await this.auth.sendActivationLink(teacher.user);
      return { ...teacher, emailSent };
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  // liste, filtrable par spécialité et par titre
  findAll(filters?: { specialty?: string; title?: string }) {
    return this.prisma.teacher.findMany({
      where: {
        title: filters?.title,
        specialty: filters?.specialty
          ? { equals: filters.specialty, mode: "insensitive" }
          : undefined,
      },
      include,
      orderBy: { user: { lastName: "asc" } },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include,
    });
    if (!teacher) throw new NotFoundException(`Enseignant ${id} introuvable`);
    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id); // 404 si inexistant

    const { email, firstName, lastName, ...teacherFields } = dto;
    const userData: Prisma.UserUpdateWithoutTeacherInput = {
      email: email?.toLowerCase(),
      firstName,
      lastName,
    };

    try {
      return await this.prisma.teacher.update({
        where: { id },
        data: { ...teacherFields, user: { update: userData } },
        include,
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    // Supprimer le User supprime aussi le Teacher (onDelete: Cascade)
    await this.prisma.user.delete({ where: { id: teacher.userId } });
    return { deleted: true };
  }

  // profil de l'enseignant connecté
  async findByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include,
    });
    if (!teacher) throw new NotFoundException("Profil enseignant introuvable");
    return teacher;
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
