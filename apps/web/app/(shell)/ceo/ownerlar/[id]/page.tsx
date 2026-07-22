'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GRANT_FREE_ACCESS, OWNER_DETAIL } from '../../../../../lib/queries';
import {
  billingBadge,
  fmtMoney,
  KIND,
  PSTATUS,
  STATUS,
  uzDate,
} from '../../../../../lib/ceo';

interface Ws {
  id: string;
  name: string;
  type: string;
}
interface Pay {
  id: string;
  amountUzs: number;
  months: number;
  note: string | null;
  status: string;
  createdAt: string;
}
interface Detail {
  userId: string;
  name: string;
  phone: string;
  businessId: string;
  businessName: string;
  status: string;
  kind: string;
  freeAccess: boolean;
  blocked: boolean;
  paidUntil: string | null;
  logoUrl: string | null;
  employeeCount: number;
  createdAt: string;
  workspaces: Ws[];
  payments: Pay[];
}

const wsLabel = (t: string) =>
  t === 'LUMBER_PRODUCTION' ? 'Taxta sotuvi' : 'Yog‘och sotuvi';

export default function OwnerDetailPage() {
  const params = useParams();
  const businessId = String(params.id);
  const { data, loading, error, refetch } = useQuery<{ ownerDetail: Detail }>(
    OWNER_DETAIL,
    { variables: { businessId }, fetchPolicy: 'cache-and-network' },
  );
  const [grant, { loading: granting }] = useMutation(GRANT_FREE_ACCESS);

  async function toggleAccess(d: Detail) {
    await grant({
      variables: { input: { businessId: d.businessId, freeAccess: !d.freeAccess } },
    }).catch(() => null);
    await refetch();
  }

  if (loading && !data)
    return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return <p className="text-red-600 text-sm">Xato: {error.message}</p>;

  const d = data!.ownerDetail;
  const st = STATUS[d.status] ?? STATUS.PENDING;
  const kind = KIND[d.kind] ?? KIND.BOTH;
  const billing = billingBadge(d);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Link
        href="/ceo/ownerlar"
        className="text-sm text-neutral-500 hover:text-brand transition-colors w-fit"
      >
        ← Ownerlar
      </Link>

      {/* Sarlavha */}
      <div className="card p-5 flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-2xl bg-brand-faint text-brand grid place-items-center text-2xl font-bold flex-none">
          {d.businessName.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{d.businessName}</h1>
          <p className="text-sm text-neutral-500">
            {d.name} · {d.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${st.cls}`}>
            {st.label}
          </span>
          <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${kind.cls}`}>
            {kind.label}
          </span>
          {billing && (
            <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${billing.cls}`}>
              {billing.label}
            </span>
          )}
        </div>
      </div>

      {/* Ma'lumot kartalari */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Makonlar', d.workspaces.length],
          ['Ishchilar', d.employeeCount],
          ['To‘lovlar', d.payments.length],
          ['Ochilgan', uzDate(d.createdAt)],
        ].map(([l, v]) => (
          <div key={l} className="card rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {l}
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {/* Obuna */}
      <section className="card p-5 grid gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm flex-1">Obuna</h2>
          <button
            onClick={() => toggleAccess(d)}
            disabled={granting}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-40 ${
              d.freeAccess
                ? 'border-blue-300 text-blue-600 bg-blue-50'
                : 'border-neutral-200 text-neutral-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {d.freeAccess ? '🎁 Tekin ruxsat: YOQILGAN' : '🎁 Tekin ruxsat berish'}
          </button>
        </div>
        <p className="text-sm text-neutral-600">
          {d.freeAccess
            ? 'Tekin ruxsat faol — to‘lovsiz ishlaydi.'
            : d.blocked
              ? 'Obuna tugagan — platforma bloklangan.'
              : d.paidUntil
                ? `Obuna ${uzDate(d.paidUntil)} gacha faol.`
                : 'Hali to‘lov qilinmagan.'}
        </p>
      </section>

      {/* Makonlar */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          Makonlar
        </h2>
        <ul className="divide-y divide-neutral-100">
          {d.workspaces.map((w) => (
            <li key={w.id} className="px-5 py-3 flex items-center gap-3 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              {w.name}
              <span className="text-xs text-neutral-400">· {wsLabel(w.type)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* To'lovlar tarixi */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          To&apos;lovlar tarixi ({d.payments.length})
        </h2>
        {d.payments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500 text-center">
            Hali to&apos;lov yo&apos;q.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {d.payments.map((p) => {
              const ps = PSTATUS[p.status] ?? PSTATUS.PENDING;
              return (
                <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold tabular-nums">
                      {fmtMoney(p.amountUzs)} so&apos;m
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
                    className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${ps.cls}`}
                  >
                    {ps.label}
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
