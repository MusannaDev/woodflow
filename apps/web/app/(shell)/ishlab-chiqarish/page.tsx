'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { CREATE_BATCH, PRODUCTION_PAGE } from '../../../lib/queries';
import {
  dateFmt,
  formatMoneyInput,
  parseDecimal,
  parseQty,
} from '../../../lib/format';
import { useI18n } from '../../../lib/i18n';

/**
 * Ishlab chiqarish (UI hujjati §8.1): partiya — kirish (xomashyo m³),
 * chiqish (tayyor mahsulot dona) va YIELD (chiqim %). Jonli hisob:
 * dona soni kiritilganda chiqish hajmi va yield darrov ko'rinadi.
 */

interface BatchRow {
  id: string;
  date: string;
  inputVolumeM3: number;
  outputQuantity: number;
  outputVolumeM3: number;
  yieldPercent: number;
  outputProductId: string | null;
}
interface TemplateRow {
  id: string;
  name: string;
  volumePerPiece: number;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string;
  volumeM3Remaining: number;
}
interface PageData {
  productionBatches: BatchRow[];
  productTemplates: TemplateRow[];
  inventory: LotRow[];
}

export default function IshlabChiqarishPage() {
  const { t, ts, locale } = useI18n();
  const fmt = (n: number, d = 1) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(n);

  const { data, loading, error, refetch } =
    useQuery<PageData>(PRODUCTION_PAGE);
  const [createBatch, { loading: saving }] = useMutation(CREATE_BATCH);

  const [lotId, setLotId] = useState('');
  const [inputVol, setInputVol] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const lots = useMemo(
    () => (data?.inventory ?? []).filter((l) => l.volumeM3Remaining > 0),
    [data],
  );
  const templates = data?.productTemplates ?? [];
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const product = templates.find((t) => t.id === productId) ?? null;

  const templateName = useMemo(() => {
    const map = new Map(templates.map((t) => [t.id, t.name]));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : '—');
  }, [templates]);

  // ─── JONLI HISOB ───
  const inVol = parseDecimal(inputVol);
  const qty = parseQty(quantity);
  const outVol = product ? product.volumePerPiece * qty : 0;
  const yieldPct = inVol > 0 && outVol > 0 ? (outVol / inVol) * 100 : 0;
  const exceedsLot = lot !== null && inVol > lot.volumeM3Remaining;
  const exceedsInput = outVol > inVol && inVol > 0;

  const canSubmit =
    !!lotId &&
    !!productId &&
    inVol > 0 &&
    qty > 0 &&
    !exceedsLot &&
    !exceedsInput &&
    !saving;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await createBatch({
        variables: {
          input: {
            inputLotId: lotId,
            inputVolumeM3: inVol,
            outputProductId: productId,
            outputQuantity: qty,
          },
        },
      });
      setMsg({
        ok: true,
        text: t('prod.saved', {
          yield: res.data.createProductionBatch.yieldPercent,
        }),
      });
      setInputVol('');
      setQuantity('');
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: ts(err instanceof Error ? err.message : null),
      });
    }
  }

  if (loading) return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-red-600 text-sm">
        {t('common.errorPrefix', { msg: ts(error.message) })}
      </p>
    );

  const batches = data?.productionBatches ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">{t('prod.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ─── Yangi partiya ─── */}
        <form
          onSubmit={onSubmit}
          className="card p-5 md:p-6 grid gap-5"
        >
          <h2 className="font-semibold text-sm">{t('prod.new')}</h2>

          <label className="grid gap-1.5">
            <span className="field-label">{t('prod.rawLot')}</span>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="field-input"
            >
              <option value="">{t('prod.pickLot')}</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {t('prod.lotOption', {
                    wood: l.woodType,
                    grade: l.grade,
                    vol: fmt(l.volumeM3Remaining),
                  })}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="field-label">{t('prod.inputVol')}</span>
              <input
                value={inputVol}
                onChange={(e) => setInputVol(e.target.value)}
                inputMode="decimal"
                placeholder="10"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">{t('prod.product')}</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="field-input"
              >
                <option value="">{t('prod.pickProduct')}</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {t('prod.productOption', {
                      name: tpl.name,
                      vol: tpl.volumePerPiece.toFixed(4),
                    })}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 sm:max-w-56">
            <span className="field-label">{t('prod.outQty')}</span>
            <input
              value={quantity}
              onChange={(e) => setQuantity(formatMoneyInput(e.target.value))}
              inputMode="numeric"
              placeholder="450"
              className="field-input"
            />
          </label>

          {exceedsLot && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {t('prod.exceedsLot', {
                vol: lot ? fmt(lot.volumeM3Remaining) : 0,
              })}
            </p>
          )}
          {exceedsInput && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {t('prod.exceedsInput', { vol: outVol.toFixed(2) })}
            </p>
          )}
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

          <button disabled={!canSubmit} className="btn-primary sm:max-w-xs">
            {saving ? t('common.saving') : t('prod.submit')}
          </button>
        </form>

        {/* ─── Jonli yield paneli ─── */}
        <aside className="bg-brand-faint border border-brand/20 rounded-2xl p-5 grid gap-3 lg:sticky lg:top-20">
          <h2 className="text-sm font-bold text-brand tracking-wide">
            {t('prod.yieldPanel')}
          </h2>
          <dl className="grid gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">{t('prod.inputRow')}</dt>
              <dd className="font-semibold tabular-nums">
                {inVol > 0 ? fmt(inVol, 2) : '—'} m³
              </dd>
            </div>
            <div className="flex justify-between border-b border-brand/10 pb-2.5">
              <dt className="text-neutral-500">
                {qty > 0
                  ? t('prod.outputPieces', { n: fmt(qty, 0) })
                  : t('prod.outputRow')}
              </dt>
              <dd className="font-semibold tabular-nums">
                {outVol > 0 ? outVol.toFixed(2) : '—'} m³
              </dd>
            </div>
          </dl>
          <div className="bg-white rounded-xl p-4 border border-brand/15 text-center">
            <div className="text-[11px] tracking-wider text-neutral-400 font-semibold">
              {t('prod.yieldLabel')}
            </div>
            <div
              className={`text-3xl font-bold tabular-nums mt-1 ${
                yieldPct === 0
                  ? 'text-neutral-300'
                  : yieldPct >= 75
                    ? 'text-emerald-600'
                    : 'text-amber-600'
              }`}
            >
              {yieldPct > 0 ? yieldPct.toFixed(0) : '—'}%
            </div>
            {yieldPct > 0 && (
              <div className="text-xs text-neutral-400 mt-1">
                {t('prod.waste', { vol: (inVol - outVol).toFixed(2) })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Partiyalar tarixi ─── */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('prod.history')}
        </h2>
        {batches.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">{t('prod.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">
                    {t('prod.col.date')}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t('prod.col.product')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('prod.col.raw')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('prod.col.output')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('prod.col.yield')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {dateFmt(b.date)}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {templateName(b.outputProductId)} × {b.outputQuantity}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fmt(b.inputVolumeM3)} m³
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fmt(b.outputVolumeM3)} m³
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-[11px] font-bold rounded-full px-2.5 py-1 tabular-nums ${
                          b.yieldPercent >= 75
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {b.yieldPercent.toFixed(0)}%
                      </span>
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
