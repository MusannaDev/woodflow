'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { CREATE_CUSTOMER, MIJOZLAR_PAGE } from '../../../lib/queries';

/**
 * Mijozlar (UI hujjati §7.6): kontakt bazasi — ism, telefon, savdo tarixi
 * soni va joriy qarz balansi. Yangi savdoda shu ro'yxatdan tanlanadi.
 */

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  salesCount: number;
  debtUzs: number;
  createdAt: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

export default function MijozlarPage() {
  const { data, loading, error, refetch } =
    useQuery<{ customers: CustomerRow[] }>(MIJOZLAR_PAGE);
  const [createCustomer, { loading: saving }] = useMutation(CREATE_CUSTOMER);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createCustomer({
        variables: { input: { name: name.trim(), phone: phone || null } },
      });
      setMsg({ ok: true, text: `Mijoz "${name.trim()}" qo'shildi.` });
      setName('');
      setPhone('+998');
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

  const customers = data?.customers ?? [];
  const totalDebt = customers.reduce((a, c) => a + c.debtUzs, 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">Mijozlar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ─── Jadval ─── */}
        <section className="card overflow-hidden order-2 lg:order-1">
          <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm">
              Barcha mijozlar ({customers.length})
            </h2>
            {totalDebt > 0 && (
              <span className="text-xs font-medium text-amber-700">
                Jami qarz: {fmt(totalDebt)} so&apos;m
              </span>
            )}
          </div>
          {customers.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500">
              Hozircha mijoz yo&apos;q.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                    <th className="px-5 py-3 font-semibold">MIJOZ</th>
                    <th className="px-5 py-3 font-semibold">TELEFON</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      SAVDOLAR
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">
                      QARZ BALANSI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-brand-faint text-brand grid place-items-center text-xs font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium">{c.name}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {c.phone ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        {c.salesCount}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {c.debtUzs > 0 ? (
                          <span className="text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1 tabular-nums">
                            {fmt(c.debtUzs)} so&apos;m
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1">
                            Qarz yo&apos;q
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ─── Yangi mijoz ─── */}
        <form
          onSubmit={onSubmit}
          className="card p-5 grid gap-4 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <h2 className="font-semibold text-sm">+ Yangi mijoz</h2>
          <label className="grid gap-1.5">
            <span className="field-label">Ism</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alisher Karimov"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Telefon</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="field-input"
            />
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
            disabled={saving || name.trim().length < 2}
            className="btn-primary"
          >
            {saving ? 'Saqlanmoqda…' : "Mijoz qo'shish"}
          </button>
        </form>
      </div>
    </div>
  );
}
