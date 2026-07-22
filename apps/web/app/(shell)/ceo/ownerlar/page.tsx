'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  CREATE_OWNER,
  DELETE_OWNER,
  GRANT_FREE_ACCESS,
  OWNERS,
  UPDATE_OWNER,
} from '../../../../lib/queries';
import {
  billingBadge,
  KIND,
  KIND_OPTIONS,
  OwnerRow,
  STATUS,
  uzDate,
} from '../../../../lib/ceo';

export default function OwnerlarPage() {
  const { data, loading, refetch } = useQuery<{ owners: OwnerRow[] }>(OWNERS);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    businessName: '',
    kind: 'BOTH',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [createOwner, { loading: saving }] = useMutation(CREATE_OWNER);

  function ok(text: string) {
    setMsg({ ok: true, text });
    refetch();
  }
  function err(text: string) {
    setMsg({ ok: false, text });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password || !form.businessName) {
      return err('Barcha maydonlarni to‘ldiring.');
    }
    try {
      const { data: d } = await createOwner({ variables: { input: form } });
      ok(`"${d.createOwner.businessName}" yaratildi — owner darhol kira oladi.`);
      setForm({ name: '', phone: '', password: '', businessName: '', kind: 'BOTH' });
      setOpen(false);
    } catch (e2) {
      err(e2 instanceof Error ? e2.message : 'Xato yuz berdi.');
    }
  }

  const rows = data?.owners ?? [];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">👑 Ownerlar</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Biznes egalari — qo&apos;shish, tahrirlash, obuna va o&apos;chirish.
        </p>
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

      <section className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-3">
          <h2 className="font-semibold text-sm flex-1">
            Ownerlar ({rows.length})
          </h2>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              open
                ? 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                : 'bg-[#1c130a] text-white hover:opacity-90'
            }`}
          >
            {open ? 'Bekor qilish' : '+ Owner qo‘shish'}
          </button>
        </div>

        {open && (
          <form
            onSubmit={submit}
            className="px-5 py-4 border-b border-neutral-100 bg-amber-50/40 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {[
              ['name', 'Owner ismi', 'Ism Familiya', 'text'],
              ['phone', 'Telefon (login)', '+998 90 123 45 67', 'tel'],
              ['password', 'Boshlang‘ich parol', 'kamida 4 belgi', 'text'],
              ['businessName', 'Biznes nomi', 'Masalan: Adam Yog‘och', 'text'],
            ].map(([key, label, ph, mode]) => (
              <label key={key} className="grid gap-1.5">
                <span className="field-label text-xs">{label}</span>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  inputMode={mode === 'tel' ? 'tel' : undefined}
                  placeholder={ph}
                  className="field-input !py-2"
                />
              </label>
            ))}
            <div className="sm:col-span-2 grid gap-1.5">
              <span className="field-label text-xs">Biznes turi</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {KIND_OPTIONS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setForm({ ...form, kind: k.value })}
                    className={`rounded-xl border-2 px-3 py-2 text-left transition-all ${
                      form.kind === k.value
                        ? 'border-brand bg-brand-faint'
                        : 'border-neutral-200 bg-white hover:border-brand/40'
                    }`}
                  >
                    <span className="block font-semibold text-sm">{k.label}</span>
                    <span className="block text-[11px] text-neutral-500">
                      {k.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                disabled={saving}
                className="rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {saving ? 'Yaratilmoqda…' : 'Owner yaratish'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Yuklanmoqda…
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            Hali owner yo‘q.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {rows.map((o) =>
              editId === o.businessId ? (
                <li key={o.businessId} className="bg-amber-50/40">
                  <EditOwnerForm
                    owner={o}
                    onDone={(t) => {
                      setEditId(null);
                      ok(t);
                    }}
                    onCancel={() => setEditId(null)}
                    onError={err}
                  />
                </li>
              ) : (
                <OwnerRowItem
                  key={o.businessId}
                  o={o}
                  confirming={confirmId === o.businessId}
                  onEdit={() => {
                    setConfirmId(null);
                    setEditId(o.businessId);
                  }}
                  onAskDelete={() => setConfirmId(o.businessId)}
                  onCancelDelete={() => setConfirmId(null)}
                  onDeleted={(t) => {
                    setConfirmId(null);
                    ok(t);
                  }}
                  onGranted={ok}
                  onError={err}
                />
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function OwnerRowItem({
  o,
  confirming,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDeleted,
  onGranted,
  onError,
}: {
  o: OwnerRow;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDeleted: (t: string) => void;
  onGranted: (t: string) => void;
  onError: (t: string) => void;
}) {
  const st = STATUS[o.status] ?? STATUS.PENDING;
  const billing = billingBadge(o);
  const [deleteOwner, { loading: deleting }] = useMutation(DELETE_OWNER);
  const [grant, { loading: granting }] = useMutation(GRANT_FREE_ACCESS);

  async function doDelete() {
    try {
      await deleteOwner({ variables: { businessId: o.businessId } });
      onDeleted(`"${o.businessName}" va barcha ma’lumoti o‘chirildi.`);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'O‘chirishda xato.');
    }
  }
  async function toggleAccess() {
    try {
      await grant({
        variables: {
          input: { businessId: o.businessId, freeAccess: !o.freeAccess },
        },
      });
      onGranted(
        !o.freeAccess
          ? `"${o.businessName}" — tekin ruxsat berildi.`
          : `"${o.businessName}" — tekin ruxsat olib tashlandi.`,
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Xato yuz berdi.');
    }
  }

  return (
    <li className="px-5 py-4 flex items-center gap-3">
      <Link
        href={`/ceo/ownerlar/${o.businessId}`}
        className="flex items-center gap-3 flex-1 min-w-0 group"
      >
        <span className="w-10 h-10 rounded-xl bg-brand-faint text-brand grid place-items-center font-bold flex-none">
          {o.businessName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold truncate group-hover:text-brand transition-colors">
            {o.businessName}
          </span>
          <span className="block text-xs text-neutral-500 truncate">
            {o.name} · {o.phone} · {uzDate(o.createdAt)}
          </span>
        </span>
      </Link>

      {confirming ? (
        <div className="flex items-center gap-2 flex-none">
          <span className="hidden md:block text-xs text-red-600 font-medium">
            Barcha ma’lumot yo‘qoladi!
          </span>
          <button
            disabled={deleting}
            onClick={doDelete}
            className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90 disabled:opacity-40"
          >
            {deleting ? 'O‘chirilmoqda…' : 'Ha, o‘chir'}
          </button>
          <button
            onClick={onCancelDelete}
            className="rounded-lg border border-neutral-200 text-neutral-500 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
          >
            Yo‘q
          </button>
        </div>
      ) : (
        <>
          {billing && (
            <span
              className={`hidden md:inline-block text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${billing.cls}`}
            >
              {billing.label}
            </span>
          )}
          <span
            className={`hidden lg:inline-block text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${
              (KIND[o.kind] ?? KIND.BOTH).cls
            }`}
          >
            {(KIND[o.kind] ?? KIND.BOTH).label}
          </span>
          <span
            className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${st.cls}`}
          >
            {st.label}
          </span>
          <div className="flex items-center gap-1 flex-none">
            <button
              onClick={toggleAccess}
              disabled={granting}
              title={o.freeAccess ? 'Tekin ruxsatni olib tashlash' : 'Tekin ruxsat berish'}
              className={`w-8 h-8 grid place-items-center rounded-lg border transition-colors disabled:opacity-40 ${
                o.freeAccess
                  ? 'border-blue-300 text-blue-600 bg-blue-50'
                  : 'border-neutral-200 text-neutral-500 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              🎁
            </button>
            <button
              onClick={onEdit}
              title="Tahrirlash"
              className="w-8 h-8 grid place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              ✎
            </button>
            <button
              onClick={onAskDelete}
              title="O‘chirish"
              className="w-8 h-8 grid place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              🗑
            </button>
          </div>
        </>
      )}
    </li>
  );
}

function EditOwnerForm({
  owner,
  onDone,
  onCancel,
  onError,
}: {
  owner: OwnerRow;
  onDone: (t: string) => void;
  onCancel: () => void;
  onError: (t: string) => void;
}) {
  const [form, setForm] = useState({
    name: owner.name,
    phone: owner.phone,
    businessName: owner.businessName,
    newPassword: '',
  });
  const [updateOwner, { loading: saving }] = useMutation(UPDATE_OWNER);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.businessName) {
      return onError('Ism, telefon va biznes nomi bo‘sh bo‘lmasin.');
    }
    try {
      await updateOwner({
        variables: {
          input: {
            businessId: owner.businessId,
            name: form.name,
            phone: form.phone,
            businessName: form.businessName,
            newPassword: form.newPassword || null,
          },
        },
      });
      onDone(`"${form.businessName}" yangilandi.`);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Yangilashda xato.');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {[
        ['name', 'Owner ismi'],
        ['phone', 'Telefon (login)'],
        ['businessName', 'Biznes nomi'],
        ['newPassword', 'Yangi parol (bo‘sh = o‘zgarmaydi)'],
      ].map(([key, label]) => (
        <label key={key} className="grid gap-1.5">
          <span className="field-label text-xs">{label}</span>
          <input
            value={(form as Record<string, string>)[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={key === 'newPassword' ? '•••• (ixtiyoriy)' : ''}
            className="field-input !py-2"
          />
        </label>
      ))}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-neutral-200 text-neutral-500 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50"
        >
          Bekor
        </button>
        <button
          disabled={saving}
          className="rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
        >
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}
