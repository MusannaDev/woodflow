import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  constructor(private readonly prisma: PrismaService) {}

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
    const row = await this.prisma.raw.employee.create({
      data: {
        workspaceId: input.isShared ? null : workspaceId,
        name: input.name,
        phone: input.phone,
        position: input.position,
        salaryAmount: new Prisma.Decimal(input.salaryAmount),
        salaryType: input.salaryType,
      },
    });
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

    return {
      id: payment.id,
      employeeId: payment.employeeId,
      amountUzs: payment.amountUzs.toNumber(),
      period: payment.period,
      date: payment.date,
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
