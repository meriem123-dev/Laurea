import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { GradingService } from "./grading.service";
import { UpsertMyScoresDto } from "./dto/upsert-my-scores.dto";
import { UpdateDeliberationDto } from "./dto/update-deliberation.dto";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("defenses/:id/evaluation")
export class GradingController {
  constructor(private readonly grading: GradingService) {}

  // grille complète : critères, notes de chaque juré, moyenne, note retenue, état
  @Roles(Role.TEACHER, Role.ADMIN_STAFF)
  @Get()
  get(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.grading.getEvaluation(id, req.user);
  }

  // un juré saisit SES notes
  @Roles(Role.TEACHER)
  @Put("me")
  saveMine(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpsertMyScoresDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.grading.saveMyScores(id, req.user.id, dto);
  }

  // le président ajuste la note, justifie, ajoute des observations
  @Roles(Role.TEACHER)
  @Patch("deliberation")
  deliberate(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDeliberationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.grading.updateDeliberation(id, req.user.id, dto);
  }

  // le président verrouille (sans body : le serveur recalcule tout)
  @Roles(Role.TEACHER)
  @Post("lock")
  lock(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { id: string } },
  ) {
    return this.grading.lock(id, req.user.id);
  }

  // administration qui publie
  @Roles(Role.ADMIN_STAFF)
  @Post("publish")
  publish(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.grading.setPublished(id, true, req.user);
  }

  @Roles(Role.ADMIN_STAFF)
  @Post("unpublish")
  unpublish(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user: { id: string; role: Role } },
  ) {
    return this.grading.setPublished(id, false, req.user);
  }
}
