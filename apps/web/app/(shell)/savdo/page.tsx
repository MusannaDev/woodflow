'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { CREATE_SALE, SALES_PAGE } from '../../../lib/queries';

/**
 * Savdo — platformaning yuragi (UI hujjati §7.4).
 * Chapda forma, o'ngda JONLI hisob: o'lcham kiritilganda m³ va summa
 * real vaqtda ko'rinadi. Saqlanganда ombordan avtomatik yechiladi.
 */

interface CustomerRow {
  id: string;
  name: string;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string;
  volumeM3Remaining: number;
}
interface SaleRow {
  id: string;
  totalPriceUzs: number;
  paidUzs: number;
  debtUzs: number;
  date: string;
  saleType: string;
  items: { volumeM3: number; quantity: number }[];
}
interface PageData {
  customers: CustomerRow[];
  inventory: LotRow[];
  sales: SaleRow[];
}

const SALE_TYPES = [
  { value: 'PER_PIECE', label: 'Donaga' },
  { value: 'PER_CUBE', label: 'Kub bilan' },
  { value: 'WHOLESALE', label: 'Ulgurji' },
] as const;

const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: d,
  }).format(n);

const sourceLabel = (s: string) =>
  s === 'RUSSIA_IMPORT'
    ? 'Import'
    : s === 'INTERNAL_TRANSFER'
      ? 'Transfer'
      : 'Mahalliy';

