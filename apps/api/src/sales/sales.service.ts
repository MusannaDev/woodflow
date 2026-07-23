import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, Prisma, SaleType } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { toUzs } from '../common/money/currency.util';
import { saleLineTotal } from '../common/money/pnl.util';
import {
  totalRoundLogVolumeM3,
  totalVolumeM3,
} from '../common/money/uom.util';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPaymentInput,
  CreateSaleInput,
  Payment,
  Sale,
} from './dto/sale.types';

const LOW_STOCK_M3 = 5; // shu qoldiqdan pastga tushса ogohlantirish

type SaleRow = Prisma.SaleGetPayload<{
  include: { items: true; payments: true };
}>;

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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
  async create(
    workspaceId: string,
    input: CreateSaleInput,
    userId?: string,
  ): Promise<Sale> {
    const perPiece = input.saleType === SaleType.PER_PIECE;
    const lowStock: { woodType: string; remaining: number }[] = [];

    const row = await this.prisma.raw.$transaction(async (tx) => {
      let totalPriceUzs = new Decimal(0);
      const itemsData: Prisma.SaleItemCreateWithoutSaleInput[] = [];

      for (const item of input.items) {
        // ── TAYYOR MAHSULOT (Taxta) — o'lchamsiz dona savdosi ──
        if (item.finishedLotId) {
          const fLot = await tx.finishedGoodsLot.findFirst({
            where: { id: item.finishedLotId, workspaceId },
            select: { id: true, quantityRemaining: true },
          });
          if (!fLot) {
            throw new NotFoundException(
              `Tayyor mahsulot topilmadi: ${item.finishedLotId}`,
            );
          }
          if (item.quantity > fLot.quantityRemaining) {
            throw new BadRequestException(
              `Tayyor mahsulot yetarli emas: so‘ralgan ${item.quantity} dona, qoldiq ${fLot.quantityRemaining} dona.`,
            );
          }
          const lineTotal = new Decimal(item.unitPriceUzs)
            .mul(item.quantity)
            .toDecimalPlaces(2);
          totalPriceUzs = totalPriceUzs.plus(lineTotal);

          await tx.finishedGoodsLot.update({
            where: { id: fLot.id },
            data: { quantityRemaining: { decrement: item.quantity } },
          });

          itemsData.push({
            finishedLot: { connect: { id: fLot.id } },
            quantity: item.quantity,
            volumeM3: new Prisma.Decimal(0),
            unitPriceUzs: new Prisma.Decimal(item.unitPriceUzs),
            lineTotalUzs: new Prisma.Decimal(lineTotal.toString()),
          });
          continue;
        }

        // ── XOMASHYO LOT (Yog'och) — o'lchamli savdo ──
        if (!item.lotId) {
          throw new BadRequestException('lotId yoki finishedLotId kerak.');
        }
        // Yumaloq yog'och (bosh+uch diametri) yoki kub (en+qalinlik)
        const isRound = item.baseDiamCm != null && item.topDiamCm != null;
        if (
          item.length == null ||
          (!isRound && (item.width == null || item.thickness == null))
        ) {
          throw new BadRequestException(
            'Xomashyo savdosida uzunlik + (en va qalinlik) yoki (bosh va uch diametri) majburiy.',
          );
        }

        const lot = await tx.inventoryLot.findFirst({
          where: { id: item.lotId, workspaceId },
          select: {
            id: true,
            woodType: true,
            volumeM3Remaining: true,
            quantityRemaining: true,
          },
        });
        if (!lot) {
          throw new NotFoundException(`Lot topilmadi: ${item.lotId}`);
        }

        const volumeM3 = isRound
          ? totalRoundLogVolumeM3(
              item.baseDiamCm!,
              item.topDiamCm!,
              item.length!,
              item.quantity,
            )
          : totalVolumeM3(
              {
                length: item.length!,
                width: item.width!,
                thickness: item.thickness!,
              },
              item.quantity,
            );
        if (volumeM3.greaterThan(lot.volumeM3Remaining.toString())) {
          throw new BadRequestException(
            `Omborda yetarli emas: so‘ralgan ${volumeM3} m³, qoldiq ${lot.volumeM3Remaining} m³ (lot ${lot.id}).`,
          );
        }

        // Dona hisobi yuritiladigan lotda dona yetarliligini tekshiramiz
        if (
          lot.quantityRemaining != null &&
          item.quantity > lot.quantityRemaining
        ) {
          throw new BadRequestException(
            `Omborda dona yetarli emas: so‘ralgan ${item.quantity} dona, qoldiq ${lot.quantityRemaining} dona (lot ${lot.id}).`,
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
          data: {
            volumeM3Remaining: { decrement: new Prisma.Decimal(volumeM3.toString()) },
            ...(lot.quantityRemaining != null
              ? { quantityRemaining: { decrement: item.quantity } }
              : {}),
          },
        });

        // Kam qoldiq — chegaradan pastga tushса (bir marta) belgilaymiz
        const before = Number(lot.volumeM3Remaining);
        const after = before - Number(volumeM3.toString());
        if (before >= LOW_STOCK_M3 && after < LOW_STOCK_M3 && after >= 0) {
          lowStock.push({ woodType: lot.woodType, remaining: after });
        }

        itemsData.push({
          lot: { connect: { id: lot.id } },
          quantity: item.quantity,
          length: new Prisma.Decimal(item.length!),
          width: isRound ? null : new Prisma.Decimal(item.width!),
          thickness: isRound ? null : new Prisma.Decimal(item.thickness!),
          baseDiamCm: isRound ? new Prisma.Decimal(item.baseDiamCm!) : null,
          topDiamCm: isRound ? new Prisma.Decimal(item.topDiamCm!) : null,
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

    // ── Bildirishnomalar (owner'ga, ishchi sotган bo'lsa) ──
    if (userId) {
      const total = Number(row.totalPriceUzs);
      let customerName: string | null = null;
      if (row.customerId) {
        const c = await this.prisma.raw.customer.findUnique({
          where: { id: row.customerId },
          select: { name: true },
        });
        customerName = c?.name ?? null;
      }
      await this.notifications.notifyWorkspaceOwner(workspaceId, userId, {
        type: 'SALE',
        title: `Yangi savdo: ${NotificationsService.som(total)}`,
        body: customerName ? `Mijoz: ${customerName}` : null,
        link: '/savdo',
      });
      for (const ls of lowStock) {
        await this.notifications.notifyWorkspaceOwner(workspaceId, userId, {
          type: 'LOW_STOCK',
          title: `Ombor kam qoldi: ${ls.woodType}`,
          body: `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 1 }).format(ls.remaining)} m³ qoldi.`,
          link: '/ombor',
        });
      }
    }

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
        finishedLotId: i.finishedLotId,
        quantity: i.quantity,
        length: i.length?.toNumber() ?? null,
        width: i.width?.toNumber() ?? null,
        thickness: i.thickness?.toNumber() ?? null,
        baseDiamCm: i.baseDiamCm?.toNumber() ?? null,
        topDiamCm: i.topDiamCm?.toNumber() ?? null,
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
