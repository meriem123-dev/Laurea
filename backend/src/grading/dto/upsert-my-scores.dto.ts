import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export class ScoreItemDto {
  @IsString()
  criterionId!: string;

  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  @Max(20)
  value!: number | null;
}

export class UpsertMyScoresDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScoreItemDto)
  scores!: ScoreItemDto[];
}