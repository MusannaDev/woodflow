import { Injectable } from '@nestjs/common';
import { ExpenseCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Expense, CreateExpenseInput } from './dto/expense.types';

/**
 * Xarajat workspaceId nullable (null = umumiy). Shuning uchun avtomatik
 * tenant-filtr O'RNIGA qo'lda filtrlaymiz: joriy workspace + umumiy.
 */
@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    workspaceId: string,
    filter?: { category?: ExpenseCategory },
  ): Promise<Expense[]> {
    const rows = await this.prisma.raw.expense.findMany({
      where: {
        OR: [{ workspaceId }, { workspaceId: null }],
        ...(filter?.category ? { category: filter.category } : {}),
      },
      orderBy: { date: 'desc' },
    });
    return rows.map(ExpensesService.toGql);
  }

  async create(
    workspaceId: string,
    input: CreateExpenseInput,
  ): Promise<Expense> {
    const row = await this.prisma.raw.expense.create({
      data: {
        workspaceId: input.isShared ? null : workspaceId,
        category: input.category,
        amountUzs: new Prisma.Decimal(input.amountUzs),
        date: input.date,
        description: input.description,
        employeeId: input.employeeId,
      },
    });
    // TODO(MVP-1): shu yerda LedgerEntry (type=EXPENSE, −amount) ham yoziladi.
    return ExpensesService.toGql(row);
  }

  private static toGql(row: {
    id: string;
    workspaceId: string | null;
    category: ExpenseCategory;
    amountUzs: Prisma.Decimal;
    date: Date;
    description: string | null;
    employeeId: string | null;
    createdAt: Date;
  }): Expense {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      category: row.category,
      amountUzs: row.amountUzs.toNumber(),
      date: row.date,
      description: row.description,
      employeeId: row.employeeId,
      createdAt: row.createdAt,
    };
  }
}
