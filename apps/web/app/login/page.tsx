'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { LOGIN } from '../../lib/queries';
import { session, WorkspaceBrief } from '../../lib/session';

interface LoginData {
  login: {
    token: string;
    name: string;
    workspaces: WorkspaceBrief[];
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [pickList, setPickList] = useState<WorkspaceBrief[] | null>(null);
  const [doLogin, { loading, error }] = useMutation<LoginData>(LOGIN);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await doLogin({
      variables: { input: { phone, password } },
    }).catch(() => null);
    const data = res?.data?.login;
    if (!data) return;

    session.save(data.token, data.name, data.workspaces);
    if (data.workspaces.length > 1) {
      setPickList(data.workspaces); // OWNER — qaysi biznesga kirishni tanlaydi
    } else {
      router.replace('/dashboard');
    }
  }

  function pick(ws: WorkspaceBrief) {
    session.setCurrentWorkspace(ws.id);
    router.replace('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <span className="w-3.5 h-3.5 rounded-full bg-brand inline-block" />
            WoodFlow
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Yog&apos;och &amp; Taxta biznes platformasi
          </p>
        </div>

        {pickList ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h1 className="font-semibold mb-4">Qaysi biznesga kirasiz?</h1>
            <div className="grid gap-3">
              {pickList.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => pick(ws)}
                  data-ws={ws.type}
                  className="flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-3 text-left hover:border-brand hover:bg-brand-faint transition-colors"
                >
                  <span className="w-3 h-3 rounded-full bg-brand inline-block" />
                  <span>
                    <span className="block font-medium">{ws.name}</span>
                    <span className="block text-xs text-neutral-500">{ws.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm grid gap-4"
          >
            <h1 className="font-semibold">Kirish</h1>
            <label className="grid gap-1.5">
              <span className="text-sm text-neutral-600">Telefon raqam</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className="border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="+998 90 123 45 67"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm text-neutral-600">Parol</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </label>
            {error && (
              <p className="text-sm text-red-600">
                {error.graphQLErrors[0]?.message ?? 'Kirishda xato. Qayta urinib ko‘ring.'}
              </p>
            )}
            <button
              disabled={loading || !phone || !password}
              className="bg-brand text-white rounded-lg py-2.5 font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Kirilmoqda…' : 'Kirish'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
