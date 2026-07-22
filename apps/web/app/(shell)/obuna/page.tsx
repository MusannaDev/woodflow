'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { MY_BILLING, SUBMIT_PAYMENT } from '../../../lib/queries';
import { formatMoneyInput, parseMoney } from '../../../lib/format';

/**
 * Obuna / Platforma to'lovi (owner):
 *  - joriy holat (muddat / bloklangan / tekin ruxsat)
 *  - to'lov yuborish (CEO tasdiqlaydi → muddat uzayadi)
 *  - to'lovlar tarixi
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

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);
const uzDate = (s: string) => new Date(s).toLocaleDateString('uz-UZ');

const PSTATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: '⏳ Kutilmoqda', cls: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '✓ Tasdiqlandi', cls: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: '✕ Rad etildi', cls: 'bg-red-100 text-red-600' },
};

export default function ObunaPage() {
  const { data, loading, error, refetch } = useQuery<{ myBilling: Billing }>(
    MY_BILLING,
    { fetchPolicy: 'cache-and-network' },
  );
  const [submit, { loading: sending }] = useMutation(SUBMIT_PAYMENT);

  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('1');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const amountUzs = parseMoney(amount);
    const m = parseInt(months, 10);
    if (amountUzs <= 0) return setMsg({ ok: false, text: 'Summani kiriting.' });
    if (!(m >= 1)) return setMsg({ ok: false, text: 'Oy sonini kiriting.' });
    try {
      await submit({
        variables: {
          input: { amountUzs, months: m, note: note.trim() || null },
        },
      });
      setMsg({
        ok: true,
        text: 'To‘lov yuborildi — CEO tasdiqlagach obuna uzayadi.',
      });
      setAmount('');
      setNote('');
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    }
  }

  if (loading && !data)
    return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return <p className="text-red-600 text-sm">Xato: {error.message}</p>;

  const b = data!.myBilling;
  const payments = b.payments;

  return (
    <div className="grid grid-cols-1 gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Obuna</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Platformadan foydalanish uchun to&apos;lov qiling — CEO tasdiqlaydi.
        </p>
      </div>

      {/* Holat kartasi */}
      {b.freeAccess ? (
        <div className="card p-5 border-emerald-200 bg-emerald-50/50">
          <div className="text-sm font-semibold text-emerald-700">
            ✓ Tekin ruxsat faol
          </div>
          <p className="text-xs text-emerald-600/80 mt-1">
            CEO sizga to&apos;lovsiz foydalanish ruxsatini bergan.
          </p>
        </div>
      ) : b.blocked ? (
        <div className="card p-5 border-red-200 bg-red-50/50">
          <div className="text-sm font-semibold text-red-700">
            ⚠ Obuna tugagan — platforma bloklangan
          </div>
          <p className="text-xs text-red-600/80 mt-1">
            Davom etish uchun quyida to&apos;lov qiling. CEO tasdiqlagach barcha
            bo&apos;limlar ochiladi.
          </p>
        </div>
      ) : b.paidUntil ? (
        <div className="card p-5 border-emerald-200 bg-emerald-50/50">
          <div className="text-sm font-semibold text-emerald-700">
            ✓ Obuna faol
          </div>
          <p className="text-xs text-emerald-600/80 mt-1">
            {uzDate(b.paidUntil)} gacha ochiq.
          </p>
        </div>
      ) : (
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <div className="text-sm font-semibold text-amber-700">
            Hali to&apos;lov qilinmagan
          </div>
          <p className="text-xs text-amber-600/80 mt-1">
            Quyida birinchi to&apos;lovni yuboring.
          </p>
        </div>
      )}

      {msg && (
        <p
          className={`text-sm rounded-lg px-3.5 py-2.5 border ${
            msg.ok
              ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
              : 'text-red-600 bg-red-50 border-red-100'
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* To'lov formasi */}
      <form onSubmit={onSubmit} className="card p-5 grid gap-4">
        <h2 className="font-semibold text-sm">To&apos;lov yuborish</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <span className="field-label text-xs">Summa (so&apos;m)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(formatMoneyInput(e.target.value))}
              inputMode="numeric"
              placeholder="200 000"
              className="field-input !py-2"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label text-xs">Necha oyga</span>
            <input
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="1"
              className="field-input !py-2"
            />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="field-label text-xs">
            Izoh / chek raqami (ixtiyoriy)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: Payme orqali, chek #12345"
            className="field-input !py-2"
          />
        </label>
        <button
          disabled={sending}
          className="btn-primary disabled:opacity-40"
        >
          {sending ? 'Yuborilmoqda…' : 'To‘lovni yuborish'}
        </button>
      </form>

      {/* Tarix */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          To&apos;lovlar tarixi ({payments.length})
        </h2>
        {payments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Hali to&apos;lov yo&apos;q.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {payments.map((p) => {
              const st = PSTATUS[p.status] ?? PSTATUS.PENDING;
              return (
                <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold tabular-nums">
                      {fmt(p.amountUzs)} so&apos;m
                      <span className="text-xs text-neutral-400 font-normal">
                        {' '}
                        · {p.months} oy
                      </span>
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">
                      {uzDate(p.createdAt)}
                      {p.note ? ` · ${p.note}` : ''}
                    </span>
                  </span>
                  <span
                    className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
