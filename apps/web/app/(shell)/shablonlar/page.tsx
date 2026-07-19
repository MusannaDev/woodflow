'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { CREATE_TEMPLATE, TEMPLATES_PAGE } from '../../../lib/queries';

/**
 * Mahsulot shablonlari (UI hujjati §8.2): doimiy o'lchamlar (Pol taxta,
 * Rika...) bir marta saqlanadi — ishlab chiqarishda qo'lda yozilmaydi.
 */

interface TemplateRow {
  id: string;
  name: string;
  length: number;
  width: number;
  thickness: number;
  volumePerPiece: number;
}

export default function ShablonlarPage() {
  const { data, loading, error, refetch } =
    useQuery<{ productTemplates: TemplateRow[] }>(TEMPLATES_PAGE);
  const [createTemplate, { loading: saving }] = useMutation(CREATE_TEMPLATE);

  const [name, setName] = useState('');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('0.1');
  const [thickness, setThickness] = useState('0.03');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const T = parseFloat(thickness) || 0;
  const vpp = L * W * T;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createTemplate({
        variables: {
          input: { name: name.trim(), length: L, width: W, thickness: T },
        },
      });
      setMsg({ ok: true, text: `Shablon "${name.trim()}" saqlandi.` });
      setName('');
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

  const templates = data?.productTemplates ?? [];

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-bold">Mahsulot shablonlari</h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ─── Ro'yxat ─── */}
        <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden order-2 lg:order-1">
          {templates.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500">
              Hozircha shablon yo&apos;q — o&apos;ngdan qo&apos;shing.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                    <th className="px-5 py-3 font-semibold">NOMI</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      O&apos;LCHAM (m)
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">
                      HAJM / DONA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className="px-5 py-3.5 font-medium">{t.name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {t.length} × {t.width} × {t.thickness}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                        {t.volumePerPiece.toFixed(4)} m³
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ─── Yangi shablon ─── */}
        <form
          onSubmit={onSubmit}
          className="bg-white border border-neutral-200 rounded-2xl p-5 grid gap-4 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <h2 className="font-semibold text-sm">+ Yangi shablon</h2>
          <label className="grid gap-1.5">
            <span className="field-label">Nomi</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pol taxta 6m"
              className="field-input"
            />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                ['Uzunlik', length, setLength],
                ['En', width, setWidth],
                ['Qalinlik', thickness, setThickness],
              ] as const
            ).map(([lab, val, set]) => (
              <label key={lab} className="grid gap-1.5">
                <span className="field-label text-xs">{lab} (m)</span>
                <input
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  inputMode="decimal"
                  className="field-input !px-2.5"
                />
              </label>
            ))}
          </div>

          <div className="bg-brand-faint border border-brand/15 rounded-xl px-4 py-3 text-sm flex justify-between">
            <span className="text-neutral-500">Bir dona hajmi</span>
            <b className="tabular-nums">
              {vpp > 0 ? vpp.toFixed(4) : '—'} m³
            </b>
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

          <button
            disabled={saving || name.trim().length < 2 || vpp <= 0}
            className="btn-primary"
          >
            {saving ? 'Saqlanmoqda…' : 'Shablonni saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}
