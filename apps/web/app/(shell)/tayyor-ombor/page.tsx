'use client';

import { useQuery } from '@apollo/client';
import { dateFmt, fmt } from '../../../lib/format';
import { useI18n } from '../../../lib/i18n';
import { FINISHED_GOODS } from '../../../lib/queries';

/**
 * Tayyor mahsulot ombori (UI hujjati §8.3): xomashyo omboridan alohida —
 * dona hisobida, har partiyadan tushgan mahsulot va uning dona tannarxi.
 */

interface FinishedRow {
  id: string;
  productName: string;
  quantityRemaining: number;
  unitCostUzsPerPiece: number;
  createdAt: string;
}

export default function TayyorOmborPage() {
  const { t, ts } = useI18n();
  const { data, loading, error } =
    useQuery<{ finishedGoods: FinishedRow[] }>(FINISHED_GOODS);

  if (loading) return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-red-600 text-sm">
        {t('common.errorPrefix', { msg: ts(error.message) })}
      </p>
    );

  const goods = data?.finishedGoods ?? [];
  const totalPieces = goods.reduce((a, g) => a + g.quantityRemaining, 0);
  const totalValue = goods.reduce(
    (a, g) => a + g.quantityRemaining * g.unitCostUzsPerPiece,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">{t('fg.title')}</h1>

      {/* Chiplar */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="card rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            {t('fg.totalPieces')}
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
            {fmt(totalPieces)}
          </div>
          <div className="text-xs text-neutral-400">{t('common.pcs')}</div>
        </div>
        <div className="card rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            {t('fg.totalValue')}
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
            {fmt(totalValue)}
          </div>
          <div className="text-xs text-neutral-400">{t('fg.atCost')}</div>
        </div>
      </div>

      {/* Jadval */}
      <section className="card overflow-hidden">
        {goods.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            {t('fg.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">
                    {t('fg.col.product')}
                  </th>
                  <th className="px-5 py-3 font-semibold">{t('fg.col.date')}</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('fg.col.remaining')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('fg.col.unitCost')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('fg.col.totalValue')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {goods.map((g) => (
                  <tr key={g.id}>
                    <td className="px-5 py-3.5 font-medium">{g.productName}</td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {dateFmt(g.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                      {fmt(g.quantityRemaining)} {t('common.pcs')}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                      {fmt(g.unitCostUzsPerPiece)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                      {fmt(g.quantityRemaining * g.unitCostUzsPerPiece)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
