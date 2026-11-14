import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { GradingService } from "./grading.service";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("results")
export class ResultsController {
  constructor(private readonly grading: GradingService) {}

  // liste de tous les résultats avec leur état de publication
  @Roles(Role.ADMIN_STAFF)
  @Get()
  list() {
    return this.grading.listResults();
  }

  // résultat de l'étudiant connecté (rien tant que l'administration n'a pas publié)
  @Roles(Role.STUDENT)
  @Get("me")
  mine(@Req() req: { user: { id: string } }) {
    return this.grading.getMyResult(req.user.id);
  }
}
