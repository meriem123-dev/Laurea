import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { DefensesService } from "./defenses.service";
import { RespondJuryDto } from "./dto/respond-jury.dto";
import { errorPage, invitationPage, resultPage } from "./jury-page";

// Lien envoyé par mail aux membres du jury : PAS de connexion, le jeton du lien fait foi.
// GET  /api/jury-confirmations/:token -> page avec les détails et deux boutons
// POST /api/jury-confirmations/:token -> enregistre la réponse (answer=accept|decline)
@Controller("jury-confirmations")
export class JuryConfirmationsController {
  constructor(private readonly defensesService: DefensesService) {}

  @Get(":token")
  @Header("Content-Type", "text/html; charset=utf-8")
  async page(
    @Param("token") token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return invitationPage(await this.defensesService.getInvitation(token));
    } catch (e) {
      return this.error(e, res);
    }
  }

  @Post(":token")
  @HttpCode(200)
  @Header("Content-Type", "text/html; charset=utf-8")
  async respond(
    @Param("token") token: string,
    @Body() dto: RespondJuryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.defensesService.respondByToken(token, dto.answer);
      return resultPage(dto.answer === "accept");
    } catch (e) {
      return this.error(e, res);
    }
  }

  // les erreurs s'affichent dans une page lisible, pas en JSON
  private error(e: unknown, res: Response) {
    if (e instanceof HttpException) {
      res.status(e.getStatus());
      return errorPage(e.message);
    }
    throw e;
  }
}
