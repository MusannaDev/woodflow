'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import { MsgKey } from '../lib/i18n/messages';
import { session } from '../lib/session';

/**
 * Homepage (landing) — Premium + Classic.
 * Classic: serif sarlavhalar, sokin ohang, ko'p havo.
 * Premium: to'q yog'och fon, amber urg'u, daraxt halqalari motivi.
 */

function WoodRings({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden>
      {[16, 30, 44, 58, 72, 86, 100].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeWidth="1.1" />
      ))}
    </svg>
  );
}

const FEATURES: { icon: string; title: MsgKey; text: MsgKey }[] = [
  { icon: '🚛', title: 'landing.f1.title', text: 'landing.f1.text' },
  { icon: '📐', title: 'landing.f2.title', text: 'landing.f2.text' },
  { icon: '💱', title: 'landing.f3.title', text: 'landing.f3.text' },
  { icon: '📦', title: 'landing.f4.title', text: 'landing.f4.text' },
  { icon: '🪚', title: 'landing.f5.title', text: 'landing.f5.text' },
  { icon: '🧾', title: 'landing.f6.title', text: 'landing.f6.text' },
];

const STEPS: { n: string; t: MsgKey; d: MsgKey }[] = [
  { n: '01', t: 'landing.s1.t', d: 'landing.s1.d' },
  { n: '02', t: 'landing.s2.t', d: 'landing.s2.d' },
  { n: '03', t: 'landing.s3.t', d: 'landing.s3.d' },
];

export default function HomePage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(Boolean(session.token())), []);

  return (
    <main className="bg-[#faf8f4] text-neutral-900">
      {/* ───── Navbar ───── */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#faf8f4]/80 border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <img
              src="/rs-mark.png"
              alt="RS Development"
              className="w-9 h-9 rounded-full object-cover object-center ring-1 ring-amber-700/25"
            />
            RS Development
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 ml-4">
            <a href="#imkoniyatlar" className="hover:text-neutral-900 transition-colors">{t('landing.nav.features')}</a>
            <a href="#jarayon" className="hover:text-neutral-900 transition-colors">{t('landing.nav.how')}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher variant="pill" />
            {authed ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#1c130a] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t('landing.nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  {t('landing.nav.login')}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-[#1c130a] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {t('landing.nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <WoodRings className="absolute -right-32 -top-32 w-[520px] h-[520px] text-amber-700/10" />
        <WoodRings className="absolute -left-40 top-64 w-[420px] h-[420px] text-amber-700/[0.07]" />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-24 text-center">
          <img
            src="/rs-wordmark.png"
            alt="RS Development"
            className="mx-auto mb-8 w-40 h-40 sm:w-48 sm:h-48 rounded-3xl object-cover shadow-2xl shadow-neutral-900/25 ring-1 ring-amber-700/20"
          />
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full px-4 py-1.5">
            {t('landing.badge')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mt-7 tracking-tight [text-wrap:balance]">
            {t('landing.hero.title1')}{' '}
            <span className="text-amber-700 italic">
              {t('landing.hero.title2')}
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.sub')}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={authed ? '/dashboard' : '/signup'}
              className="rounded-2xl bg-amber-700 text-white px-8 py-4 font-semibold shadow-xl shadow-amber-700/25 hover:shadow-amber-700/40 hover:-translate-y-0.5 transition-all"
            >
              {authed ? t('landing.cta.toDashboard') : t('landing.cta.start')}
            </Link>
            <a
              href="#jarayon"
              className="rounded-2xl border-2 border-neutral-300 px-8 py-4 font-semibold text-neutral-700 hover:border-amber-700 hover:text-amber-800 transition-colors"
            >
              {t('landing.cta.how')}
            </a>
          </div>

          {/* Mini "dashboard" preview — classic karta */}
          <div className="mt-16 max-w-3xl mx-auto rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/[0.06] p-6 text-left">
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span className="text-sm font-semibold">
                {t('landing.preview.title')}
              </span>
              <span className="ml-auto text-xs text-emerald-600">
                ● {t('common.online')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {(
                [
                  ['landing.preview.sales', '24.5 mln', 'common.som'],
                  ['landing.preview.stock', '182 m³', 'landing.preview.stockSub'],
                  ['landing.preview.profit', '41.2 mln', 'landing.preview.profitSub'],
                  ['landing.preview.debts', '6.1 mln', 'landing.preview.debtsSub'],
                ] as [MsgKey, string, MsgKey][]
              ).map(([l, v, s]) => (
                <div key={l} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5">
                  <div className="text-[10px] tracking-wider text-neutral-400 font-semibold">{t(l)}</div>
                  <div className="text-lg font-bold mt-0.5 tabular-nums">{v}</div>
                  <div className="text-[11px] text-neutral-400">{t(s)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Imkoniyatlar ───── */}
      <section id="imkoniyatlar" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl text-center tracking-tight">
          {t('landing.features.title')}
        </h2>
        <p className="text-center text-neutral-500 mt-3 max-w-xl mx-auto">
          {t('landing.features.sub')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-700/5 transition-all"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold mt-3.5">{t(f.title)}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mt-2">
                {t(f.text)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Jarayon (qora band) ───── */}
      <section id="jarayon" className="relative overflow-hidden bg-[#1c130a] text-white">
        <WoodRings className="absolute -right-24 -bottom-24 w-[400px] h-[400px] text-amber-400/10" />
        <div className="relative max-w-6xl mx-auto px-5 py-20">
          <h2 className="font-serif text-3xl sm:text-4xl text-center tracking-tight">
            {t('landing.steps.title1')}{' '}
            <span className="text-amber-300 italic">
              {t('landing.steps.title2')}
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-serif text-5xl text-amber-400/25 font-bold">{s.n}</div>
                <h3 className="font-semibold text-lg mt-2">{t(s.t)}</h3>
                <p className="text-sm text-white/55 leading-relaxed mt-2">
                  {t(s.d)}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/10 text-center">
            {(
              [
                ['2', 'landing.stat1'],
                ['m³', 'landing.stat2'],
                ['3', 'landing.stat3'],
                ['24/7', 'landing.stat4'],
              ] as [string, MsgKey][]
            ).map(([v, l]) => (
              <div key={l}>
                <div className="font-serif text-3xl font-bold text-amber-300">{v}</div>
                <div className="text-xs text-white/45 mt-1">{t(l)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl tracking-tight [text-wrap:balance]">
          {t('landing.final.title')}
        </h2>
        <p className="text-neutral-500 mt-3">{t('landing.final.sub')}</p>
        <Link
          href={authed ? '/dashboard' : '/signup'}
          className="inline-block mt-8 rounded-2xl bg-amber-700 text-white px-10 py-4 font-semibold shadow-xl shadow-amber-700/25 hover:shadow-amber-700/40 hover:-translate-y-0.5 transition-all"
        >
          {authed ? t('landing.cta.toDashboard') : t('landing.final.cta')}
        </Link>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center gap-3 text-sm text-neutral-400">
          <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-600">
            <img
              src="/rs-mark.png"
              alt="RS Development"
              className="w-6 h-6 rounded-full object-cover object-center ring-1 ring-amber-700/25"
            />
            RS Development
          </Link>
          <span className="sm:ml-auto">
            © {new Date().getFullYear()} · {t('landing.footer')}
          </span>
        </div>
      </footer>
    </main>
  );
}
