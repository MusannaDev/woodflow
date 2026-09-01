'use client';

import { useI18n } from '../lib/i18n';
import { Lang } from '../lib/i18n/types';

const LABEL: Record<Lang, string> = { uz: 'UZ', en: 'EN' };
const FLAG: Record<Lang, string> = { uz: '🇺🇿', en: '🇬🇧' };

/**
 * Til almashtirgich — bitta bosish butun ilovani ikkinchi tilga o'tkazadi.
 * `variant`:
 *   'dark'  — to'q sidebar/fon ustida
 *   'light' — oq/glass panel ustida (default)
 *   'pill'  — landing va auth sahifalari uchun mustaqil tugma
 */
export function LanguageSwitcher({
  variant = 'light',
  className = '',
}: {
  variant?: 'dark' | 'light' | 'pill';
  className?: string;
}) {
  const { lang, setLang, t } = useI18n();

  const base =
    'flex items-center gap-0.5 rounded-lg p-0.5 flex-none select-none transition-colors';
  const shell = {
    dark: 'bg-white/[0.07] border border-white/10',
    light: 'bg-neutral-100/80 border border-neutral-200',
    pill: 'bg-white border border-neutral-200 shadow-sm',
  }[variant];

  const activeCls =
    variant === 'dark'
      ? 'bg-white/90 text-neutral-900'
      : 'bg-[#1c130a] text-white';
  const idleCls =
    variant === 'dark'
      ? 'text-white/55 hover:text-white'
      : 'text-neutral-500 hover:text-neutral-900';

  return (
    <div
      className={`${base} ${shell} ${className}`}
      role="group"
      aria-label={t('common.langSwitch')}
    >
      {(['uz', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          title={l === 'uz' ? 'O‘zbekcha' : 'English'}
          className={`rounded-[6px] px-1.5 py-1 text-[11px] font-bold leading-none tracking-wide transition-colors ${
            lang === l ? activeCls : idleCls
          }`}
        >
          <span className="mr-0.5 text-[10px]" aria-hidden>
            {FLAG[l]}
          </span>
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
