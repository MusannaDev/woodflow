import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BusinessView,
  DecideRequestInput,
  JoinRequestView,
  UpdateBusinessInput,
} from './dto/business.types';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Faqat CEO (platforma darajasi). */
  private async assertCeo(userId: string) {
    const user = await this.prisma.raw.user.findUnique({ where: { id: userId } });
    if (user?.platformRole !== 'CEO') {
      throw new ForbiddenException('Bu amal faqat CEO uchun.');
    }
  }

  /** Foydalanuvchining ACTIVE biznesi (egasi sifatida). */
  private async ownedBusiness(userId: string) {
    const business = await this.prisma.raw.business.findFirst({
      where: { ownerId: userId },
    });
    if (!business) {
      throw new ForbiddenException('Sizda biznes yo‘q.');
    }
    return business;
  }

  // ─────────── CEO: owner so'rovlari ───────────

  async pendingOwnerRequests(userId: string): Promise<JoinRequestView[]> {
    await this.assertCeo(userId);
    const rows = await this.prisma.raw.joinRequest.findMany({
      where: { type: 'OWNER_SIGNUP', status: 'PENDING' },
      include: { user: true, business: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      userName: r.user.name,
      userPhone: r.user.phone,
      businessName: r.business.name,
      employeeName: null,
      createdAt: r.createdAt,
    }));
  }

  /** CEO qarori: approve → biznes ACTIVE + 2 workspace + OWNER a'zoliklar. */
  async decideOwnerRequest(
    ceoUserId: string,
    input: DecideRequestInput,
  ): Promise<JoinRequestView> {
    await this.assertCeo(ceoUserId);

    const request = await this.prisma.raw.joinRequest.findUnique({
      where: { id: input.requestId },
      include: { user: true, business: true },
    });
    if (!request || request.type !== 'OWNER_SIGNUP') {
      throw new NotFoundException('So‘rov topilmadi.');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('So‘rov allaqachon hal qilingan.');
    }

    const status = input.approve ? 'APPROVED' : 'REJECTED';

    await this.prisma.raw.$transaction(async (tx) => {
      await tx.joinRequest.update({
        where: { id: request.id },
        data: { status, decidedById: ceoUserId, decidedAt: new Date() },
      });
      await tx.business.update({
        where: { id: request.businessId },
        data: { status: input.approve ? 'ACTIVE' : 'REJECTED' },
      });
      if (input.approve) {
        const wood = await tx.workspace.create({
          data: {
            name: 'Yog‘och sotuvi',
            type: 'WOOD_TRADING',
            businessId: request.businessId,
          },
        });
        const lumber = await tx.workspace.create({
          data: {
            name: 'Taxta sotuvi',
            type: 'LUMBER_PRODUCTION',
            businessId: request.businessId,
          },
        });
        await tx.membership.createMany({
          data: [
            { userId: request.userId, workspaceId: wood.id, role: 'OWNER' },
            { userId: request.userId, workspaceId: lumber.id, role: 'OWNER' },
          ],
        });
      }
    });

    return {
      id: request.id,
      type: request.type,
      status,
      userName: request.user.name,
      userPhone: request.user.phone,
      businessName: request.business.name,
      employeeName: null,
      createdAt: request.createdAt,
    };
  }

  // ─────────── OWNER: ishchi so'rovlari ───────────

  async pendingWorkerRequests(userId: string): Promise<JoinRequestView[]> {
    const business = await this.ownedBusiness(userId);
    const rows = await this.prisma.raw.joinRequest.findMany({
      where: { type: 'WORKER_JOIN', status: 'PENDING', businessId: business.id },
      include: { user: true, employee: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      userName: r.user.name,
      userPhone: r.user.phone,
      businessName: null,
      employeeName: r.employee?.name ?? null,
      createdAt: r.createdAt,
    }));
  }

  /** Egasi qarori: approve → WORKER membership + Employee.userId bog'lanadi. */
  async decideWorkerRequest(
    ownerUserId: string,
    input: DecideRequestInput,
  ): Promise<JoinRequestView> {
    const business = await this.ownedBusiness(ownerUserId);

    const request = await this.prisma.raw.joinRequest.findUnique({
      where: { id: input.requestId },
      include: { user: true, employee: true },
    });
    if (
      !request ||
      request.type !== 'WORKER_JOIN' ||
      request.businessId !== business.id
    ) {
      throw new NotFoundException('So‘rov topilmadi.');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('So‘rov allaqachon hal qilingan.');
    }

    const status = input.approve ? 'APPROVED' : 'REJECTED';

    await this.prisma.raw.$transaction(async (tx) => {
      await tx.joinRequest.update({
        where: { id: request.id },
        data: { status, decidedById: ownerUserId, decidedAt: new Date() },
      });
      if (input.approve) {
        // Ishchi qaysi workspace'ga: employee.workspaceId bo'lsa o'shanga,
        // null (umumiy) bo'lsa — biznesning ikkala workspace'iga.
        const workspaces = await tx.workspace.findMany({
          where: request.employee?.workspaceId
            ? { id: request.employee.workspaceId }
            : { businessId: business.id },
          select: { id: true },
        });
        await tx.membership.createMany({
          data: workspaces.map((w) => ({
            userId: request.userId,
            workspaceId: w.id,
            role: 'WORKER' as const,
          })),
          skipDuplicates: true,
        });
        if (request.employeeId) {
          await tx.employee.update({
            where: { id: request.employeeId },
            data: { userId: request.userId },
          });
        }
      }
    });

    return {
      id: request.id,
      type: request.type,
      status,
      userName: request.user.name,
      userPhone: request.user.phone,
      businessName: null,
      employeeName: request.employee?.name ?? null,
      createdAt: request.createdAt,
    };
  }

  // ─────────── Biznes sozlamalari ───────────

  async myBusiness(userId: string): Promise<BusinessView> {
    const business = await this.ownedBusiness(userId);
    return {
      id: business.id,
      name: business.name,
      logoUrl: business.logoUrl,
      status: business.status,
    };
  }

  async updateBusiness(
    userId: string,
    input: UpdateBusinessInput,
  ): Promise<BusinessView> {
    const business = await this.ownedBusiness(userId);
    const updated = await this.prisma.raw.business.update({
      where: { id: business.id },
      data: { name: input.name.trim() },
    });
    return {
      id: updated.id,
      name: updated.name,
      logoUrl: updated.logoUrl,
      status: updated.status,
    };
  }

  /** Logo faylini saqlagach chaqiriladi (upload controller'dan). */
  async setLogo(userId: string, logoUrl: string): Promise<BusinessView> {
    const business = await this.ownedBusiness(userId);
    const updated = await this.prisma.raw.business.update({
      where: { id: business.id },
      data: { logoUrl },
    });
    return {
      id: updated.id,
      name: updated.name,
      logoUrl: updated.logoUrl,
      status: updated.status,
    };
  }
}
