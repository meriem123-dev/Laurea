import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role, Speciality } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

// On n'expose jamais le passwordHash
const include = { user: { omit: { passwordHash: true } } } as const;

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const passwordHash = await argon2.hash(dto.password);
    try {
      return await this.prisma.student.create({
        data: {
          matricule: dto.matricule,
          speciality: dto.speciality,
          group: dto.group,
          user: {
            create: {
              email: dto.email,
              passwordHash,
              firstName: dto.firstName,
              lastName: dto.lastName,
              role: Role.STUDENT,
            },
          },
        },
        include,
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  findAll(filters?: { speciality?: Speciality; group?: string }) {
    return this.prisma.student.findMany({
      where: filters,
      include,
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include,
    });
    if (!student) throw new NotFoundException(`Étudiant ${id} introuvable`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id); // 404 si inexistant

    const { email, password, firstName, lastName, ...studentFields } = dto;
    const userData: Prisma.UserUpdateWithoutStudentInput = {
      email,
      firstName,
      lastName,
      ...(password && { passwordHash: await argon2.hash(password) }),
    };

    try {
      return await this.prisma.student.update({
        where: { id },
        data: { ...studentFields, user: { update: userData } },
        include,
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    // Supprimer le User supprime aussi le Student (onDelete: Cascade)
    await this.prisma.user.delete({ where: { id: student.userId } });
    return { deleted: true };
  }

  private handleUniqueError(e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new ConflictException('Email ou matricule déjà utilisé');
    }
  }
}