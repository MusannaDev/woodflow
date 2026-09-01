'use client';

import { useQuery } from '@apollo/client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { NotificationBell } from '../../components/NotificationBell';
import { useI18n, TFunc } from '../../lib/i18n';
import { MsgKey } from '../../lib/i18n/messages';
import {
  PENDING_PLATFORM_PAYMENTS,
  PLATFORM_STATS,
} from '../../lib/queries';
import {
  API_BASE,
  BusinessBrief,
  session,
  WorkspaceBrief,
} from '../../lib/session';

/**
 * App Shell — Luxury Premium + Classic (glass effekt).
 * Desktop: suzuvchi glass sidebar. Mobil: glass top-header (workspace
 * almashtirgich bilan) + Instagram-uslub pastki tab-bar + "Ko'proq" sheet.
 */

type MenuItem = { href: string; label: MsgKey; icon: string };

const SHARED_TAIL: MenuItem[] = [
  { href: '/tolovlar', label: 'nav.tolovlar', icon: '◇' },
  { href: '/transfer', label: 'nav.transfer', icon: '⇄' },
  { href: '/mijozlar', label: 'nav.mijozlar', icon: '◎' },
  { href: '/xarajatlar', label: 'nav.xarajatlar', icon: '◈' },
  { href: '/ishchilar', label: 'nav.ishchilar', icon: '♟' },
  { href: '/oylik', label: 'nav.oylik', icon: '💵' },
  { href: '/konsolidatsiya', label: 'nav.konsolidatsiya', icon: '◆' },
];

const MENU_WOOD: MenuItem[] = [
  { href: '/dashboard', label: 'nav.dashboard', icon: '▦' },
  { href: '/furalar', label: 'nav.furalar', icon: '▤' },
  { href: '/kirim', label: 'nav.kirim', icon: '⬇' },
  { href: '/ombor', label: 'nav.ombor', icon: '▣' },
  { href: '/savdo', label: 'nav.savdo', icon: '◉' },
  ...SHARED_TAIL,
];

const MENU_LUMBER: MenuItem[] = [
  { href: '/dashboard', label: 'nav.dashboard', icon: '▦' },
  { href: '/ishlab-chiqarish', label: 'nav.ishlabChiqarish', icon: '⚙' },
  { href: '/shablonlar', label: 'nav.shablonlar', icon: '▱' },
  { href: '/tayyor-ombor', label: 'nav.tayyorOmbor', icon: '▥' },
  { href: '/ombor', label: 'nav.omborRaw', icon: '▣' },
  { href: '/savdo', label: 'nav.savdo', icon: '◉' },
  ...SHARED_TAIL,
];

/** Mobil pastki tab-bar (Instagram-uslub): 2 + markaziy Savdo + 1 + Ko'proq. */
const TABS_WOOD: MenuItem[] = [
  { href: '/dashboard', label: 'nav.tab.home', icon: '▦' },
  { href: '/ombor', label: 'nav.tab.ombor', icon: '▣' },
  { href: '/savdo', label: 'nav.tab.savdo', icon: '+' }, // markaziy tugma
  { href: '/tolovlar', label: 'nav.tab.tolov', icon: '◇' },
];
const TABS_LUMBER: MenuItem[] = [
  { href: '/dashboard', label: 'nav.tab.home', icon: '▦' },
  { href: '/ishlab-chiqarish', label: 'nav.tab.prod', icon: '⚙' },
  { href: '/savdo', label: 'nav.tab.savdo', icon: '+' },
  { href: '/tayyor-ombor', label: 'nav.tab.tayyor', icon: '▥' },
];
const TABS_WORKER: MenuItem[] = [
  { href: '/dashboard', label: 'nav.tab.home', icon: '▦' },
  { href: '/ombor', label: 'nav.tab.ombor', icon: '▣' },
  { href: '/savdo', label: 'nav.tab.savdo', icon: '+' },
  { href: '/mijozlar', label: 'nav.tab.mijozlar', icon: '◎' },
];

/** WORKER (ishchi) ko'ra oladigan sahifalar — qolganlari yashirin. */
const WORKER_ALLOWED = new Set([
  '/dashboard',
  '/furalar',
  '/ombor',
  '/savdo',
  '/transfer',
  '/mijozlar',
  '/oylik',
]);

