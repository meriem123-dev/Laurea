import { IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from "class-validator";

export class UpdateDeliberationDto {
  // null = revenir à la moyenne du jury
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  @Max(20)
  finalGrade?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  justification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  observations?: string;
}