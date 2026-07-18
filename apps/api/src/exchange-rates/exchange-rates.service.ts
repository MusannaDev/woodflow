import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExchangeRate,
  SetExchangeRateInput,
} from './dto/exchange-rate.types';

/**
 * Kunlik kurs (System Design §9.2). GLOBAL — workspace'ga bog'liq emas.
 * MVP'da qo'lda kiritiladi (keyinchalik avtomatik olinadi).
 * Eski yozuvlar (Purchase/Payment) o'z kursini allaqachon muzlatib saqlaydi —
 * bu jadval faqat "bugungi kurs qancha?" uchun ma'lumotnoma.
 */
@Injectable()
export class ExchangeRatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Kun boshiga normallashtirish — kuniga bitta yozuv bo'lsin. */
  private static dayOf(date?: Date): Date {
    const d = date ?? new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  async set(input: SetExchangeRateInput): Promise<ExchangeRate> {
    const day = ExchangeRatesService.dayOf(input.date);
    const row = await this.prisma.raw.exchangeRate.upsert({
      where: { date: day },
      create: {
        date: day,
        rubToUzs: new Prisma.Decimal(input.rubToUzs),
        usdToUzs: new Prisma.Decimal(input.usdToUzs),
      },
      update: {
        rubToUzs: new Prisma.Decimal(input.rubToUzs),
        usdToUzs: new Prisma.Decimal(input.usdToUzs),
      },
    });
    return ExchangeRatesService.toGql(row);
  }

  /** Berilgan kunga (yoki undan oldingi eng yaqin) kurs. */
  async latest(date?: Date): Promise<ExchangeRate> {
    const day = ExchangeRatesService.dayOf(date);
    const row = await this.prisma.raw.exchangeRate.findFirst({
      where: { date: { lte: day } },
      orderBy: { date: 'desc' },
    });
    if (!row) {
      throw new NotFoundException(
        'Kurs topilmadi — avval setExchangeRate bilan kiriting.',
      );
    }
    return ExchangeRatesService.toGql(row);
  }

  async list(): Promise<ExchangeRate[]> {
    const rows = await this.prisma.raw.exchangeRate.findMany({
      orderBy: { date: 'desc' },
      take: 90,
    });
    return rows.map(ExchangeRatesService.toGql);
  }

  private static toGql(row: {
    id: string;
    date: Date;
    rubToUzs: Prisma.Decimal;
    usdToUzs: Prisma.Decimal;
  }): ExchangeRate {
    return {
      id: row.id,
      date: row.date,
      rubToUzs: row.rubToUzs.toNumber(),
      usdToUzs: row.usdToUzs.toNumber(),
    };
  }
}
