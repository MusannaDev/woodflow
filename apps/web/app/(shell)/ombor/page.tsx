'use client';

import { useMutation, useQuery } from '@apollo/client';
import { Fragment, FormEvent, useState } from 'react';
import { INVENTORY_PAGE, RECORD_DEFECT } from '../../../lib/queries';
import { parseDecimal, parseQty } from '../../../lib/format';
import { useEnumLabel, useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';

/**
 * Ombor (UI hujjati §7.3): yuqorida umumiy chiplar, pastda lotlar jadvali.
 * Har lotda "Nuqson" amali — brak m³ ni ajratadi: sotiladigan qoldiqdan
 * minus bo'ladi va zarar sifatida furaga yoziladi (backend shunday qiladi).
 */

interface Summary {
  totalRemainingM3: number;
  defectM3: number;
  totalQuantity: number;
  lotCount: number;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string | null;
  status: string;
  volumeM3Remaining: number;
  quantityRemaining: number | null;
  unitCostUzsPerM3: number;
}
interface PageData {
  inventorySummary: Summary;
  inventory: LotRow[];
}

const STATUS_CLS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  LOW: 'bg-amber-100 text-amber-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  SOLD_OUT: 'bg-neutral-100 text-neutral-500',
  DEFECT: 'bg-red-100 text-red-700',
};

export default function OmborPage() {
  const { t, ts, locale } = useI18n();
  const label = useEnumLabel();
  const fmt = (n: number, d = 1) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(n);

  const { data, loading, error, refetch } = useQuery<PageData>(INVENTORY_PAGE);
  const [recordDefect, { loading: saving }] = useMutation(RECORD_DEFECT);

  const [defectLotId, setDefectLotId] = useState<string | null>(null);
  const [defectVol, setDefectVol] = useState('');
  const [defectQty, setDefectQty] = useState('');
  const [defectReason, setDefectReason] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submitDefect(e: FormEvent, lot: LotRow) {
    e.preventDefault();
    setMsg(null);
    const vol = parseDecimal(defectVol);
    if (vol <= 0 || vol > lot.volumeM3Remaining) {
      setMsg({
        ok: false,
        text: t('inv.defectRange', { max: fmt(lot.volumeM3Remaining) }),
      });
      return;
    }
    try {
      await recordDefect({
        variables: {
          input: {
            lotId: lot.id,
            volumeM3: vol,
            quantity:
              lot.quantityRemaining != null && parseQty(defectQty) > 0
                ? parseQty(defectQty)
                : null,
            reason: defectReason || null,
          },
        },
      });
      setMsg({ ok: true, text: t('inv.defectDone', { vol }) });
      setDefectLotId(null);
      setDefectVol('');
      setDefectQty('');
      setDefectReason('');
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

  const s = data!.inventorySummary;
  const lots = data!.inventory;

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">{t('inv.title')}</h1>

      {/* ─── Umumiy chiplar ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            ['inv.chip.remaining', `${fmt(s.totalRemainingM3)} m³`, ''],
            [
              'inv.chip.pieces',
              s.totalQuantity > 0 ? fmt(s.totalQuantity, 0) : '—',
              '',
            ],
            [
              'inv.chip.defect',
              `${fmt(s.defectM3)} m³`,
              s.defectM3 > 0 ? 'text-red-600' : '',
            ],
            ['inv.chip.lots', String(s.lotCount), ''],
          ] as [MsgKey, string, string][]
        ).map(([l, v, cls]) => (
          <div key={l} className="card rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {t(l)}
            </div>
            <div className={`text-xl md:text-2xl font-bold mt-1 tabular-nums ${cls}`}>
              {v}
            </div>
          </div>
        ))}
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

      {/* ─── Lotlar jadvali ─── */}
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                <th className="px-5 py-3 font-semibold">
                  {t('inv.col.woodSource')}
                </th>
                <th className="px-5 py-3 font-semibold">{t('inv.col.grade')}</th>
                <th className="px-5 py-3 font-semibold text-right">
                  {t('inv.col.remaining')}
                </th>
                <th className="px-5 py-3 font-semibold text-right">
                  {t('inv.col.pieces')}
                </th>
                <th className="px-5 py-3 font-semibold text-right">
                  {t('inv.col.unitCost')}
                </th>
                <th className="px-5 py-3 font-semibold text-right">
                  {t('inv.col.status')}
                </th>
                <th className="px-5 py-3 font-semibold text-right">
                  {t('inv.col.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {lots.map((lot) => {
                const stCls = STATUS_CLS[lot.status] ?? STATUS_CLS.AVAILABLE;
                const isOpen = defectLotId === lot.id;
                return (
                  <Fragment key={lot.id}>
                    <tr>
                      <td className="px-5 py-3.5">
                        <span className="block font-medium">{lot.woodType}</span>
                        <span className="block text-xs text-neutral-400">
                          {label('src', lot.source ?? 'LOCAL')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {lot.grade}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                          lot.volumeM3Remaining === 0
                            ? 'text-neutral-300'
                            : lot.volumeM3Remaining < 5
                              ? 'text-amber-600'
                              : ''
                        }`}
                      >
                        {fmt(lot.volumeM3Remaining)} m³
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {lot.quantityRemaining != null
                          ? fmt(lot.quantityRemaining, 0)
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {fmt(lot.unitCostUzsPerM3, 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${stCls}`}
                        >
                          {label('lotStatus', lot.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {lot.volumeM3Remaining > 0 && (
                          <button
                            onClick={() => {
                              setDefectLotId(isOpen ? null : lot.id);
                              setMsg(null);
                            }}
                            className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                              isOpen
                                ? 'border-red-300 bg-red-50 text-red-600'
                                : 'border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600'
                            }`}
                          >
                            {isOpen ? t('common.cancel') : t('inv.markDefect')}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Nuqson formasi (qator ostida ochiladi) */}
                    {isOpen && (
                      <tr className="bg-red-50/40">
                        <td colSpan={6} className="px-5 py-4">
                          <form
                            onSubmit={(e) => submitDefect(e, lot)}
                            className="flex flex-wrap items-end gap-3"
                          >
                            <label className="grid gap-1.5">
                              <span className="field-label text-xs">
                                {t('inv.defectVol', {
                                  max: fmt(lot.volumeM3Remaining),
                                })}
                              </span>
                              <input
                                value={defectVol}
                                onChange={(e) => setDefectVol(e.target.value)}
                                inputMode="decimal"
                                placeholder="2.5"
                                className="field-input !py-2 w-40"
                                autoFocus
                              />
                            </label>
                            {lot.quantityRemaining != null && (
                              <label className="grid gap-1.5">
                                <span className="field-label text-xs">
                                  {t('inv.defectQty', {
                                    max: lot.quantityRemaining,
                                  })}
                                </span>
                                <input
                                  value={defectQty}
                                  onChange={(e) => setDefectQty(e.target.value)}
                                  inputMode="numeric"
                                  placeholder="10"
                                  className="field-input !py-2 w-28"
                                />
                              </label>
                            )}
                            <label className="grid gap-1.5 flex-1 min-w-48">
                              <span className="field-label text-xs">
                                {t('inv.defectReason')}
                              </span>
                              <input
                                value={defectReason}
                                onChange={(e) => setDefectReason(e.target.value)}
                                placeholder={t('inv.defectReasonPh')}
                                className="field-input !py-2"
                              />
                            </label>
                            <button
                              disabled={saving}
                              className="rounded-xl bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                            >
                              {saving
                                ? t('common.saving')
                                : t('inv.defectSubmit')}
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
