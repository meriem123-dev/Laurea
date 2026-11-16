import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { NotificationsService } from "./notifications.service";

type AuthRequest = { user: { id: string } };

// tous les rôles : chacun ne voit et ne modifie que ses propres notifications
@UseGuards(AuthGuard("jwt"))
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("me")
  findMine(@Req() req: AuthRequest) {
    return this.notificationsService.findMine(req.user.id);
  }

  // "read-all" doit rester AVANT ":id/read"
  @Patch("read-all")
  markAllAsRead(@Req() req: AuthRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(":id/read")
  markAsRead(@Req() req: AuthRequest, @Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Delete(":id")
  remove(@Req() req: AuthRequest, @Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.remove(req.user.id, id);
  }
}
