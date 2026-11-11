import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import {
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from "./dto/update-project.dto";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { Role } from "../generated/prisma/enums";
import type { AuthUser } from "./project-scope";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @Get()
  findAll() {
    return this.projects.findAll();
  }

  // "me" doit rester AVANT ":id", sinon Nest prend "me" pour un id
  @Roles(Role.STUDENT, Role.TEACHER)
  @Get("me")
  findMine(@Req() req: { user: AuthUser }) {
    return this.projects.findMine(req.user);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER, Role.STUDENT)
  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.projects.findOneFor(id, req.user);
  }

  @Roles(Role.ADMIN_STAFF)
  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Patch(":id/status")
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectStatusDto,
  ) {
    return this.projects.updateStatus(id, dto.status);
  }

  @Roles(Role.ADMIN_STAFF)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.projects.remove(id);
  }
}