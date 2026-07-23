import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationView } from './dto/notification.types';

export interface NotifyPayload {
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
}

/**
 * Ilova ichidagi bildirishnomalar. Boshqa servislar hodisa yuz berganda
 * `notify` / `notifyCeos` chaqiradi. Frontend polling bilan o'qiydi.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Bitta foydalanuvchiga. Xato bo'lsa asosiy amalni buzmaydi. */
  async notify(userId: string, p: NotifyPayload): Promise<void> {
    try {
      await this.prisma.raw.notification.create({
        data: {
          userId,
          type: p.type,
          title: p.title,
          body: p.body ?? null,
          link: p.link ?? null,
        },
      });
    } catch (e) {
      this.logger.warn(`notify xato: ${e instanceof Error ? e.message : e}`);
    }
  }

  /**
   * Makon egasiga (owner) — lekin amalni bajargan kishi owner'ning o'zi
   * bo'lsa yubormaydi (o'ziga o'zi xabar bermaydi). Ishchi qilганда keladi.
   */
  async notifyWorkspaceOwner(
    workspaceId: string,
    actorUserId: string,
    p: NotifyPayload,
  ): Promise<void> {
    try {
      const ws = await this.prisma.raw.workspace.findUnique({
        where: { id: workspaceId },
        select: { business: { select: { ownerId: true } } },
      });
      const ownerId = ws?.business?.ownerId;
      if (ownerId && ownerId !== actorUserId) {
        await this.notify(ownerId, p);
      }
    } catch (e) {
      this.logger.warn(
        `notifyWorkspaceOwner xato: ${e instanceof Error ? e.message : e}`,
      );
    }
  }

  static som(n: number): string {
    return `${new Intl.NumberFormat('uz-UZ').format(Math.round(n))} so'm`;
  }

  /** Barcha CEO'larga. */
  async notifyCeos(p: NotifyPayload): Promise<void> {
    try {
      const ceos = await this.prisma.raw.user.findMany({
        where: { platformRole: 'CEO' },
        select: { id: true },
      });
      if (ceos.length === 0) return;
      await this.prisma.raw.notification.createMany({
        data: ceos.map((c) => ({
          userId: c.id,
          type: p.type,
          title: p.title,
          body: p.body ?? null,
          link: p.link ?? null,
        })),
      });
    } catch (e) {
      this.logger.warn(`notifyCeos xato: ${e instanceof Error ? e.message : e}`);
    }
  }

  async list(userId: string): Promise<NotificationView[]> {
    const rows = await this.prisma.raw.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      read: r.read,
      createdAt: r.createdAt,
    }));
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.raw.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(userId: string, id: string): Promise<boolean> {
    await this.prisma.raw.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    return true;
  }

  async markAllRead(userId: string): Promise<boolean> {
    await this.prisma.raw.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return true;
  }

  /** Har kuni 09:00 — obuna muddati tugashi haqida owner'ga eslatma. */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'subscription-reminders' })
  async subscriptionReminders(): Promise<void> {
    const businesses = await this.prisma.raw.business.findMany({
      where: { status: 'ACTIVE', freeAccess: false, paidUntil: { not: null } },
      select: { id: true, name: true, ownerId: true, paidUntil: true },
    });
    const now = Date.now();
    for (const b of businesses) {
      if (!b.paidUntil) continue;
      const daysLeft = Math.ceil((b.paidUntil.getTime() - now) / 86_400_000);
      if (daysLeft === 3 || daysLeft === 1) {
        await this.notify(b.ownerId, {
          type: 'SUB_EXPIRING',
          title:
            daysLeft === 1
              ? 'Obunangiz ertaga tugaydi'
              : 'Obunangiz 3 kundan keyin tugaydi',
          body: `"${b.name}" obunasini uzaytiring — aks holda bloklanadi.`,
          link: '/obuna',
        });
      } else if (daysLeft === 0) {
        await this.notify(b.ownerId, {
          type: 'SUB_EXPIRED',
          title: 'Obuna bugun tugaydi',
          body: `"${b.name}" — davom etish uchun to'lov qiling.`,
          link: '/obuna',
        });
      }
    }
    this.logger.log(`Obuna eslatmalari tekshirildi (${businesses.length} biznes)`);
  }
}
