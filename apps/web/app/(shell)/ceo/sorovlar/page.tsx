'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  DECIDE_OWNER_REQUEST,
  PENDING_OWNER_REQUESTS,
} from '../../../../lib/queries';
import { RequestRow, uzDate } from '../../../../lib/ceo';

export default function SorovlarPage() {
  const { data, loading, refetch } = useQuery<{
    pendingOwnerRequests: RequestRow[];
  }>(PENDING_OWNER_REQUESTS);
  const [decide, { loading: deciding }] = useMutation(DECIDE_OWNER_REQUEST);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onDecide(r: RequestRow, approve: boolean) {
    setMsg(null);
    try {
      await decide({ variables: { input: { requestId: r.id, approve } } });
      setMsg({
        ok: approve,
        text: approve
          ? `"${r.businessName}" tasdiqlandi — makon(lar) ochildi.`
          : `"${r.businessName}" rad etildi.`,
      });
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    }
  }

  const rows = data?.pendingOwnerRequests ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">🔔 So&apos;rovlar</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Yangi biznes ochish so&apos;rovlari — siz tasdiqlaysiz.
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
          Kutilayotgan so&apos;rovlar ({rows.length})
        </h2>
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Yuklanmoqda…
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Hozircha yangi so&apos;rov yo&apos;q 🎉
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <li
                key={r.id}
                className="px-5 py-4 flex items-center gap-3 flex-wrap"
              >
                <span className="w-10 h-10 rounded-xl bg-brand-faint text-brand grid place-items-center font-bold">
                  {(r.businessName ?? '?').charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 min-w-44">
                  <span className="block font-semibold">{r.businessName}</span>
                  <span className="block text-xs text-neutral-500">
                    {r.userName} · {r.userPhone} · {uzDate(r.createdAt)}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={deciding}
                    onClick={() => onDecide(r, true)}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    ✓ Tasdiqlash
                  </button>
                  <button
                    disabled={deciding}
                    onClick={() => onDecide(r, false)}
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
