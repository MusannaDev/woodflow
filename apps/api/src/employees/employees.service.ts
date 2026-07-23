import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeeInput,
  Employee,
  PaySalaryInput,
  SalaryPayment,
} from './dto/employee.types';

/**
 * Ishchi workspaceId nullable (null = ikkala biznes) — Expense kabi
 * qo'lda filtrlanadi: joriy workspace + umumiy.
 */
@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(workspaceId: string): Promise<Employee[]> {
    const rows = await this.prisma.raw.employee.findMany({
      where: { OR: [{ workspaceId }, { workspaceId: null }] },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(EmployeesService.toGql);
  }

  async create(
    workspaceId: string,
    input: CreateEmployeeInput,
  ): Promise<Employee> {
    // Joriy workspace'ning biznesi — worker-match uchun saqlanadi
    const ws = await this.prisma.raw.workspace.findUnique({
      where: { id: workspaceId },
      select: { businessId: true },
    });

    const row = await this.prisma.raw.employee.create({
      data: {
        workspaceId: input.isShared ? null : workspaceId,
        businessId: ws?.businessId ?? null,
        name: input.name,
        phone: input.phone,
        position: input.position,
        salaryAmount: new Prisma.Decimal(input.salaryAmount),
        salaryType: input.salaryType,
      },
    });

    // Shu telefon bilan KUTAYOTGAN user bo'lsa — egaga avto so'rov ochamiz
    if (input.phone && ws?.businessId) {
      const waiting = await this.prisma.raw.user.findFirst({
        where: {
          phone: input.phone,
          platformRole: 'USER',
          memberships: { none: {} },
          ownedBusinesses: { none: {} },
        },
      });
      if (waiting) {
        const already = await this.prisma.raw.joinRequest.findFirst({
          where: { userId: waiting.id, status: 'PENDING' },
        });
        if (!already) {
          await this.prisma.raw.joinRequest.create({
            data: {
              type: 'WORKER_JOIN',
              userId: waiting.id,
              businessId: ws.businessId,
              employeeId: row.id,
            },
          });
        }
      }
    }

    return EmployeesService.toGql(row);
  }

  /**
   * Oylik to'laydi (ATOMIK): SalaryPayment + avtomatik SALARY xarajat.
   * Xarajat ishchining workspace'iga yoziladi (umumiy ishchi → umumiy xarajat,
   * konsolidatsiyada ikkiga taqsimlanadi).
   */
  async paySalary(
    workspaceId: string,
    input: PaySalaryInput,
  ): Promise<SalaryPayment> {
    const employee = await this.prisma.raw.employee.findFirst({
      where: {
        id: input.employeeId,
        OR: [{ workspaceId }, { workspaceId: null }],
      },
    });
    if (!employee) {
      throw new NotFoundException('Ishchi topilmadi.');
    }

    const date = input.date ?? new Date();
    const amount = new Prisma.Decimal(input.amountUzs);

    const payment = await this.prisma.raw.$transaction(async (tx) => {
      const p = await tx.salaryPayment.create({
        data: {
          employeeId: employee.id,
          amountUzs: amount,
          period: input.period,
          date,
        },
      });
      await tx.expense.create({
        data: {
          workspaceId: employee.workspaceId, // null = umumiy
          category: 'SALARY',
          amountUzs: amount,
          date,
          description: `Oylik: ${employee.name} (${input.period})`,
          employeeId: employee.id,
        },
      });
      return p;
    });

    // Ishchi hisobi bog'langan bo'lsa — unga bildirishnoma
    if (employee.userId) {
      await this.notifications.notify(employee.userId, {
        type: 'SALARY_PAID',
        title: "Sizga oylik to'landi",
        body: `${new Intl.NumberFormat('uz-UZ').format(input.amountUzs)} so'm (${input.period}) — qabul qildingizmi?`,
        link: '/oylik',
      });
    }

    return EmployeesService.toSalaryGql(payment, employee.name);
  }

  /** Ishchi o'z oyliklarini ko'radi (User.id orqali bog'langan Employee). */
  async mySalaries(userId: string): Promise<SalaryPayment[]> {
    const rows = await this.prisma.raw.salaryPayment.findMany({
      where: { employee: { userId } },
      include: { employee: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => EmployeesService.toSalaryGql(r, r.employee.name));
  }

  /** Ishchi oylikni "qabul qildim" deb tasdiqlaydi. */
  async confirmSalary(
    userId: string,
    paymentId: string,
  ): Promise<SalaryPayment> {
    const payment = await this.prisma.raw.salaryPayment.findUnique({
      where: { id: paymentId },
      include: {
        employee: {
          select: {
            name: true,
            userId: true,
            business: { select: { ownerId: true } },
          },
        },
      },
    });
    if (!payment || payment.employee.userId !== userId) {
      throw new NotFoundException('Oylik yozuvi topilmadi.');
    }
    if (payment.status === 'CONFIRMED') {
      return EmployeesService.toSalaryGql(payment, payment.employee.name);
    }
    const updated = await this.prisma.raw.salaryPayment.update({
      where: { id: paymentId },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    });

    const ownerId = payment.employee.business?.ownerId;
    if (ownerId) {
      await this.notifications.notify(ownerId, {
        type: 'SALARY_CONFIRMED',
        title: 'Oylik tasdiqlandi ✓',
        body: `${payment.employee.name} oylikni qabul qildi.`,
        link: '/oylik',
      });
    }

    return EmployeesService.toSalaryGql(updated, payment.employee.name);
  }

  /** Owner: shu makondagi (yoki umumiy) ishchilar oylik tarixi. */
  async salaryHistory(workspaceId: string): Promise<SalaryPayment[]> {
    const rows = await this.prisma.raw.salaryPayment.findMany({
      where: {
        employee: { OR: [{ workspaceId }, { workspaceId: null }] },
      },
      include: { employee: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 100,
    });
    return rows.map((r) => EmployeesService.toSalaryGql(r, r.employee.name));
  }

  private static toSalaryGql(
    row: {
      id: string;
      employeeId: string;
      amountUzs: Prisma.Decimal;
      period: string;
      date: Date;
      status: string;
      confirmedAt: Date | null;
    },
    employeeName: string | null,
  ): SalaryPayment {
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeName,
      amountUzs: row.amountUzs.toNumber(),
      period: row.period,
      date: row.date,
      status: row.status,
      confirmedAt: row.confirmedAt,
    };
  }

  private static toGql(row: {
    id: string;
    workspaceId: string | null;
    name: string;
    phone: string | null;
    position: string | null;
    salaryAmount: Prisma.Decimal;
    salaryType: Employee['salaryType'];
    createdAt: Date;
  }): Employee {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      name: row.name,
      phone: row.phone,
      position: row.position,
      salaryAmount: row.salaryAmount.toNumber(),
      salaryType: row.salaryType,
      createdAt: row.createdAt,
    };
  }
}
