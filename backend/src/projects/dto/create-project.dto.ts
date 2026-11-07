import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, IsUUID,
} from "class-validator";
import { Speciality, TeamType } from "../../generated/prisma/client";
import { Matches } from "class-validator";

export class CreateProjectDto {
  @IsString() title: string;

  @Matches(/^\d{4}-\d{4}$/, { message: "Format attendu : 2026-2027" })
  @IsString() academicYear: string;

  @IsEnum(Speciality) domain: Speciality;

  @IsOptional() @IsString() company?: string;

  @IsEnum(TeamType) teamType: TeamType;

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(4) @IsUUID("all", { each: true })
  studentIds: string[];

  @IsUUID() supervisorId: string;

  @IsOptional() @IsUUID() coSupervisorId?: string | null;
  
  @IsOptional() @IsString() notes?: string;
}
