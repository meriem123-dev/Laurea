import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DefensesController } from "./defenses.controller";
import { DefensesService } from "./defenses.service";
import { JuryConfirmationsController } from "./jury-confirmations.controller";

@Module({
  controllers: [DefensesController, JuryConfirmationsController],
  providers: [DefensesService],
  imports: [AuthModule], // MailService (même service d'envoi que les comptes)
})
export class DefensesModule {}
