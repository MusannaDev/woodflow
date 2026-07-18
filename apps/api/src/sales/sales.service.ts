import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, Prisma, SaleType } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { toUzs } from '../common/money/currency.util';
import { saleLineTotal } from '../common/money/pnl.util';
import { totalVolumeM3 } from '../common/money/uom.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPaymentInput,
  CreateSaleInput,
  Payment,
  Sale,
} from './dto/sale.types';

type SaleRow = Prisma.SaleGetPayload<{
  include: { items: true; payments: true };
}>;

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<Sale[]> {
    const rows = await this.prisma.raw.sale.findMany({
      where: { workspaceId },
      include: { items: true, payments: true },
      orderBy: { date: 'desc' },
    });
    return rows.map(SalesService.toGql);
  }

  async findOne(workspaceId: string, id: string): Promise<Sale> {
    const row = await this.prisma.raw.sale.findFirst({
      where: { id, workspaceId },
      include: { items: true, payments: true },
    });
    if (!row) {
      throw new NotFoundException('Savdo topilmadi.');
    }
    return SalesService.toGql(row);
  }

  /**
   * Savdo yaratadi (ATOMIK tranzaksiya):
   *  1) har qator uchun hajm = L×W×T×qty (metr→m³ avto)
   *  2) lot qoldig'ini tekshiradi (yetarlimi? shu workspace'nikimi?)
   *  3) ombordan yechadi (decrement)
   *  4) Sale + SaleItem'larni yozadi
   * Bittasi yiqilsa — hammasi qaytadi (yarim savdo qolmaydi).
   */
  async create(workspaceId: string, input: CreateSaleInput): Promise<Sale> {
    const perPiece = input.saleType === SaleType.PER_PIECE;

    const row = await this.prisma.raw.$transaction(async (tx) => {
      let totalPriceUzs = new Decimal(0);
      const itemsData: Prisma.SaleItemCreateWithoutSaleInput[] = [];

      for (const item of input.items) {
        const lot = await tx.inventoryLot.findFirst({
          where: { id: item.lotId, workspaceId },
          select: { id: true, volumeM3Remaining: true },
        });
        if (!lot) {
          throw new NotFoundException(`Lot topilmadi: ${item.lotId}`);
        }

        const volumeM3 = totalVolumeM3(
          { length: item.length, width: item.width, thickness: item.thickness },
          item.quantity,
        );
        if (volumeM3.greaterThan(lot.volumeM3Remaining.toString())) {
          throw new BadRequestException(
            `Omborda yetarli emas: so‘ralgan ${volumeM3} m³, qoldiq ${lot.volumeM3Remaining} m³ (lot ${lot.id}).`,
          );
        }

        const lineTotal = saleLineTotal({
          perPiece,
          quantity: item.quantity,
          volumeM3,
          unitPriceUzs: item.unitPriceUzs,
        });
        totalPriceUzs = totalPriceUzs.plus(lineTotal);

        // Ombordan yechish
        await tx.inventoryLot.update({
          where: { id: lot.id },
          data: { volumeM3Remaining: { decrement: new Prisma.Decimal(volumeM3.toString()) } },
        });

        itemsData.push({
          lot: { connect: { id: lot.id } },
          quantity: item.quantity,
          length: new Prisma.Decimal(item.length),
          width: new Prisma.Decimal(item.width),
          thickness: new Prisma.Decimal(item.thickness),
          volumeM3: new Prisma.Decimal(volumeM3.toString()),
          unitPriceUzs: new Prisma.Decimal(item.unitPriceUzs),
          lineTotalUzs: new Prisma.Decimal(lineTotal.toString()),
        });
      }

      return tx.sale.create({
        data: {
          workspaceId,
          customerId: input.customerId ?? null,
          saleType: input.saleType,
          totalPriceUzs: new Prisma.Decimal(totalPriceUzs.toFixed(2)),
          date: input.date,
          items: { create: itemsData },
        },
        include: { items: true, payments: true },
      });
    });

    return SalesService.toGql(row);
  }

  /**
   * To'lov qabul qiladi. Valyuta qoidasi (System Design §5.2):
   * narx DOIM so'mda; USD kelsa qabul kuni kursi bilan so'mga aylanadi,
   * savdo narxini o'zgartirmaydi.
   */
  async addPayment(workspaceId: string, input: AddPaymentInput): Promise<Payment> {
    if (input.currency === Currency.RUB) {
      throw new BadRequestException('To‘lov faqat UZS yoki USD bo‘ladi.');
    }
    const isUsd = input.currency === Currency.USD;
    if (isUsd && (!input.exchangeRate || input.exchangeRate <= 0)) {
      throw new BadRequestException('USD to‘lov uchun kurs (exchangeRate) majburiy.');
    }

    const sale = await this.prisma.raw.sale.findFirst({
      where: { id: input.saleId, workspaceId },
      include: { payments: true },
    });
    if (!sale) {
      throw new NotFoundException('Savdo topilmadi.');
    }

    const rate = isUsd ? input.exchangeRate! : 1;
    const amountUzs = toUzs(input.amount, input.currency, rate);

    // Ortiqcha to'lovni bloklaymiz (qarz manfiy bo'lib ketmasin)
    const paid = sale.payments.reduce(
      (acc, p) => acc.plus(p.amountUzs.toString()),
      new Decimal(0),
    );
    const debt = new Decimal(sale.totalPriceUzs.toString()).minus(paid);
    if (amountUzs.greaterThan(debt.plus('0.01'))) {
      throw new BadRequestException(
        `To‘lov (${amountUzs} so‘m) qarzdan (${debt} so‘m) ortiq.`,
      );
    }

    const row = await this.prisma.raw.payment.create({
      data: {
        saleId: sale.id,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        exchangeRate: new Prisma.Decimal(rate),
        amountUzs: new Prisma.Decimal(amountUzs.toString()),
        date: input.date ?? new Date(),
      },
    });

    return {
      id: row.id,
      amount: row.amount.toNumber(),
      currency: row.currency,
      exchangeRate: row.exchangeRate.toNumber(),
      amountUzs: row.amountUzs.toNumber(),
      date: row.date,
    };
  }

  private static toGql(row: SaleRow): Sale {
    const paid = row.payments.reduce(
      (acc, p) => acc.plus(p.amountUzs.toString()),
      new Decimal(0),
    );
    const total = new Decimal(row.totalPriceUzs.toString());
    return {
      id: row.id,
      customerId: row.customerId,
      saleType: row.saleType,
      totalPriceUzs: total.toNumber(),
      paidUzs: paid.toNumber(),
      debtUzs: total.minus(paid).toNumber(),
      date: row.date,
      createdAt: row.createdAt,
      items: row.items.map((i) => ({
        id: i.id,
        lotId: i.lotId,
        quantity: i.quantity,
        length: i.length.toNumber(),
        width: i.width.toNumber(),
        thickness: i.thickness.toNumber(),
        volumeM3: i.volumeM3.toNumber(),
        unitPriceUzs: i.unitPriceUzs.toNumber(),
        lineTotalUzs: i.lineTotalUzs.toNumber(),
      })),
      payments: row.payments.map((p) => ({
        id: p.id,
        amount: p.amount.toNumber(),
        currency: p.currency,
        exchangeRate: p.exchangeRate.toNumber(),
        amountUzs: p.amountUzs.toNumber(),
        date: p.date,
      })),
    };
  }
}
