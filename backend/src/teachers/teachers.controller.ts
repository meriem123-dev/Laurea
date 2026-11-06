import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { TeachersImportService } from "./teachers-import.service";
import { TeachersService } from "./teachers.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("teachers")
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly importService: TeachersImportService,
  ) {}

  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  // les enseignants voient la liste (utile pour proposer un jury)
  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get()
  findAll(
    @Query("specialty") specialty?: string,
    @Query("title") title?: string,
  ) {
    return this.teachersService.findAll({ specialty, title });
  }

  @Roles(Role.ADMIN_STAFF)
  @Get("import/template")
  async template(@Res() res: Response) {
    const wb = await this.importService.buildTemplate();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="modele-enseignants.xlsx"',
    );
    await wb.xlsx.write(res);
    res.end();
  }

  @Roles(Role.ADMIN_STAFF)
  @Post("import")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  import(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Fichier manquant.");
    return this.importService.import(file);
  }

  // "me" doit rester AVANT ":id", sinon Nest prend "me" pour un id
  @Roles(Role.TEACHER)
  @Get("me")
  me(@Req() req: { user: { id: string } }) {
    return this.teachersService.findByUserId(req.user.id);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.teachersService.findOne(id);
  }

  @Roles(Role.ADMIN_STAFF)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.teachersService.remove(id);
  }
}
