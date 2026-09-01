'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import {
  CONFIRM_SALARY,
  ISHCHILAR_PAGE,
  MY_SALARIES,
  PAY_SALARY,
  SALARY_HISTORY,
} from '../../../lib/queries';
import { session } from '../../../lib/session';
import { dateFmt, fmt, formatMoneyInput, parseMoney } from '../../../lib/format';
import { useEnumLabel, useI18n } from '../../../lib/i18n';

/**
 * Oylik sahifasi — rolga qarab:
 *  OWNER  → oylik to'lash + tarix (ishchi tasdig'i holati bilan).
 *  WORKER → o'z oyliklari + "Qabul qildim" tasdig'i.
 */

interface SalaryRow {
  id: string;
  employeeName: string | null;
  amountUzs: number;
  period: string;
  date: string;
  status: string;
  confirmedAt: string | null;
}
interface EmpRow {
  id: string;
  name: string;
  salaryAmount: number;
}

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const STATUS_CLS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
};

export default function OylikPage() {
  const isWorker = session.currentWorkspace()?.role === 'WORKER';
  return isWorker ? <WorkerSalary /> : <OwnerSalary />;
}

/* ───────────────────────── OWNER ───────────────────────── */

function OwnerSalary() {
  const { t, ts } = useI18n();
  const label = useEnumLabel();
  const emps = useQuery<{ employees: EmpRow[] }>(ISHCHILAR_PAGE);
  const hist = useQuery<{ salaryHistory: SalaryRow[] }>(SALARY_HISTORY);
  const [paySalary, { loading: paying }] = useMutation(PAY_SALARY);

  const [empId, setEmpId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(currentPeriod());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const amountUzs = parseMoney(amount);
    if (!empId) return setMsg({ ok: false, text: t('sal.needEmployee') });
    if (amountUzs <= 0) return setMsg({ ok: false, text: t('sal.needAmount') });
    try {
      await paySalary({
        variables: { input: { employeeId: empId, amountUzs, period } },
      });
      setMsg({ ok: true, text: t('sal.paid', { period }) });
      setAmount('');
      await hist.refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: ts(err instanceof Error ? err.message : null),
      });
    }
  }

  const employees = emps.data?.employees ?? [];
  const rows = hist.data?.salaryHistory ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">{t('sal.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('sal.sub')}</p>
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

      {/* To'lash formasi */}
      <form
        onSubmit={onPay}
        className="card p-5 grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-3 items-end"
      >
        <label className="grid gap-1.5">
          <span className="field-label text-xs">{t('sal.employee')}</span>
          <select
            value={empId}
            onChange={(e) => {
              setEmpId(e.target.value);
              const emp = employees.find((x) => x.id === e.target.value);
              if (emp) setAmount(formatMoneyInput(String(emp.salaryAmount)));
            }}
            className="field-input !py-2"
          >
            <option value="">{t('sal.pickEmployee')}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label text-xs">{t('sal.amount')}</span>
          <input
            value={amount}
            onChange={(e) => setAmount(formatMoneyInput(e.target.value))}
            inputMode="numeric"
            className="field-input !py-2"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="field-label text-xs">{t('sal.period')}</span>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="field-input !py-2"
          />
        </label>
        <button
          disabled={paying}
          className="rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {paying ? t('sal.paying') : t('sal.pay')}
        </button>
      </form>

      {/* Tarix */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('sal.history', { n: rows.length })}
        </h2>
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            {t('sal.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">
                    {t('sal.col.employee')}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t('sal.col.period')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('sal.col.amount')}
                  </th>
                  <th className="px-5 py-3 font-semibold">{t('sal.col.date')}</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('sal.col.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {rows.map((r) => {
                  const cls = STATUS_CLS[r.status] ?? STATUS_CLS.PENDING;
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium">
                        {r.employeeName ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{r.period}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">
                        {fmt(r.amountUzs)}
                      </td>
                      <td className="px-5 py-3 text-neutral-500">
                        {dateFmt(r.date)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${cls}`}
                        >
                          {label('salStatus', r.status)}
                        </span>
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

/* ───────────────────────── WORKER ───────────────────────── */

function WorkerSalary() {
  const { t } = useI18n();
  const label = useEnumLabel();
  const { data, loading, refetch } = useQuery<{ mySalaries: SalaryRow[] }>(
    MY_SALARIES,
  );
  const [confirmSalary, { loading: confirming }] = useMutation(CONFIRM_SALARY);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onConfirm(id: string) {
    setBusyId(id);
    setMsg(null);
    try {
      await confirmSalary({ variables: { paymentId: id } });
      setMsg(t('sal.confirmed'));
      await refetch();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setBusyId(null);
    }
  }

  const rows = data?.mySalaries ?? [];
  const pending = rows.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">{t('sal.myTitle')}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {t('sal.mySub')}
          {pending > 0 && (
            <span className="ml-1 text-amber-600 font-medium">
              {t('sal.pendingCount', { n: pending })}
            </span>
          )}
        </p>
      </div>

      {msg && (
        <p className="text-sm rounded-lg px-3.5 py-2.5 border text-emerald-700 bg-emerald-50 border-emerald-100">
          {msg}
        </p>
      )}

      <section className="card overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            {t('common.loading')}
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            {t('sal.myEmpty')}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {rows.map((r) => {
              const cls = STATUS_CLS[r.status] ?? STATUS_CLS.PENDING;
              return (
                <li key={r.id} className="px-5 py-4 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold tabular-nums">
                      {fmt(r.amountUzs)} {t('common.som')}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {r.period} · {dateFmt(r.date)}
                    </span>
                  </span>
                  {r.status === 'PENDING' ? (
                    <button
                      disabled={confirming && busyId === r.id}
                      onClick={() => onConfirm(r.id)}
                      className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex-none"
                    >
                      {confirming && busyId === r.id
                        ? t('sal.confirming')
                        : t('sal.confirm')}
                    </button>
                  ) : (
                    <span
                      className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${cls}`}
                    >
                      {label('salStatus', r.status)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
