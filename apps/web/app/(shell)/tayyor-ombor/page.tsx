'use client';

import { useQuery } from '@apollo/client';
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

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

export default function TayyorOmborPage() {
  const { data, loading, error } =
    useQuery<{ finishedGoods: FinishedRow[] }>(FINISHED_GOODS);

  if (loading) return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return <p className="text-red-600 text-sm">Xato: {error.message}</p>;

  const goods = data?.finishedGoods ?? [];
  const totalPieces = goods.reduce((a, g) => a + g.quantityRemaining, 0);
  const totalValue = goods.reduce(
    (a, g) => a + g.quantityRemaining * g.unitCostUzsPerPiece,
    0,
  );

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-bold">Tayyor mahsulot ombori</h1>

      {/* Chiplar */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            JAMI MAHSULOT
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
            {fmt(totalPieces)}
          </div>
          <div className="text-xs text-neutral-400">dona</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            OMBOR QIYMATI
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
            {fmt(totalValue)}
          </div>
          <div className="text-xs text-neutral-400">so&apos;m (tannarxda)</div>
        </div>
      </div>

      {/* Jadval */}
      <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {goods.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            Tayyor mahsulot yo&apos;q — «Ishlab chiqarish» bo&apos;limida
            partiya yarating.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">MAHSULOT</th>
                  <th className="px-5 py-3 font-semibold">SANA</th>
                  <th className="px-5 py-3 font-semibold text-right">QOLDIQ</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    TANNARX / DONA
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    JAMI QIYMAT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {goods.map((g) => (
                  <tr key={g.id}>
                    <td className="px-5 py-3.5 font-medium">{g.productName}</td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {new Date(g.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                      {fmt(g.quantityRemaining)} dona
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
