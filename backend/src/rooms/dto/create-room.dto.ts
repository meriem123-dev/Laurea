// src/rooms/dto/create-room.dto.ts
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export const ROOM_TONES = ["blue", "violet", "orange", "green"] as const;
export type RoomTone = (typeof ROOM_TONES)[number];

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  block?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  pole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipment?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsIn(ROOM_TONES)
  tone?: RoomTone;
}