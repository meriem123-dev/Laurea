import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Roles } from "../common/roles.decorator";
import { Role } from "../generated/prisma/enums";

@Controller("projects")
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Roles(Role.ADMIN_STAFF)
  @Post() create(@Body() dto: CreateProjectDto) { return this.projects.create(dto); }

  @Roles(Role.ADMIN_STAFF)
  @Get() findAll() { return this.projects.findAll(); }

  @Roles(Role.ADMIN_STAFF,Role.TEACHER)
  @Get(":id") findOne(@Param("id") id: string) { return this.projects.findOne(id); }

  @Roles(Role.ADMIN_STAFF)
  @Patch(":id") update(@Param("id") id: string, @Body() dto: UpdateProjectDto) { return this.projects.update(id, dto); }
}