export default function SavdoPage() {
  const { data, loading, error, refetch } = useQuery<PageData>(SALES_PAGE);
  const [createSale, { loading: saving }] = useMutation(CREATE_SALE);

  const [customerId, setCustomerId] = useState('');
  const [saleType, setSaleType] =
    useState<(typeof SALE_TYPES)[number]['value']>('PER_PIECE');
  const [lotId, setLotId] = useState('');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('0.2');
  const [thickness, setThickness] = useState('0.05');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const lots = useMemo(
    () => (data?.inventory ?? []).filter((l) => l.volumeM3Remaining > 0),
    [data],
  );
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const perPiece = saleType === 'PER_PIECE';

  // ─── JONLI HISOB ───
  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const T = parseFloat(thickness) || 0;
  const qty = parseInt(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;

  const volPerPiece = L * W * T;
  const totalVol = volPerPiece * qty;
  const totalSum = perPiece ? qty * price : totalVol * price;
  const remaining = lot ? lot.volumeM3Remaining - totalVol : null;
  const exceeds = remaining !== null && remaining < 0;

  const canSubmit =
    !!lotId && qty > 0 && price > 0 && totalVol > 0 && !exceeds && !saving;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createSale({
        variables: {
          input: {
            customerId: customerId || null,
            saleType,
            date: new Date().toISOString(),
            items: [
              {
                lotId,
                quantity: qty,
                length: L,
                width: W,
                thickness: T,
                unitPriceUzs: price,
              },
            ],
          },
        },
      });
      setMsg({ ok: true, text: `Savdo saqlandi — ${fmt(totalSum)} so'm, ombordan ${totalVol.toFixed(2)} m³ yechildi.` });
      setQuantity('');
      setUnitPrice('');
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Yangi savdo</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ─── FORMA ─── */}
        <form
          onSubmit={onSubmit}
          className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 grid gap-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="field-label">Mijoz (ixtiyoriy)</span>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="field-input"
              >
                <option value="">— Tanlanmagan —</option>
                {(data?.customers ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="field-label">Savdo turi</span>
              <select
                value={saleType}
                onChange={(e) =>
                  setSaleType(e.target.value as typeof saleType)
                }
                className="field-input"
              >
                {SALE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="field-label">Ombordan (lot)</span>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="field-input"
            >
              <option value="">— Lot tanlang —</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.woodType} · {l.grade} · {sourceLabel(l.source)} — qoldiq{' '}
                  {fmt(l.volumeM3Remaining, 1)} m³
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-3">
            <legend className="field-label text-brand font-semibold mb-1.5">
              O&apos;LCHAM (avtomatik m³ ga aylanadi)
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ['Uzunlik (m)', length, setLength],
                  ['En (m)', width, setWidth],
                  ['Qalinlik (m)', thickness, setThickness],
                ] as const
              ).map(([lab, val, set]) => (
                <label key={lab} className="grid gap-1.5">
                  <span className="field-label text-xs">{lab}</span>
                  <input
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    inputMode="decimal"
                    className="field-input"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="field-label">Dona soni</span>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
                placeholder="200"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">
                {perPiece ? 'Narx / dona (so‘m)' : 'Narx / m³ (so‘m)'}
              </span>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                inputMode="numeric"
                placeholder="25 000"
                className="field-input"
              />
            </label>
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

          <button disabled={!canSubmit} className="btn-primary">
            {saving ? 'Saqlanmoqda…' : 'Savdoni saqlash'}
          </button>
        </form>

        {/* ─── JONLI HISOB PANELI ─── */}
        <aside className="bg-brand-faint border border-brand/20 rounded-2xl p-5 grid gap-3 lg:sticky lg:top-20">
          <h2 className="text-sm font-bold text-brand tracking-wide">
            Tizim avtomatik hisoblaydi
          </h2>
          <dl className="grid gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Bir dona hajmi</dt>
              <dd className="font-semibold tabular-nums">
                {volPerPiece > 0 ? volPerPiece.toFixed(4) : '—'} m³
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">
                Jami hajm {qty > 0 ? `(${fmt(qty)} dona)` : ''}
              </dt>
              <dd className="font-semibold tabular-nums">
                {totalVol > 0 ? totalVol.toFixed(2) : '—'} m³
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Ombordan yechiladi</dt>
              <dd className="font-semibold tabular-nums text-red-600">
                {totalVol > 0 ? `−${totalVol.toFixed(2)}` : '—'} m³
              </dd>
            </div>
            <div className="flex justify-between border-b border-brand/10 pb-2.5">
              <dt className="text-neutral-500">Qolgan qoldiq</dt>
              <dd
                className={`font-semibold tabular-nums ${
                  exceeds ? 'text-red-600' : ''
                }`}
              >
                {remaining !== null ? remaining.toFixed(2) : '—'} m³
              </dd>
            </div>
          </dl>

          {exceeds && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              ⚠ Omborda yetarli emas! Lot qoldig&apos;i:{' '}
              {lot ? fmt(lot.volumeM3Remaining, 1) : 0} m³
            </p>
          )}

          <div className="bg-white rounded-xl p-4 border border-brand/15">
            <div className="text-[11px] tracking-wider text-neutral-400 font-semibold">
              JAMI SAVDO
            </div>
            <div className="text-2xl font-bold tabular-nums mt-0.5">
              {totalSum > 0 ? fmt(totalSum) : '0'}{' '}
              <span className="text-sm font-medium text-neutral-400">
                so&apos;m
              </span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            To&apos;lov so&apos;m yoki USD qabul qilinadi — narx baribir
            so&apos;mda qoladi.
          </p>
        </aside>
      </div>

      {/* ─── SAVDOLAR RO'YXATI ─── */}
      <section className="bg-white border border-neutral-200 rounded-2xl">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          So&apos;nggi savdolar
        </h2>
        {(data?.sales ?? []).length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            Hozircha savdo yo&apos;q.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-2.5 font-semibold">SANA</th>
                  <th className="px-5 py-2.5 font-semibold">TURI</th>
                  <th className="px-5 py-2.5 font-semibold text-right">HAJM</th>
                  <th className="px-5 py-2.5 font-semibold text-right">SUMMA</th>
                  <th className="px-5 py-2.5 font-semibold text-right">HOLAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(data?.sales ?? []).map((s) => {
                  const vol = s.items.reduce((a, i) => a + i.volumeM3, 0);
                  return (
                    <tr key={s.id}>
                      <td className="px-5 py-3 text-neutral-500">
                        {new Date(s.date).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-5 py-3">
                        {SALE_TYPES.find((t) => t.value === s.saleType)?.label ??
                          s.saleType}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {vol.toFixed(1)} m³
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">
                        {fmt(s.totalPriceUzs)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {s.debtUzs > 0 ? (
                          <span className="text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                            Qarz {fmt(s.debtUzs)}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1">
                            To&apos;landi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
