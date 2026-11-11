import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { createReadStream } from "node:fs";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { Role } from "../generated/prisma/enums";
import type { AuthUser } from "../projects/project-scope";
import { EvaluateDocumentDto } from "./dto/evaluate-document.dto";
import { DocumentsService } from "./documents.service";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo (comme le front)

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  // POST /api/projects/:projectId/documents  (multipart, champ "file")
  @Roles(Role.STUDENT)
  @Post("projects/:projectId/documents")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  upload(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: AuthUser },
  ) {
    return this.documents.upload(projectId, req.user, file);
  }

  // GET /api/projects/:projectId/documents
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN_STAFF)
  @Get("projects/:projectId/documents")
  list(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.documents.list(projectId, req.user);
  }

  // PATCH /api/documents/:id/evaluation  { grade: number | null, comment: string }
  @Roles(Role.TEACHER)
  @Patch("documents/:id/evaluation")
  evaluate(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: EvaluateDocumentDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.documents.evaluate(id, req.user, dto);
  }

  // GET /api/documents/:id/file  (le PDF)
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN_STAFF)
  @Get("documents/:id/file")
  async download(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { path, name } = await this.documents.getFile(id, req.user);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
    });
    return new StreamableFile(createReadStream(path));
  }
}