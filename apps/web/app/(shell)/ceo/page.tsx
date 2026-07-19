'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  DECIDE_OWNER_REQUEST,
  PENDING_OWNER_REQUESTS,
} from '../../../lib/queries';

/**
 * CEO panel — faqat platforma egasi (CEO) uchun.
 * Yangi biznes ochish so'rovlari: Approve → biznes ACTIVE + 2 workspace.
 */

interface RequestRow {
  id: string;
  userName: string;
  userPhone: string;
  businessName: string | null;
  createdAt: string;
}

export default function CeoPage() {
  const { data, loading, error, refetch } = useQuery<{
    pendingOwnerRequests: RequestRow[];
  }>(PENDING_OWNER_REQUESTS);
  const [decide, { loading: deciding }] = useMutation(DECIDE_OWNER_REQUEST);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onDecide(req: RequestRow, approve: boolean) {
    setMsg(null);
    try {
      await decide({
        variables: { input: { requestId: req.id, approve } },
      });
      setMsg({
        ok: approve,
        text: approve
          ? `"${req.businessName}" tasdiqlandi — ${req.userName} uchun ikkala makon ochildi.`
          : `"${req.businessName}" rad etildi.`,
      });
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    }
  }

  if (loading) return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-lg">
        {error.graphQLErrors[0]?.message ?? error.message}
      </p>
    );

  const requests = data?.pendingOwnerRequests ?? [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amber-500">⭑</span> CEO panel
        </h1>
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
          Kutilayotgan so&apos;rovlar ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Hozircha yangi so&apos;rov yo&apos;q 🎉
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {requests.map((r) => (
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
                    {r.userName} · {r.userPhone} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
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
