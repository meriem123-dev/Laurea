import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

// Remplace l'évaluation courante : grade absent ou null = pas de note (document « à évaluer »)
export class EvaluateDocumentDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Note invalide" })
  @Min(0, { message: "La note doit être comprise entre 0 et 20" })
  @Max(20, { message: "La note doit être comprise entre 0 et 20" })
  grade?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: "Commentaire trop long (2000 caractères max)" })
  comment?: string;
}