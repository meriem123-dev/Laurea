import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { Speciality, Cursus } from "../../generated/prisma/client";

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: "Le prénom est obligatoire" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  lastName!: string;

  @IsEmail({}, { message: "Adresse e-mail invalide" })
  email!: string;

  @Matches(/^\d{8}$/, { message: "Le matricule doit contenir 8 chiffres" })
  matricule!: string;

  @IsEnum(Speciality, { message: "Spécialité invalide" })
  speciality!: Speciality;

  @IsEnum(Cursus, { message: "Cursus invalide" })
  cursus!: Cursus;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: "Groupe trop long" })
  group?: string;
}
