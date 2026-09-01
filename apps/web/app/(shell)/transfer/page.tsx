'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CREATE_TRANSFER, TRANSFERS_PAGE } from '../../../lib/queries';
import {
  dateFmt,
  formatMoneyInput,
  parseDecimal,
  parseMoney,
  parseQty,
} from '../../../lib/format';
import { useI18n } from '../../../lib/i18n';
import { session, WorkspaceBrief } from '../../../lib/session';

/**
 * Ichki transfer (UI hujjati §8.4): yog'ochni 1-biznesdan 2-biznesga
 * "ichki narxda sotish". 1-biznesga daromad, 2-biznesga xarajat — pul
 * ikki marta sanalmaydi. Yuborish — Yog'och tomonda, qabul — Taxtada.
 */

interface TransferRow {
  id: string;
  fromWorkspaceId: string;
  toWorkspaceId: string;
  lotId: string;
  volumeM3: number;
  quantity: number | null;
  internalPriceUzs: number;
  date: string;
}
interface LotRow {
  id: string;
  woodType: string;
  grade: string;
  source: string;
  volumeM3Remaining: number;
  quantityRemaining: number | null;
}
interface PageData {
  transfers: TransferRow[];
  inventory: LotRow[];
}

export default function TransferPage() {
  const { t, ts, locale } = useI18n();
  const fmt = (n: number, d = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(n);

  const { data, loading, error, refetch } = useQuery<PageData>(TRANSFERS_PAGE);
  const [createTransfer, { loading: saving }] = useMutation(CREATE_TRANSFER);

  const [ws, setWs] = useState<WorkspaceBrief | null>(null);
  const [other, setOther] = useState<WorkspaceBrief | null>(null);
  useEffect(() => {
    const current = session.currentWorkspace();
    setWs(current);
    setOther(
      session.workspaces().find((w) => w.id !== current?.id) ?? null,
    );
  }, []);

  const [lotId, setLotId] = useState('');
  const [volume, setVolume] = useState('');
  const [pieces, setPieces] = useState('');
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const lots = useMemo(
    () => (data?.inventory ?? []).filter((l) => l.volumeM3Remaining > 0),
    [data],
  );
  const lot = lots.find((l) => l.id === lotId) ?? null;
  const vol = parseDecimal(volume);
  const priceNum = parseMoney(price);
  const exceeds = lot !== null && vol > lot.volumeM3Remaining;
  const piecesNum = parseQty(pieces);
  const exceedsPieces =
    lot?.quantityRemaining != null && piecesNum > lot.quantityRemaining;
  const isWood = ws?.type === 'WOOD_TRADING';
  const canSend = isWood && ws?.role === 'OWNER'; // yuborish faqat egaga

  const wsName = (id: string) =>
    session.workspaces().find((w) => w.id === id)?.name ?? '—';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!other) return;
    try {
      await createTransfer({
        variables: {
          input: {
            toWorkspaceId: other.id,
            lotId,
            volumeM3: vol,
            quantity:
              lot?.quantityRemaining != null && piecesNum > 0 ? piecesNum : null,
            internalPriceUzs: priceNum,
          },
        },
      });
      setMsg({
        ok: true,
        text: t('tr.done', {
          vol,
          ws: other.name,
          amount: fmt(priceNum),
        }),
      });
      setVolume('');
      setPieces('');
      setPrice('');
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: ts(err instanceof Error ? err.message : null),
      });
    }
  }

  if (loading || !ws)
    return <p className="text-neutral-500">{t('common.loading')}</p>;
  if (error)
    return (
      <p className="text-red-600 text-sm">
        {t('common.errorPrefix', { msg: ts(error.message) })}
      </p>
    );

  const transfers = data?.transfers ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-xl font-bold">{t('tr.title')}</h1>

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

      {canSend ? (
        /* ─── YOG'OCH (egasi): yuborish formasi ─── */
        <form
          onSubmit={onSubmit}
          className="card p-5 md:p-6 grid gap-5 max-w-2xl"
        >
          <h2 className="font-semibold text-sm">
            {t('tr.sendTo')}{' '}
            <span className="text-emerald-700">{other?.name}</span>
          </h2>

          <label className="grid gap-1.5">
            <span className="field-label">{t('tr.fromLot')}</span>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="field-input"
            >
              <option value="">{t('tr.pickLot')}</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {t('tr.lotOption', {
                    wood: l.woodType,
                    grade: l.grade,
                    vol: fmt(l.volumeM3Remaining, 1),
                  })}
                  {l.quantityRemaining != null
                    ? ` · ${fmt(l.quantityRemaining)} ${t('common.pcs')}`
                    : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5">
              <span className="field-label">{t('tr.volume')}</span>
              <input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                inputMode="decimal"
                placeholder="10"
                className="field-input"
              />
            </label>
            {lot?.quantityRemaining != null && (
              <label className="grid gap-1.5">
                <span className="field-label">
                  {t('tr.pieces', { max: fmt(lot.quantityRemaining) })}
                </span>
                <input
                  value={pieces}
                  onChange={(e) => setPieces(formatMoneyInput(e.target.value))}
                  inputMode="numeric"
                  placeholder="500"
                  className="field-input"
                />
              </label>
            )}
            <label className="grid gap-1.5">
              <span className="field-label">{t('tr.internalPrice')}</span>
              <input
                value={price}
                onChange={(e) => setPrice(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder="13 050 000"
                className="field-input"
              />
            </label>
          </div>

          {vol > 0 && priceNum > 0 && (
            <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
              {t('tr.unitCostHint', { value: fmt(priceNum / vol) })}
            </p>
          )}
          {exceeds && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {t('tr.exceeds', {
                vol: lot ? fmt(lot.volumeM3Remaining, 1) : 0,
              })}
            </p>
          )}

          <button
            disabled={!lotId || vol <= 0 || priceNum <= 0 || exceeds || exceedsPieces || saving}
            className="btn-primary sm:max-w-xs"
          >
            {saving ? t('tr.sending') : t('tr.submit')}
          </button>
        </form>
      ) : (
        /* ─── Ishchi yoki Taxta: faqat tarix ─── */
        <p className="text-sm text-neutral-500 card px-5 py-4 max-w-2xl">
          {isWood ? t('tr.ownerOnly') : t('tr.receiverNote')}
        </p>
      )}

      {/* ─── Transferlar tarixi ─── */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          {t('tr.history')}
        </h2>
        {transfers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">{t('tr.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 font-semibold">{t('tr.col.date')}</th>
                  <th className="px-5 py-3 font-semibold">
                    {t('tr.col.direction')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('tr.col.volume')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('tr.col.pieces')}
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    {t('tr.col.price')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {transfers.map((row) => {
                  const outgoing = row.fromWorkspaceId === ws.id;
                  return (
                    <tr key={row.id}>
                      <td className="px-5 py-3.5 text-neutral-500">
                        {dateFmt(row.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 mr-2 ${
                            outgoing
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {outgoing ? t('tr.out') : t('tr.in')}
                        </span>
                        <span className="text-neutral-600">
                          {wsName(row.fromWorkspaceId)} →{' '}
                          {wsName(row.toWorkspaceId)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold">
                        {fmt(row.volumeM3, 1)} m³
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-neutral-600">
                        {row.quantity != null ? fmt(row.quantity) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        {fmt(row.internalPriceUzs)}
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
