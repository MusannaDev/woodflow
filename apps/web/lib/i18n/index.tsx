'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setFormatLang } from '../format';
import { messages, MsgKey } from './messages';
import { translateServerMessage } from './server-errors';
import { isLang, Lang, LANG_KEY } from './types';

export type { Lang } from './types';
export type { MsgKey } from './messages';
export { LANG_KEY, LANGS } from './types';

/** t() ga uzatiladigan o'rin egallovchilar: t('x', { n: 5 }). */
export type Vars = Record<string, string | number>;

export type TFunc = (key: MsgKey, vars?: Vars) => string;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: TFunc;
  /** Backend'dan kelgan xabarni joriy tilga o'giradi (topilmasa — o'zini qaytaradi). */
  ts: (raw: string | null | undefined, fallbackKey?: MsgKey) => string;
  /** Intl uchun locale: 'uz-UZ' | 'en-US'. */
  locale: string;
}

const I18nContext = createContext<I18nValue | null>(null);

/** `{name}` ko'rinishidagi o'rin egallovchilarni almashtiradi. */
function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

/** Tilni saqlash: localStorage (tez o'qish) + cookie (SSR mos kelishi uchun). */
function persist(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode — e'tiborsiz */
  }
  // 1 yil, butun sayt bo'ylab
  document.cookie = `${LANG_KEY}=${lang};path=/;max-age=31536000;samesite=lax`;
}

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Intl formatlagichlari (fmt/mln/sana) ham til bilan birga yuradi
  setFormatLang(lang);

  useEffect(() => {
    // Cookie o'chib qolgan, lekin localStorage'da tanlov bor bo'lsa — tiklaymiz
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (isLang(stored) && stored !== lang) setLangState(stored);
      else persist(lang);
    } catch {
      /* e'tiborsiz */
    }
    // faqat ilk yuklashda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setFormatLang(next);
    persist(next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const idx = lang === 'uz' ? 0 : 1;
    const t: TFunc = (key, vars) => {
      const pair = messages[key];
      if (!pair) return key; // kalit yo'q — kalitning o'zi ko'rinadi (debug)
      return interpolate(pair[idx] ?? pair[0], vars);
    };
    return {
      lang,
      setLang,
      toggle: () => setLang(lang === 'uz' ? 'en' : 'uz'),
      t,
      ts: (raw, fallbackKey) =>
        raw
          ? translateServerMessage(raw, lang)
          : t(fallbackKey ?? 'common.error'),
      locale: lang === 'uz' ? 'uz-UZ' : 'en-US',
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n I18nProvider ichida chaqirilishi kerak.');
  return ctx;
}

/** Qisqa yordamchi — faqat t() kerak bo'lganda. */
export function useT(): TFunc {
  return useI18n().t;
}

/**
 * Dinamik (enum) kalitlar uchun xavfsiz tarjima: kalit lug'atda bo'lmasa
 * asl qiymat ko'rinadi — backend yangi enum qo'shsa ham UI buzilmaydi.
 */
export function useEnumLabel(): (prefix: string, value: string) => string {
  const { t } = useI18n();
  return (prefix, value) => {
    const key = `${prefix}.${value}` as MsgKey;
    const label = t(key);
    return label === key ? value : label;
  };
}
