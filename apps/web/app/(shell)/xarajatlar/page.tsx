'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useMemo, useState } from 'react';
import { CREATE_EXPENSE, EXPENSES_PAGE } from '../../../lib/queries';
import { formatMoneyInput, parseMoney } from '../../../lib/format';

/**
 * Xarajatlar (UI hujjati §7.7): yuqorida kategoriya kartalari (shu oygi
 * yig'indi), o'ngda yangi xarajat formasi, pastda so'nggi xarajatlar.
 * Har xarajat aniq biznesga yoki umumiy (ikkiga taqsimlanadigan) bo'ladi.
 */

interface ExpenseRow {
  id: string;
  workspaceId: string | null; // null = umumiy
  category: string;
  amountUzs: number;
  date: string;
  description: string | null;
}
interface PageData {
  expenses: ExpenseRow[];
}

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'SALARY', label: 'Oylik', icon: '💰' },
  { value: 'GAS', label: 'Gaz', icon: '🔥' },
  { value: 'ELECTRICITY', label: 'Svet', icon: '💡' },
  { value: 'WATER', label: 'Suv', icon: '💧' },
  { value: 'TAX', label: 'Soliq', icon: '🏛' },
  { value: 'EQUIPMENT', label: 'Apparat', icon: '🛠' },
  { value: 'FOOD', label: 'Ovqat', icon: '🍽' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚚' },
  { value: 'OTHER', label: 'Boshqa', icon: '📦' },
];

const catOf = (v: string) =>
  CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[CATEGORIES.length - 1];

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

const mln = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln` : fmt(n);

export default function XarajatlarPage() {
  const { data, loading, error, refetch } = useQuery<PageData>(EXPENSES_PAGE);
  const [createExpense, { loading: saving }] = useMutation(CREATE_EXPENSE);

  const [category, setCategory] = useState('GAS');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Shu oygi yig'indilar — kategoriya bo'yicha
  const monthTotals = useMemo(() => {
    const now = new Date();
    const totals: Record<string, number> = {};
    for (const e of data?.expenses ?? []) {
      const d = new Date(e.date);
      if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      ) {
        totals[e.category] = (totals[e.category] ?? 0) + e.amountUzs;
      }
    }
    return totals;
  }, [data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const amountUzs = parseMoney(amount);
    if (amountUzs <= 0) {
      setMsg({ ok: false, text: 'Summani kiriting.' });
      return;
    }
    try {
      await createExpense({
        variables: {
          input: {
            category,
            amountUzs,
            date: new Date().toISOString(),
            description: description || null,
            isShared,
          },
        },
      });
      setMsg({
        ok: true,
        text: `${catOf(category).label} — ${fmt(amountUzs)} so'm yozildi${isShared ? ' (umumiy, ikki biznesga taqsimlanadi)' : ''}.`,
      });
      setAmount('');
      setDescription('');
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

  const rows = [...(data?.expenses ?? [])].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">Xarajatlar</h1>

      {/* ─── Kategoriya kartalari (shu oy) ─── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-2.5">
        {CATEGORIES.map((c) => (
          <div
            key={c.value}
            className="card rounded-xl px-3 py-2.5"
          >
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <span>{c.icon}</span> {c.label}
            </div>
            <div className="text-sm font-bold tabular-nums mt-0.5">
              {monthTotals[c.value] ? mln(monthTotals[c.value]) : '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ─── So'nggi xarajatlar ─── */}
        <section className="card order-2 lg:order-1">
          <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
            So&apos;nggi xarajatlar
          </h2>
          {rows.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500">
              Hozircha xarajat yo&apos;q.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-50">
              {rows.map((e) => {
                const c = catOf(e.category);
                return (
                  <li key={e.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 grid place-items-center">
                      {c.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {e.description || c.label}
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {new Date(e.date).toLocaleDateString('uz-UZ')} ·{' '}
                        {c.label}
                        {e.workspaceId === null && (
                          <span className="ml-1.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded-full px-1.5 py-0.5">
                            Umumiy
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-red-600">
                      −{fmt(e.amountUzs)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ─── Yangi xarajat formasi ─── */}
        <form
          onSubmit={onSubmit}
          className="card p-5 grid gap-4 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <h2 className="font-semibold text-sm">+ Yangi xarajat</h2>

          <label className="grid gap-1.5">
            <span className="field-label">Kategoriya</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="field-label">Summa (so&apos;m)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(formatMoneyInput(e.target.value))}
              inputMode="numeric"
              placeholder="320 000"
              className="field-input"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="field-label">Izoh (ixtiyoriy)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Svet to'lovi"
              className="field-input"
            />
          </label>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[rgb(var(--brand))]"
            />
            <span>
              <span className="font-medium">Umumiy xarajat</span>
              <span className="block text-xs text-neutral-400">
                Ikkala biznesga tegishli — hisobotda teng taqsimlanadi
              </span>
            </span>
          </label>

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

          <button
            disabled={saving || !(parseMoney(amount) > 0)}
            className="btn-primary"
          >
            {saving ? 'Saqlanmoqda…' : 'Xarajatni yozish'}
          </button>
        </form>
      </div>
    </div>
  );
}
