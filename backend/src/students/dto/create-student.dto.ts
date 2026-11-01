import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Speciality } from '../../generated/prisma/client';

export class CreateStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  matricule: string;

  @IsEnum(Speciality)
  speciality: Speciality;

  @IsOptional()
  @IsString()
  group?: string;
}