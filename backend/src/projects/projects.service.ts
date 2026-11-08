import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TeamType } from "../generated/prisma/client";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectStatus } from "../generated/prisma/client";

const SIZE: Record<TeamType, number> = { solo: 1, pair: 2, trio: 3, quad: 4 };
const include = { students: { select: { id: true } } };
// transitions autorisées : une étape en avant, ou un retour arrière d'une étape
const ORDER: ProjectStatus[] = [
  "deposited",
  "validated",
  "planned",
  "defended",
  "graded",
  "closed",
];

// même forme que l'interface Project du front
const toApi = ({ students, ...p }: any) => ({
  ...p,
  studentIds: students.map((s: any) => s.id),
});

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private async check(
    d: {
      teamType: TeamType;
      studentIds: string[];
      supervisorId: string;
      coSupervisorId?: string | null;
    },
    projectId?: string,
  ) {
    if (d.studentIds.length !== SIZE[d.teamType]) {
      throw new BadRequestException(
        "Le nombre d'étudiants ne correspond pas au type d'équipe",
      );
    }
    if (d.coSupervisorId && d.coSupervisorId === d.supervisorId) {
      throw new BadRequestException(
        "L'encadrant et le co-encadrant doivent être différents",
      );
    }
    const students = await this.prisma.student.findMany({
      where: { id: { in: d.studentIds } },
    });
    if (students.length !== d.studentIds.length)
      throw new BadRequestException("Étudiant introuvable");
    if (students.some((s) => s.projectId && s.projectId !== projectId)) {
      throw new ConflictException("Un étudiant a déjà un projet");
    }
    const teachers = [d.supervisorId, d.coSupervisorId].filter(
      Boolean,
    ) as string[];
    const found = await this.prisma.teacher.count({
      where: { id: { in: teachers } },
    });
    if (found !== teachers.length)
      throw new BadRequestException("Encadrant introuvable");
  }

  // créer projet
  async create(dto: CreateProjectDto) {
    await this.check(dto);
    const { studentIds, ...data } = dto;
    const p = await this.prisma.project.create({
      data: {
        ...data,
        students: { connect: studentIds.map((id) => ({ id })) },
      },
      include,
    });
    return toApi(p);
  }

  //recup all
  async findAll() {
    return (
      await this.prisma.project.findMany({
        include,
        orderBy: { createdAt: "desc" },
      })
    ).map(toApi);
  }

  // avec id
  async findOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id }, include });
    if (!p) throw new NotFoundException("Projet introuvable");
    return toApi(p);
  }

  //modif prjt
  async update(id: string, dto: UpdateProjectDto) {
    const current = await this.findOne(id);
    const merged = { ...current, ...dto };
    await this.check(merged, id);
    const { studentIds, ...data } = dto;
    const p = await this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(studentIds && {
          students: { set: studentIds.map((sid) => ({ id: sid })) },
        }),
      },
      include,
    });
    return toApi(p);
  }

  //maj statut
  async updateStatus(id: string, status: ProjectStatus) {
    const current = await this.findOne(id);
    const diff = ORDER.indexOf(status) - ORDER.indexOf(current.status);
    if (diff !== 1 && diff !== -1) {
      throw new BadRequestException("Transition de statut non autorisée");
    }
    const p = await this.prisma.project.update({
      where: { id },
      data: { status },
      include,
    });
    return toApi(p);
  }

  //supp projet
  async remove(id: string) {
    await this.findOne(id); // 404 si inexistant
    // les étudiants sont libérés automatiquement (onDelete: SetNull sur Student.projectId)
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }
}
