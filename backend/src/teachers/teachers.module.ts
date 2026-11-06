import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TeachersController } from "./teachers.controller";
import { TeachersImportService } from "./teachers-import.service";
import { TeachersService } from "./teachers.service";

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, TeachersImportService],
  imports: [AuthModule],
})
export class TeachersModule {}
