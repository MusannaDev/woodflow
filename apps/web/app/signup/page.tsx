'use client';

import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { WorkspacePicker } from '../../components/auth/WorkspacePicker';
import { REGISTER } from '../../lib/queries';
import { session, WorkspaceBrief } from '../../lib/session';

interface RegisterData {
  register: { token: string; name: string; workspaces: WorkspaceBrief[] };
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pickList, setPickList] = useState<WorkspaceBrief[] | null>(null);
  const [doRegister, { loading, error }] = useMutation<RegisterData>(REGISTER);

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit =
    name.trim().length >= 2 &&
    phone.length >= 9 &&
    password.length >= 6 &&
    confirm === password &&
    !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await doRegister({
      variables: { input: { name: name.trim(), phone, password } },
    }).catch(() => null);
    const data = res?.data?.register;
    if (!data) return;

    session.save(data.token, data.name, data.workspaces);
    setPickList(data.workspaces); // yangi hisobda doim 2 workspace
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
          <Link
            href="/"
            className="lg:hidden mb-10 flex items-center gap-2 text-xl font-bold w-fit"
          >
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 inline-block" />
            WoodFlow
          </Link>

          {pickList ? (
            <div>
              <p className="mb-6 text-sm bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-3.5 py-2.5">
                🎉 Hisobingiz yaratildi! Ikkala biznes makoni tayyor.
              </p>
              <WorkspacePicker workspaces={pickList} onPick={pick} />
            </div>
          ) : (
            <div className="animate-[fadeIn_.4s_ease]">
              <h1 className="text-2xl font-bold tracking-tight">
                Hisob yaratish
              </h1>
              <p className="text-sm text-neutral-500 mt-1.5">
                Bir daqiqada — ikkala biznes makoningiz avtomatik tayyorlanadi.
              </p>

              <form onSubmit={onSubmit} className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="field-label">Ism familiya</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="field-input"
                    placeholder="Otabek Juraev"
                  />
                </label>

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
                    autoComplete="new-password"
                    className="field-input"
                    placeholder="Kamida 6 belgi"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="field-label">Parolni tasdiqlang</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className={`field-input ${
                      mismatch ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : ''
                    }`}
                    placeholder="Qayta kiriting"
                  />
                  {mismatch && (
                    <span className="text-xs text-red-500">
                      Parollar mos kelmadi.
                    </span>
                  )}
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    {error.graphQLErrors[0]?.message ??
                      'Ro‘yxatdan o‘tishda xato. Qayta urinib ko‘ring.'}
                  </p>
                )}

                <button disabled={!canSubmit} className="btn-primary mt-1">
                  {loading ? 'Yaratilmoqda…' : 'Hisob yaratish'}
                </button>
              </form>

              <p className="mt-8 text-sm text-neutral-500 text-center">
                Hisobingiz bormi?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-brand hover:underline"
                >
                  Kirish
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
