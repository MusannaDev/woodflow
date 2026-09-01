'use client';

import { useQuery } from '@apollo/client';
import { dateFmt, fmt1, mln } from '../../../lib/format';
import { useEnumLabel, useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';
import { DASHBOARD } from '../../../lib/queries';

interface SaleRow {
  id: string;
  totalPriceUzs: number;
  paidUzs: number;
  debtUzs: number;
  date: string;
  saleType: string;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string;
  volumeM3Remaining: number;
  quantityRemaining: number | null;
  unitCostUzsPerM3: number;
}
interface CustomerRow {
  id: string;
  name: string;
  debtUzs: number;
}
interface DashboardData {
  sales: SaleRow[];
  inventory: LotRow[];
  customers: CustomerRow[];
}

export default function DashboardPage() {
  const { t, ts } = useI18n();
  const label = useEnumLabel();
  const { data, loading, error } = useQuery<DashboardData>(DASHBOARD);

  if (loading) {
    return <p className="text-neutral-500">{t('common.loading')}</p>;
  }
  if (error) {
    return (
      <p className="text-red-600 text-sm">
        {t('dash.error', { msg: ts(error.message) })}
      </p>
    );
  }
  const sales = data?.sales ?? [];
  const inventory = data?.inventory ?? [];
  const customers = data?.customers ?? [];

  const today = new Date().toDateString();
  const todaySales = sales
    .filter((s) => new Date(s.date).toDateString() === today)
    .reduce((a, s) => a + s.totalPriceUzs, 0);
  const totalSales = sales.reduce((a, s) => a + s.totalPriceUzs, 0);
  const stockM3 = inventory.reduce((a, l) => a + l.volumeM3Remaining, 0);
  const totalDebt = sales.reduce((a, s) => a + s.debtUzs, 0);
  const debtors = customers.filter((c) => c.debtUzs > 0).length;

  const kpis: { label: MsgKey; value: string; sub: string; warn?: boolean }[] = [
    { label: 'dash.kpi.today', value: mln(todaySales), sub: t('common.som') },
    { label: 'dash.kpi.total', value: mln(totalSales), sub: t('common.som') },
    { label: 'dash.kpi.stock', value: fmt1(stockM3), sub: 'm³' },
    {
      label: 'dash.kpi.debt',
      value: mln(totalDebt),
      sub: debtors > 0 ? t('dash.debtors', { n: debtors }) : t('common.som'),
      warn: totalDebt > 0,
    },
  ];

  const recent = [...sales]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* KPI kartalar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`card rounded-xl p-4 ${
              k.warn ? '!border-amber-300' : ''
            }`}
          >
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {t(k.label)}
            </div>
            <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
              {k.value}
            </div>
            <div className="text-xs text-neutral-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* So'nggi savdolar */}
        <section className="card rounded-xl">
          <h2 className="px-4 py-3 border-b border-neutral-100 font-semibold text-sm">
            {t('dash.recentSales')}
          </h2>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">
              {t('dash.noSales')}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recent.map((s) => (
                <li key={s.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium tabular-nums">
                      {mln(s.totalPriceUzs)} {t('common.som')}
                    </span>
                    <span className="block text-xs text-neutral-400">
                      {dateFmt(s.date)} · {label('saleType', s.saleType)}
                    </span>
                  </span>
                  {s.debtUzs > 0 ? (
                    <span className="text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                      {t('dash.debtBadge', { amount: mln(s.debtUzs) })}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1">
                      {t('term.paid')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Ombor lotlari */}
        <section className="card rounded-xl">
          <h2 className="px-4 py-3 border-b border-neutral-100 font-semibold text-sm">
            {t('dash.inventory')}
          </h2>
          {inventory.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">
              {t('dash.emptyStock')}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {inventory.map((l) => (
                <li key={l.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">
                      {l.woodType} · {l.grade}
                    </span>
                    <span className="block text-xs text-neutral-400">
                      {label('src', l.source)}
                    </span>
                  </span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      l.volumeM3Remaining === 0
                        ? 'text-neutral-300'
                        : l.volumeM3Remaining < 5
                          ? 'text-amber-600'
                          : ''
                    }`}
                  >
                    {fmt1(l.volumeM3Remaining)} m³
                    {l.quantityRemaining != null
                      ? ` · ${fmt1(l.quantityRemaining)} ${t('common.pcs')}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
