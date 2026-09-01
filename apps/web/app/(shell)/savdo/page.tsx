'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import {
  ADD_PAYMENT,
  CREATE_CUSTOMER,
  CREATE_SALE,
  SALES_PAGE,
} from '../../../lib/queries';
import {
  formatMoneyInput,
  parseDecimal,
  parseMoney,
  parseQty,
} from '../../../lib/format';
import { dateFmt } from '../../../lib/format';
import { useEnumLabel, useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';
import { roundLogVolumeM3 } from '../../../lib/wood';
import { session } from '../../../lib/session';

/**
 * Savdo — platformaning yuragi (UI hujjati §7.4).
 *  Yog'och: xomashyo lotdan, o'lcham → jonli m³ hisob.
 *  Taxta:  TAYYOR OMBORdan (pol taxta/rika) — o'lchamsiz, dona bilan.
 * To'lov: 💵 Naqd (so'm yoki USD, kurs bilan) yoki 📝 Qarz.
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
  quantityRemaining: number | null;
}
interface FinishedRow {
  id: string;
  productName: string;
  quantityRemaining: number;
  unitCostUzsPerPiece: number;
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
  finishedGoods: FinishedRow[];
  sales: SaleRow[];
}

const SALE_TYPES = [
  { value: 'PER_PIECE', label: 'sale.type.PER_PIECE' },
  { value: 'PER_CUBE', label: 'sale.type.PER_CUBE' },
  { value: 'WHOLESALE', label: 'sale.type.WHOLESALE' },
] as const satisfies readonly { value: string; label: MsgKey }[];

/** O'lcham maydoni: [yorliq kaliti, qiymat, setter]. */
type DimField = [MsgKey, string, (v: string) => void];

export default function SavdoPage() {
  const { t, ts, locale } = useI18n();
  const label = useEnumLabel();
  const fmt = (n: number, d = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(n);

  const { data, loading, error, refetch } = useQuery<PageData>(SALES_PAGE);
  const [createSale, { loading: saving }] = useMutation(CREATE_SALE);
  const [addPayment] = useMutation(ADD_PAYMENT);
  const [createCustomer] = useMutation(CREATE_CUSTOMER);

  // Taxta workspace — tayyor ombordan sotadi
  const isLumber =
    session.currentWorkspace()?.type === 'LUMBER_PRODUCTION';

  const [customerId, setCustomerId] = useState('');
  // "+ Yangi mijoz" rejimi — savdo saqlanganda avto-yaratiladi
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+998');
  const [saleType, setSaleType] =
    useState<(typeof SALE_TYPES)[number]['value']>('PER_PIECE');
  const [lotId, setLotId] = useState('');
  // Yog'och shakli: SILINDR (ikki uch teng) · KONUS (ingichkalanadi) · BOX (taxta)
  const [shape, setShape] = useState<'SILINDR' | 'KONUS' | 'BOX'>('SILINDR');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('0.2');
  const [thickness, setThickness] = useState('0.05');
  const [diam, setDiam] = useState('28'); // silindr diametri, sm
  const [baseDiam, setBaseDiam] = useState('30'); // konus bosh ⌀, sm
  const [topDiam, setTopDiam] = useState('24'); // konus uch ⌀, sm
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  // ── To'lov holati ──
  const [payMode, setPayMode] = useState<'CASH' | 'DEBT'>('CASH');
  const [payCurrency, setPayCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [usdAmount, setUsdAmount] = useState('');
  const [usdRate, setUsdRate] = useState('');

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const lots = useMemo(
    () => (data?.inventory ?? []).filter((l) => l.volumeM3Remaining > 0),
    [data],
  );
  const finished = useMemo(
    () => (data?.finishedGoods ?? []).filter((f) => f.quantityRemaining > 0),
    [data],
  );
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const fLot = finished.find((f) => f.id === lotId) ?? null;
  const perPiece = isLumber || saleType === 'PER_PIECE';

  // ─── JONLI HISOB ───
  const L = parseDecimal(length);
  const W = parseDecimal(width);
  const T = parseDecimal(thickness);
  const dm = parseDecimal(diam);
  const bd = parseDecimal(baseDiam);
  const td = parseDecimal(topDiam);
  const qty = parseQty(quantity);
  const price = parseMoney(unitPrice);
  const isKonus = !isLumber && shape === 'KONUS';
  const isSilindr = !isLumber && shape === 'SILINDR';
  const isRound = isKonus || isSilindr;
  // Silindr = konus formulasiда ikkala diametr teng
  const sendBase = isKonus ? bd : dm;
  const sendTop = isKonus ? td : dm;

  const volPerPiece = isLumber
    ? 0
    : isRound
      ? roundLogVolumeM3(sendBase, sendTop, L)
      : L * W * T;
  const totalVol = volPerPiece * qty;
  const totalSum = perPiece ? qty * price : totalVol * price;

  // Xomashyo qoldiqlari
  const remaining = lot ? lot.volumeM3Remaining - totalVol : null;
  const exceeds = remaining !== null && remaining < 0;
  const remainingPieces = isLumber
    ? fLot
      ? fLot.quantityRemaining - qty
      : null
    : lot?.quantityRemaining != null
      ? lot.quantityRemaining - qty
      : null;
  const exceedsPieces = remainingPieces !== null && remainingPieces < 0;

  // To'lov hisobi
  const usdNum = parseMoney(usdAmount);
  const rateNum = parseDecimal(usdRate);
  const usdInUzs = usdNum * rateNum;
  const cashUzs =
    payMode === 'DEBT' ? 0 : payCurrency === 'UZS' ? totalSum : usdInUzs;
  const debtAfter = totalSum - cashUzs;
  const overPaid = payMode === 'CASH' && payCurrency === 'USD' && usdInUzs > totalSum + 0.01;
  const usdIncomplete =
    payMode === 'CASH' && payCurrency === 'USD' && (usdNum <= 0 || rateNum <= 0);

  const canSubmit =
    !!lotId &&
    qty > 0 &&
    price > 0 &&
    (isLumber || totalVol > 0) &&
    (customerId !== '__new' || newCustName.trim().length >= 2) &&
    !exceeds &&
    !exceedsPieces &&
    !overPaid &&
    !(payMode === 'CASH' && payCurrency === 'USD' && usdIncomplete) &&
    !saving;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      // "+ Yangi mijoz" tanlangan bo'lsa — avval mijozni yaratamiz
      let finalCustomerId: string | null = customerId || null;
      let newCustomerNote = '';
      if (customerId === '__new') {
        const custRes = await createCustomer({
          variables: {
            input: {
              name: newCustName.trim(),
              phone: newCustPhone.trim() && newCustPhone !== '+998' ? newCustPhone.trim() : null,
            },
          },
        });
        finalCustomerId = custRes.data.createCustomer.id as string;
        newCustomerNote = t('sale.custAdded', { name: newCustName.trim() });
      }

      const res = await createSale({
        variables: {
          input: {
            customerId: finalCustomerId,
            saleType: isLumber ? 'PER_PIECE' : saleType,
            date: new Date().toISOString(),
            items: [
              isLumber
                ? {
                    finishedLotId: lotId,
                    quantity: qty,
                    unitPriceUzs: price,
                  }
                : isRound
                  ? {
                      lotId,
                      quantity: qty,
                      length: L,
                      baseDiamCm: sendBase,
                      topDiamCm: sendTop,
                      unitPriceUzs: price,
                    }
                  : {
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

      const saleId = res.data.createSale.id as string;

      // 💵 Naqd bo'lsa — darhol to'lov yozamiz
      if (payMode === 'CASH') {
        if (payCurrency === 'UZS') {
          await addPayment({
            variables: {
              input: { saleId, amount: totalSum, currency: 'UZS' },
            },
          });
        } else {
          await addPayment({
            variables: {
              input: {
                saleId,
                amount: usdNum,
                currency: 'USD',
                exchangeRate: rateNum,
              },
            },
          });
        }
      }

      const debtText =
        payMode === 'DEBT'
          ? t('sale.fullDebt', { total: fmt(totalSum) })
          : debtAfter > 0.01
            ? t('sale.partialPaid', { debt: fmt(debtAfter) })
            : t('sale.fullyPaid');
      setMsg({
        ok: true,
        text: `${t('sale.saved', {
          total: fmt(totalSum),
        })}${debtText}${newCustomerNote}`,
      });
      setQuantity('');
      setUnitPrice('');
      setUsdAmount('');
      if (customerId === '__new') {
        setCustomerId('');
        setNewCustName('');
        setNewCustPhone('+998');
      }
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

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('sale.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ─── FORMA ─── */}
        <form onSubmit={onSubmit} className="card p-5 md:p-6 grid gap-5 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="field-label">{t('sale.customer')}</span>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="field-input"
              >
                <option value="">{t('sale.noCustomer')}</option>
                {(data?.customers ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new">{t('sale.newCustomer')}</option>
              </select>
            </label>

            {!isLumber && (
              <label className="grid gap-1.5">
                <span className="field-label">{t('sale.saleType')}</span>
                <select
                  value={saleType}
                  onChange={(e) =>
                    setSaleType(e.target.value as typeof saleType)
                  }
                  className="field-input"
                >
                  {SALE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.label)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* ➕ Yangi mijoz mini-formasi */}
          {customerId === '__new' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border-2 border-brand/30 bg-brand-faint/60 p-4 animate-[fadeIn_.3s_ease]">
              <label className="grid gap-1.5">
                <span className="field-label text-xs">
                  {t('sale.custName')}
                </span>
                <input
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder={t('sale.custNamePh')}
                  className="field-input !py-2.5"
                  autoFocus
                />
              </label>
              <label className="grid gap-1.5">
                <span className="field-label text-xs">
                  {t('sale.custPhone')}
                </span>
                <input
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  inputMode="tel"
                  className="field-input !py-2.5"
                />
              </label>
              <p className="sm:col-span-2 text-[11px] text-neutral-500">
                {t('sale.custNote')}
              </p>
            </div>
          )}

          <label className="grid gap-1.5">
            <span className="field-label">
              {isLumber ? t('sale.fromFinished') : t('sale.fromLot')}
            </span>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="field-input"
            >
              <option value="">
                {isLumber ? t('sale.pickProduct') : t('sale.pickLot')}
              </option>
              {isLumber
                ? finished.map((f) => (
                    <option key={f.id} value={f.id}>
                      {t('sale.finishedOption', {
                        name: f.productName,
                        qty: fmt(f.quantityRemaining),
                        cost: fmt(f.unitCostUzsPerPiece),
                      })}
                    </option>
                  ))
                : lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {t('sale.lotOption', {
                        wood: l.woodType,
                        grade: l.grade,
                        source: label('sale.srcShort', l.source),
                        vol: fmt(l.volumeM3Remaining, 1),
                      })}
                      {l.quantityRemaining != null
                        ? ` · ${fmt(l.quantityRemaining)} ${t('common.pcs')}`
                        : ''}
                    </option>
                  ))}
            </select>
            {isLumber && finished.length === 0 && (
              <span className="text-xs text-amber-700">
                {t('sale.noFinished')}
              </span>
            )}
          </label>

          {!isLumber && (
            <fieldset className="grid gap-3">
              <legend className="field-label text-brand font-semibold mb-1.5">
                {t('sale.dimsLegend')}
              </legend>

              {/* Shakl: silindr · konus · taxta */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      value: 'SILINDR',
                      icon: '🪵',
                      title: 'sale.shape.cyl.title',
                      desc: 'sale.shape.cyl.desc',
                    },
                    {
                      value: 'KONUS',
                      icon: '📐',
                      title: 'sale.shape.cone.title',
                      desc: 'sale.shape.cone.desc',
                    },
                    {
                      value: 'BOX',
                      icon: '🟫',
                      title: 'sale.shape.box.title',
                      desc: 'sale.shape.box.desc',
                    },
                  ] as const satisfies readonly {
                    value: 'SILINDR' | 'KONUS' | 'BOX';
                    icon: string;
                    title: MsgKey;
                    desc: MsgKey;
                  }[]
                ).map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setShape(s.value)}
                    className={`text-left rounded-xl border-2 px-3 py-2 transition-all ${
                      shape === s.value
                        ? 'border-brand bg-brand-faint'
                        : 'border-neutral-200 bg-white/70 hover:border-brand/40'
                    }`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="block font-semibold text-sm">
                      {t(s.title)}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {t(s.desc)}
                    </span>
                  </button>
                ))}
              </div>

              {isSilindr && (
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ['pur.calc.diameter', diam, setDiam],
                      ['pur.calc.length', length, setLength],
                    ] as DimField[]
                  ).map(([lab, val, set]) => (
                    <label key={lab} className="grid gap-1.5">
                      <span className="field-label text-xs">{t(lab)}</span>
                      <input
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        inputMode="decimal"
                        className="field-input"
                      />
                    </label>
                  ))}
                </div>
              )}
              {isKonus && (
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ['pur.calc.base', baseDiam, setBaseDiam],
                      ['pur.calc.top', topDiam, setTopDiam],
                      ['pur.calc.length', length, setLength],
                    ] as DimField[]
                  ).map(([lab, val, set]) => (
                    <label key={lab} className="grid gap-1.5">
                      <span className="field-label text-xs">{t(lab)}</span>
                      <input
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        inputMode="decimal"
                        className="field-input"
                      />
                    </label>
                  ))}
                </div>
              )}
              {shape === 'BOX' && (
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ['pur.calc.length', length, setLength],
                      ['pur.calc.width', width, setWidth],
                      ['pur.calc.thickness', thickness, setThickness],
                    ] as DimField[]
                  ).map(([lab, val, set]) => (
                    <label key={lab} className="grid gap-1.5">
                      <span className="field-label text-xs">{t(lab)}</span>
                      <input
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        inputMode="decimal"
                        className="field-input"
                      />
                    </label>
                  ))}
                </div>
              )}
              {isRound && (
                <p className="text-[11px] text-neutral-400">
                  {t('sale.perPieceHint', {
                    vol: volPerPiece.toFixed(3),
                    shape: isSilindr ? t('sale.cylNote') : t('sale.coneNote'),
                  })}
                </p>
              )}
            </fieldset>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="field-label">{t('sale.qty')}</span>
              <input
                value={quantity}
                onChange={(e) => setQuantity(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder="200"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">
                {perPiece ? t('sale.pricePerPiece') : t('sale.pricePerM3')}
              </span>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder="25 000"
                className="field-input"
              />
            </label>
          </div>

          {/* ─── TO'LOV ─── */}
          <fieldset className="grid gap-3">
            <legend className="field-label text-brand font-semibold mb-1.5">
              {t('sale.payLegend')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    value: 'CASH',
                    icon: '💵',
                    title: 'sale.pay.cash.title',
                    desc: 'sale.pay.cash.desc',
                  },
                  {
                    value: 'DEBT',
                    icon: '📝',
                    title: 'sale.pay.debt.title',
                    desc: 'sale.pay.debt.desc',
                  },
                ] as const satisfies readonly {
                  value: 'CASH' | 'DEBT';
                  icon: string;
                  title: MsgKey;
                  desc: MsgKey;
                }[]
              ).map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPayMode(m.value)}
                  className={`text-left rounded-xl border-2 px-4 py-3 transition-all ${
                    payMode === m.value
                      ? 'border-brand bg-brand-faint shadow-md shadow-brand/10'
                      : 'border-neutral-200 bg-white/70 hover:border-brand/40'
                  }`}
                >
                  <span className="font-semibold text-sm">
                    {m.icon} {t(m.title)}
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-0.5">
                    {t(m.desc)}
                  </span>
                </button>
              ))}
            </div>

            {payMode === 'CASH' && (
              <div className="grid gap-3 animate-[fadeIn_.3s_ease]">
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5">
                    <span className="field-label text-xs">
                      {t('pay.currency')}
                    </span>
                    <select
                      value={payCurrency}
                      onChange={(e) =>
                        setPayCurrency(e.target.value as 'UZS' | 'USD')
                      }
                      className="field-input"
                    >
                      <option value="UZS">{t('common.som')}</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </label>
                  {payCurrency === 'USD' && (
                    <label className="grid gap-1.5">
                      <span className="field-label text-xs">
                        {t('pay.rate')}
                      </span>
                      <input
                        value={usdRate}
                        onChange={(e) => setUsdRate(e.target.value)}
                        inputMode="decimal"
                        placeholder="12 600"
                        className="field-input"
                      />
                    </label>
                  )}
                </div>

                {payCurrency === 'UZS' ? (
                  <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
                    {t('sale.allCash', {
                      total: totalSum > 0 ? fmt(totalSum) : 0,
                    })}
                  </p>
                ) : (
                  <div className="grid gap-2">
                    <label className="grid gap-1.5">
                      <span className="field-label text-xs">
                        {t('sale.usdReceived')}
                      </span>
                      <input
                        value={usdAmount}
                        onChange={(e) =>
                          setUsdAmount(formatMoneyInput(e.target.value))
                        }
                        inputMode="decimal"
                        placeholder="100"
                        className="field-input"
                      />
                    </label>
                    {usdNum > 0 && rateNum > 0 && (
                      <p
                        className={`text-xs rounded-lg px-3 py-2 border ${
                          overPaid
                            ? 'text-red-600 bg-red-50 border-red-100'
                            : 'text-neutral-500 bg-neutral-50 border-neutral-100'
                        }`}
                      >
                        = <b className="tabular-nums">{fmt(usdInUzs)}</b>{' '}
                        {t('common.som')}
                        {overPaid
                          ? t('sale.overPaid', { total: fmt(totalSum) })
                          : debtAfter > 0.01
                            ? t('sale.remainingDebt', { debt: fmt(debtAfter) })
                            : t('sale.coversAll')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </fieldset>

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
            {saving ? t('common.saving') : t('sale.submit')}
          </button>
        </form>

        {/* ─── JONLI HISOB PANELI ─── */}
        <aside className="bg-brand-faint border border-brand/20 rounded-2xl p-5 grid gap-3 lg:sticky lg:top-20 min-w-0">
          <h2 className="text-sm font-bold text-brand tracking-wide">
            {t('sale.panelTitle')}
          </h2>
          <dl className="grid gap-2.5 text-sm">
            {!isLumber && (
              <>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    {t('sale.volPerPiece')}
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {volPerPiece > 0 ? volPerPiece.toFixed(4) : '—'} m³
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    {qty > 0
                      ? t('sale.totalVolQty', { n: fmt(qty) })
                      : t('sale.totalVol')}
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {totalVol > 0 ? totalVol.toFixed(2) : '—'} m³
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">{t('sale.deducted')}</dt>
                  <dd className="font-semibold tabular-nums text-red-600">
                    {totalVol > 0 ? `−${totalVol.toFixed(2)}` : '—'} m³
                  </dd>
                </div>
              </>
            )}
            {isLumber && (
              <div className="flex justify-between">
                <dt className="text-neutral-500">{t('sale.piecesSold')}</dt>
                <dd className="font-semibold tabular-nums">
                  {qty > 0 ? fmt(qty) : '—'}
                </dd>
              </div>
            )}
            {remainingPieces !== null && (
              <div className="flex justify-between">
                <dt className="text-neutral-500">{t('sale.piecesLeft')}</dt>
                <dd
                  className={`font-semibold tabular-nums ${
                    exceedsPieces ? 'text-red-600' : ''
                  }`}
                >
                  {remainingPieces}
                </dd>
              </div>
            )}
            {!isLumber && (
              <div className="flex justify-between border-b border-brand/10 pb-2.5">
                <dt className="text-neutral-500">{t('sale.volLeft')}</dt>
                <dd
                  className={`font-semibold tabular-nums ${
                    exceeds ? 'text-red-600' : ''
                  }`}
                >
                  {remaining !== null ? remaining.toFixed(2) : '—'} m³
                </dd>
              </div>
            )}
          </dl>

          {exceedsPieces && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {t('sale.exceedsPieces', {
                qty:
                  (isLumber ? fLot?.quantityRemaining : lot?.quantityRemaining) ??
                  0,
              })}
            </p>
          )}
          {exceeds && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {t('sale.exceedsVol', {
                vol: lot ? fmt(lot.volumeM3Remaining, 1) : 0,
              })}
            </p>
          )}

          <div className="bg-white rounded-xl p-4 border border-brand/15">
            <div className="text-[11px] tracking-wider text-neutral-400 font-semibold">
              {t('sale.grandTotal')}
            </div>
            <div className="text-2xl font-bold tabular-nums mt-0.5">
              {totalSum > 0 ? fmt(totalSum) : '0'}{' '}
              <span className="text-sm font-medium text-neutral-400">
                {t('common.som')}
              </span>
            </div>
            {payMode === 'DEBT' && totalSum > 0 && (
              <div className="text-[11px] font-semibold text-amber-700 mt-1">
                {t('sale.allDebtNote')}
              </div>
            )}
            {payMode === 'CASH' && totalSum > 0 && (
              <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                {t('sale.cashNote', { amount: fmt(cashUzs) })}
                {debtAfter > 0.01
                  ? t('sale.cashDebtNote', { debt: fmt(debtAfter) })
                  : ''}
              </div>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {t('sale.footnote')}
          </p>
        </aside>
      </div>

      {/* ─── SAVDOLAR RO'YXATI ─── */}
      <section className="card">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('sale.recent')}
        </h2>
        {(data?.sales ?? []).length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">{t('sale.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-2.5 font-semibold">
                    {t('sale.col.date')}
                  </th>
                  <th className="px-5 py-2.5 font-semibold">
                    {t('sale.col.type')}
                  </th>
                  <th className="px-5 py-2.5 font-semibold text-right">
                    {t('sale.col.volQty')}
                  </th>
                  <th className="px-5 py-2.5 font-semibold text-right">
                    {t('sale.col.amount')}
                  </th>
                  <th className="px-5 py-2.5 font-semibold text-right">
                    {t('sale.col.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(data?.sales ?? []).map((s) => {
                  const vol = s.items.reduce((a, i) => a + i.volumeM3, 0);
                  const pcs = s.items.reduce((a, i) => a + i.quantity, 0);
                  return (
                    <tr key={s.id}>
                      <td className="px-5 py-3 text-neutral-500">
                        {dateFmt(s.date)}
                      </td>
                      <td className="px-5 py-3">
                        {label('sale.type', s.saleType)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {vol > 0
                          ? `${vol.toFixed(1)} m³`
                          : `${fmt(pcs)} ${t('common.pcs')}`}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">
                        {fmt(s.totalPriceUzs)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {s.debtUzs > 0 ? (
                          <span className="text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                            {t('sale.debtBadge', { amount: fmt(s.debtUzs) })}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1">
                            {t('term.paid')}
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
