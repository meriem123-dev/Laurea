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
} from "@nestjs/common";
import { Role, Speciality } from "../generated/prisma/client";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  
  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Roles(Role.ADMIN_STAFF,Role.TEACHER)
  @Get()
  findAll(
    @Query("speciality", new ParseEnumPipe(Speciality, { optional: true }))
    speciality?: Speciality,
    @Query("group") group?: string,
  ) {
    return this.studentsService.findAll({ speciality, group });
  }

  @Roles(Role.ADMIN_STAFF,Role.TEACHER)
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Roles(Role.ADMIN_STAFF,Role.TEACHER)
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
