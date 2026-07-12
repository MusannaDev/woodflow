import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { runWithTenant, TenantStore } from './tenant-context';

/**
 * Har bir so'rovni tenant konteksti ichida bajaradi. WorkspaceGuard req'ga
 * qo'ygan user/workspace ma'lumotini AsyncLocalStorage'ga o'tkazadi, shunda
 * PrismaService avtomatik filtrlash uchun uni ko'radi.
 *
 * Observable ni run() ichida subscribe qilamiz — shunda ALS konteksti
 * resolver'ning async bajarilishi davomida saqlanadi.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const store: TenantStore = {
      userId: req?.user?.userId ?? null,
      workspaceId: req?.workspaceId ?? null,
      role: req?.role ?? null,
    };

    return new Observable((subscriber) => {
      runWithTenant(store, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
