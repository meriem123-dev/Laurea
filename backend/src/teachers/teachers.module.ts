import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TeachersController } from "./teachers.controller";
import { TeachersImportService } from "./teachers-import.service";
import { TeachersService } from "./teachers.service";
import { TeacherDashboardService } from "./teacher-dashboard.service";

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, TeachersImportService, TeacherDashboardService],
  imports: [AuthModule],
})
export class TeachersModule {}
