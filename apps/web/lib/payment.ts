import { MsgKey } from './i18n/messages';

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
  /** Sarlavha lug'at kaliti — ikkala tilda ko'rinadi. */
  titleKey: MsgKey;
  priceUzs: number;
  oldPriceUzs?: number; // eski narx (chizib tashlanadi) — ixtiyoriy
  discount?: string; // masalan "16%" — ixtiyoriy
  popular?: boolean;
}

/** Tarif rejalari — narxlar so'mda. Bemalol o'zgartiring. */
export const PLANS: Plan[] = [
  {
    months: 1,
    titleKey: 'plan.1',
    priceUzs: 99_000,
  },
  {
    months: 3,
    titleKey: 'plan.3',
    priceUzs: 249_000,
    oldPriceUzs: 297_000,
    discount: '16%',
    popular: true,
  },
  {
    months: 6,
    titleKey: 'plan.6',
    priceUzs: 499_000,
    oldPriceUzs: 594_000,
    discount: '16%',
  },
  {
    months: 12,
    titleKey: 'plan.12',
    priceUzs: 899_000,
    oldPriceUzs: 1_188_000,
    discount: '24%',
  },
];
