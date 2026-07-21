import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LotStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefectRecord,
  InventoryLot,
  InventorySummary,
  RecordDefectInput,
} from './dto/inventory.types';

type LotRow = {
  id: string;
  woodType: string;
  grade: string;
  volumeM3Remaining: Prisma.Decimal;
  quantityRemaining: number | null;
  unitCostUzsPerM3: Prisma.Decimal;
  status: LotStatus;
  createdAt: Date;
  purchase?: { source: string } | null;
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listLots(workspaceId: string): Promise<InventoryLot[]> {
    const rows = await this.prisma.client.inventoryLot.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { purchase: { select: { source: true } } },
    });
    return rows.map(InventoryService.toLotGql);
  }

  async summary(workspaceId: string): Promise<InventorySummary> {
    const [remaining, defect, lotCount, qty] = await Promise.all([
      this.prisma.client.inventoryLot.aggregate({
        where: { workspaceId },
        _sum: { volumeM3Remaining: true },
      }),
      // DefectRecord'da workspaceId yo'q — lot orqali filtrlaymiz
      this.prisma.raw.defectRecord.aggregate({
        where: { lot: { workspaceId } },
        _sum: { volumeM3: true },
      }),
      this.prisma.client.inventoryLot.count({ where: { workspaceId } }),
      this.prisma.client.inventoryLot.aggregate({
        where: { workspaceId },
        _sum: { quantityRemaining: true },
      }),
    ]);

    return {
      totalRemainingM3: (remaining._sum.volumeM3Remaining ?? new Prisma.Decimal(0)).toNumber(),
      defectM3: (defect._sum.volumeM3 ?? new Prisma.Decimal(0)).toNumber(),
      totalQuantity: qty._sum.quantityRemaining ?? 0,
      lotCount,
    };
  }

  /**
   * Nuqsonni yozadi: qoldiqdan minus qiladi + DefectRecord qo'shadi (atomik).
   * Zarar keyin fura P&L hisobida shu lotning tannarxi bo'yicha hisoblanadi.
   */
  async recordDefect(
    workspaceId: string,
    input: RecordDefectInput,
  ): Promise<DefectRecord> {
    const lot = await this.prisma.client.inventoryLot.findFirst({
      where: { id: input.lotId, workspaceId },
      select: { id: true, volumeM3Remaining: true, quantityRemaining: true },
    });
    if (!lot) {
      throw new NotFoundException('Lot topilmadi.');
    }

    const defectVol = new Prisma.Decimal(input.volumeM3);
    if (defectVol.greaterThan(lot.volumeM3Remaining)) {
      throw new BadRequestException(
        `Nuqson (${defectVol}) qoldiqdan (${lot.volumeM3Remaining}) oshib ketdi.`,
      );
    }

    if (input.quantity != null) {
      if (lot.quantityRemaining == null) {
        throw new BadRequestException('Bu lotda dona hisobi yuritilmaydi.');
      }
      if (input.quantity > lot.quantityRemaining) {
        throw new BadRequestException(
          `Nuqson dona (${input.quantity}) qoldiq donadan (${lot.quantityRemaining}) oshib ketdi.`,
        );
      }
    }

    const date = input.date ?? new Date();
    const [defect] = await this.prisma.raw.$transaction([
      this.prisma.raw.defectRecord.create({
        data: {
          lotId: lot.id,
          volumeM3: defectVol,
          quantity: input.quantity ?? null,
          reason: input.reason,
          date,
        },
      }),
      this.prisma.raw.inventoryLot.update({
        where: { id: lot.id },
        data: {
          volumeM3Remaining: { decrement: defectVol },
          ...(input.quantity != null
            ? { quantityRemaining: { decrement: input.quantity } }
            : {}),
        },
      }),
    ]);

    return {
      id: defect.id,
      lotId: defect.lotId,
      volumeM3: defect.volumeM3.toNumber(),
      reason: defect.reason,
      date: defect.date,
    };
  }

  private static toLotGql(row: LotRow): InventoryLot {
    return {
      id: row.id,
      woodType: row.woodType,
      grade: row.grade,
      volumeM3Remaining: row.volumeM3Remaining.toNumber(),
      quantityRemaining: row.quantityRemaining,
      unitCostUzsPerM3: row.unitCostUzsPerM3.toNumber(),
      status: row.status,
      source: row.purchase?.source ?? null,
      createdAt: row.createdAt,
    };
  }
}
