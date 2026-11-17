import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Role } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// Réservé à l'admin système. Vérifié en base à chaque requête (pas dans le JWT),
// pour qu'un retrait de droit soit immédiat.
@Injectable()
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user } = ctx
      .switchToHttp()
      .getRequest<{ user?: { id: string } }>();
    if (!user) return false;

    const current = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isSystemAdmin: true },
    });
    if (current?.role !== Role.ADMIN_STAFF || !current.isSystemAdmin) {
      throw new ForbiddenException(
        "Seul l'administrateur système peut gérer les administrateurs.",
      );
    }
    return true;
  }
}