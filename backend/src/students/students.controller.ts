import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
    UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Req
} from "@nestjs/common";
import { Role, Speciality } from "../generated/prisma/client";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { StudentsImportService } from "./students-import.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService, private readonly importService: StudentsImportService) {}

  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get()
  findAll(
    @Query("speciality", new ParseEnumPipe(Speciality, { optional: true }))
    speciality?: Speciality,
    @Query("group") group?: string,
  ) {
    return this.studentsService.findAll({ speciality, group });
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
      'attachment; filename="modele-etudiants.xlsx"',
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

  @Roles(Role.STUDENT)
  @Get("me")
  me(@Req() req: {user:{id:string}}){
    return this.studentsService.findByUserId(req.user.id);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentsService.remove(id);
  }
}
