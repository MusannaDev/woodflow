'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GRANT_FREE_ACCESS, OWNER_DETAIL } from '../../../../../lib/queries';
import {
  billingBadge,
  fmtMoney,
  KIND_CLS,
  PSTATUS_CLS,
  STATUS_CLS,
  uzDate,
} from '../../../../../lib/ceo';
import { useEnumLabel, useI18n } from '../../../../../lib/i18n';
import { MsgKey } from '../../../../../lib/i18n/messages';

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

export default function OwnerDetailPage() {
  const { t, ts } = useI18n();
  const label = useEnumLabel();
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
    return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-red-600 text-sm">
        {t('common.errorPrefix', { msg: ts(error.message) })}
      </p>
    );

  const d = data!.ownerDetail;
  const stCls = STATUS_CLS[d.status] ?? STATUS_CLS.PENDING;
  const kindCls = KIND_CLS[d.kind] ?? KIND_CLS.BOTH;
  const billing = billingBadge(d);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Link
        href="/ceo/ownerlar"
        className="text-sm text-neutral-500 hover:text-brand transition-colors w-fit"
      >
        {t('ceo.own.back')}
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
          <span
            className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${stCls}`}
          >
            {label('bizStatus', d.status)}
          </span>
          <span
            className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${kindCls}`}
          >
            {label('kind', d.kind)}
          </span>
          {billing && (
            <span
              className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${billing.cls}`}
            >
              {t(billing.key, billing.vars)}
            </span>
          )}
        </div>
      </div>

      {/* Ma'lumot kartalari */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            ['ceo.own.d.workspaces', d.workspaces.length],
            ['ceo.own.d.employees', d.employeeCount],
            ['ceo.own.d.payments', d.payments.length],
            ['ceo.own.d.opened', uzDate(d.createdAt)],
          ] as [MsgKey, string | number][]
        ).map(([l, v]) => (
          <div key={l} className="card rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {t(l)}
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {/* Obuna */}
      <section className="card p-5 grid gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm flex-1">
            {t('ceo.own.d.subscription')}
          </h2>
          <button
            onClick={() => toggleAccess(d)}
            disabled={granting}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-40 ${
              d.freeAccess
                ? 'border-blue-300 text-blue-600 bg-blue-50'
                : 'border-neutral-200 text-neutral-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {d.freeAccess ? t('ceo.own.d.freeOn') : t('ceo.own.d.freeOff')}
          </button>
        </div>
        <p className="text-sm text-neutral-600">
          {d.freeAccess
            ? t('ceo.own.d.freeText')
            : d.blocked
              ? t('ceo.own.d.blockedText')
              : d.paidUntil
                ? t('ceo.own.d.activeText', { date: uzDate(d.paidUntil) })
                : t('ceo.own.d.noneText')}
        </p>
      </section>

      {/* Makonlar */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('ceo.own.d.workspaces')}
        </h2>
        <ul className="divide-y divide-neutral-100">
          {d.workspaces.map((w) => (
            <li key={w.id} className="px-5 py-3 flex items-center gap-3 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              {w.name}
              <span className="text-xs text-neutral-400">
                ·{' '}
                {w.type === 'LUMBER_PRODUCTION'
                  ? t('ceo.own.d.wsLumber')
                  : t('ceo.own.d.wsWood')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* To'lovlar tarixi */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('ceo.own.d.payHistory', { n: d.payments.length })}
        </h2>
        {d.payments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500 text-center">
            {t('ceo.own.d.payEmpty')}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {d.payments.map((p) => {
              const psCls = PSTATUS_CLS[p.status] ?? PSTATUS_CLS.PENDING;
              return (
                <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold tabular-nums">
                      {fmtMoney(p.amountUzs)} {t('common.som')}
                      <span className="text-xs text-neutral-400 font-normal">
                        {' '}
                        {t('ceo.months', { n: p.months })}
                      </span>
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">
                      {uzDate(p.createdAt)}
                      {p.note ? ` · ${p.note}` : ''}
                    </span>
                  </span>
                  <span
                    className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${psCls}`}
                  >
                    {label('payStatus', p.status)}
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
