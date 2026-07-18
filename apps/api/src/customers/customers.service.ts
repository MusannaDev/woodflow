import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerInput, Customer } from './dto/customer.types';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Mijozlar + har birining savdo soni va joriy qarz balansi. */
  async list(workspaceId: string): Promise<Customer[]> {
    const rows = await this.prisma.raw.customer.findMany({
      where: { workspaceId },
      include: {
        sales: {
          select: {
            totalPriceUzs: true,
            payments: { select: { amountUzs: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((c) => {
      let debt = new Decimal(0);
      for (const s of c.sales) {
        const paid = s.payments.reduce(
          (acc, p) => acc.plus(p.amountUzs.toString()),
          new Decimal(0),
        );
        debt = debt.plus(new Decimal(s.totalPriceUzs.toString()).minus(paid));
      }
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        salesCount: c.sales.length,
        debtUzs: debt.toDecimalPlaces(2).toNumber(),
        createdAt: c.createdAt,
      };
    });
  }

  async create(
    workspaceId: string,
    input: CreateCustomerInput,
  ): Promise<Customer> {
    const row = await this.prisma.raw.customer.create({
      data: { workspaceId, name: input.name, phone: input.phone },
    });
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      salesCount: 0,
      debtUzs: 0,
      createdAt: row.createdAt,
    };
  }
}
