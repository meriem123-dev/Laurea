import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Speciality,Cursus } from "../../generated/prisma/client";

export class CreateStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  matricule: string;

  @IsEnum(Cursus)
  cursus: Cursus;

  @IsEnum(Speciality)
  speciality: Speciality;

  @IsOptional()
  @IsString()
  group?: string | null;
}
