/** Ilova tillari. UZ — asosiy (default), EN — ikkinchi til. */
export type Lang = 'uz' | 'en';

export const LANGS: Lang[] = ['uz', 'en'];

/** localStorage + cookie kaliti. Cookie SSR'da o'qiladi (hydration mos kelishi uchun). */
export const LANG_KEY = 'wf_lang';

export const isLang = (v: unknown): v is Lang => v === 'uz' || v === 'en';

/**
 * Har bir xabar — [o'zbekcha, inglizcha] juftligi. Ikkala til bitta joyda
 * turgani uchun tarjima "yo'qolib qolishi" mumkin emas.
 */
export type Msg = readonly [uz: string, en: string];
