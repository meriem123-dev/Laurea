import { IsIn } from "class-validator";

export class RespondJuryDto {
  @IsIn(["accept", "decline"], {
    message: "Réponse invalide (accept ou decline)",
  })
  answer!: "accept" | "decline";
}
