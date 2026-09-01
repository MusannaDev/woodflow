'use client';

import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { WorkspacePicker } from '../../components/auth/WorkspacePicker';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useI18n } from '../../lib/i18n';
import { MsgKey } from '../../lib/i18n/messages';
import { REGISTER } from '../../lib/queries';
import { AuthData, session, WorkspaceBrief } from '../../lib/session';

interface RegisterData {
  register: AuthData;
}

const ROLES: {
  value: 'OWNER' | 'WORKER';
  icon: string;
  title: MsgKey;
  desc: MsgKey;
}[] = [
  {
    value: 'OWNER',
    icon: '👑',
    title: 'auth.role.owner.title',
    desc: 'auth.role.owner.desc',
  },
  {
    value: 'WORKER',
    icon: '🛠',
    title: 'auth.role.worker.title',
    desc: 'auth.role.worker.desc',
  },
];

const KINDS: {
  value: 'BOTH' | 'WOOD_ONLY' | 'LUMBER_ONLY';
  icon: string;
  title: MsgKey;
  desc: MsgKey;
}[] = [
  {
    value: 'BOTH',
    icon: '🌲🪵',
    title: 'auth.kind.both.title',
    desc: 'auth.kind.both.desc',
  },
  {
    value: 'WOOD_ONLY',
    icon: '🌲',
    title: 'auth.kind.wood.title',
    desc: 'auth.kind.wood.desc',
  },
  {
    value: 'LUMBER_ONLY',
    icon: '🪵',
    title: 'auth.kind.lumber.title',
    desc: 'auth.kind.lumber.desc',
  },
];

export default function SignupPage() {
  const { t, ts } = useI18n();
  const router = useRouter();
  const [accountType, setAccountType] = useState<'OWNER' | 'WORKER'>('OWNER');
  const [businessKind, setBusinessKind] = useState<
    'BOTH' | 'WOOD_ONLY' | 'LUMBER_ONLY'
  >('BOTH');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [businessName, setBusinessName] = useState('');
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
    (accountType === 'WORKER' || businessName.trim().length >= 2) &&
    !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await doRegister({
      variables: {
        input: {
          name: name.trim(),
          phone,
          password,
          accountType,
          businessName:
            accountType === 'OWNER' ? businessName.trim() : undefined,
          businessKind: accountType === 'OWNER' ? businessKind : undefined,
        },
      },
    }).catch(() => null);
    const data = res?.data?.register;
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

      <section className="relative flex items-center justify-center p-6 sm:p-10 bg-neutral-50">
        <LanguageSwitcher variant="pill" className="absolute top-5 right-5" />

        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="lg:hidden mb-8 flex items-center gap-2.5 text-xl font-bold w-fit"
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
                {t('auth.signup.title')}
              </h1>
              <p className="text-sm text-neutral-500 mt-1.5">
                {t('auth.signup.sub')}
              </p>

              {/* Rol tanlash kartalari */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAccountType(r.value)}
                    className={`text-left rounded-2xl border-2 p-4 transition-all ${
                      accountType === r.value
                        ? 'border-brand bg-brand-faint shadow-lg shadow-brand/10'
                        : 'border-neutral-200 bg-white/70 hover:border-brand/40'
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className="block font-semibold text-sm mt-1.5">
                      {t(r.title)}
                    </span>
                    <span className="block text-[11px] text-neutral-500 leading-snug mt-1">
                      {t(r.desc)}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-5 grid gap-4">
                <label className="grid gap-1.5">
                  <span className="field-label">{t('auth.fullName')}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="field-input"
                    placeholder={t('auth.fullNamePh')}
                  />
                </label>

                {accountType === 'OWNER' && (
                  <>
                    <label className="grid gap-1.5 animate-[fadeIn_.3s_ease]">
                      <span className="field-label">
                        {t('auth.businessName')}
                      </span>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="field-input"
                        placeholder={t('auth.businessNamePh')}
                      />
                    </label>

                    <div className="grid gap-2 animate-[fadeIn_.3s_ease]">
                      <span className="field-label">
                        {t('auth.businessKind')}
                      </span>
                      {KINDS.map((k) => (
                        <button
                          key={k.value}
                          type="button"
                          onClick={() => setBusinessKind(k.value)}
                          className={`flex items-center gap-3 text-left rounded-xl border-2 px-3.5 py-2.5 transition-all ${
                            businessKind === k.value
                              ? 'border-brand bg-brand-faint'
                              : 'border-neutral-200 bg-white/70 hover:border-brand/40'
                          }`}
                        >
                          <span className="text-lg leading-none">{k.icon}</span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-sm">
                              {t(k.title)}
                            </span>
                            <span className="block text-[11px] text-neutral-500 leading-snug">
                              {t(k.desc)}
                            </span>
                          </span>
                          <span
                            className={`ml-auto w-4 h-4 rounded-full border-2 flex-none grid place-items-center ${
                              businessKind === k.value
                                ? 'border-brand'
                                : 'border-neutral-300'
                            }`}
                          >
                            {businessKind === k.value && (
                              <span className="w-2 h-2 rounded-full bg-brand" />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <label className="grid gap-1.5">
                  <span className="field-label">{t('auth.phone')}</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    className="field-input"
                    placeholder="+998 90 123 45 67"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="field-label flex items-center justify-between">
                    {t('auth.password')}
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-xs text-neutral-400 hover:text-brand transition-colors"
                    >
                      {showPass ? t('auth.hide') : t('auth.show')}
                    </button>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="field-input"
                    placeholder={t('auth.passwordPh')}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="field-label">
                    {t('auth.confirmPassword')}
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className={`field-input ${
                      mismatch
                        ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
                        : ''
                    }`}
                    placeholder={t('auth.confirmPh')}
                  />
                  {mismatch && (
                    <span className="text-xs text-red-500">
                      {t('auth.mismatch')}
                    </span>
                  )}
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                    {ts(
                      error.graphQLErrors[0]?.message,
                      'auth.signup.error',
                    )}
                  </p>
                )}

                <button disabled={!canSubmit} className="btn-primary mt-1">
                  {loading
                    ? t('auth.signup.creating')
                    : accountType === 'OWNER'
                      ? t('auth.signup.asOwner')
                      : t('auth.signup.asWorker')}
                </button>
              </form>

              <p className="mt-6 text-sm text-neutral-500 text-center">
                {t('auth.hasAccount')}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-brand hover:underline"
                >
                  {t('auth.loginLink')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
