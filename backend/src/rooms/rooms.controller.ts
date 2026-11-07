// src/rooms/rooms.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { RoomsService } from "./rooms.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER, Role.STUDENT)
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER, Role.STUDENT)
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.roomsService.findOne(id);
  }

  @Roles(Role.ADMIN_STAFF)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.roomsService.remove(id);
  }
}