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

/* ── Ko'rsatish formatlari — joriy tilga bog'liq ── */

/**
 * Joriy formatlash tili. I18nProvider til almashganda `setFormatLang` bilan
 * yangilaydi, shuning uchun `fmt`/`mln`/`dateFmt` chaqiruvlarini o'zgartirish
 * shart emas — ular avtomatik to'g'ri tilda ishlaydi.
 *
 * MUHIM: bu modul darajasidagi o'zgaruvchi — serverda u barcha so'rovlar
 * uchun umumiy bo'lardi va bir foydalanuvchining tili boshqasiga "oqib"
 * ketishi mumkin edi. Shu sabab u FAQAT brauzerda o'zgaradi; SSR har doim
 * standart 'uz' bilan render qiladi (sahifalar server tomonda hali
 * ma'lumotsiz — "yuklanmoqda" holatida chiqadi), so'ng brauzerda
 * hydration paytida to'g'ri til qo'llanadi.
 */
let formatLang: 'uz' | 'en' = 'uz';

const LOCALES = { uz: 'uz-UZ', en: 'en-US' } as const;

/** Har til uchun Intl instansiyalari bir marta yaratiladi (samarador). */
const CACHE: Record<string, Intl.NumberFormat> = {};

const numberFormat = (digits: 0 | 1): Intl.NumberFormat => {
  const key = `${formatLang}:${digits}`;
  return (CACHE[key] ??= new Intl.NumberFormat(LOCALES[formatLang], {
    maximumFractionDigits: digits,
  }));
};

export function setFormatLang(lang: 'uz' | 'en'): void {
  // Serverda o'zgartirmaymiz — so'rovlar orasida holat oqib ketmasligi uchun.
  if (typeof window === 'undefined') return;
  formatLang = lang;
}

export const currentLocale = (): string => LOCALES[formatLang];

export const fmt = (n: number): string => numberFormat(0).format(n);
export const fmt1 = (n: number): string => numberFormat(1).format(n);

/** Katta summani qisqartirish: 5 400 000 → "5.4 mln" / "5.4M". */
export const mln = (n: number): string =>
  Math.abs(n) >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}${formatLang === 'uz' ? ' mln' : 'M'}`
    : fmt(n);

/** Sanani joriy tilda ko'rsatish. */
export const dateFmt = (
  value: string | number | Date,
  opts?: Intl.DateTimeFormatOptions,
): string => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(LOCALES[formatLang], opts);
};

/** Sana + vaqt. */
export const dateTimeFmt = (value: string | number | Date): string => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(LOCALES[formatLang], {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};
