'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { MY_AUTH, MY_BILLING, SUBMIT_PAYMENT } from '../../../lib/queries';
import { PAYMENT_INFO, Plan, PLANS } from '../../../lib/payment';
import { dateFmt, fmt } from '../../../lib/format';
import { useEnumLabel, useI18n } from '../../../lib/i18n';
import { AuthData, session } from '../../../lib/session';

/**
 * Obuna — tarif rejalari + karta raqamiga to'lov modali.
 * Owner reja tanlaydi → kartaga o'tkazadi → "to'ladim" tasdiqlaydi →
 * to'lov PENDING bo'lib CEO ga boradi → CEO tasdiqlaganda obuna uzayadi.
 */

interface Payment {
  id: string;
  amountUzs: number;
  months: number;
  note: string | null;
  status: string;
  createdAt: string;
}
interface Billing {
  status: string;
  blocked: boolean;
  freeAccess: boolean;
  paidUntil: string | null;
  payments: Payment[];
}

const PSTATUS_CLS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function ObunaPage() {
  const { t, ts } = useI18n();
  const { data, loading, error, refetch } = useQuery<{ myBilling: Billing }>(
    MY_BILLING,
    { fetchPolicy: 'cache-and-network' },
  );
  const [selected, setSelected] = useState<Plan | null>(null);

  // Sessiyani serverdan yangilaymiz: CEO tasdiqlagach (blocked o'zgarsa)
  // qayta login qilmasdan avtomatik ochiladi.
  const { data: authData } = useQuery<{ myAuth: AuthData }>(MY_AUTH, {
    fetchPolicy: 'network-only',
  });
  useEffect(() => {
    const fresh = authData?.myAuth;
    if (!fresh) return;
    const wasBlocked = session.business()?.blocked ?? false;
    session.save(fresh);
    if (wasBlocked !== (fresh.business?.blocked ?? false)) {
      window.location.reload(); // shell menyusi/gating yangilanishi uchun
    }
  }, [authData]);

  if (loading && !data)
    return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-red-600 text-sm">
        {t('common.errorPrefix', { msg: ts(error.message) })}
      </p>
    );

  const b = data!.myBilling;

  return (
    <div className="grid grid-cols-1 gap-8 max-w-4xl">
      {/* Sarlavha */}
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
          {t('sub.title')}
        </h1>
        <p className="text-sm text-neutral-500 mt-2 max-w-lg mx-auto">
          {t('sub.sub')}
        </p>
      </div>

      {/* Holat */}
      <StatusBanner b={b} />

      {/* Tariflar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((p) => (
          <PlanCard key={p.months} plan={p} onPick={() => setSelected(p)} />
        ))}
      </div>

      {/* Tarix */}
      <History payments={b.payments} />

      {/* To'lov modali */}
      {selected && (
        <PayModal
          plan={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/* ───────────────── Holat banneri ───────────────── */

function StatusBanner({ b }: { b: Billing }) {
  const { t } = useI18n();

  if (b.freeAccess)
    return (
      <Banner
        cls="border-blue-200 bg-blue-50/60 text-blue-700"
        title={t('sub.free.title')}
        text={t('sub.free.text')}
      />
    );
  if (b.blocked)
    return (
      <Banner
        cls="border-red-200 bg-red-50/60 text-red-700"
        title={t('sub.blocked.title')}
        text={t('sub.blocked.text')}
      />
    );
  if (b.paidUntil)
    return (
      <Banner
        cls="border-emerald-200 bg-emerald-50/60 text-emerald-700"
        title={t('sub.active.title')}
        text={t('sub.active.text', { date: dateFmt(b.paidUntil) })}
      />
    );
  return (
    <Banner
      cls="border-amber-200 bg-amber-50/60 text-amber-700"
      title={t('sub.none.title')}
      text={t('sub.none.text')}
    />
  );
}

function Banner({
  cls,
  title,
  text,
}: {
  cls: string;
  title: string;
  text: string;
}) {
  return (
    <div className={`card p-4 border ${cls}`}>
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-xs opacity-80 mt-0.5">{text}</p>
    </div>
  );
}

/* ───────────────── Tarif kartasi ───────────────── */

function PlanCard({ plan, onPick }: { plan: Plan; onPick: () => void }) {
  const { t } = useI18n();

  return (
    <div
      className={`relative rounded-3xl p-5 flex flex-col bg-white transition-all hover:-translate-y-1 ${
        plan.popular
          ? 'ring-2 ring-brand shadow-xl shadow-brand/15'
          : 'border border-neutral-200/80 shadow-sm hover:shadow-lg'
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold text-white bg-brand rounded-full px-3 py-1 shadow-lg shadow-brand/30">
          {t('plan.popular')}
        </span>
      )}

      <div className="text-sm font-semibold text-neutral-500 tracking-wide uppercase">
        {t(plan.titleKey)}
      </div>

      <div className="mt-3">
        <span className="text-xs text-neutral-400 line-through block h-4">
          {plan.oldPriceUzs ? `${fmt(plan.oldPriceUzs)} ${t('common.som')}` : ''}
        </span>
        <div className="flex items-end gap-1.5 mt-0.5">
          <span className="font-serif text-3xl font-bold text-neutral-900 tabular-nums">
            {fmt(plan.priceUzs)}
          </span>
          <span className="text-neutral-500 mb-1 text-sm">
            {t('common.som')}
          </span>
        </div>
      </div>

      {plan.discount ? (
        <span className="mt-3 inline-flex w-fit items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-2.5 py-1">
          {t('plan.save', { discount: plan.discount })}
        </span>
      ) : (
        <span className="mt-3 inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 rounded-full px-2.5 py-1">
          {t('plan.starter')}
        </span>
      )}

      <div className="text-xs text-neutral-500 mt-3 leading-relaxed flex-1">
        {t('plan.desc', { months: plan.months })}
      </div>

      <button
        onClick={onPick}
        className={`mt-4 rounded-xl py-2.5 text-sm font-semibold transition-all ${
          plan.popular
            ? 'bg-brand text-white hover:opacity-90 shadow-lg shadow-brand/25'
            : 'border-2 border-neutral-200 text-neutral-700 hover:border-brand hover:text-brand'
        }`}
      >
        {t('plan.pick')}
      </button>
    </div>
  );
}

/* ───────────────── To'lov modali ───────────────── */

function PayModal({
  plan,
  onClose,
  onDone,
}: {
  plan: Plan;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t, ts } = useI18n();
  const [submit, { loading }] = useMutation(SUBMIT_PAYMENT);
  const [agree, setAgree] = useState(false);
  const [paid, setPaid] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function copyCard() {
    navigator.clipboard
      ?.writeText(PAYMENT_INFO.cardNumber.replace(/\s/g, ''))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => null);
  }

  async function send() {
    setErr(null);
    try {
      await submit({
        variables: {
          input: {
            amountUzs: plan.priceUzs,
            months: plan.months,
            note:
              note.trim() ||
              t('pm.defaultNote', { title: t(plan.titleKey) }),
          },
        },
      });
      onDone();
    } catch (e) {
      setErr(ts(e instanceof Error ? e.message : null));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-[slideUp_.25s_ease] max-h-[92vh] overflow-y-auto">
        {/* Sarlavha */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold flex-1">{t('pm.title')}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-neutral-100 text-neutral-400"
          >
            ✕
          </button>
        </div>

        {/* Karta rekvizitlari */}
        <div className="px-5 py-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#1c130a] to-[#3a2a17] text-white p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-400/10" />
            <div className="text-[11px] uppercase tracking-widest text-amber-300/80">
              {PAYMENT_INFO.bank}
            </div>
            <button
              onClick={copyCard}
              className="mt-2 flex items-center gap-2 font-mono text-lg sm:text-xl tracking-wider hover:text-amber-200 transition-colors"
              title={t('pm.copy')}
            >
              {PAYMENT_INFO.cardNumber}
              <span className="text-xs text-amber-300">
                {copied ? t('pm.copied') : '📋'}
              </span>
            </button>
            <div className="mt-3 text-xs text-white/60 uppercase">
              {t('pm.recipient')}
            </div>
            <div className="text-sm font-semibold">{PAYMENT_INFO.holder}</div>
          </div>

          {/* Summa */}
          <div className="mt-4 rounded-2xl bg-brand-faint border border-brand/15 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-600">
              {t('pm.forMonths', { months: plan.months })}
            </span>
            <span className="font-serif text-2xl font-bold text-brand tabular-nums">
              {fmt(plan.priceUzs)} {t('common.som')}
            </span>
          </div>

          {/* Roziliklar */}
          <label className="flex items-start gap-2.5 mt-4 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[rgb(var(--brand))]"
            />
            <span className="text-neutral-600">
              {t('pm.agreePre')}{' '}
              <span className="font-semibold text-brand">
                {t('pm.agreeTerms')}
              </span>{' '}
              {t('pm.agreeMid')}{' '}
              <span className="font-semibold text-brand">
                {t('pm.agreePrivacy')}
              </span>
              {t('pm.agreePost')}
            </span>
          </label>
          <label className="flex items-start gap-2.5 mt-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[rgb(var(--brand))]"
            />
            <span className="text-neutral-600">
              {t('pm.paidPre')}{' '}
              <span className="font-semibold">
                {fmt(plan.priceUzs)} {t('common.som')}
              </span>{' '}
              {t('pm.paidPost')}
            </span>
          </label>

          {/* Chek/izoh */}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('pm.notePh')}
            className="field-input !py-2 mt-4"
          />

          {err && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
              {err}
            </p>
          )}

          <button
            onClick={send}
            disabled={!agree || !paid || loading}
            className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t('pm.sending') : t('pm.submit')}
          </button>
          <p className="text-[11px] text-neutral-400 text-center mt-2">
            {t('pm.footnote')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Tarix ───────────────── */

function History({ payments }: { payments: Payment[] }) {
  const { t } = useI18n();
  const label = useEnumLabel();

  return (
    <section className="card overflow-hidden">
      <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
        {t('sub.history', { n: payments.length })}
      </h2>
      {payments.length === 0 ? (
        <p className="px-5 py-8 text-sm text-neutral-500 text-center">
          {t('sub.historyEmpty')}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {payments.map((p) => {
            const cls = PSTATUS_CLS[p.status] ?? PSTATUS_CLS.PENDING;
            return (
              <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold tabular-nums">
                    {fmt(p.amountUzs)} {t('common.som')}
                    <span className="text-xs text-neutral-400 font-normal">
                      {' '}
                      {t('sub.months', { n: p.months })}
                    </span>
                  </span>
                  <span className="block text-xs text-neutral-500 truncate">
                    {dateFmt(p.createdAt)}
                    {p.note ? ` · ${p.note}` : ''}
                  </span>
                </span>
                <span
                  className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${cls}`}
                >
                  {label('payStatus', p.status)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
