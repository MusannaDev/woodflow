'use client';

import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MY_AUTH } from '../../lib/queries';
import { AuthData, session } from '../../lib/session';

/**
 * Kutish ekrani: CEO/egasi tasdig'i yoki ishchi yozuvi kutilayotgan holat.
 * "Holatni tekshirish" — myAuth'ni qayta so'raydi; tasdiqlangan bo'lsa kiradi.
 */

const STATES: Record<
  string,
  { icon: string; title: string; desc: string; tone: string }
> = {
  CEO_APPROVAL: {
    icon: '⏳',
    title: 'CEO tasdig‘i kutilmoqda',
    desc: "Biznesingiz so'rovi yuborildi. CEO tasdiqlagach, ikkala biznes makoningiz avtomatik ochiladi.",
    tone: 'amber',
  },
  OWNER_APPROVAL: {
    icon: '🤝',
    title: 'Egangiz tasdig‘i kutilmoqda',
    desc: "So'rovingiz biznes egasiga yuborildi. Tasdiqlangach ishchi sifatida kirasiz.",
    tone: 'amber',
  },
  WAITING_EMPLOYEE: {
    icon: '📞',
    title: 'Egangiz sizni hali qo‘shmagan',
    desc: "Biznes egasiga ayting — u sizni 'Ishchilar' bo'limida telefon raqamingiz bilan qo'shsin. Shundan so'ng bu yerda so'rov paydo bo'ladi.",
    tone: 'blue',
  },
  REJECTED: {
    icon: '🚫',
    title: 'So‘rov rad etildi',
    desc: 'Afsuski, biznes ochish so‘rovingiz rad etildi. Savollar bo‘lsa administratsiya bilan bog‘laning.',
    tone: 'red',
  },
};

export default function KutishPage() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [refresh] = useLazyQuery<{ myAuth: AuthData }>(MY_AUTH, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!session.token()) {
      router.replace('/login');
      return;
    }
    const p = session.pending();
    if (!p) {
      router.replace('/dashboard');
      return;
    }
    setPending(p);
  }, [router]);

  async function check() {
    setChecking(true);
    const res = await refresh().catch(() => null);
    const data = res?.data?.myAuth;
    setChecking(false);
    if (!data) return;
    session.save({ ...data, token: session.token()! });
    if (!data.pending && data.workspaces.length > 0) {
      router.replace('/dashboard');
    } else {
      setPending(data.pending);
    }
  }

  function logout() {
    session.clear();
    router.replace('/login');
  }

  if (!pending) return null;
  const s = STATES[pending] ?? STATES.CEO_APPROVAL;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 500px at 80% -10%, rgba(176,106,36,0.12), transparent 60%),' +
            'radial-gradient(700px 400px at -10% 105%, rgba(176,106,36,0.08), transparent 55%)',
        }}
      />
      <div className="glass rounded-3xl p-8 sm:p-10 max-w-md w-full text-center animate-[fadeIn_.4s_ease]">
        <div className="text-5xl">{s.icon}</div>
        <h1 className="text-xl font-bold mt-4 tracking-tight">{s.title}</h1>
        <p className="text-sm text-neutral-500 mt-2.5 leading-relaxed">
          {s.desc}
        </p>

        <div className="grid gap-2.5 mt-8">
          {pending !== 'REJECTED' && (
            <button
              onClick={check}
              disabled={checking}
              className="btn-primary"
            >
              {checking ? 'Tekshirilmoqda…' : 'Holatni tekshirish'}
            </button>
          )}
          <button
            onClick={logout}
            className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors py-2"
          >
            Chiqish →
          </button>
        </div>
      </div>
    </main>
  );
}
