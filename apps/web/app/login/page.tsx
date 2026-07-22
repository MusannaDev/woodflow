'use client';

import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { WorkspacePicker } from '../../components/auth/WorkspacePicker';
import { LOGIN } from '../../lib/queries';
import { AuthData, session, WorkspaceBrief } from '../../lib/session';

interface LoginData {
  login: AuthData;
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pickList, setPickList] = useState<WorkspaceBrief[] | null>(null);
  const [doLogin, { loading, error }] = useMutation<LoginData>(LOGIN);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await doLogin({
      variables: { input: { phone, password } },
    }).catch(() => null);
    const data = res?.data?.login;
    if (!data) return;

    session.save(data);
    if (data.platformRole === 'CEO') {
      router.replace('/ceo');
    } else if (data.pending) {
      router.replace('/kutish');
    } else if (data.business?.blocked) {
      router.replace('/obuna');
    } else if (data.workspaces.length > 1) {
      setPickList(data.workspaces);
    } else {
      router.replace('/dashboard');
    }
  }

  function pick(ws: WorkspaceBrief) {
    session.setCurrentWorkspace(ws.id);
    router.replace('/dashboard');
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <section className="flex items-center justify-center p-6 sm:p-10 bg-neutral-50">
        <div className="w-full max-w-[400px]">
          {/* Mobil logo */}
          <Link
            href="/"
            className="lg:hidden mb-10 flex items-center gap-2.5 text-xl font-bold w-fit"
          >
            <img
              src="/rs-logo.png"
              alt="RS Development"
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-amber-700/20"
            />
            RS Development
          </Link>

          {pickList ? (
            <WorkspacePicker workspaces={pickList} onPick={pick} />
          ) : (
            <div className="animate-[fadeIn_.4s_ease]">
              <h1 className="text-2xl font-bold tracking-tight">
                Xush kelibsiz 👋
              </h1>
              <p className="text-sm text-neutral-500 mt-1.5">
                Hisobingizga kiring va ishni davom ettiring.
              </p>

              <form onSubmit={onSubmit} className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="field-label">Telefon raqam</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    className="field-input"
                    placeholder="+998 90 123 45 67"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="field-label flex items-center justify-between">
                    Parol
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-xs text-neutral-400 hover:text-brand transition-colors"
                    >
                      {showPass ? 'Yashirish' : 'Ko‘rsatish'}
                    </button>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="field-input"
                    placeholder="••••••••"
                  />
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    {error.graphQLErrors[0]?.message ??
                      'Kirishda xato. Qayta urinib ko‘ring.'}
                  </p>
                )}

                <button
                  disabled={loading || !phone || password.length < 4}
                  className="btn-primary mt-1"
                >
                  {loading ? 'Kirilmoqda…' : 'Kirish'}
                </button>
              </form>

              <p className="mt-8 text-sm text-neutral-500 text-center">
                Hisobingiz yo&apos;qmi?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-brand hover:underline"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
