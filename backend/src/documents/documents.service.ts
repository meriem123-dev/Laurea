import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DocumentStatus, ProjectStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser, projectScope } from "../projects/project-scope";
import { EvaluateDocumentDto } from "./dto/evaluate-document.dto";

// En prod, monter un volume sur /app/uploads (voir Dockerfile)
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");

// après la soutenance, plus de dépôt (même règle que les soutenances)
const LOCKED: ProjectStatus[] = ["defended", "graded", "closed"];

// même forme que l'interface ProjectDocument du front
const toApi = (d: {
  id: number;
  projectId: string;
  originalName: string;
  sizeBytes: number;
  status: DocumentStatus;
  grade: number | null;
  comment: string;
  evaluatedAt: Date | null;
  createdAt: Date;
}) => ({
  id: d.id,
  projectId: d.projectId,
  name: d.originalName,
  submittedOn: d.createdAt.toISOString().slice(0, 10),
  sizeKb: Math.max(1, Math.round(d.sizeBytes / 1024)),
  status: d.status,
  grade: d.grade,
  comment: d.comment,
  evaluatedOn: d.evaluatedAt ? d.evaluatedAt.toISOString().slice(0, 10) : null,
});

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // le projet, seulement s'il est dans le périmètre de l'utilisateur
  private async getProject(projectId: string, user: AuthUser) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ...projectScope(user) },
    });
    if (!project) throw new NotFoundException("Projet introuvable");
    return project;
  }

  // liste des dépôts d'un projet (étudiant du projet, encadrants, admin)
  async list(projectId: string, user: AuthUser) {
    await this.getProject(projectId, user);
    const docs = await this.prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return docs.map(toApi);
  }

  // dépôt d'un PDF par un étudiant du projet
  async upload(projectId: string, user: AuthUser, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Fichier manquant.");

    const project = await this.getProject(projectId, user);
    if (LOCKED.includes(project.status)) {
      throw new BadRequestException(
        "La soutenance a déjà eu lieu : les dépôts sont fermés.",
      );
    }

    // on vérifie le contenu réel (signature PDF), pas seulement l'extension
    if (file.buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new BadRequestException("Seuls les fichiers PDF sont acceptés.");
    }

    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    // multer lit le nom en latin1 : on le remet en UTF-8 (accents)
    const originalName = Buffer.from(file.originalname, "latin1")
      .toString("utf8")
      .replace(/[\\/]/g, "_")
      .slice(0, 200);

    const storedName = `${randomUUID()}.pdf`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, storedName), file.buffer);

    try {
      const doc = await this.prisma.document.create({
        data: {
          projectId,
          uploadedById: student?.id,
          originalName,
          storedName,
          sizeBytes: file.size,
          // status : PENDING par défaut
        },
      });
      return toApi(doc);
    } catch (e) {
      await unlink(join(UPLOAD_DIR, storedName)).catch(() => undefined);
      throw e;
    }
  }

  // évaluation d'un dépôt par l'encadrant / co-encadrant du projet
  async evaluate(id: number, user: AuthUser, dto: EvaluateDocumentDto) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException("Document introuvable");

    // 404 si le projet n'est pas encadré par cet enseignant
    const project = await this.getProject(doc.projectId, user);
    if (project.status === "closed") {
      throw new BadRequestException(
        "Le projet est clôturé : les évaluations ne sont plus modifiables.",
      );
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    const grade =
      dto.grade === null || dto.grade === undefined
        ? null
        : Math.round(dto.grade * 100) / 100;
    const evaluated = grade !== null;

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        grade,
        comment: (dto.comment ?? "").trim(),
        status: evaluated ? DocumentStatus.EVALUATED : DocumentStatus.PENDING,
        evaluatedAt: evaluated ? new Date() : null,
        evaluatedById: evaluated ? (teacher?.id ?? null) : null,
      },
    });
    return toApi(updated);
  }

  // chemin du fichier à télécharger, après vérification des droits
  async getFile(id: number, user: AuthUser) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException("Document introuvable");
    await this.getProject(doc.projectId, user); // 404 si hors périmètre

    const path = join(UPLOAD_DIR, doc.storedName);
    try {
      await access(path);
    } catch {
      throw new NotFoundException("Le fichier n'est plus disponible.");
    }
    return { path, name: doc.originalName };
  }
}