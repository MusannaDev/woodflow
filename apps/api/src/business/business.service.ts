import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  BusinessView,
  CreateOwnerInput,
  DecidePaymentInput,
  DecideRequestInput,
  GrantAccessInput,
  JoinRequestView,
  MyBillingView,
  OwnerDetailView,
  OwnerView,
  PlatformPaymentView,
  PlatformStatsView,
  PlatformUserView,
  SubmitPaymentInput,
  UpdateBusinessInput,
  UpdateOwnerInput,
  UserDetailView,
} from './dto/business.types';

type BillingRow = {
  status: string;
  freeAccess: boolean;
  paidUntil: Date | null;
};

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Obuna bloklanganmi: ACTIVE biznes, tekin ruxsat yo'q, muddat o'tgan. */
  private static isBlocked(b: BillingRow): boolean {
    return (
      b.status === 'ACTIVE' &&
      !b.freeAccess &&
      (!b.paidUntil || b.paidUntil.getTime() < Date.now())
    );
  }

  /** Faqat CEO (platforma darajasi). */
  private async assertCeo(userId: string) {
    const user = await this.prisma.raw.user.findUnique({ where: { id: userId } });
    if (user?.platformRole !== 'CEO') {
      throw new ForbiddenException('Bu amal faqat CEO uchun.');
    }
  }

  /**
   * Biznes turiga qarab makon(lar) yaratadi + owner a'zoligini beradi.
   * WOOD_ONLY → 1 Yog'och; LUMBER_ONLY → 1 Taxta; BOTH → ikkalasi.
   */
  private async spawnWorkspaces(
    tx: Prisma.TransactionClient,
    businessId: string,
    ownerId: string,
    kind: 'WOOD_ONLY' | 'LUMBER_ONLY' | 'BOTH',
  ) {
    const specs: { name: string; type: 'WOOD_TRADING' | 'LUMBER_PRODUCTION' }[] =
      [];
    if (kind !== 'LUMBER_ONLY') {
      specs.push({ name: 'Yog‘och sotuvi', type: 'WOOD_TRADING' });
    }
    if (kind !== 'WOOD_ONLY') {
      specs.push({ name: 'Taxta sotuvi', type: 'LUMBER_PRODUCTION' });
    }
    for (const s of specs) {
      const w = await tx.workspace.create({
        data: { name: s.name, type: s.type, businessId },
      });
      await tx.membership.create({
        data: { userId: ownerId, workspaceId: w.id, role: 'OWNER' },
      });
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
        await this.spawnWorkspaces(
          tx,
          request.businessId,
          request.userId,
          request.business.kind,
        );
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

  // ─────────── CEO: statistika ───────────

  async platformStats(userId: string): Promise<PlatformStatsView> {
    await this.assertCeo(userId);
    const [ownerCount, pendingCount, userCount, workerCount] =
      await Promise.all([
        this.prisma.raw.business.count({ where: { status: 'ACTIVE' } }),
        this.prisma.raw.business.count({ where: { status: 'PENDING' } }),
        this.prisma.raw.user.count(),
        this.prisma.raw.user.count({
          where: { memberships: { some: { role: 'WORKER' } } },
        }),
      ]);
    return { ownerCount, pendingCount, userCount, workerCount };
  }

  // ─────────── CEO: ownerlar ro'yxati ───────────

  async owners(userId: string): Promise<OwnerView[]> {
    await this.assertCeo(userId);
    const rows = await this.prisma.raw.business.findMany({
      include: { owner: true, _count: { select: { workspaces: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((b) => ({
      userId: b.ownerId,
      name: b.owner.name,
      phone: b.owner.phone,
      businessId: b.id,
      businessName: b.name,
      status: b.status,
      kind: b.kind,
      freeAccess: b.freeAccess,
      blocked: BusinessService.isBlocked(b),
      paidUntil: b.paidUntil,
      logoUrl: b.logoUrl,
      workspaceCount: b._count.workspaces,
      createdAt: b.createdAt,
    }));
  }

  /** CEO to'g'ridan-to'g'ri owner yaratadi: darhol ACTIVE + 2 workspace. */
  async createOwner(
    ceoUserId: string,
    input: CreateOwnerInput,
  ): Promise<OwnerView> {
    await this.assertCeo(ceoUserId);

    const phone = input.phone.trim();
    const exists = await this.prisma.raw.user.findUnique({ where: { phone } });
    if (exists) {
      throw new ConflictException(
        'Bu telefon raqam allaqachon ro‘yxatdan o‘tgan.',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const kind = input.kind ?? 'BOTH';

    const result = await this.prisma.raw.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: input.name.trim(), phone, passwordHash },
      });
      const business = await tx.business.create({
        data: {
          name: input.businessName.trim(),
          ownerId: user.id,
          status: 'ACTIVE',
          kind,
        },
      });
      await this.spawnWorkspaces(tx, business.id, user.id, kind);
      return { user, business };
    });

    return {
      userId: result.user.id,
      name: result.user.name,
      phone: result.user.phone,
      businessId: result.business.id,
      businessName: result.business.name,
      status: result.business.status,
      kind: result.business.kind,
      freeAccess: result.business.freeAccess,
      blocked: BusinessService.isBlocked(result.business),
      paidUntil: result.business.paidUntil,
      logoUrl: result.business.logoUrl,
      workspaceCount: kind === 'BOTH' ? 2 : 1,
      createdAt: result.business.createdAt,
    };
  }

  /** CEO owner + biznes ma'lumotini tahrirlaydi (parol ixtiyoriy). */
  async updateOwner(
    ceoUserId: string,
    input: UpdateOwnerInput,
  ): Promise<OwnerView> {
    await this.assertCeo(ceoUserId);

    const business = await this.prisma.raw.business.findUnique({
      where: { id: input.businessId },
      include: { owner: true, _count: { select: { workspaces: true } } },
    });
    if (!business) {
      throw new NotFoundException('Biznes topilmadi.');
    }

    const phone = input.phone.trim();
    if (phone !== business.owner.phone) {
      const clash = await this.prisma.raw.user.findUnique({ where: { phone } });
      if (clash) {
        throw new ConflictException('Bu telefon raqam band.');
      }
    }

    const userData: {
      name: string;
      phone: string;
      passwordHash?: string;
    } = { name: input.name.trim(), phone };
    if (input.newPassword) {
      userData.passwordHash = await bcrypt.hash(input.newPassword, 10);
    }

    await this.prisma.raw.$transaction([
      this.prisma.raw.user.update({
        where: { id: business.ownerId },
        data: userData,
      }),
      this.prisma.raw.business.update({
        where: { id: business.id },
        data: { name: input.businessName.trim() },
      }),
    ]);

    return {
      userId: business.ownerId,
      name: input.name.trim(),
      phone,
      businessId: business.id,
      businessName: input.businessName.trim(),
      status: business.status,
      kind: business.kind,
      freeAccess: business.freeAccess,
      blocked: BusinessService.isBlocked(business),
      paidUntil: business.paidUntil,
      logoUrl: business.logoUrl,
      workspaceCount: business._count.workspaces,
      createdAt: business.createdAt,
    };
  }

  /**
   * CEO biznesni to'liq o'chiradi: barcha workspace ma'lumoti (savdo, to'lov,
   * ombor, ishlab chiqarish, ishchi, ledger...) bog'liqlik tartibida o'chadi.
   * CEO hisobini o'chirib bo'lmaydi. Owner boshqa biznes/a'zoligi bo'lmasa,
   * user hisobi ham o'chiriladi.
   */
  async deleteOwner(ceoUserId: string, businessId: string): Promise<boolean> {
    await this.assertCeo(ceoUserId);

    const business = await this.prisma.raw.business.findUnique({
      where: { id: businessId },
      include: { owner: true, workspaces: { select: { id: true } } },
    });
    if (!business) {
      throw new NotFoundException('Biznes topilmadi.');
    }
    if (business.owner.platformRole === 'CEO') {
      throw new ForbiddenException('CEO hisobini o‘chirib bo‘lmaydi.');
    }

    const wsIds = business.workspaces.map((w) => w.id);
    const ownerId = business.ownerId;

    await this.prisma.raw.$transaction(async (tx) => {
      // 1. Savdo bolalari
      await tx.payment.deleteMany({
        where: { sale: { workspaceId: { in: wsIds } } },
      });
      await tx.saleItem.deleteMany({
        where: { sale: { workspaceId: { in: wsIds } } },
      });
      await tx.sale.deleteMany({ where: { workspaceId: { in: wsIds } } });

      // 2. Ombor bolalari (nuqson, transfer)
      await tx.defectRecord.deleteMany({
        where: { lot: { workspaceId: { in: wsIds } } },
      });
      await tx.stockTransfer.deleteMany({
        where: {
          OR: [
            { fromWorkspaceId: { in: wsIds } },
            { toWorkspaceId: { in: wsIds } },
          ],
        },
      });

      // 3. Ishlab chiqarish zanjiri: FinishedGoodsLot → ProductionBatch
      await tx.finishedGoodsLot.deleteMany({
        where: { workspaceId: { in: wsIds } },
      });
      await tx.productionBatch.deleteMany({
        where: { workspaceId: { in: wsIds } },
      });

      // 4. Ombor + kirim + shablon + kontragent
      await tx.inventoryLot.deleteMany({ where: { workspaceId: { in: wsIds } } });
      await tx.purchase.deleteMany({ where: { workspaceId: { in: wsIds } } });
      await tx.productTemplate.deleteMany({
        where: { workspaceId: { in: wsIds } },
      });
      await tx.shipment.deleteMany({ where: { workspaceId: { in: wsIds } } });
      await tx.supplier.deleteMany({ where: { workspaceId: { in: wsIds } } });
      await tx.customer.deleteMany({ where: { workspaceId: { in: wsIds } } });

      // 5. HR: oylik → xarajat → so'rov → ishchi
      await tx.salaryPayment.deleteMany({
        where: {
          employee: {
            OR: [{ workspaceId: { in: wsIds } }, { businessId }],
          },
        },
      });
      await tx.expense.deleteMany({
        where: {
          OR: [{ workspaceId: { in: wsIds } }, { employee: { businessId } }],
        },
      });
      await tx.joinRequest.deleteMany({ where: { businessId } });
      await tx.platformPayment.deleteMany({ where: { businessId } });
      await tx.employee.deleteMany({
        where: { OR: [{ workspaceId: { in: wsIds } }, { businessId }] },
      });

      // 6. Ledger (avval self-ref null) + a'zoliklar
      await tx.ledgerEntry.updateMany({
        where: { workspaceId: { in: wsIds } },
        data: { reversedById: null },
      });
      await tx.ledgerEntry.deleteMany({ where: { workspaceId: { in: wsIds } } });
      await tx.membership.deleteMany({ where: { workspaceId: { in: wsIds } } });

      // 7. Workspace'lar + biznes
      await tx.workspace.deleteMany({ where: { businessId } });
      await tx.business.delete({ where: { id: businessId } });

      // 8. Owner hisobi — agar boshqa hech narsaga bog'liq bo'lmasa
      const rem = await tx.user.findUnique({
        where: { id: ownerId },
        include: {
          _count: {
            select: {
              ownedBusinesses: true,
              memberships: true,
              employeeLinks: true,
              joinRequests: true,
              decidedRequests: true,
            },
          },
        },
      });
      if (
        rem &&
        rem.platformRole !== 'CEO' &&
        rem._count.ownedBusinesses === 0 &&
        rem._count.memberships === 0 &&
        rem._count.employeeLinks === 0 &&
        rem._count.joinRequests === 0 &&
        rem._count.decidedRequests === 0
      ) {
        await tx.user.delete({ where: { id: ownerId } });
      }
    });

    return true;
  }

  // ─────────── CEO: barcha foydalanuvchilar ───────────

  async allUsers(userId: string): Promise<PlatformUserView[]> {
    await this.assertCeo(userId);
    const rows = await this.prisma.raw.user.findMany({
      include: {
        ownedBusinesses: { select: { name: true } },
        memberships: {
          include: {
            workspace: { include: { business: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((u) => {
      const owned = u.ownedBusinesses[0] ?? null;
      const viaMembership = u.memberships[0]?.workspace.business ?? null;
      const isWorker = u.memberships.some((m) => m.role === 'WORKER');
      const roleLabel =
        u.platformRole === 'CEO'
          ? 'CEO'
          : owned
            ? 'Owner'
            : isWorker
              ? 'Ishchi'
              : '—';
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        platformRole: u.platformRole,
        roleLabel,
        businessName: owned?.name ?? viaMembership?.name ?? null,
        createdAt: u.createdAt,
      };
    });
  }

  // ─────────── CEO: detail sahifalar ───────────

  async ownerDetail(
    ceoUserId: string,
    businessId: string,
  ): Promise<OwnerDetailView> {
    await this.assertCeo(ceoUserId);
    const b = await this.prisma.raw.business.findUnique({
      where: { id: businessId },
      include: {
        owner: true,
        workspaces: { select: { id: true, name: true, type: true } },
        _count: { select: { employees: true } },
        platformPayments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!b) {
      throw new NotFoundException('Biznes topilmadi.');
    }
    return {
      userId: b.ownerId,
      name: b.owner.name,
      phone: b.owner.phone,
      businessId: b.id,
      businessName: b.name,
      status: b.status,
      kind: b.kind,
      freeAccess: b.freeAccess,
      blocked: BusinessService.isBlocked(b),
      paidUntil: b.paidUntil,
      logoUrl: b.logoUrl,
      employeeCount: b._count.employees,
      createdAt: b.createdAt,
      workspaces: b.workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        type: w.type,
      })),
      payments: b.platformPayments.map((p) =>
        this.toPaymentGql(p, b.name, b.owner.name),
      ),
    };
  }

  async userDetail(
    ceoUserId: string,
    userId: string,
  ): Promise<UserDetailView> {
    await this.assertCeo(ceoUserId);
    const u = await this.prisma.raw.user.findUnique({
      where: { id: userId },
      include: {
        ownedBusinesses: { select: { name: true } },
        memberships: {
          include: {
            workspace: { include: { business: { select: { name: true } } } },
          },
        },
      },
    });
    if (!u) {
      throw new NotFoundException('Foydalanuvchi topilmadi.');
    }
    const owned = u.ownedBusinesses[0] ?? null;
    const isWorker = u.memberships.some((m) => m.role === 'WORKER');
    const roleLabel =
      u.platformRole === 'CEO'
        ? 'CEO'
        : owned
          ? 'Owner'
          : isWorker
            ? 'Ishchi'
            : '—';
    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      platformRole: u.platformRole,
      roleLabel,
      ownedBusinessName: owned?.name ?? null,
      createdAt: u.createdAt,
      memberships: u.memberships.map((m) => ({
        workspaceName: m.workspace.name,
        businessName: m.workspace.business?.name ?? null,
        role: m.role,
      })),
    };
  }

  // ─────────── Platforma to'lovi (obuna) ───────────

  private toPaymentGql(
    p: {
      id: string;
      businessId: string;
      amountUzs: Prisma.Decimal;
      months: number;
      note: string | null;
      receiptUrl: string | null;
      status: string;
      createdAt: Date;
    },
    businessName: string | null = null,
    ownerName: string | null = null,
  ): PlatformPaymentView {
    return {
      id: p.id,
      businessId: p.businessId,
      businessName,
      ownerName,
      amountUzs: p.amountUzs.toNumber(),
      months: p.months,
      note: p.note,
      receiptUrl: p.receiptUrl,
      status: p.status,
      createdAt: p.createdAt,
    };
  }

  /** Owner: platformaga to'lov yuboradi (CEO tasdiqlaydi). */
  async submitPlatformPayment(
    userId: string,
    input: SubmitPaymentInput,
  ): Promise<PlatformPaymentView> {
    const business = await this.ownedBusiness(userId);
    const p = await this.prisma.raw.platformPayment.create({
      data: {
        businessId: business.id,
        amountUzs: new Prisma.Decimal(input.amountUzs),
        months: input.months,
        note: input.note ?? null,
        receiptUrl: input.receiptUrl ?? null,
      },
    });
    return this.toPaymentGql(p, business.name);
  }

  /** Owner: o'z obuna holati + to'lov tarixi. */
  async myBilling(userId: string): Promise<MyBillingView> {
    const business = await this.ownedBusiness(userId);
    const payments = await this.prisma.raw.platformPayment.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
    });
    return {
      status: business.status,
      blocked: BusinessService.isBlocked(business),
      freeAccess: business.freeAccess,
      paidUntil: business.paidUntil,
      payments: payments.map((p) => this.toPaymentGql(p, business.name)),
    };
  }

  /** CEO: kutilayotgan platforma to'lovlari. */
  async pendingPlatformPayments(
    ceoUserId: string,
  ): Promise<PlatformPaymentView[]> {
    await this.assertCeo(ceoUserId);
    const rows = await this.prisma.raw.platformPayment.findMany({
      where: { status: 'PENDING' },
      include: { business: { include: { owner: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((p) =>
      this.toPaymentGql(p, p.business.name, p.business.owner.name),
    );
  }

  /** CEO: to'lovni tasdiqlaydi → biznes muddati uzayadi; yoki rad etadi. */
  async decidePlatformPayment(
    ceoUserId: string,
    input: DecidePaymentInput,
  ): Promise<PlatformPaymentView> {
    await this.assertCeo(ceoUserId);
    const payment = await this.prisma.raw.platformPayment.findUnique({
      where: { id: input.paymentId },
      include: { business: { include: { owner: { select: { name: true } } } } },
    });
    if (!payment) {
      throw new NotFoundException('To‘lov topilmadi.');
    }
    if (payment.status !== 'PENDING') {
      throw new BadRequestException('To‘lov allaqachon hal qilingan.');
    }

    const status = input.approve ? 'APPROVED' : 'REJECTED';
    const updated = await this.prisma.raw.$transaction(async (tx) => {
      const u = await tx.platformPayment.update({
        where: { id: payment.id },
        data: { status, decidedById: ceoUserId, decidedAt: new Date() },
      });
      if (input.approve) {
        const cur = payment.business.paidUntil;
        const base = cur && cur.getTime() > Date.now() ? new Date(cur) : new Date();
        base.setMonth(base.getMonth() + payment.months);
        await tx.business.update({
          where: { id: payment.businessId },
          data: { paidUntil: base },
        });
      }
      return u;
    });

    return this.toPaymentGql(
      updated,
      payment.business.name,
      payment.business.owner.name,
    );
  }

  /** CEO: biznesga tekin ruxsat beradi yoki oladi. */
  async grantFreeAccess(
    ceoUserId: string,
    input: GrantAccessInput,
  ): Promise<OwnerView> {
    await this.assertCeo(ceoUserId);
    const business = await this.prisma.raw.business.update({
      where: { id: input.businessId },
      data: { freeAccess: input.freeAccess },
      include: { owner: true, _count: { select: { workspaces: true } } },
    });
    return {
      userId: business.ownerId,
      name: business.owner.name,
      phone: business.owner.phone,
      businessId: business.id,
      businessName: business.name,
      status: business.status,
      kind: business.kind,
      freeAccess: business.freeAccess,
      blocked: BusinessService.isBlocked(business),
      paidUntil: business.paidUntil,
      logoUrl: business.logoUrl,
      workspaceCount: business._count.workspaces,
      createdAt: business.createdAt,
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
