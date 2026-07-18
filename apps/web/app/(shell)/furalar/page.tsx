'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useEffect, useState } from 'react';
import {
  CREATE_SHIPMENT,
  SHIPMENTS_PAGE,
  SHIPMENT_PNL,
} from '../../../lib/queries';

/**
 * Furalar (UI hujjati §7.1): chapda ro'yxat, o'ngda tanlangan furaning
 * to'liq foyda hisobi (P&L). Har fura — alohida foyda markazi.
 */

interface ShipmentRow {
  id: string;
  truckNumber: string;
  truckColor: string | null;
  ownerName: string;
  ownerPhone: string | null;
  arrivalDate: string;
  transportCost: number;
  customsCost: number;
}
interface Pnl {
  shipmentId: string;
  truckNumber: string;
  salesUzs: number;
  soldCostUzs: number;
  transportUzs: number;
  customsUzs: number;
  defectLossUzs: number;
  netProfitUzs: number;
  soldVolumeM3: number;
  defectVolumeM3: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);
const mln = (n: number) =>
  Math.abs(n) >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln` : fmt(n);

const COLOR_DOTS: Record<string, string> = {
  qora: 'bg-neutral-800',
  oq: 'bg-neutral-200 border border-neutral-300',
  "ko'k": 'bg-blue-500',
  kul: 'bg-neutral-400',
  qizil: 'bg-red-500',
  yashil: 'bg-emerald-500',
  sariq: 'bg-amber-400',
};

export default function FuralarPage() {
  const { data, loading, error, refetch } =
    useQuery<{ shipments: ShipmentRow[] }>(SHIPMENTS_PAGE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: pnlData,
    loading: pnlLoading,
  } = useQuery<{ shipmentPnl: Pnl }>(SHIPMENT_PNL, {
    variables: { shipmentId: selectedId ?? '' },
    skip: !selectedId,
  });
  const [createShipment, { loading: saving }] = useMutation(CREATE_SHIPMENT);

  const [showForm, setShowForm] = useState(false);
  const [truckNumber, setTruckNumber] = useState('');
  const [truckColor, setTruckColor] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+998');
  const [transportCost, setTransportCost] = useState('');
  const [customsCost, setCustomsCost] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const shipments = data?.shipments ?? [];

  // Birinchi fura avto-tanlanadi
  useEffect(() => {
    if (!selectedId && shipments.length > 0) {
      setSelectedId(shipments[0].id);
    }
  }, [shipments, selectedId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await createShipment({
        variables: {
          input: {
            truckNumber: truckNumber.trim().toUpperCase(),
            truckColor: truckColor || null,
            ownerName: ownerName.trim(),
            ownerPhone: ownerPhone || null,
            arrivalDate: new Date().toISOString(),
            transportCost: parseFloat(transportCost) || 0,
            customsCost: parseFloat(customsCost) || 0,
          },
        },
      });
      setMsg({
        ok: true,
        text: `Fura ${res.data.createShipment.truckNumber} qo'shildi.`,
      });
      setShowForm(false);
      setTruckNumber('');
      setTruckColor('');
      setOwnerName('');
      setTransportCost('');
      setCustomsCost('');
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

  const pnl = pnlData?.shipmentPnl;
  const selected = shipments.find((s) => s.id === selectedId);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Furalar</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? 'Bekor qilish' : '+ Yangi fura'}
        </button>
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

      {/* ─── Yangi fura formasi ─── */}
      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-white border border-neutral-200 rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-[fadeIn_.3s_ease]"
        >
          <label className="grid gap-1.5">
            <span className="field-label">Fura nomeri</span>
            <input
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
              placeholder="AA777BB"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Rangi</span>
            <input
              value={truckColor}
              onChange={(e) => setTruckColor(e.target.value)}
              placeholder="qora"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Ega ismi</span>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Ravshan"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Ega telefoni</span>
            <input
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              inputMode="tel"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Transport xarajati (so&apos;m)</span>
            <input
              value={transportCost}
              onChange={(e) => setTransportCost(e.target.value)}
              inputMode="numeric"
              placeholder="4 000 000"
              className="field-input"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Bojxona (so&apos;m)</span>
            <input
              value={customsCost}
              onChange={(e) => setCustomsCost(e.target.value)}
              inputMode="numeric"
              placeholder="500 000"
              className="field-input"
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              disabled={saving || !truckNumber.trim() || !ownerName.trim()}
              className="btn-primary sm:max-w-xs"
            >
              {saving ? 'Saqlanmoqda…' : 'Furani saqlash'}
            </button>
          </div>
        </form>
      )}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* ─── Ro'yxat ─── */}
        <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          {shipments.length === 0 ? (
            <p className="px-5 py-8 text-sm text-neutral-500 text-center">
              Hozircha fura yo&apos;q — «+ Yangi fura» bilan qo&apos;shing.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-50">
              {shipments.map((s) => {
                const active = s.id === selectedId;
                const dot =
                  COLOR_DOTS[(s.truckColor ?? '').toLowerCase()] ??
                  'bg-neutral-300';
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors ${
                        active ? 'bg-brand-faint' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${dot}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold tracking-wide">
                          {s.truckNumber}
                          {s.truckColor && (
                            <span className="ml-2 text-xs font-normal text-neutral-400">
                              {s.truckColor}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-neutral-500">
                          {s.ownerName}
                          {s.ownerPhone ? ` · ${s.ownerPhone}` : ''}
                        </span>
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(s.arrivalDate).toLocaleDateString('uz-UZ')}
                      </span>
                      {active && <span className="text-brand">→</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ─── P&L panel ─── */}
        <aside className="bg-white border border-neutral-200 rounded-2xl p-5 lg:sticky lg:top-20">
          {!selected ? (
            <p className="text-sm text-neutral-500">Fura tanlang.</p>
          ) : pnlLoading || !pnl ? (
            <p className="text-sm text-neutral-500">P&L hisoblanmoqda…</p>
          ) : (
            <div className="grid gap-4">
              <div>
                <h2 className="font-bold">
                  Fura {pnl.truckNumber}
                  {selected.truckColor && (
                    <span className="ml-2 text-sm font-normal text-neutral-400">
                      · {selected.truckColor}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ega: {selected.ownerName}
                  {selected.ownerPhone ? ` · ${selected.ownerPhone}` : ''}
                </p>
              </div>

              <div>
                <h3 className="text-[11px] tracking-wider font-bold text-brand">
                  FOYDA HISOBI (P&L)
                </h3>
                <dl className="grid gap-2 mt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">
                      Sotilgan yog&apos;och ({pnl.soldVolumeM3.toFixed(1)} m³)
                    </dt>
                    <dd className="font-semibold tabular-nums text-emerald-600">
                      +{mln(pnl.salesUzs)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Yog&apos;och tannarxi</dt>
                    <dd className="font-semibold tabular-nums text-red-600">
                      −{mln(pnl.soldCostUzs)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Transport</dt>
                    <dd className="font-semibold tabular-nums text-red-600">
                      −{mln(pnl.transportUzs)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Bojxona</dt>
                    <dd className="font-semibold tabular-nums text-red-600">
                      −{mln(pnl.customsUzs)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-2.5">
                    <dt className="text-neutral-500">
                      Nuqson zarari ({pnl.defectVolumeM3.toFixed(1)} m³)
                    </dt>
                    <dd className="font-semibold tabular-nums text-red-600">
                      −{mln(pnl.defectLossUzs)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div
                className={`rounded-xl p-4 border ${
                  pnl.netProfitUzs >= 0
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="text-[11px] tracking-wider font-semibold text-neutral-500">
                  SOF FOYDA
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums mt-0.5 ${
                    pnl.netProfitUzs >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {pnl.netProfitUzs >= 0 ? '+' : '−'}
                  {mln(Math.abs(pnl.netProfitUzs))}{' '}
                  <span className="text-sm font-medium text-neutral-400">
                    so&apos;m
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Sof foyda = sotilgan savdo − sotilgan hajm tannarxi − transport
                − bojxona − nuqson zarari. Sotilmagan yog&apos;och hali xarajat
                emas — u ombor aktivi.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
