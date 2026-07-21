import { BadRequestException, Injectable } from '@nestjs/common';
import { Currency, Prisma, PurchaseSource } from '@prisma/client';
import {
  purchaseTotalUzs,
  SupportedCurrency,
  unitCostPerM3,
} from '../common/money/currency.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseInput, Purchase } from './dto/purchase.types';

type PurchaseRow = {
  id: string;
  source: PurchaseSource;
  shipmentId: string | null;
  supplierId: string | null;
  woodType: string;
  grade: string;
  volumeM3: Prisma.Decimal;
  quantity: number | null;
  unitPrice: Prisma.Decimal;
  currency: Currency;
  exchangeRate: Prisma.Decimal;
  totalCostUzs: Prisma.Decimal;
  date: Date;
  createdAt: Date;
};

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<Purchase[]> {
    const rows = await this.prisma.client.purchase.findMany({
      where: { workspaceId },
      orderBy: { date: 'desc' },
    });
    return rows.map(PurchasesService.toGql);
  }

  /**
   * Kirim yozadi va SHU zahoti ombor lotini yaratadi (atomik).
   * Manba qoidalari (System Design §4.2):
   *   RUSSIA_IMPORT  → furaga bog'liq, valyuta RUB, kirim kursi muzlatiladi
   *   LOCAL_WHOLESALE → furasiz, valyuta UZS, kurs = 1
   */
  async create(
    workspaceId: string,
    input: CreatePurchaseInput,
  ): Promise<Purchase> {
    const exchangeRate = await this.resolveAndValidate(workspaceId, input);

    const totalCostUzs = purchaseTotalUzs({
      unitPrice: input.unitPrice,
      volumeM3: input.volumeM3,
      currency: input.currency as SupportedCurrency,
      rateToUzs: exchangeRate,
    });
    const unitCost = unitCostPerM3(totalCostUzs, input.volumeM3);

    const row = await this.prisma.client.purchase.create({
      data: {
        workspaceId,
        source: input.source,
        shipmentId: input.shipmentId ?? null,
        supplierId: input.supplierId ?? null,
        woodType: input.woodType,
        grade: input.grade,
        volumeM3: new Prisma.Decimal(input.volumeM3),
        quantity: input.quantity ?? null,
        unitPrice: new Prisma.Decimal(input.unitPrice),
        currency: input.currency,
        exchangeRate: new Prisma.Decimal(exchangeRate),
        totalCostUzs: new Prisma.Decimal(totalCostUzs.toFixed(2)),
        date: input.date,
        // Kirim → ombor lotini hosil qiladi (1:1)
        lot: {
          create: {
            workspaceId,
            woodType: input.woodType,
            grade: input.grade,
            volumeM3Remaining: new Prisma.Decimal(input.volumeM3),
            quantityRemaining: input.quantity ?? null,
            unitCostUzsPerM3: new Prisma.Decimal(unitCost.toFixed(2)),
            status: 'AVAILABLE',
          },
        },
      },
    });
    return PurchasesService.toGql(row);
  }

  /** Manba bo'yicha tekshiradi va ishlatiladigan kursni qaytaradi. */
  private async resolveAndValidate(
    workspaceId: string,
    input: CreatePurchaseInput,
  ): Promise<number> {
    if (input.source === PurchaseSource.RUSSIA_IMPORT) {
      if (!input.shipmentId) {
        throw new BadRequestException('Import kirimi uchun fura (shipmentId) majburiy.');
      }
      if (input.currency !== Currency.RUB) {
        throw new BadRequestException('Import kirimi valyutasi RUB bo‘lishi kerak.');
      }
      if (!input.exchangeRate || input.exchangeRate <= 0) {
        throw new BadRequestException('Import kirimi uchun kurs (exchangeRate) majburiy.');
      }
      // Fura shu workspace'ga tegishli ekanini tasdiqlaymiz
      const shipment = await this.prisma.client.shipment.findFirst({
        where: { id: input.shipmentId, workspaceId },
        select: { id: true },
      });
      if (!shipment) {
        throw new BadRequestException('Ko‘rsatilgan fura topilmadi.');
      }
      return input.exchangeRate;
    }

    // LOCAL_WHOLESALE
    if (input.shipmentId) {
      throw new BadRequestException('Mahalliy kirim furaga bog‘lanmaydi.');
    }
    if (input.currency !== Currency.UZS) {
      throw new BadRequestException('Mahalliy kirim valyutasi UZS bo‘lishi kerak.');
    }
    return 1; // so'm — kurs yo'q
  }

  private static toGql(row: PurchaseRow): Purchase {
    return {
      id: row.id,
      source: row.source,
      shipmentId: row.shipmentId,
      supplierId: row.supplierId,
      woodType: row.woodType,
      grade: row.grade,
      volumeM3: row.volumeM3.toNumber(),
      quantity: row.quantity,
      unitPrice: row.unitPrice.toNumber(),
      currency: row.currency,
      exchangeRate: row.exchangeRate.toNumber(),
      totalCostUzs: row.totalCostUzs.toNumber(),
      date: row.date,
      createdAt: row.createdAt,
    };
  }
}
