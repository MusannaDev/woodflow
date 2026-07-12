import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Izolyatsiya qoidasi (System Design §3) — eng muhim xavfsizlik nuqtasi.
 *
 * Foydalanuvchi qaysi workspace'da ishlayotganini `x-workspace-id` header'ida
 * yuboradi. Guard:
 *   1) shu workspace'ga a'zoligini tekshiradi (Membership),
 *   2) req.workspaceId va req.role ni o'rnatadi.
 *
 * Keyin TenantInterceptor shu qiymatni AsyncLocalStorage'ga qo'yadi va
 * PrismaService har bir so'rovni avtomatik filtrlaydi.
 *
 * Ishlatilishi: @UseGuards(GqlAuthGuard, WorkspaceGuard)
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const user = req.user;
    if (!user?.userId) {
      throw new ForbiddenException('Autentifikatsiya talab qilinadi.');
    }

    const workspaceId: string | undefined =
      req.headers?.['x-workspace-id'] ?? req.workspaceId;
    if (!workspaceId) {
      throw new ForbiddenException('x-workspace-id header yuborilmagan.');
    }

    const membership = await this.prisma.raw.membership.findUnique({
      where: {
        userId_workspaceId: { userId: user.userId, workspaceId },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Bu workspace’ga ruxsatingiz yo‘q.');
    }

    req.workspaceId = workspaceId;
    req.role = membership.role;
    return true;
  }
}
