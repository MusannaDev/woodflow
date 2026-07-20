'use client';

import { useMutation, useQuery } from '@apollo/client';
import { Fragment, FormEvent, useState } from 'react';
import { INVENTORY_PAGE, RECORD_DEFECT } from '../../../lib/queries';
import { parseDecimal } from '../../../lib/format';

/**
 * Ombor (UI hujjati §7.3): yuqorida umumiy chiplar, pastda lotlar jadvali.
 * Har lotda "Nuqson" amali — brak m³ ni ajratadi: sotiladigan qoldiqdan
 * minus bo'ladi va zarar sifatida furaga yoziladi (backend shunday qiladi).
 */

interface Summary {
  totalRemainingM3: number;
  defectM3: number;
  lotCount: number;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string | null;
  status: string;
  volumeM3Remaining: number;
  unitCostUzsPerM3: number;
}
interface PageData {
  inventorySummary: Summary;
  inventory: LotRow[];
}

const fmt = (n: number, d = 1) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: d }).format(n);

const sourceLabel = (s: string | null) =>
  s === 'RUSSIA_IMPORT'
    ? 'Rossiya importi'
    : s === 'INTERNAL_TRANSFER'
      ? 'Ichki transfer'
      : 'Mahalliy';

const STATUS: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: 'Mavjud', cls: 'bg-emerald-100 text-emerald-700' },
  LOW: { label: 'Kam', cls: 'bg-amber-100 text-amber-700' },
  RESERVED: { label: 'Bron', cls: 'bg-blue-100 text-blue-700' },
  SOLD_OUT: { label: 'Tugagan', cls: 'bg-neutral-100 text-neutral-500' },
  DEFECT: { label: 'Nuqson', cls: 'bg-red-100 text-red-700' },
};

export default function OmborPage() {
  const { data, loading, error, refetch } = useQuery<PageData>(INVENTORY_PAGE);
  const [recordDefect, { loading: saving }] = useMutation(RECORD_DEFECT);

  const [defectLotId, setDefectLotId] = useState<string | null>(null);
  const [defectVol, setDefectVol] = useState('');
  const [defectReason, setDefectReason] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submitDefect(e: FormEvent, lot: LotRow) {
    e.preventDefault();
    setMsg(null);
    const vol = parseDecimal(defectVol);
    if (vol <= 0 || vol > lot.volumeM3Remaining) {
      setMsg({
        ok: false,
        text: `Hajm 0 dan katta va qoldiqdan (${fmt(lot.volumeM3Remaining)} m³) oshmasligi kerak.`,
      });
      return;
    }
    try {
      await recordDefect({
        variables: {
          input: {
            lotId: lot.id,
            volumeM3: vol,
            reason: defectReason || null,
          },
        },
      });
      setMsg({
        ok: true,
        text: `${vol} m³ nuqson belgilandi — sotiladigan qoldiqdan chiqarildi, zarar furaga yozildi.`,
      });
      setDefectLotId(null);
      setDefectVol('');
      setDefectReason('');
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
    return <p className="text-red-600 text-sm">Xato: {error.message}</p>;

  const s = data!.inventorySummary;
  const lots = data!.inventory;

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-bold">Ombor</h1>

      {/* ─── Umumiy chiplar ─── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Jami qoldiq', `${fmt(s.totalRemainingM3)} m³`, ''],
          ['Nuqson', `${fmt(s.defectM3)} m³`, s.defectM3 > 0 ? 'text-red-600' : ''],
          ['Lotlar', String(s.lotCount), ''],
        ].map(([l, v, cls]) => (
          <div
            key={l}
            className="card rounded-xl p-4"
          >
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {l}
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
                <th className="px-5 py-3 font-semibold">YOG&apos;OCH / MANBA</th>
                <th className="px-5 py-3 font-semibold">NAVI</th>
                <th className="px-5 py-3 font-semibold text-right">QOLDIQ</th>
                <th className="px-5 py-3 font-semibold text-right">TANNARX / m³</th>
                <th className="px-5 py-3 font-semibold text-right">HOLAT</th>
                <th className="px-5 py-3 font-semibold text-right">AMAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {lots.map((lot) => {
                const st = STATUS[lot.status] ?? STATUS.AVAILABLE;
                const isOpen = defectLotId === lot.id;
                return (
                  <Fragment key={lot.id}>
                    <tr>
                      <td className="px-5 py-3.5">
                        <span className="block font-medium">{lot.woodType}</span>
                        <span className="block text-xs text-neutral-400">
                          {sourceLabel(lot.source)}
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
                        {fmt(lot.unitCostUzsPerM3, 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${st.cls}`}
                        >
                          {st.label}
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
                            {isOpen ? 'Bekor qilish' : 'Nuqson belgilash'}
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
                                Nuqson hajmi (m³) — maks {fmt(lot.volumeM3Remaining)}
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
                            <label className="grid gap-1.5 flex-1 min-w-48">
                              <span className="field-label text-xs">
                                Sabab (ixtiyoriy)
                              </span>
                              <input
                                value={defectReason}
                                onChange={(e) => setDefectReason(e.target.value)}
                                placeholder="Chirigan, yorilgan…"
                                className="field-input !py-2"
                              />
                            </label>
                            <button
                              disabled={saving}
                              className="rounded-xl bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                            >
                              {saving ? 'Saqlanmoqda…' : 'Nuqsonni tasdiqlash'}
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
