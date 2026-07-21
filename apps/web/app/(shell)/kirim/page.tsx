'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import {
  CREATE_PURCHASE,
  KIRIM_PAGE,
  LATEST_RATE,
} from '../../../lib/queries';
import {
  fmt,
  formatMoneyInput,
  parseDecimal,
  parseMoney,
  parseQty,
} from '../../../lib/format';
import { session } from '../../../lib/session';

/**
 * Kirim (UI hujjati §7.2): yog'och qabul qilish — omborni to'ldiradi.
 *  RUSSIA_IMPORT  → furaga bog'lanadi, narx RUBda, kurs MUZLATILADI.
 *  LOCAL_WHOLESALE → furasiz, narx so'mda.
 * Saqlangач avtomatik LOT ochiladi — savdo/transfer o'shandan yechadi.
 */

interface PurchaseRow {
  id: string;
  source: string;
  shipmentId: string | null;
  woodType: string;
  grade: string;
  volumeM3: number;
  quantity: number | null;
  unitPrice: number;
  currency: string;
  exchangeRate: number;
  totalCostUzs: number;
  date: string;
}
interface ShipmentRow {
  id: string;
  truckNumber: string;
  truckColor: string | null;
}
interface PageData {
  purchases: PurchaseRow[];
  shipments: ShipmentRow[];
}

