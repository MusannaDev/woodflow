'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { CREATE_TEMPLATE, TEMPLATES_PAGE } from '../../../lib/queries';
import { parseDecimal } from '../../../lib/format';
import { useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';

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
  const { t, ts } = useI18n();
  const { data, loading, error, refetch } =
    useQuery<{ productTemplates: TemplateRow[] }>(TEMPLATES_PAGE);
  const [createTemplate, { loading: saving }] = useMutation(CREATE_TEMPLATE);

  const [name, setName] = useState('');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('0.1');
  const [thickness, setThickness] = useState('0.03');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const L = parseDecimal(length);
  const W = parseDecimal(width);
  const T = parseDecimal(thickness);
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
      setMsg({ ok: true, text: t('tpl.saved', { name: name.trim() }) });
      setName('');
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

  const templates = data?.productTemplates ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">{t('tpl.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ─── Ro'yxat ─── */}
        <section className="card overflow-hidden order-2 lg:order-1">
          {templates.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500">
              {t('tpl.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                    <th className="px-5 py-3 font-semibold">
                      {t('tpl.col.name')}
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">
                      {t('tpl.col.size')}
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">
                      {t('tpl.col.volume')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {templates.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-3.5 font-medium">{row.name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {row.length} × {row.width} × {row.thickness}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                        {row.volumePerPiece.toFixed(4)} m³
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
          className="card p-5 grid gap-4 order-1 lg:order-2 lg:sticky lg:top-20"
        >
          <h2 className="font-semibold text-sm">{t('tpl.new')}</h2>
          <label className="grid gap-1.5">
            <span className="field-label">{t('common.name')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('tpl.namePh')}
              className="field-input"
            />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                ['term.length', length, setLength],
                ['term.width', width, setWidth],
                ['term.thickness', thickness, setThickness],
              ] as [MsgKey, string, (v: string) => void][]
            ).map(([lab, val, set]) => (
              <label key={lab} className="grid gap-1.5">
                <span className="field-label text-xs">
                  {t('tpl.unit', { label: t(lab) })}
                </span>
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
            <span className="text-neutral-500">{t('tpl.perPiece')}</span>
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
            {saving ? t('common.saving') : t('tpl.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