export default function ShellLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [ws, setWs] = useState<WorkspaceBrief | null>(null);
  const [list, setList] = useState<WorkspaceBrief[]>([]);
  const [wsOpen, setWsOpen] = useState(false); // desktop switcher
  const [mobWsOpen, setMobWsOpen] = useState(false); // mobil switcher
  const [moreOpen, setMoreOpen] = useState(false); // mobil "Ko'proq" sheet

  const [biz, setBiz] = useState<BusinessBrief | null>(null);
  const [platformRole, setPlatformRole] = useState('USER');

  useEffect(() => {
    if (!session.token()) {
      router.replace('/login');
      return;
    }
    const role = session.platformRole();
    setPlatformRole(role);
    // CEO — sof admin: makon kerak emas, alohida CEO shell ko'rsatiladi
    if (role === 'CEO') return;
    if (session.pending()) {
      router.replace('/kutish'); // tasdiq kutilmoqda — ichkariga kirmaydi
      return;
    }
    const current = session.currentWorkspace();
    if (!current) {
      session.clear();
      router.replace('/login');
      return;
    }
    setWs(current);
    setList(session.workspaces());
    setBiz(session.business());
  }, [router]);

  // Obuna bloklangan bo'lsa — faqat /obuna sahifasi ochiq
  useEffect(() => {
    if (biz?.blocked && pathname !== '/obuna') {
      router.replace('/obuna');
    }
  }, [biz, pathname, router]);

  // Ishchi ruxsatsiz sahifaga URL orqali kirsa — dashboard'ga qaytariladi
  useEffect(() => {
    if (ws?.role === 'WORKER' && !WORKER_ALLOWED.has(pathname)) {
      router.replace('/dashboard');
    }
  }, [ws, pathname, router]);

  // Bitta makonli biznesda /transfer sahifasi ochilmaydi (ichki transfer yo'q)
  useEffect(() => {
    if (list.length === 0 || pathname !== '/transfer') return;
    const types = new Set(list.map((w) => w.type));
    if (!(types.has('WOOD_TRADING') && types.has('LUMBER_PRODUCTION'))) {
      router.replace('/dashboard');
    }
  }, [list, pathname, router]);

  function switchWs(target: WorkspaceBrief) {
    session.setCurrentWorkspace(target.id);
    window.location.reload();
  }

  function logout() {
    session.clear();
    router.replace('/login');
  }

  // CEO — sof admin shell (makon/biznes yo'q, faqat CEO panel)
  if (platformRole === 'CEO') {
    return (
      <CeoShell name={session.userName()} onLogout={logout}>
        {children}
      </CeoShell>
    );
  }

  if (!ws) return null;

  const menu = ws.type === 'LUMBER_PRODUCTION' ? MENU_LUMBER : MENU_WOOD;
  const isOwner = ws.role === 'OWNER';
  const isWorker = ws.role === 'WORKER';

  // Biznesda ikkala makon (Yog'och + Taxta) bormi — ichki transfer shartli
  const wsTypes = new Set(list.map((w) => w.type));
  const hasBoth =
    wsTypes.has('WOOD_TRADING') && wsTypes.has('LUMBER_PRODUCTION');

  // Ishchi — faqat ruxsat etilgan sahifalar; boshqalar to'liq menyu.
  // Bitta makonli biznesda "Ichki transfer" ko'rinmaydi.
  const fullMenu = (
    isWorker
      ? menu.filter((m) => WORKER_ALLOWED.has(m.href))
      : [
          ...menu.filter((m) => m.href !== '/konsolidatsiya' || isOwner),
          ...(isOwner
            ? ([
                { href: '/obuna', label: 'nav.obuna', icon: '💳' },
                { href: '/sozlamalar', label: 'nav.sozlamalar', icon: '⚙' },
              ] as MenuItem[])
            : []),
        ]
  ).filter((m) => m.href !== '/transfer' || hasBoth);

  // Obuna bloklangan bo'lsa — faqat Obuna sahifasi ko'rinadi
  const visibleMenu: MenuItem[] = biz?.blocked
    ? [{ href: '/obuna', label: 'nav.obuna', icon: '💳' }]
    : fullMenu;

  const tabs = isWorker
    ? TABS_WORKER
    : ws.type === 'LUMBER_PRODUCTION'
      ? TABS_LUMBER
      : TABS_WOOD;

  /** Biznes brendi: logo (yuklangan bo'lsa) + nom. */
  const brandName = biz?.name ?? 'RS Development';
  const BrandLogo = ({ size }: { size: string }) =>
    biz?.logoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${API_BASE}${biz.logoUrl}`}
        alt={brandName}
        className={`${size} rounded-lg object-cover flex-none`}
      />
    ) : (
      <span
        className={`${size} rounded-lg bg-gradient-to-br from-amber-300 to-amber-700 grid place-items-center text-white text-xs font-bold flex-none`}
      >
        {brandName.charAt(0).toUpperCase()}
      </span>
    );

  const WsDot = ({ type }: { type: string }) => (
    <span
      data-ws={type}
      className="w-2.5 h-2.5 rounded-full bg-brand inline-block flex-none"
    />
  );

  return (
    <div data-ws={ws.type} className="min-h-screen flex">
      {/* ── Ambient luxury fon ── */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1100px 550px at 85% -10%, rgb(var(--brand) / 0.13), transparent 60%),' +
            'radial-gradient(800px 450px at -10% 105%, rgb(var(--brand) / 0.10), transparent 55%)',
        }}
      />

      {/* ════════ DESKTOP: suzuvchi glass sidebar ════════ */}
      <aside className="hidden md:flex w-64 flex-none flex-col glass-dark text-neutral-300 m-3 rounded-3xl sticky top-3 h-[calc(100vh-1.5rem)] overflow-y-auto">
        <a
          href="/"
          className="px-5 pt-5 pb-3 flex items-center gap-2.5 text-white font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <BrandLogo size="w-8 h-8" />
          <span className="truncate">{brandName}</span>
        </a>

        {/* Workspace almashtirgich */}
        <div className="px-3 pb-3 relative">
          <button
            onClick={() => setWsOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm transition-colors"
          >
            <WsDot type={ws.type} />
            <span className="flex-1 text-left truncate">{ws.name}</span>
            <span className="text-white/40">⌄</span>
          </button>
          {wsOpen && (
            <div className="absolute left-3 right-3 mt-1.5 glass-dark rounded-xl overflow-hidden z-20 animate-[fadeIn_.2s_ease]">
              {list.map((w) => (
                <button
                  key={w.id}
                  onClick={() => switchWs(w)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-white/10 transition-colors ${
                    w.id === ws.id ? 'text-white' : 'text-white/70'
                  }`}
                >
                  <WsDot type={w.type} />
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {visibleMenu.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                pathname === m.href
                  ? 'bg-brand text-white shadow-lg shadow-brand/30'
                  : 'hover:bg-white/[0.08] text-white/75 hover:text-white'
              }`}
            >
              <span className="opacity-70 w-4 text-center">{m.icon}</span>
              {t(m.label)}
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 mt-2 border-t border-white/10 text-sm">
          <div className="text-white">{session.userName()}</div>
          <div className="text-xs text-white/40">{roleLabel(ws.role, t)}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <LanguageSwitcher variant="dark" />
            <button
              onClick={logout}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {t('common.logoutArrow')}
            </button>
          </div>
        </div>
      </aside>

      {/* ════════ ASOSIY USTUN ════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top-bar */}
        <header className="hidden md:flex glass rounded-2xl mx-3 mt-3 px-5 py-3 items-center gap-3 sticky top-3 z-30">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <WsDot type={ws.type} />
            {ws.name}
          </span>
          <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {t('common.online')}
          </span>
          <LanguageSwitcher />
          <NotificationBell />
          <button
            onClick={logout}
            className="text-xs font-semibold text-neutral-500 hover:text-red-600 border border-neutral-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            {t('common.logoutArrow')}
          </button>
        </header>

        {/* ── MOBIL: glass top-header (workspace almashtirgich bilan) ── */}
        <header className="md:hidden glass sticky top-0 z-40 px-4 py-2.5 flex items-center gap-2.5">
          <a href="/" className="flex items-center gap-2 font-bold min-w-0">
            <BrandLogo size="w-7 h-7" />
            <span className="truncate max-w-24 text-sm">{brandName}</span>
          </a>
          <div className="relative flex-1 flex justify-center">
            <button
              onClick={() => setMobWsOpen((v) => !v)}
              className="flex items-center gap-2 bg-brand-faint border border-brand/20 rounded-full pl-3 pr-2.5 py-1.5 text-[13px] font-semibold text-brand max-w-[190px]"
            >
              <WsDot type={ws.type} />
              <span className="truncate">{ws.name}</span>
              <span className="opacity-60">⌄</span>
            </button>
            {mobWsOpen && (
              <div className="absolute top-full mt-2 glass rounded-2xl overflow-hidden z-50 min-w-52 animate-[fadeIn_.2s_ease]">
                {list.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => switchWs(w)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-white/80 transition-colors ${
                      w.id === ws.id ? 'font-semibold' : ''
                    }`}
                  >
                    <WsDot type={w.type} />
                    {w.name}
                    {w.id === ws.id && <span className="ml-auto text-brand">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <LanguageSwitcher />
          <NotificationBell />
          <button
            onClick={logout}
            aria-label={t('common.logout')}
            className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-red-600 border border-neutral-200 rounded-lg px-2 py-1.5 transition-colors flex-none"
          >
            {t('common.logout')}
          </button>
        </header>

        {/* Kontent — mobilda pastki tab uchun joy */}
        <main className="flex-1 p-4 md:p-6 pb-28 md:pb-6 animate-[fadeIn_.35s_ease]">{children}</main>
      </div>

      {/* ════════ MOBIL: Instagram-uslub pastki tab-bar (glass) ════════ */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-dark rounded-3xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 items-end">
          {tabs.slice(0, 2).map((t) => (
            <MobTab key={t.href} item={t} active={pathname === t.href} />
          ))}

          {/* Markaziy Savdo tugmasi */}
          <a
            href={tabs[2].href}
            className="flex flex-col items-center -mt-7"
          >
            <span
              className={`w-14 h-14 rounded-2xl grid place-items-center text-2xl font-bold text-white bg-brand shadow-xl shadow-brand/40 border-4 border-[#f6f2ea] transition-transform active:scale-95 ${
                pathname === tabs[2].href ? 'ring-2 ring-brand/50' : ''
              }`}
            >
              {tabs[2].icon}
            </span>
            <span className="text-[10px] mt-1 text-white/70 font-medium">
              {t(tabs[2].label)}
            </span>
          </a>

          <MobTab item={tabs[3]} active={pathname === tabs[3].href} />

          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-1.5 text-white/60 hover:text-white transition-colors"
          >
            <span className="text-lg leading-none">☰</span>
            <span className="text-[10px] font-medium">{t('common.more')}</span>
          </button>
        </div>
      </nav>

      {/* ════════ MOBIL: "Ko'proq" sheet ════════ */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label={t('common.close')}
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 glass rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto animate-[slideUp_.25s_ease]">
            <div className="w-10 h-1 rounded-full bg-neutral-300 mx-auto mb-4" />

            {/* Workspace almashtirish */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {list.map((w) => (
                <button
                  key={w.id}
                  onClick={() => switchWs(w)}
                  data-ws={w.type}
                  className={`flex items-center gap-2 rounded-2xl border-2 px-3.5 py-3 text-sm font-semibold transition-colors ${
                    w.id === ws.id
                      ? 'border-brand bg-brand-faint text-brand'
                      : 'border-neutral-200 bg-white/70 text-neutral-600'
                  }`}
                >
                  <WsDot type={w.type} />
                  <span className="truncate">{w.name}</span>
                </button>
              ))}
            </div>

            {/* Barcha bo'limlar */}
            <div className="grid grid-cols-3 gap-2.5">
              {visibleMenu.map((m) => (
                <a
                  key={m.href}
                  href={m.href}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3.5 text-center transition-colors ${
                    pathname === m.href
                      ? 'bg-brand text-white shadow-lg shadow-brand/30'
                      : 'bg-white/70 border border-neutral-200/80 text-neutral-700 hover:border-brand/40'
                  }`}
                >
                  <span className="text-lg leading-none">{m.icon}</span>
                  <span className="text-[11px] font-medium leading-tight">
                    {t(m.label)}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200/70 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-brand-faint text-brand grid place-items-center text-sm font-bold">
                {session.userName().charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate">
                  {session.userName()}
                </span>
                <span className="block text-xs text-neutral-400">
                  {roleLabel(ws.role, t)}
                </span>
              </span>
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                {t('common.logoutArrow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CEO_NAV: {
  href: string;
  label: MsgKey;
  icon: string;
  badge?: 'req' | 'pay';
}[] = [
  { href: '/ceo', label: 'nav.ceo.umumiy', icon: '▦' },
  { href: '/ceo/sorovlar', label: 'nav.ceo.sorovlar', icon: '🔔', badge: 'req' },
  { href: '/ceo/tolovlar', label: 'nav.ceo.tolovlar', icon: '💳', badge: 'pay' },
  { href: '/ceo/ownerlar', label: 'nav.ceo.ownerlar', icon: '👑' },
  { href: '/ceo/foydalanuvchilar', label: 'nav.ceo.users', icon: '👥' },
];

/** Makon roli — tarjima qilingan nom (noma'lum rol o'zi ko'rinadi). */
function roleLabel(role: string, t: TFunc): string {
  const key = `common.role.${role}` as MsgKey;
  const label = t(key);
  return label === key ? role : label;
}

const ceoActive = (href: string, pathname: string) =>
  href === '/ceo' ? pathname === '/ceo' : pathname.startsWith(href);

/** CEO shell — glass sidebar, makon/biznes yo'q, faqat platformani boshqaradi. */
function CeoShell({
  name,
  onLogout,
  children,
}: {
  name: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const stats = useQuery<{ platformStats: { pendingCount: number } }>(
    PLATFORM_STATS,
  );
  const pays = useQuery<{ pendingPlatformPayments: unknown[] }>(
    PENDING_PLATFORM_PAYMENTS,
  );
  const counts = {
    req: stats.data?.platformStats.pendingCount ?? 0,
    pay: pays.data?.pendingPlatformPayments.length ?? 0,
  };

  const Badge = ({ n }: { n: number }) =>
    n > 0 ? (
      <span className="ml-auto text-[11px] font-bold bg-amber-400 text-[#1c130a] rounded-full px-1.5 py-0.5 leading-none">
        {n}
      </span>
    ) : null;

  return (
    <div className="min-h-screen flex">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1100px 550px at 85% -10%, rgb(var(--brand) / 0.13), transparent 60%),' +
            'radial-gradient(800px 450px at -10% 105%, rgb(var(--brand) / 0.10), transparent 55%)',
        }}
      />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-none flex-col glass-dark text-neutral-300 m-3 rounded-3xl sticky top-3 h-[calc(100vh-1.5rem)] overflow-y-auto">
        <a
          href="/ceo"
          className="px-5 pt-5 pb-4 flex items-center gap-2.5 text-white font-bold hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rs-mark.png"
            alt="RS Development"
            className="w-8 h-8 rounded-full object-cover object-center ring-1 ring-amber-300/20 flex-none"
          />
          <span className="truncate">RS Development</span>
          <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 rounded-full px-1.5 py-0.5">
            CEO
          </span>
        </a>

        <nav className="flex-1 px-3 space-y-0.5 mt-1">
          {CEO_NAV.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                ceoActive(m.href, pathname)
                  ? 'bg-brand text-white shadow-lg shadow-brand/30'
                  : 'hover:bg-white/[0.08] text-white/75 hover:text-white'
              }`}
            >
              <span className="opacity-80 w-4 text-center">{m.icon}</span>
              {t(m.label)}
              {m.badge && <Badge n={counts[m.badge]} />}
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 mt-2 border-t border-white/10 text-sm">
          <div className="text-white truncate">{name}</div>
          <div className="text-xs text-white/40">{t('nav.ceo.platformOwner')}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <LanguageSwitcher variant="dark" />
            <button
              onClick={onLogout}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {t('common.logoutArrow')}
            </button>
          </div>
        </div>
      </aside>

      {/* Asosiy ustun */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobil header + gorizontal nav */}
        <header className="md:hidden glass sticky top-0 z-40 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-2 font-bold min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/rs-mark.png"
                alt="RS"
                className="w-7 h-7 rounded-full object-cover object-center flex-none"
              />
              <span className="truncate text-sm">RS · CEO</span>
            </span>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationBell />
              <button
                onClick={onLogout}
                className="text-[11px] font-semibold text-neutral-500 hover:text-red-600 border border-neutral-200 rounded-lg px-2 py-1.5 flex-none"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto mt-2 -mx-1 px-1">
            {CEO_NAV.map((m) => (
              <a
                key={m.href}
                href={m.href}
                className={`flex-none flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                  ceoActive(m.href, pathname)
                    ? 'bg-[#1c130a] text-white'
                    : 'text-neutral-500 bg-white/60'
                }`}
              >
                <span>{m.icon}</span>
                {t(m.label)}
                {m.badge && counts[m.badge] > 0 && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 leading-none">
                    {counts[m.badge]}
                  </span>
                )}
              </a>
            ))}
          </div>
        </header>

        <header className="hidden md:flex glass rounded-2xl mx-6 mt-3 px-5 py-3 items-center gap-3 sticky top-3 z-30">
          <span className="text-sm font-semibold flex items-center gap-2">
            <span className="text-amber-500">⭑</span> {t('nav.ceo.panel')}
          </span>
          <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {t('common.online')}
          </span>
          <LanguageSwitcher />
          <NotificationBell />
        </header>
        <main className="p-4 sm:p-6 animate-[fadeIn_.35s_ease] max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Mobil tab elementi. */
function MobTab({ item, active }: { item: MenuItem; active: boolean }) {
  const { t } = useI18n();

  return (
    <a
      href={item.href}
      className={`flex flex-col items-center gap-1 py-1.5 transition-colors ${
        active ? 'text-white' : 'text-white/60 hover:text-white'
      }`}
    >
      <span className="text-lg leading-none">{item.icon}</span>
      <span className="text-[10px] font-medium">{t(item.label)}</span>
      {active && <span className="w-1 h-1 rounded-full bg-brand -mt-0.5" />}
    </a>
  );
}
