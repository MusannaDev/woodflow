import { Decimal } from 'decimal.js';

/**
 * O'lchov birligi (UoM) konvertatsiyasi (System Design §5.1).
 * Baza birlik = m³ (kub). Savdoda o'lcham + dona kiritiladi, hajm avto chiqadi:
 *
 *   volumeM3 = length(m) × width(m) × thickness(m) × quantity
 */

export interface PieceDimensions {
  length: Decimal.Value;    // m
  width: Decimal.Value;     // m
  thickness: Decimal.Value; // m
}

/** Bitta donaning hajmi (m³). */
export function volumePerPiece(dim: PieceDimensions): Decimal {
  return new Decimal(dim.length)
    .mul(new Decimal(dim.width))
    .mul(new Decimal(dim.thickness))
    .toDecimalPlaces(6);
}

/** Jami hajm (m³) = bir dona hajmi × dona soni. */
export function totalVolumeM3(dim: PieceDimensions, quantity: number): Decimal {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Dona soni musbat butun son bo‘lishi kerak.');
  }
  return volumePerPiece(dim).mul(quantity).toDecimalPlaces(4);
}

/**
 * YUMALOQ YOG'OCH hajmi (kesik konus / frustum).
 * Yog'och bosh tomoni yo'g'on (D), uch tomoni ingichka (d) — ingichkalanadi.
 *
 *   V = (π × L / 12) × (D² + D·d + d²)
 *
 * Diametrlar SANTIMETRDA, uzunlik METRDA kiritiladi (m³ chiqadi).
 */
export function roundLogVolumePerPiece(
  baseDiamCm: Decimal.Value,
  topDiamCm: Decimal.Value,
  lengthM: Decimal.Value,
): Decimal {
  const D = new Decimal(baseDiamCm).div(100); // sm → m
  const d = new Decimal(topDiamCm).div(100);
  const L = new Decimal(lengthM);
  const PI = new Decimal('3.14159265358979');
  return PI.mul(L)
    .div(12)
    .mul(D.pow(2).plus(D.mul(d)).plus(d.pow(2)))
    .toDecimalPlaces(6);
}

/** Jami yumaloq yog'och hajmi (m³) = bir dona × dona soni. */
export function totalRoundLogVolumeM3(
  baseDiamCm: Decimal.Value,
  topDiamCm: Decimal.Value,
  lengthM: Decimal.Value,
  quantity: number,
): Decimal {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Dona soni musbat butun son bo‘lishi kerak.');
  }
  return roundLogVolumePerPiece(baseDiamCm, topDiamCm, lengthM)
    .mul(quantity)
    .toDecimalPlaces(4);
}

/** Ishlab chiqarish chiqim foizi (yield): (chiqqan hajm / kirgan hajm) × 100. */
export function yieldPercent(inputM3: Decimal.Value, outputM3: Decimal.Value): Decimal {
  const input = new Decimal(inputM3);
  if (input.isZero()) {
    throw new Error('Kirish hajmi (m³) nol bo‘lishi mumkin emas.');
  }
  return new Decimal(outputM3).div(input).mul(100).toDecimalPlaces(2);
}
