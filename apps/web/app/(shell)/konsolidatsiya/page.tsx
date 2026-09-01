'use client';

import { useQuery } from '@apollo/client';
import { mln } from '../../../lib/format';
import { useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';
import { CONSOLIDATED_REPORT } from '../../../lib/queries';

/**
 * Konsolidatsiya (UI hujjati §9.1) — FAQAT EGA (OWNER):
 * ikkala biznesning birlashtirilgan ko'rinishi. Umumiy xarajatlar
 * ikki biznesga teng taqsimlangan holda hisoblanadi.
 */

interface WsPnl {
  workspaceId: string;
  name: string;
  type: string;
  salesUzs: number;
  transferInUzs: number;
  soldCostUzs: number;
  expensesUzs: number;
  netProfitUzs: number;
}
interface Report {
  workspaces: WsPnl[];
  totalSalesUzs: number;
  totalExpensesUzs: number;
  totalNetProfitUzs: number;
}

export default function KonsolidatsiyaPage() {
  const { t, ts } = useI18n();
  const { data, loading, error } =
    useQuery<{ consolidatedReport: Report }>(CONSOLIDATED_REPORT);

  if (loading) return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-lg">
        {ts(error.graphQLErrors[0]?.message ?? error.message)}
      </p>
    );

  const report = data!.consolidatedReport;

  const totals: { label: MsgKey; value: number; cls: string }[] = [
    { label: 'cons.totalSales', value: report.totalSalesUzs, cls: '' },
    {
      label: 'cons.totalExpenses',
      value: report.totalExpensesUzs,
      cls: 'text-red-600',
    },
    {
      label: 'cons.totalNet',
      value: report.totalNetProfitUzs,
      cls: report.totalNetProfitUzs >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">{t('cons.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('cons.sub')}</p>
      </div>

      {/* ─── Jami kartalar ─── */}
      <div className="grid grid-cols-3 gap-3">
        {totals.map((row) => (
          <div key={row.label} className="card rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {t(row.label)}
            </div>
            <div
              className={`text-xl md:text-2xl font-bold mt-1 tabular-nums ${row.cls}`}
            >
              {mln(row.value)}
            </div>
            <div className="text-xs text-neutral-400">{t('common.som')}</div>
          </div>
        ))}
      </div>

      {/* ─── Har biznes bo'yicha ─── */}
      <div className="grid md:grid-cols-2 gap-5">
        {report.workspaces.map((ws) => {
          const isWood = ws.type === 'WOOD_TRADING';
          return (
            <section
              key={ws.workspaceId}
              data-ws={ws.type}
              className="card overflow-hidden"
            >
              <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
                {ws.name}
                <span className="ml-auto text-[11px] font-normal text-neutral-400">
                  {isWood ? t('cons.woodTag') : t('cons.lumberTag')}
                </span>
              </h2>
              <dl className="px-5 py-4 grid gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    {t('cons.salesRevenue')}
                  </dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    +{mln(ws.salesUzs)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">{t('cons.transferIn')}</dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    +{mln(ws.transferInUzs)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">{t('cons.soldCost')}</dt>
                  <dd className="font-semibold tabular-nums text-red-600">
                    −{mln(ws.soldCostUzs)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                  <dt className="text-neutral-500">{t('cons.expenses')}</dt>
                  <dd className="font-semibold tabular-nums text-red-600">
                    −{mln(ws.expensesUzs)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="font-semibold">{t('cons.net')}</dt>
                  <dd
                    className={`font-bold tabular-nums ${
                      ws.netProfitUzs >= 0
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {ws.netProfitUzs >= 0 ? '+' : '−'}
                    {mln(Math.abs(ws.netProfitUzs))}
                  </dd>
                </div>
              </dl>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed max-w-2xl">
        {t('cons.footnote')}
      </p>
    </div>
  );
}
