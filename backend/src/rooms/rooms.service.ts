// src/rooms/rooms.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    try {
      return await this.prisma.room.create({
        data: { ...dto, name: dto.name.trim() },
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  findAll() {
    return this.prisma.room.findMany({ orderBy: { name: "asc" } });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException(`Salle ${id} introuvable`);
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id); // 404 si inexistante
    try {
      return await this.prisma.room.update({
        where: { id },
        data: { ...dto, name: dto.name?.trim() },
      });
    } catch (e) {
      this.handleUniqueError(e);
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    // une salle utilisée par des soutenances ne peut pas être supprimée
    const used = await this.prisma.defense.count({ where: { roomId: id } });
    if (used > 0) {
      throw new ConflictException(
        `Impossible de supprimer cette salle : ${used} soutenance(s) y sont planifiées.`,
      );
    }
    await this.prisma.room.delete({ where: { id } });
    return { deleted: true };
  }

  private handleUniqueError(e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new ConflictException("Une salle avec ce nom existe déjà");
    }
  }
}
