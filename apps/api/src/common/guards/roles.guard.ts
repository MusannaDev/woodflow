import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RoleGuard — GLOBAL ishlaydi, lekin faqat @Roles(...) belgisi bor joyda
 * tekshiradi. Belgisiz endpoint → AuthGuard darajasi yetadi (hamma
 * authenticated o'tadi). Belgili endpoint → joriy workspace'dagi
 * Membership.role ro'yxatda bo'lishi shart (masalan ADMIN, AGENT).
 *
 * Eslatma: WorkspaceGuard allaqachon req.role ni o'rnatgan bo'lsa, shu
 * ishlatiladi; bo'lmasa x-workspace-id orqali a'zolik o'qiladi.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true; // @Roles yo'q — AuthGuard darajasi kifoya
    }

    const req = GqlExecutionContext.create(context).getContext().req;
    const userId: string | undefined = req?.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Autentifikatsiya talab qilinadi.');
    }

    // WorkspaceGuard o'rnatgan bo'lsa — tayyor
    let role: Role | undefined = req.role;

    if (!role) {
      const workspaceId: string | undefined = req.headers?.['x-workspace-id'];
      if (!workspaceId) {
        throw new ForbiddenException('x-workspace-id header yuborilmagan.');
      }
      const membership = await this.prisma.raw.membership.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });
      if (!membership) {
        throw new ForbiddenException('Bu workspace’ga ruxsatingiz yo‘q.');
      }
      role = membership.role;
    }

    if (!required.includes(role)) {
      throw new ForbiddenException(
        `Bu amal uchun ruxsat yo‘q. Kerakli rol: ${required.join(' yoki ')}.`,
      );
    }
    return true;
  }
}
