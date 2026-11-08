import { PartialType } from "@nestjs/mapped-types";
import { CreateProjectDto } from "./create-project.dto";
import { ProjectStatus } from "../../generated/prisma/enums";
import { IsEnum } from "class-validator";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus) status: ProjectStatus;
}
