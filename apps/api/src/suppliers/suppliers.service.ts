import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierInput, Supplier } from './dto/supplier.types';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<Supplier[]> {
    const rows = await this.prisma.raw.supplier.findMany({
      where: { workspaceId },
      include: { purchases: { select: { totalCostUzs: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      type: s.type,
      purchasesCount: s.purchases.length,
      totalPurchasedUzs: s.purchases
        .reduce((acc, p) => acc.plus(p.totalCostUzs.toString()), new Decimal(0))
        .toDecimalPlaces(2)
        .toNumber(),
      createdAt: s.createdAt,
    }));
  }

  async create(
    workspaceId: string,
    input: CreateSupplierInput,
  ): Promise<Supplier> {
    const row = await this.prisma.raw.supplier.create({
      data: {
        workspaceId,
        name: input.name,
        phone: input.phone,
        type: input.type,
      },
    });
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      type: row.type,
      purchasesCount: 0,
      totalPurchasedUzs: 0,
      createdAt: row.createdAt,
    };
  }
}
