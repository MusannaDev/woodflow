'use client';

import { useMutation, useQuery } from '@apollo/client';
import { Fragment, FormEvent, useMemo, useState } from 'react';
import { ADD_PAYMENT, TOLOVLAR_PAGE } from '../../../lib/queries';
import { formatMoneyInput, parseMoney } from '../../../lib/format';

/**
 * To'lovlar / Qarzlar (UI hujjati §7.5): har savdoga bog'langan to'lovlar.
 * Mijoz qisman to'lasa — qolgan qarz ko'rinadi. USD berilsa, kiritilgan
 * kurs bilan so'mga aylantiriladi — savdo narxi o'zgarmaydi.
 */

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountUzs: number;
  date: string;
}
interface SaleRow {
  id: string;
  totalPriceUzs: number;
  paidUzs: number;
  debtUzs: number;
  date: string;
  saleType: string;
  customerId: string | null;
  payments: PaymentRow[];
}
interface PageData {
  sales: SaleRow[];
  customers: { id: string; name: string }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

export default function TolovlarPage() {
  const { data, loading, error, refetch } = useQuery<PageData>(TOLOVLAR_PAGE);
  const [addPayment, { loading: saving }] = useMutation(ADD_PAYMENT);

  const [openId, setOpenId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [rate, setRate] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const customerName = useMemo(() => {
    const map = new Map((data?.customers ?? []).map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? (map.get(id) ?? '—') : 'Nomsiz mijoz');
  }, [data]);

  const debts = (data?.sales ?? []).filter((s) => s.debtUzs > 0);
  const paid = (data?.sales ?? []).filter((s) => s.debtUzs <= 0);
  const totalDebt = debts.reduce((a, s) => a + s.debtUzs, 0);

  const amountNum = parseMoney(amount);
  const rateNum = parseMoney(rate);
  const paymentUzs =
    currency === 'USD' ? amountNum * rateNum : amountNum;

  async function pay(e: FormEvent, sale: SaleRow) {
    e.preventDefault();
    setMsg(null);
    if (amountNum <= 0 || (currency === 'USD' && rateNum <= 0)) {
      setMsg({ ok: false, text: 'Summa (va USD uchun kurs) kiriting.' });
      return;
    }
    if (paymentUzs > sale.debtUzs + 0.01) {
      setMsg({
        ok: false,
        text: `To'lov (${fmt(paymentUzs)} so'm) qarzdan (${fmt(sale.debtUzs)} so'm) oshib ketdi.`,
      });
      return;
    }
    try {
      await addPayment({
        variables: {
          input: {
            saleId: sale.id,
            amount: amountNum,
            currency,
            ...(currency === 'USD' ? { exchangeRate: rateNum } : {}),
          },
        },
      });
      setMsg({
        ok: true,
        text:
          currency === 'USD'
            ? `${fmt(amountNum)} USD (kurs ${fmt(rateNum)}) = ${fmt(paymentUzs)} so'm qabul qilindi.`
            : `${fmt(amountNum)} so'm qabul qilindi.`,
      });
      setOpenId(null);
      setAmount('');
      setRate('');
      setCurrency('UZS');
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
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">To&apos;lovlar / Qarzlar</h1>

      {/* Chiplar */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="card rounded-xl !border-amber-300 p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            JAMI QARZ
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums text-amber-700">
            {fmt(totalDebt)}
          </div>
          <div className="text-xs text-neutral-400">so&apos;m</div>
        </div>
        <div className="card rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
            QARZDOR SAVDOLAR
          </div>
          <div className="text-xl md:text-2xl font-bold mt-1 tabular-nums">
            {debts.length}
          </div>
          <div className="text-xs text-neutral-400">ta</div>
        </div>
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

      {/* ─── Qarzli savdolar ─── */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          Qarzli savdolar
        </h2>
        {debts.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            Qarz yo&apos;q — hammasi to&apos;langan 🎉
          </p>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {debts.map((s) => {
              const isOpen = openId === s.id;
              return (
                <Fragment key={s.id}>
                  <li className="px-5 py-4 flex items-center gap-3 flex-wrap">
                    <span className="flex-1 min-w-40">
                      <span className="block text-sm font-medium">
                        {customerName(s.customerId)}
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {new Date(s.date).toLocaleDateString('uz-UZ')} · jami{' '}
                        {fmt(s.totalPriceUzs)} · to&apos;langan {fmt(s.paidUzs)}
                      </span>
                    </span>
                    <span className="text-sm font-bold tabular-nums text-amber-700">
                      qarz {fmt(s.debtUzs)}
                    </span>
                    <button
                      onClick={() => {
                        setOpenId(isOpen ? null : s.id);
                        setMsg(null);
                        setAmount('');
                        setRate('');
                        setCurrency('UZS');
                      }}
                      className={`text-xs font-semibold rounded-lg px-3.5 py-2 border transition-colors ${
                        isOpen
                          ? 'border-neutral-300 text-neutral-500'
                          : 'border-brand bg-brand text-white hover:opacity-90'
                      }`}
                    >
                      {isOpen ? 'Bekor qilish' : "To'lov qabul qilish"}
                    </button>
                  </li>

                  {isOpen && (
                    <li className="px-5 py-4 bg-brand-faint/60">
                      <form
                        onSubmit={(e) => pay(e, s)}
                        className="flex flex-wrap items-end gap-3"
                      >
                        <label className="grid gap-1.5">
                          <span className="field-label text-xs">Summa</span>
                          <input
                            value={amount}
                            onChange={(e) => setAmount(formatMoneyInput(e.target.value))}
                            inputMode="decimal"
                            placeholder={currency === 'USD' ? '100' : '200 000'}
                            className="field-input !py-2 w-36"
                            autoFocus
                          />
                        </label>
                        <label className="grid gap-1.5">
                          <span className="field-label text-xs">Valyuta</span>
                          <select
                            value={currency}
                            onChange={(e) =>
                              setCurrency(e.target.value as 'UZS' | 'USD')
                            }
                            className="field-input !py-2 w-28"
                          >
                            <option value="UZS">so&apos;m</option>
                            <option value="USD">USD</option>
                          </select>
                        </label>
                        {currency === 'USD' && (
                          <label className="grid gap-1.5">
                            <span className="field-label text-xs">
                              Kurs (1 USD = ? so&apos;m)
                            </span>
                            <input
                              value={rate}
                              onChange={(e) => setRate(formatMoneyInput(e.target.value))}
                              inputMode="decimal"
                              placeholder="12 600"
                              className="field-input !py-2 w-32"
                            />
                          </label>
                        )}
                        <div className="text-xs text-neutral-500 pb-2.5 min-w-32">
                          ={' '}
                          <b className="tabular-nums">
                            {paymentUzs > 0 ? fmt(paymentUzs) : '—'}
                          </b>{' '}
                          so&apos;m
                        </div>
                        <button
                          disabled={saving}
                          className="rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                        >
                          {saving ? 'Saqlanmoqda…' : 'Qabul qilish'}
                        </button>
                      </form>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─── To'langan savdolar ─── */}
      <section className="card">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          To&apos;langan savdolar
        </h2>
        {paid.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">Hozircha yo&apos;q.</p>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {paid.map((s) => (
              <li key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">
                    {customerName(s.customerId)}
                  </span>
                  <span className="block text-xs text-neutral-400">
                    {new Date(s.date).toLocaleDateString('uz-UZ')} ·{' '}
                    {s.payments.length} to&apos;lov
                    {s.payments.some((p) => p.currency === 'USD') &&
                      ' (USD bor)'}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {fmt(s.totalPriceUzs)}
                </span>
                <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1">
                  To&apos;landi
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
