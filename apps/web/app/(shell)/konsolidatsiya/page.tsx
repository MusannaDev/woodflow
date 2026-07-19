'use client';

import { useQuery } from '@apollo/client';
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

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);
const mln = (n: number) =>
  Math.abs(n) >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln` : fmt(n);

export default function KonsolidatsiyaPage() {
  const { data, loading, error } =
    useQuery<{ consolidatedReport: Report }>(CONSOLIDATED_REPORT);

  if (loading) return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-lg">
        {error.graphQLErrors[0]?.message ?? error.message}
      </p>
    );

  const report = data!.consolidatedReport;

  const totals = [
    { label: 'JAMI SAVDO', value: report.totalSalesUzs, cls: '' },
    { label: 'JAMI XARAJAT', value: report.totalExpensesUzs, cls: 'text-red-600' },
    {
      label: 'JAMI SOF FOYDA',
      value: report.totalNetProfitUzs,
      cls: report.totalNetProfitUzs >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-bold">Konsolidatsiya</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ikkala biznes birga — faqat egaga ko&apos;rinadi.
        </p>
      </div>

      {/* ─── Jami kartalar ─── */}
      <div className="grid grid-cols-3 gap-3">
        {totals.map((t) => (
          <div
            key={t.label}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {t.label}
            </div>
            <div
              className={`text-xl md:text-2xl font-bold mt-1 tabular-nums ${t.cls}`}
            >
              {mln(t.value)}
            </div>
            <div className="text-xs text-neutral-400">so&apos;m</div>
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
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
            >
              <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
                {ws.name}
                <span className="ml-auto text-[11px] font-normal text-neutral-400">
                  {isWood ? "yog'och savdosi" : 'taxta ishlab chiqarish'}
                </span>
              </h2>
              <dl className="px-5 py-4 grid gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Savdo tushumi</dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    +{mln(ws.salesUzs)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Ichki transfer daromadi</dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    +{mln(ws.transferInUzs)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Sotilgan tannarx</dt>
                  <dd className="font-semibold tabular-nums text-red-600">
                    −{mln(ws.soldCostUzs)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                  <dt className="text-neutral-500">
                    Xarajatlar (umumiy ulush bilan)
                  </dt>
                  <dd className="font-semibold tabular-nums text-red-600">
                    −{mln(ws.expensesUzs)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="font-semibold">Sof foyda</dt>
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
        Umumiy (ikkala biznesga tegishli) xarajatlar teng taqsimlanadi. Ichki
        transfer: 1-biznesga daromad, 2-biznesда xomashyo tannarxiga aylanadi —
        pul ikki marta sanalmaydi.
      </p>
    </div>
  );
}
