import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

// mêmes valeurs que ProfessorTitle dans le front
export const PROFESSOR_TITLES = ["Pr.", "Dr."] as const;
export type ProfessorTitle = (typeof PROFESSOR_TITLES)[number];

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty({ message: "Le prénom est obligatoire" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  lastName!: string;

  @IsEmail({}, { message: "Adresse e-mail invalide" })
  email!: string;

  @IsOptional()
  @IsIn(PROFESSOR_TITLES, { message: "Titre invalide (Pr. ou Dr.)" })
  title?: ProfessorTitle;

  @IsString()
  @IsNotEmpty({ message: "La spécialité est obligatoire" })
  @MaxLength(100, { message: "Spécialité trop longue" })
  specialty!: string;
}
