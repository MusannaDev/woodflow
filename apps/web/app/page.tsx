'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

const FEATURES = [
  {
    icon: '🚛',
    title: 'Har furadan aniq foyda',
    text: "Nomer, rang, ega, telefon — va eng muhimi: har fura alohida foyda markazi. Savdo − tannarx − transport − bojxona − nuqson = sof foyda.",
  },
  {
    icon: '📐',
    title: "O'lchamdan m³ avtomatik",
    text: "«6 metr, 200 dona, donasi 25 mingdan» deysiz — tizim 12 m³ deb hisoblab, ombordan o'zi yechadi. Qo'lda sanash yo'q.",
  },
  {
    icon: '💱',
    title: 'RUB · USD · so‘m — to‘g‘ri',
    text: "Import rublda, narx so'mda, to'lov dollarda bo'lsa ham — har yozuv o'z kursini muzlatib saqlaydi. «Qog'ozda foyda, aslida zarar» bo'lmaydi.",
  },
  {
    icon: '📦',
    title: 'Ombor m³ hisobida',
    text: "Har kirim omborni to'ldiradi, har savdo avtomatik yechadi. Nuqsonli yog'och ajratiladi va zarar sifatida furaga yoziladi.",
  },
  {
    icon: '🪚',
    title: 'Ishlab chiqarish va yield',
    text: "Necha m³ xomashyodan qancha pol taxta chiqdi — chiqim foizi (yield) har partiyada. Ikki biznes ichki transfer bilan toza ajralgan.",
  },
  {
    icon: '🧾',
    title: 'Qarz va xarajat nazorati',
    text: "Kim qancha qarz — ro'yxat doim tayyor. Oylik, gaz, svet, soliq — kategoriya bo'yicha, sof foydadan avtomatik ayiriladi.",
  },
];

const STEPS = [
  { n: '01', t: 'Kiriting', d: "Fura keldi — kirim yozasiz. Mijoz oldi — savdo yozasiz. Bor-yo'g'i shu." },
  { n: '02', t: 'Tizim hisoblaydi', d: "m³, kurs, ombor qoldig'i, qarz — hammasi avtomatik, xatosiz." },
  { n: '03', t: "Foydani ko'ring", d: 'Har furadan, har oydan, har biznesdan — aniq raqam bilan.' },
];

export default function HomePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(Boolean(session.token())), []);

  return (
    <main className="bg-[#faf8f4] text-neutral-900">
      {/* ───── Navbar ───── */}
      <header className="sticky top-0 z-20 backdrop-blur bg-[#faf8f4]/80 border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
            WoodFlow
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 ml-4">
            <a href="#imkoniyatlar" className="hover:text-neutral-900 transition-colors">Imkoniyatlar</a>
            <a href="#jarayon" className="hover:text-neutral-900 transition-colors">Qanday ishlaydi</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {authed ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#1c130a] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  Kirish
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-[#1c130a] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Ro&apos;yxatdan o&apos;tish
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
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 text-center">
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-amber-800 bg-amber-100/70 border border-amber-200 rounded-full px-4 py-1.5">
            🪵 Yog&apos;och &amp; taxta biznesi uchun maxsus
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mt-7 tracking-tight [text-wrap:balance]">
            Daftar va Telegram o&apos;rniga —{' '}
            <span className="text-amber-700 italic">bitta platforma</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Kirim, ombor, savdo, qarz va xarajat — siz kiritasiz, WoodFlow hisoblaydi.
            Istalgan payt aniq foydangizni ko&apos;rasiz: telefonda ham, kompyuterda ham.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={authed ? '/dashboard' : '/signup'}
              className="rounded-2xl bg-amber-700 text-white px-8 py-4 font-semibold shadow-xl shadow-amber-700/25 hover:shadow-amber-700/40 hover:-translate-y-0.5 transition-all"
            >
              {authed ? 'Dashboard’ga o‘tish' : 'Bepul boshlash'}
            </Link>
            <a
              href="#jarayon"
              className="rounded-2xl border-2 border-neutral-300 px-8 py-4 font-semibold text-neutral-700 hover:border-amber-700 hover:text-amber-800 transition-colors"
            >
              Qanday ishlaydi?
            </a>
          </div>

          {/* Mini "dashboard" preview — classic karta */}
          <div className="mt-16 max-w-3xl mx-auto rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/[0.06] p-6 text-left">
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span className="text-sm font-semibold">Yog&apos;och sotuvi · Dashboard</span>
              <span className="ml-auto text-xs text-emerald-600">● Onlayn</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[
                ['BUGUNGI SAVDO', '24.5 mln', "so'm"],
                ["OMBOR QOLDIG'I", '182 m³', "yog'och"],
                ['KUTILAYOTGAN FOYDA', '41.2 mln', 'shu oy'],
                ['QARZLAR', '6.1 mln', '3 mijoz'],
              ].map(([l, v, s]) => (
                <div key={l} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5">
                  <div className="text-[10px] tracking-wider text-neutral-400 font-semibold">{l}</div>
                  <div className="text-lg font-bold mt-0.5 tabular-nums">{v}</div>
                  <div className="text-[11px] text-neutral-400">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Imkoniyatlar ───── */}
      <section id="imkoniyatlar" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl text-center tracking-tight">
          Biznesingiz uchun yaratilgan
        </h2>
        <p className="text-center text-neutral-500 mt-3 max-w-xl mx-auto">
          Umumiy dastur emas — yog&apos;och importi va taxta ishlab chiqarishning har bir nozikligi hisobga olingan.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-700/5 transition-all"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold mt-3.5">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mt-2">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Jarayon (qora band) ───── */}
      <section id="jarayon" className="relative overflow-hidden bg-[#1c130a] text-white">
        <WoodRings className="absolute -right-24 -bottom-24 w-[400px] h-[400px] text-amber-400/10" />
        <div className="relative max-w-6xl mx-auto px-5 py-20">
          <h2 className="font-serif text-3xl sm:text-4xl text-center tracking-tight">
            Uch qadam — <span className="text-amber-300 italic">shu xolos</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-serif text-5xl text-amber-400/25 font-bold">{s.n}</div>
                <h3 className="font-semibold text-lg mt-2">{s.t}</h3>
                <p className="text-sm text-white/55 leading-relaxed mt-2">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/10 text-center">
            {[
              ['2', 'biznes, bitta login'],
              ['m³', 'avtomatik hisob'],
              ['3', 'valyuta (RUB·USD·UZS)'],
              ['24/7', 'telefon va kompyuterda'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-serif text-3xl font-bold text-amber-300">{v}</div>
                <div className="text-xs text-white/45 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl tracking-tight [text-wrap:balance]">
          Bugun boshlang — foydangizni aniq biling
        </h2>
        <p className="text-neutral-500 mt-3">Bir daqiqada hisob yaratiladi, ikkala biznes makoni avtomatik tayyor.</p>
        <Link
          href={authed ? '/dashboard' : '/signup'}
          className="inline-block mt-8 rounded-2xl bg-amber-700 text-white px-10 py-4 font-semibold shadow-xl shadow-amber-700/25 hover:shadow-amber-700/40 hover:-translate-y-0.5 transition-all"
        >
          {authed ? 'Dashboard’ga o‘tish' : "Ro'yxatdan o'tish — bepul"}
        </Link>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center gap-3 text-sm text-neutral-400">
          <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-600">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
            WoodFlow
          </Link>
          <span className="sm:ml-auto">
            © {new Date().getFullYear()} · Yog&apos;och &amp; Taxta biznes platformasi
          </span>
        </div>
      </footer>
    </main>
  );
}
