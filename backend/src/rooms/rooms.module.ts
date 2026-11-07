// src/rooms/rooms.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [AuthModule],
})
export class RoomsModule {}