'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { session, WorkspaceBrief } from '../../lib/session';

/**
 * App Shell (UI hujjati §3): chapda menyu, yuqorida panel.
 * Workspace almashtirgich — rang ham birga almashadi (amber ↔ yashil).
 */

type MenuItem = { href: string; label: string; icon: string };

/** Menyu joriy workspace'ga qarab o'zgaradi (UI hujjati §3). */
const MENU_WOOD: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/furalar', label: 'Furalar', icon: '▤' },
  { href: '/ombor', label: 'Ombor', icon: '▣' },
  { href: '/savdo', label: 'Savdo', icon: '◉' },
  { href: '/tolovlar', label: "To'lovlar", icon: '◇' },
  { href: '/transfer', label: 'Ichki transfer', icon: '⇄' },
  { href: '/mijozlar', label: 'Mijozlar', icon: '◎' },
  { href: '/xarajatlar', label: 'Xarajatlar', icon: '◈' },
];

const MENU_LUMBER: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/ishlab-chiqarish', label: 'Ishlab chiqarish', icon: '⚙' },
  { href: '/shablonlar', label: 'Shablonlar', icon: '▱' },
  { href: '/tayyor-ombor', label: 'Tayyor ombor', icon: '▥' },
  { href: '/transfer', label: 'Ichki transfer', icon: '⇄' },
  { href: '/ombor', label: 'Xomashyo ombori', icon: '▣' },
  { href: '/savdo', label: 'Savdo', icon: '◉' },
  { href: '/tolovlar', label: "To'lovlar", icon: '◇' },
  { href: '/mijozlar', label: 'Mijozlar', icon: '◎' },
  { href: '/xarajatlar', label: 'Xarajatlar', icon: '◈' },
];

export default function ShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ws, setWs] = useState<WorkspaceBrief | null>(null);
  const [list, setList] = useState<WorkspaceBrief[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session.token()) {
      router.replace('/login');
      return;
    }
    const current = session.currentWorkspace();
    if (!current) {
      // Buzuq/eski sessiya — blank sahifa o'rniga toza login
      session.clear();
      router.replace('/login');
      return;
    }
    setWs(current);
    setList(session.workspaces());
  }, [router]);

  function switchWs(target: WorkspaceBrief) {
    session.setCurrentWorkspace(target.id);
    // Eng ishonchli yo'l: to'liq reload — barcha query yangi workspace bilan qayta ketadi
    window.location.reload();
  }

  function logout() {
    session.clear();
    router.replace('/login');
  }

  if (!ws) return null;

  return (
    <div data-ws={ws.type} className="min-h-screen flex">
      {/* Yon menyu */}
      <aside className="hidden md:flex w-60 flex-col bg-neutral-900 text-neutral-300">
        <a
          href="/"
          className="px-5 py-4 flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <span className="w-3 h-3 rounded-full bg-brand inline-block" />
          WoodFlow
        </a>

        {/* Workspace almashtirgich */}
        <div className="px-3 pb-3 relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
            <span className="flex-1 text-left truncate">{ws.name}</span>
            <span className="text-neutral-500">⌄</span>
          </button>
          {open && (
            <div className="absolute left-3 right-3 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden z-10">
              {list.map((w) => (
                <button
                  key={w.id}
                  onClick={() => switchWs(w)}
                  data-ws={w.type}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-700 ${
                    w.id === ws.id ? 'text-white' : ''
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {(ws.type === 'LUMBER_PRODUCTION' ? MENU_LUMBER : MENU_WOOD).map((m) => (
            <a
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === m.href
                  ? 'bg-brand text-white'
                  : 'hover:bg-neutral-800'
              }`}
            >
              <span className="opacity-70">{m.icon}</span>
              {m.label}
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-neutral-800 text-sm">
          <div className="text-white">{session.userName()}</div>
          <div className="text-xs text-neutral-500">{ws.role}</div>
          <button
            onClick={logout}
            className="mt-2 text-xs text-neutral-400 hover:text-white"
          >
            Chiqish →
          </button>
        </div>
      </aside>

      {/* Asosiy maydon */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex items-center gap-3">
          <span className="md:hidden font-bold">WoodFlow</span>
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
            {ws.name}
          </span>
          <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Onlayn
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
