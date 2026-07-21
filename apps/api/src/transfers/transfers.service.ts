import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { getTenant } from '../common/tenant/tenant-context';
import { unitCostPerM3 } from '../common/money/currency.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferInput, StockTransfer } from './dto/transfer.types';

type TransferRow = {
  id: string;
  fromWorkspaceId: string;
  toWorkspaceId: string;
  lotId: string;
  volumeM3: Prisma.Decimal;
  quantity: number | null;
  internalPriceUzs: Prisma.Decimal;
  date: Date;
  createdAt: Date;
};

/**
 * Ichki transfer (System Design §4.2, §12):
 * 1-biznes yog'ochni 2-biznesga "ichki narxda sotadi".
 *  - manba lot qoldig'idan minus
 *  - qabul qiluvchida INTERNAL_TRANSFER kirim + yangi lot (tannarx = ichki narx)
 *  - ledger: yuboruvchiga TRANSFER_IN (+), qabul qiluvchiga TRANSFER_OUT (−)
 * Shu bilan har biznes o'z foydasini alohida ko'radi, pul ikki marta sanalmaydi.
 */
@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Joriy workspace ishtirok etgan transferlar (chiqqan + kirgan). */
  async list(workspaceId: string): Promise<StockTransfer[]> {
    const rows = await this.prisma.raw.stockTransfer.findMany({
      where: {
        OR: [{ fromWorkspaceId: workspaceId }, { toWorkspaceId: workspaceId }],
      },
      orderBy: { date: 'desc' },
    });
    return rows.map(TransfersService.toGql);
  }

  async create(
    fromWorkspaceId: string,
    input: CreateTransferInput,
  ): Promise<StockTransfer> {
    if (input.toWorkspaceId === fromWorkspaceId) {
      throw new BadRequestException('O‘zi-o‘ziga transfer qilib bo‘lmaydi.');
    }

    // Qabul qiluvchi workspace'ga ham a'zolik shart (xavfsizlik)
    const userId = getTenant()?.userId;
    const membership = await this.prisma.raw.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId ?? '',
          workspaceId: input.toWorkspaceId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Qabul qiluvchi workspace’ga ruxsatingiz yo‘q.');
    }

    const volume = new Decimal(input.volumeM3);
    const totalPrice = new Decimal(input.internalPriceUzs);
    const unitCost = unitCostPerM3(totalPrice, volume);
    const date = input.date ?? new Date();

    const row = await this.prisma.raw.$transaction(async (tx) => {
      // 1) Manba lot — joriy workspace'niki, qoldiq yetarli
      const lot = await tx.inventoryLot.findFirst({
        where: { id: input.lotId, workspaceId: fromWorkspaceId },
        select: { id: true, woodType: true, grade: true, volumeM3Remaining: true, quantityRemaining: true },
      });
      if (!lot) {
        throw new NotFoundException('Manba lot topilmadi.');
      }
      if (volume.greaterThan(lot.volumeM3Remaining.toString())) {
        throw new BadRequestException(
          `Omborda yetarli emas: so‘ralgan ${volume} m³, qoldiq ${lot.volumeM3Remaining} m³.`,
        );
      }
      if (input.quantity != null) {
        if (lot.quantityRemaining == null) {
          throw new BadRequestException('Bu lotda dona hisobi yuritilmaydi.');
        }
        if (input.quantity > lot.quantityRemaining) {
          throw new BadRequestException(
            `Dona yetarli emas: so‘ralgan ${input.quantity}, qoldiq ${lot.quantityRemaining}.`,
          );
        }
      }

      // 2) Manbadan yechish
      await tx.inventoryLot.update({
        where: { id: lot.id },
        data: {
          volumeM3Remaining: { decrement: new Prisma.Decimal(volume.toString()) },
          ...(input.quantity != null
            ? { quantityRemaining: { decrement: input.quantity } }
            : {}),
        },
      });

      // 3) Qabul qiluvchida kirim + yangi lot (tannarx = ichki narx)
      await tx.purchase.create({
        data: {
          workspaceId: input.toWorkspaceId,
          source: 'INTERNAL_TRANSFER',
          woodType: lot.woodType,
          grade: lot.grade,
          volumeM3: new Prisma.Decimal(volume.toString()),
          quantity: input.quantity ?? null,
          unitPrice: new Prisma.Decimal(unitCost.toString()),
          currency: 'UZS',
          exchangeRate: new Prisma.Decimal(1),
          totalCostUzs: new Prisma.Decimal(totalPrice.toFixed(2)),
          date,
          lot: {
            create: {
              workspaceId: input.toWorkspaceId,
              woodType: lot.woodType,
              grade: lot.grade,
              volumeM3Remaining: new Prisma.Decimal(volume.toString()),
              quantityRemaining: input.quantity ?? null,
              unitCostUzsPerM3: new Prisma.Decimal(unitCost.toString()),
              status: 'AVAILABLE',
            },
          },
        },
      });

      // 4) Transfer yozuvi
      const transfer = await tx.stockTransfer.create({
        data: {
          fromWorkspaceId,
          toWorkspaceId: input.toWorkspaceId,
          lotId: lot.id,
          volumeM3: new Prisma.Decimal(volume.toString()),
          quantity: input.quantity ?? null,
          internalPriceUzs: new Prisma.Decimal(totalPrice.toFixed(2)),
          date,
        },
      });

      // 5) Ledger — ikki tomonlama, pul ikki marta sanalmaydi
      await tx.ledgerEntry.createMany({
        data: [
          {
            workspaceId: fromWorkspaceId,
            type: 'TRANSFER_IN',
            amountUzs: new Prisma.Decimal(totalPrice.toFixed(2)), // + daromad
            date,
            refType: 'StockTransfer',
            refId: transfer.id,
            description: `Ichki transfer: ${volume} m³ ${lot.woodType}`,
          },
          {
            workspaceId: input.toWorkspaceId,
            type: 'TRANSFER_OUT',
            amountUzs: new Prisma.Decimal(totalPrice.neg().toFixed(2)), // − xarajat
            date,
            refType: 'StockTransfer',
            refId: transfer.id,
            description: `Ichki transfer: ${volume} m³ ${lot.woodType}`,
          },
        ],
      });

      return transfer;
    });

    return TransfersService.toGql(row);
  }

  private static toGql(row: TransferRow): StockTransfer {
    return {
      id: row.id,
      fromWorkspaceId: row.fromWorkspaceId,
      toWorkspaceId: row.toWorkspaceId,
      lotId: row.lotId,
      volumeM3: row.volumeM3.toNumber(),
      quantity: row.quantity,
      internalPriceUzs: row.internalPriceUzs.toNumber(),
      date: row.date,
      createdAt: row.createdAt,
    };
  }
}
