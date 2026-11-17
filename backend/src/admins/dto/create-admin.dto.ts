import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

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
}