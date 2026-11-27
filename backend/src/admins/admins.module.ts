import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { AdminDashboardService } from "./admin-dashboard.service";
@Module({
  controllers: [AdminsController],
    providers: [AdminsService, AdminDashboardService],
  imports: [AuthModule],
})
export class AdminsModule {}