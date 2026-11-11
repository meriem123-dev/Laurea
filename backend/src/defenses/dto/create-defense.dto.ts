import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from "class-validator";
import { JURY_MEMBER_COUNT,MIN_JURY_MEMBER_COUNT } from "../defense.rules";

// mêmes champs que DefenseFormData du front (+ durée facultative)
export class CreateDefenseDto {
  @IsUUID("all", { message: "Projet invalide" })
  projectId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date invalide (format 2026-06-18)",
  })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "Heure invalide (format 09:00)",
  })
  time!: string;

  // gérée par l'application : 60 min par défaut
  @IsOptional()
  @IsInt({ message: "Durée invalide" })
  @Min(15, { message: "La durée minimale est de 15 minutes" })
  @Max(240, { message: "La durée maximale est de 240 minutes" })
  duration?: number;

  @IsUUID("all", { message: "Salle invalide" })
  roomId!: string;

  @IsUUID("all", { message: "Président du jury invalide" })
  presidentId!: string;

  @IsArray()
  @ArrayMinSize(MIN_JURY_MEMBER_COUNT, {
    message: `Le jury doit compter au moins ${JURY_MEMBER_COUNT} jurés en plus du président`,
  })
  @ArrayMaxSize(JURY_MEMBER_COUNT, {
    message: `Le jury doit compter ${JURY_MEMBER_COUNT} jurés en plus du président`,
  })
  @IsUUID("all", { each: true, message: "Juré invalide" })
  memberIds!: string[];
}
