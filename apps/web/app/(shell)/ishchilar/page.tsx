'use client';

import { useMutation, useQuery } from '@apollo/client';
import { Fragment, FormEvent, useState } from 'react';
import {
  CREATE_EMPLOYEE,
  ISHCHILAR_PAGE,
  PAY_SALARY,
} from '../../../lib/queries';

/**
 * Ishchilar (UI hujjati §7.8): ism, telefon, lavozim, oylik turi.
 * "Oylik to'lash" — to'lov avtomatik "Oylik" (SALARY) xarajatiga tushadi.
 * Umumiy ishchi (ikkala biznes) — xarajati ham umumiy bo'ladi.
 */

interface EmployeeRow {
  id: string;
  workspaceId: string | null; // null = ikkala biznes
  name: string;
  phone: string | null;
  position: string | null;
  salaryAmount: number;
  salaryType: 'MONTHLY' | 'DAILY' | 'PER_PIECE';
  createdAt: string;
}

const SALARY_TYPES = [
  { value: 'MONTHLY', label: 'Oylik' },
  { value: 'DAILY', label: 'Kunlik' },
  { value: 'PER_PIECE', label: 'Ishbay' },
] as const;

const typeLabel = (v: string) =>
  SALARY_TYPES.find((t) => t.value === v)?.label ?? v;

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function IshchilarPage() {
  const { data, loading, error, refetch } =
    useQuery<{ employees: EmployeeRow[] }>(ISHCHILAR_PAGE);
  const [createEmployee, { loading: creating }] = useMutation(CREATE_EMPLOYEE);
  const [paySalary, { loading: paying }] = useMutation(PAY_SALARY);

  // Yangi ishchi formasi
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [position, setPosition] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryType, setSalaryType] =
    useState<(typeof SALARY_TYPES)[number]['value']>('MONTHLY');
  const [isShared, setIsShared] = useState(false);

  // Oylik to'lash formasi (qator ostида)
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState(currentPeriod());

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createEmployee({
        variables: {
          input: {
            name: name.trim(),
            phone: phone || null,
            position: position || null,
            salaryAmount: parseFloat(salaryAmount) || 0,
            salaryType,
            isShared,
          },
        },
      });
      setMsg({ ok: true, text: `Ishchi "${name.trim()}" qo'shildi.` });
      setName('');
      setPosition('');
      setSalaryAmount('');
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    }
  }

  async function onPay(e: FormEvent, emp: EmployeeRow) {
    e.preventDefault();
    setMsg(null);
    const amountUzs = parseFloat(payAmount) || 0;
    if (amountUzs <= 0) {
      setMsg({ ok: false, text: 'Summani kiriting.' });
      return;
    }
    try {
      await paySalary({
        variables: {
          input: { employeeId: emp.id, amountUzs, period: payPeriod },
        },
      });
      setMsg({
        ok: true,
        text: `${emp.name}ga ${fmt(amountUzs)} so'm oylik to'landi (${payPeriod}) — avtomatik "Oylik" xarajatiga yozildi.`,
      });
      setPayId(null);
      setPayAmount('');
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

  const employees = data?.employees ?? [];

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-bold">Ishchilar</h1>

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

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ─── Ro'yxat ─── */}
        <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden order-2 lg:order-1">
          {employees.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500">
              Hozircha ishchi yo&apos;q.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                    <th className="px-5 py-3 font-semibold">ISHCHI</th>
                    <th className="px-5 py-3 font-semibold">LAVOZIM</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      MAOSH
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">AMAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {employees.map((emp) => {
                    const isOpen = payId === emp.id;
                    return (
                      <Fragment key={emp.id}>
                        <tr>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-brand-faint text-brand grid place-items-center text-xs font-bold">
                                {emp.name.charAt(0).toUpperCase()}
                              </span>
                              <span>
                                <span className="font-medium flex items-center gap-2">
                                  {emp.name}
                                  {emp.workspaceId === null && (
                                    <span className="text-[10px] font-medium bg-blue-50 text-blue-600 rounded-full px-1.5 py-0.5">
                                      Umumiy
                                    </span>
                                  )}
                                </span>
                                <span className="block text-xs text-neutral-400">
                                  {emp.phone ?? '—'}
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-neutral-600">
                            {emp.position ?? '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="tabular-nums font-semibold">
                              {fmt(emp.salaryAmount)}
                            </span>
                            <span className="block text-[11px] text-neutral-400">
                              {typeLabel(emp.salaryType)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setPayId(isOpen ? null : emp.id);
                                setPayAmount(String(emp.salaryAmount || ''));
                                setPayPeriod(currentPeriod());
                                setMsg(null);
                              }}
                              className={`text-xs font-semibold rounded-lg px-3.5 py-2 border transition-colors ${
                                isOpen
                                  ? 'border-neutral-300 text-neutral-500'
                                  : 'border-brand bg-brand text-white hover:opacity-90'
                              }`}
                            >
                              {isOpen ? 'Bekor qilish' : "Oylik to'lash"}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className="bg-brand-faint/60">
                            <td colSpan={4} className="px-5 py-4">
                              <form
                                onSubmit={(e) => onPay(e, emp)}
                                className="flex flex-wrap items-end gap-3"
                              >
                                <label className="grid gap-1.5">
                                  <span className="field-label text-xs">
                                    Summa (so&apos;m)
                                  </span>
                                  <input
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    inputMode="numeric"
                                    className="field-input !py-2 w-40"
                                    autoFocus
                                  />
                                </label>
                                <label className="grid gap-1.5">
                                  <span className="field-label text-xs">
                                    Davr (YYYY-MM)
                                  </span>
                                  <input
                                    value={payPeriod}
                                    onChange={(e) => setPayPeriod(e.target.value)}
                                    className="field-input !py-2 w-32"
                                  />
                                </label>
                                <button
                                  disabled={paying}
                                  className="rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                                >
                                  {paying ? 'To‘lanmoqda…' : "To'lash"}
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
          )}
        </section>

        {/* ─── Yangi ishchi ─── */}
        <form
          onSubmit={onCreate}
          className="bg-white border border-neutral-200 rounded-2xl p-5 grid gap-4 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <h2 className="font-semibold text-sm">+ Yangi ishchi</h2>
          <label className="grid gap-1.5">
            <span className="field-label">Ism</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Akmal"
              className="field-input"
            />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="grid gap-1.5">
              <span className="field-label">Telefon</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Lavozim</span>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Omborchi"
                className="field-input"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="grid gap-1.5">
              <span className="field-label">Maosh (so&apos;m)</span>
              <input
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                inputMode="numeric"
                placeholder="1 500 000"
                className="field-input"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Turi</span>
              <select
                value={salaryType}
                onChange={(e) =>
                  setSalaryType(e.target.value as typeof salaryType)
                }
                className="field-input"
              >
                {SALARY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[rgb(var(--brand))]"
            />
            <span>
              <span className="font-medium">Ikkala biznesda ishlaydi</span>
              <span className="block text-xs text-neutral-400">
                Oyligi umumiy xarajat bo&apos;lib taqsimlanadi
              </span>
            </span>
          </label>

          <button
            disabled={
              creating ||
              name.trim().length < 2 ||
              !(parseFloat(salaryAmount) > 0)
            }
            className="btn-primary"
          >
            {creating ? 'Saqlanmoqda…' : "Ishchi qo'shish"}
          </button>
        </form>
      </div>
    </div>
  );
}
