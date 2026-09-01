'use client';

/**
 * Auth sahifalarining chap "brand" paneli — yog'och halqalari motivi,
 * chuqur jigarrang fon, amber urg'u. Login va Signup'da bir xil.
 */

import Link from 'next/link';
import { useI18n } from '../../lib/i18n';
import { MsgKey } from '../../lib/i18n/messages';

const BULLETS: MsgKey[] = ['brand.b1', 'brand.b2', 'brand.b3', 'brand.b4'];

export function BrandPanel() {
  const { t } = useI18n();

  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#1c130a] text-white p-12">
      {/* Yog'och halqalari (daraxt kesimi) — nozik dekor */}
      <svg
        className="absolute -right-40 -top-40 w-[560px] h-[560px] opacity-[0.14]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        {[18, 34, 50, 66, 82, 98].map((r) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            stroke="#e8b06a"
            strokeWidth="1.2"
          />
        ))}
      </svg>
      <svg
        className="absolute -left-24 -bottom-24 w-[380px] h-[380px] opacity-[0.10]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        {[20, 40, 60, 80].map((r) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            stroke="#e8b06a"
            strokeWidth="1.4"
          />
        ))}
      </svg>
      {/* Amber nur */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,176,106,0.18),transparent_55%)]" />

      <Link
        href="/"
        className="relative w-fit hover:opacity-90 transition-opacity"
      >
        <img
          src="/rs-logo.png"
          alt="RS Development"
          className="w-44 rounded-2xl ring-1 ring-amber-300/15 shadow-2xl shadow-black/40"
        />
      </Link>

      <div className="relative max-w-md">
        <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
          {t('brand.title1')}{' '}
          <span className="text-amber-300">{t('brand.title2')}</span>
        </h2>
        <p className="mt-4 text-white/60 leading-relaxed">{t('brand.sub')}</p>

        <ul className="mt-8 grid gap-3.5 text-sm">
          {BULLETS.map((key) => (
            <li key={key} className="flex items-center gap-3 text-white/80">
              <span className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-300/40 grid place-items-center text-amber-300 text-[11px]">
                ✓
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/35">
        © {new Date().getFullYear()} RS Development · {t('landing.footer')}
      </p>
    </aside>
  );
}
