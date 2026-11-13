import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { CreateDefenseDto } from "./dto/create-defense.dto";
import { UpdateDefenseDto } from "./dto/update-defense.dto";
import { RespondJuryDto } from "./dto/respond-jury.dto";
import { DefensesService } from "./defenses.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("defenses")
export class DefensesController {
  constructor(private readonly defensesService: DefensesService) {}

  @Roles(Role.ADMIN_STAFF)
  @Post()
  create(@Body() dto: CreateDefenseDto) {
    return this.defensesService.create(dto);
  }

  // ?from=2026-06-15&to=2026-06-19&roomId=...&teacherId=...
  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get()
  findAll(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("roomId") roomId?: string,
    @Query("teacherId") teacherId?: string,
  ) {
    return this.defensesService.findAll({ from, to, roomId, teacherId });
  }

  // "me" doit rester AVANT ":id"
  @Roles(Role.TEACHER, Role.STUDENT)
  @Get("me")
  findMine(@Req() req: { user: { id: string; role: Role } }) {
    return this.defensesService.findMine(req.user);
  }

    // étudiant : sa soutenance avec noms (salle, jury, encadrant)
  @Roles(Role.STUDENT)
  @Get("my-defense")
  findMyDefense(@Req() req: { user: { id: string } }) {
    return this.defensesService.findMyDefense(req.user.id);
  }

  @Roles(Role.ADMIN_STAFF, Role.TEACHER)
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.defensesService.findOne(id);
  }

  // un membre du jury confirme ou décline depuis son espace : { "answer": "accept" | "decline" }
  @Roles(Role.TEACHER)
  @Post(":id/response")
  respond(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: RespondJuryDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.defensesService.respondAsTeacher(id, req.user.id, dto.answer);
  }

  @Roles(Role.ADMIN_STAFF)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateDefenseDto) {
    return this.defensesService.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.defensesService.remove(id);
  }
}