export default function KirimPage() {
  const { data, loading, error, refetch } = useQuery<PageData>(KIRIM_PAGE);
  const { data: rateData } = useQuery<{
    latestExchangeRate: { rubToUzs: number };
  }>(LATEST_RATE, { errorPolicy: 'ignore' });
  const [createPurchase, { loading: saving }] = useMutation(CREATE_PURCHASE);

  // Taxta workspace'ida fura/import yo'q — faqat mahalliy kirim
  const isLumber =
    session.currentWorkspace()?.type === 'LUMBER_PRODUCTION';
  const [source, setSource] = useState<'RUSSIA_IMPORT' | 'LOCAL_WHOLESALE'>(
    isLumber ? 'LOCAL_WHOLESALE' : 'RUSSIA_IMPORT',
  );
  const [shipmentId, setShipmentId] = useState('');
  const [woodType, setWoodType] = useState('');
  const [grade, setGrade] = useState('1-nav');
  const [volume, setVolume] = useState('');
  const [pieces, setPieces] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [rate, setRate] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isImport = source === 'RUSSIA_IMPORT';
  const suggestedRate = rateData?.latestExchangeRate?.rubToUzs ?? null;

  const shipmentName = useMemo(() => {
    const map = new Map(
      (data?.shipments ?? []).map((s) => [s.id, s.truckNumber]),
    );
    return (id: string | null) => (id ? (map.get(id) ?? '—') : '—');
  }, [data]);

  // ─── JONLI TANNARX HISOBI ───
  const vol = parseDecimal(volume);
  const price = parseMoney(unitPrice);
  const rateNum = isImport ? parseDecimal(rate) : 1;
  const totalOriginal = vol * price; // asl valyutada (RUB yoki so'm)
  const totalUzs = totalOriginal * rateNum;
  const costPerM3 = vol > 0 ? totalUzs / vol : 0;

  const canSubmit =
    woodType.trim().length >= 2 &&
    vol > 0 &&
    price > 0 &&
    (!isImport || (rateNum > 0 && !!shipmentId)) &&
    !saving;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createPurchase({
        variables: {
          input: {
            source,
            shipmentId: isImport ? shipmentId : null,
            woodType: woodType.trim(),
            grade: grade.trim() || '1-nav',
            volumeM3: vol,
            quantity: parseQty(pieces) > 0 ? parseQty(pieces) : null,
            unitPrice: price,
            currency: isImport ? 'RUB' : 'UZS',
            exchangeRate: isImport ? rateNum : 1,
            date: new Date().toISOString(),
          },
        },
      });
      setMsg({
        ok: true,
        text: `Kirim saqlandi — ${fmt(vol)} m³ ${woodType.trim()} omborga LOT bo'lib tushdi (tannarx ${fmt(costPerM3)} so'm/m³).`,
      });
      setVolume('');
      setPieces('');
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

  const purchases = [...(data?.purchases ?? [])].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );
  const shipments = data?.shipments ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">Kirim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ─── FORMA ─── */}
        <form onSubmit={onSubmit} className="card p-5 md:p-6 grid gap-5">
          {/* Taxta'da izoh: import Yog'och bo'limida */}
          {isLumber && (
            <p className="text-xs text-neutral-500 bg-brand-faint border border-brand/15 rounded-lg px-3.5 py-2.5">
              Bu bo&apos;limda faqat <b>mahalliy kirim</b> qilinadi. Rossiya
              importi (furalar bilan) — <b>Yog&apos;och sotuvi</b> bo&apos;limida;
              xomashyo esa asosan <b>Ichki transfer</b> orqali keladi.
            </p>
          )}

          {/* Manba tanlash */}
          <div className={`grid gap-3 ${isLumber ? '' : 'grid-cols-2'}`}>
            {(
              [
                {
                  value: 'RUSSIA_IMPORT',
                  icon: '🚛',
                  title: 'Rossiya importi',
                  desc: 'Furaga bog‘lanadi · narx RUB · kurs muzlatiladi',
                },
                {
                  value: 'LOCAL_WHOLESALE',
                  icon: '🏠',
                  title: 'Mahalliy ulgurji',
                  desc: 'Furasiz · narx so‘mda',
                },
              ] as const
            )
              .filter((s) => !isLumber || s.value === 'LOCAL_WHOLESALE')
              .map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={`text-left rounded-2xl border-2 p-4 transition-all ${
                  source === s.value
                    ? 'border-brand bg-brand-faint shadow-lg shadow-brand/10'
                    : 'border-neutral-200 bg-white/70 hover:border-brand/40'
                }`}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="block font-semibold text-sm mt-1.5">
                  {s.title}
                </span>
                <span className="block text-[11px] text-neutral-500 leading-snug mt-1">
                  {s.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Fura (faqat import) */}
          {isImport && (
            <label className="grid gap-1.5 animate-[fadeIn_.3s_ease]">
              <span className="field-label">Fura</span>
              <select
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                className="field-input"
              >
                <option value="">— Fura tanlang —</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.truckNumber}
                    {s.truckColor ? ` · ${s.truckColor}` : ''}
                  </option>
                ))}
              </select>
              {shipments.length === 0 && (
                <span className="text-xs text-amber-700">
                  Avval «Furalar» bo&apos;limida fura qo&apos;shing.
                </span>
              )}
            </label>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="field-label">Yog&apos;och turi</span>
              <input
                value={woodType}
                onChange={(e) => setWoodType(e.target.value)}
                placeholder="Qarag'ay"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Navi</span>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="1-nav"
                className="field-input"
              />
            </label>
          </div>

          <div
            className={`grid gap-4 ${isImport ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}
          >
            <label className="grid gap-1.5">
              <span className="field-label">Hajm (m³)</span>
              <input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                inputMode="decimal"
                placeholder="30"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Dona soni (ixtiyoriy)</span>
              <input
                value={pieces}
                onChange={(e) => setPieces(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder="500"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">
                {isImport ? 'Narx / m³ (RUB)' : 'Narx / m³ (so‘m)'}
              </span>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder={isImport ? '9 000' : '1 100 000'}
                className="field-input"
              />
            </label>
            {isImport && (
              <label className="grid gap-1.5">
                <span className="field-label">Kurs (1 RUB = ? so&apos;m)</span>
                <input
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  inputMode="decimal"
                  placeholder={suggestedRate ? String(suggestedRate) : '150'}
                  className="field-input"
                />
                {suggestedRate && !rate && (
                  <button
                    type="button"
                    onClick={() => setRate(String(suggestedRate))}
                    className="text-xs text-brand hover:underline text-left"
                  >
                    Bugungi kurs: {suggestedRate} — qo&apos;llash
                  </button>
                )}
              </label>
            )}
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

          <button disabled={!canSubmit} className="btn-primary sm:max-w-xs">
            {saving ? 'Saqlanmoqda…' : 'Kirimni saqlash'}
          </button>
        </form>

        {/* ─── JONLI TANNARX PANELI ─── */}
        <aside className="bg-brand-faint border border-brand/20 rounded-2xl p-5 grid gap-3 lg:sticky lg:top-20">
          <h2 className="text-sm font-bold text-brand tracking-wide">
            Tizim avtomatik hisoblaydi
          </h2>
          <dl className="grid gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Hajm</dt>
              <dd className="font-semibold tabular-nums">
                {vol > 0 ? fmt(vol) : '—'} m³
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Dona</dt>
              <dd className="font-semibold tabular-nums">
                {parseQty(pieces) > 0 ? fmt(parseQty(pieces)) : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">
                Jami {isImport ? '(RUB)' : "(so'm)"}
              </dt>
              <dd className="font-semibold tabular-nums">
                {totalOriginal > 0 ? fmt(totalOriginal) : '—'}
              </dd>
            </div>
            {isImport && (
              <div className="flex justify-between border-b border-brand/10 pb-2.5">
                <dt className="text-neutral-500">Kurs</dt>
                <dd className="font-semibold tabular-nums">
                  {rateNum > 0 ? rateNum : '—'}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tannarx / m³</dt>
              <dd className="font-semibold tabular-nums">
                {costPerM3 > 0 ? fmt(costPerM3) : '—'} so&apos;m
              </dd>
            </div>
          </dl>

          <div className="bg-white rounded-xl p-4 border border-brand/15">
            <div className="text-[11px] tracking-wider text-neutral-400 font-semibold">
              JAMI TANNARX
            </div>
            <div className="text-2xl font-bold tabular-nums mt-0.5">
              {totalUzs > 0 ? fmt(totalUzs) : '0'}{' '}
              <span className="text-sm font-medium text-neutral-400">
                so&apos;m
              </span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {isImport
              ? 'Kurs shu kirim uchun muzlatiladi — keyin kurs o‘zgarsa ham bu partiya o‘z tannarxida qoladi.'
              : 'Mahalliy kirim so‘mda — kurs ishlatilmaydi.'}{' '}
            Saqlangач omborда yangi LOT paydo bo&apos;ladi.
          </p>
        </aside>
      </div>

      {/* ─── KIRIMLAR TARIXI ─── */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          Kirimlar tarixi
        </h2>
        {purchases.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            Hozircha kirim yo&apos;q.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">SANA</th>
                  <th className="px-5 py-3 font-semibold">MANBA</th>
                  <th className="px-5 py-3 font-semibold">YOG&apos;OCH</th>
                  <th className="px-5 py-3 font-semibold text-right">HAJM</th>
                  <th className="px-5 py-3 font-semibold text-right">DONA</th>
                  <th className="px-5 py-3 font-semibold text-right">NARX</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    JAMI (SO&apos;M)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {new Date(p.date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.source === 'RUSSIA_IMPORT' ? (
                        <span className="text-[11px] font-medium bg-blue-50 text-blue-700 rounded-full px-2.5 py-1">
                          🚛 {shipmentName(p.shipmentId)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1">
                          🏠 Mahalliy
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {p.woodType}
                      <span className="text-neutral-400 font-normal">
                        {' '}
                        · {p.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fmt(p.volumeM3)} m³
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                      {p.quantity != null ? fmt(p.quantity) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                      {fmt(p.unitPrice)} {p.currency}
                      {p.currency === 'RUB' && (
                        <span className="block text-[10px] text-neutral-400">
                          kurs {p.exchangeRate}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                      {fmt(p.totalCostUzs)}
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
