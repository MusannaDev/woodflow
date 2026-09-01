'use client';

import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useI18n } from '../../lib/i18n';
import { MsgKey } from '../../lib/i18n/messages';
import { MY_AUTH } from '../../lib/queries';
import { AuthData, session } from '../../lib/session';

/**
 * Kutish ekrani: CEO/egasi tasdig'i yoki ishchi yozuvi kutilayotgan holat.
 * "Holatni tekshirish" — myAuth'ni qayta so'raydi; tasdiqlangan bo'lsa kiradi.
 */

const STATES: Record<
  string,
  { icon: string; title: MsgKey; desc: MsgKey; tone: string }
> = {
  CEO_APPROVAL: {
    icon: '⏳',
    title: 'wait.CEO_APPROVAL.title',
    desc: 'wait.CEO_APPROVAL.desc',
    tone: 'amber',
  },
  OWNER_APPROVAL: {
    icon: '🤝',
    title: 'wait.OWNER_APPROVAL.title',
    desc: 'wait.OWNER_APPROVAL.desc',
    tone: 'amber',
  },
  WAITING_EMPLOYEE: {
    icon: '📞',
    title: 'wait.WAITING_EMPLOYEE.title',
    desc: 'wait.WAITING_EMPLOYEE.desc',
    tone: 'blue',
  },
  REJECTED: {
    icon: '🚫',
    title: 'wait.REJECTED.title',
    desc: 'wait.REJECTED.desc',
    tone: 'red',
  },
};

export default function KutishPage() {
  const { t } = useI18n();
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
      <LanguageSwitcher variant="pill" className="absolute top-5 right-5" />

      <div className="glass rounded-3xl p-8 sm:p-10 max-w-md w-full text-center animate-[fadeIn_.4s_ease]">
        <div className="text-5xl">{s.icon}</div>
        <h1 className="text-xl font-bold mt-4 tracking-tight">{t(s.title)}</h1>
        <p className="text-sm text-neutral-500 mt-2.5 leading-relaxed">
          {t(s.desc)}
        </p>

        <div className="grid gap-2.5 mt-8">
          {pending !== 'REJECTED' && (
            <button
              onClick={check}
              disabled={checking}
              className="btn-primary"
            >
              {checking ? t('wait.checking') : t('wait.check')}
            </button>
          )}
          <button
            onClick={logout}
            className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors py-2"
          >
            {t('common.logoutArrow')}
          </button>
        </div>
      </div>
    </main>
  );
}
