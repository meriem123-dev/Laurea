import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "../generated/prisma/client";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AdminsService } from "./admins.service";
import { SystemAdminGuard } from "./system-admin.guard";
import { AdminDashboardService } from "./admin-dashboard.service";
// Lecture : tous les admins. Écriture : admin système uniquement (SystemAdminGuard).
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("admins")
export class AdminsController {
   constructor(
    private readonly adminsService: AdminsService,
    private readonly dashboardService: AdminDashboardService,
  ) {}

    // tableau de bord : chiffres clés, prochaines soutenances, actions à traiter
  @Roles(Role.ADMIN_STAFF)
  @Get("dashboard")
  dashboard() {
    return this.dashboardService.get();
  }
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Roles(Role.ADMIN_STAFF)
  @UseGuards(SystemAdminGuard)
  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @UseGuards(SystemAdminGuard)
  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }

  @Roles(Role.ADMIN_STAFF)
  @UseGuards(SystemAdminGuard)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.adminsService.remove(id);
  }
}