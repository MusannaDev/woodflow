/**
 * Pul va son formatlash — YAGONA manba.
 *
 * MUAMMO: parseFloat("1 500 000") === 1 (birinchi bo'shliqda to'xtaydi) —
 * pul jimgina noto'g'ri saqlanardi. Shu helper'lar buni hal qiladi.
 *
 * Qoidalar:
 *  - parseMoney   → pul/butun sonlar: bo'shliq, vergul, apostrof — ming
 *    ajratgich sifatida olib tashlanadi; nuqta o'nlik bo'lib qoladi (USD).
 *  - parseDecimal → o'lchov (m³, metr): bo'shliq olib tashlanadi, vergul
 *    O'NLIK deb qabul qilinadi ("0,05" → 0.05). Pulga ishlatilmasin!
 *  - parseQty     → dona soni (butun).
 *  - formatMoneyInput → yozayotganda jonli "1 500 000" ko'rinishi.
 */

/** "1 500 000" | "1,500,000" | "1'500'000" → 1500000 · "8.5" → 8.5 */
export function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[\s,'’]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** "0,05" → 0.05 · "2.5" → 2.5 — o'lchovlar uchun (vergul = o'nlik). */
export function parseDecimal(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Dona soni — butun: "1 200" → 1200. */
export function parseQty(raw: string): number {
  return Math.floor(parseMoney(raw));
}

/**
 * Kiritish maydonida jonli ming-ajratgich: "1500000" → "1 500 000".
 * O'nlik qismi (nuqtadan keyin) o'zgarishsiz qoladi ("8.5" → "8.5").
 * Raqam bo'lmagan belgilar tozalanadi.
 */
export function formatMoneyInput(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned) return '';
  const [intPart, ...rest] = cleaned.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return rest.length > 0 ? `${grouped}.${rest.join('')}` : grouped;
}

/* ── Ko'rsatish formatlari (bitta Intl instansi — samarador) ── */

const nf0 = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 1 });

export const fmt = (n: number): string => nf0.format(n);
export const fmt1 = (n: number): string => nf1.format(n);

/** Katta summani qisqartirish: 5 400 000 → "5.4 mln". */
export const mln = (n: number): string =>
  Math.abs(n) >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln` : fmt(n);
