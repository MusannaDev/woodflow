/**
 * Platforma to'lov sozlamalari.
 *
 * 👉 O'Z KARTANGIZNI shu yerga yozing — owner'lar shu kartaga o'tkazadi.
 * Narxlar SO'MDA. Tariflarni istagancha o'zgartiring.
 */

export const PAYMENT_INFO = {
  cardNumber: '8600 0000 0000 0000', // ← o'z karta raqamingiz
  holder: 'ISM FAMILIYA', // ← karta egasi
  bank: 'Uzcard / Humo',
};

export interface Plan {
  months: number;
  title: string;
  priceUzs: number;
  oldPriceUzs?: number; // eski narx (chizib tashlanadi) — ixtiyoriy
  discount?: string; // masalan "16%" — ixtiyoriy
  popular?: boolean;
}

/** Tarif rejalari — narxlar so'mda. Bemalol o'zgartiring. */
export const PLANS: Plan[] = [
  {
    months: 1,
    title: '1 oylik',
    priceUzs: 99_000,
  },
  {
    months: 3,
    title: '3 oylik',
    priceUzs: 249_000,
    oldPriceUzs: 297_000,
    discount: '16%',
    popular: true,
  },
  {
    months: 6,
    title: '6 oylik',
    priceUzs: 499_000,
    oldPriceUzs: 594_000,
    discount: '16%',
  },
  {
    months: 12,
    title: '12 oylik',
    priceUzs: 899_000,
    oldPriceUzs: 1_188_000,
    discount: '24%',
  },
];
