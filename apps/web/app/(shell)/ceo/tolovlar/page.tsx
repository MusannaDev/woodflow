'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  DECIDE_PLATFORM_PAYMENT,
  PENDING_PLATFORM_PAYMENTS,
} from '../../../../lib/queries';
import { fmtMoney, PaymentRow, uzDate } from '../../../../lib/ceo';

export default function TolovlarPage() {
  const { data, loading, refetch } = useQuery<{
    pendingPlatformPayments: PaymentRow[];
  }>(PENDING_PLATFORM_PAYMENTS);
  const [decide, { loading: deciding }] = useMutation(DECIDE_PLATFORM_PAYMENT);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onDecide(p: PaymentRow, approve: boolean) {
    setBusyId(p.id);
    setMsg(null);
    try {
      await decide({ variables: { input: { paymentId: p.id, approve } } });
      setMsg({
        ok: approve,
        text: approve
          ? `"${p.businessName}" — ${p.months} oylik to‘lov tasdiqlandi, obuna uzaytirildi.`
          : `"${p.businessName}" to‘lovi rad etildi.`,
      });
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    } finally {
      setBusyId(null);
    }
  }

  const rows = data?.pendingPlatformPayments ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">💳 To&apos;lovlar</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ownerlarning platforma to&apos;lovlari — tasdiqlasangiz obuna uzayadi.
        </p>
      </div>

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

      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          Kutilayotgan to&apos;lovlar ({rows.length})
        </h2>
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Yuklanmoqda…
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Kutilayotgan to&apos;lov yo&apos;q 🎉
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {rows.map((p) => (
              <li
                key={p.id}
                className="px-5 py-4 flex items-center gap-3 flex-wrap"
              >
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center font-bold flex-none">
                  💳
                </span>
                <span className="flex-1 min-w-44">
                  <span className="block font-semibold">
                    {fmtMoney(p.amountUzs)} so&apos;m
                    <span className="text-xs font-normal text-neutral-400">
                      {' '}
                      · {p.months} oy
                    </span>
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {p.businessName} · {p.ownerName} · {uzDate(p.createdAt)}
                    {p.note ? ` · ${p.note}` : ''}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={deciding && busyId === p.id}
                    onClick={() => onDecide(p, true)}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    ✓ Tasdiqlash
                  </button>
                  <button
                    disabled={deciding && busyId === p.id}
                    onClick={() => onDecide(p, false)}
                    className="rounded-xl border border-red-200 text-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    ✕ Rad etish
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
