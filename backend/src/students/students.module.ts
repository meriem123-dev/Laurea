import { Module } from "@nestjs/common";
import { StudentsService } from "./students.service";
import { StudentsController } from "./students.controller";
import { AuthModule } from "../auth/auth.module";
import { StudentsImportService } from "./students-import.service";
import { StudentDashboardService } from "./student-dashboard.service";

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, StudentsImportService, StudentDashboardService],
  imports: [AuthModule],
})
export class StudentsModule {}
