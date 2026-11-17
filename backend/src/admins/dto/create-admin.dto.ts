import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { AdminType } from "../../generated/prisma/client";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: "Le prénom est obligatoire" })
  @MaxLength(100, { message: "Prénom trop long" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  @MaxLength(100, { message: "Nom trop long" })
  lastName!: string;

  @IsEmail({}, { message: "Adresse e-mail invalide" })
  email!: string;

  @IsEnum(AdminType, { message: "Fonction invalide" })
  adminType!: AdminType;
}