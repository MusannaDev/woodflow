import { Decimal } from 'decimal.js';

/**
 * Valyuta qoidasi (System Design §5.2) — yagona haqiqat = so'm (UZS).
 *  - RUB  → faqat importda, kirim kursi bilan so'mga muzlatiladi
 *  - UZS  → baza valyuta
 *  - USD  → faqat to'lovda, qabul kuni kursi bilan so'mga aylantiriladi
 *
 * Kurs har doim "1 birlik chet valyuta = X so'm" ko'rinishida.
 * Hamma hisob Decimal bilan — float ishlatilmaydi (pul yaxlitlash xatosi).
 */

export type SupportedCurrency = 'UZS' | 'RUB' | 'USD';

/** Asl summani so'mga aylantiradi. UZS bo'lsa kurs 1. */
export function toUzs(
  amount: Decimal.Value,
  currency: SupportedCurrency,
  rateToUzs: Decimal.Value,
): Decimal {
  const value = new Decimal(amount);
  if (currency === 'UZS') {
    return value.toDecimalPlaces(2);
  }
  return value.mul(new Decimal(rateToUzs)).toDecimalPlaces(2);
}

/**
 * Import tannarxi: kubi X (RUB) × hajm (m³) × kurs = jami tannarx (so'm).
 * unitPrice — bir m³ narxi asl valyutada.
 */
export function purchaseTotalUzs(params: {
  unitPrice: Decimal.Value; // RUB yoki UZS / m³
  volumeM3: Decimal.Value;
  currency: SupportedCurrency;
  rateToUzs: Decimal.Value;
}): Decimal {
  const gross = new Decimal(params.unitPrice).mul(new Decimal(params.volumeM3));
  return toUzs(gross, params.currency, params.rateToUzs);
}

/** So'm summasini m³ ga bo'lib, m³ boshiga tannarx chiqaradi. */
export function unitCostPerM3(totalUzs: Decimal.Value, volumeM3: Decimal.Value): Decimal {
  const vol = new Decimal(volumeM3);
  if (vol.isZero()) {
    throw new Error('Hajm (m³) nol bo‘lishi mumkin emas.');
  }
  return new Decimal(totalUzs).div(vol).toDecimalPlaces(2);
}
