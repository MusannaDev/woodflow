'use client';

import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useRef, useState } from 'react';
import { MY_BUSINESS, UPDATE_BUSINESS } from '../../../lib/queries';
import { API_BASE, session } from '../../../lib/session';

/**
 * Sozlamalar (faqat biznes egasi): biznes nomi + logo yuklash.
 * Logo REST orqali yuklanadi (POST /upload/logo, multipart).
 */

interface BusinessData {
  myBusiness: {
    id: string;
    name: string;
    logoUrl: string | null;
    status: string;
  };
}

export default function SozlamalarPage() {
  const { data, loading, error, refetch } =
    useQuery<BusinessData>(MY_BUSINESS);
  const [updateBusiness, { loading: saving }] = useMutation(UPDATE_BUSINESS);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const biz = data?.myBusiness;
  const displayName = name ?? biz?.name ?? '';

  /** Sessiyadagi biznesni yangilab, sidebar darhol yangi nom/logo ko'rsatsin. */
  function syncSession(patch: Partial<{ name: string; logoUrl: string }>) {
    const current = session.business();
    if (current) {
      localStorage.setItem(
        'wf_business',
        JSON.stringify({ ...current, ...patch }),
      );
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await updateBusiness({
        variables: { input: { name: displayName.trim() } },
      });
      syncSession({ name: res.data.updateBusiness.name });
      setMsg({ ok: true, text: 'Biznes nomi saqlandi. Sahifa yangilanganda menyuda ko‘rinadi.' });
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Xato yuz berdi.',
      });
    }
  }

  async function uploadLogo(file: File) {
    setMsg(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/upload/logo`, {
        method: 'POST',
        headers: { authorization: `Bearer ${session.token()}` },
        body: form,
      });
      if (!res.ok) {
        throw new Error('Yuklashda xato — rasm (png/jpg/webp, maks 2MB) tanlang.');
      }
      const json = (await res.json()) as { logoUrl: string };
      syncSession({ logoUrl: json.logoUrl });
      setMsg({ ok: true, text: 'Logo yuklandi. Sahifa yangilanganda menyuda ko‘rinadi.' });
      await refetch();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Yuklashda xato.',
      });
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-lg">
        {error.graphQLErrors[0]?.message ?? error.message}
      </p>
    );

  return (
    <div className="grid gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Sozlamalar</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Biznesingiz brendi — nom va logo.
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

      {/* ── Logo ── */}
      <section className="card p-6 flex items-center gap-5 flex-wrap">
        {biz?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE}${biz.logoUrl}`}
            alt={biz.name}
            className="w-20 h-20 rounded-2xl object-cover border border-neutral-200"
          />
        ) : (
          <span className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-700 grid place-items-center text-white text-3xl font-bold">
            {(biz?.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1 min-w-48">
          <h2 className="font-semibold text-sm">Biznes logosi</h2>
          <p className="text-xs text-neutral-400 mt-1">
            PNG, JPG yoki WEBP — maks 2MB. Menyu va sarlavhada ko&apos;rinadi.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadLogo(f);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 rounded-xl bg-brand text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {uploading ? 'Yuklanmoqda…' : biz?.logoUrl ? 'Logoni almashtirish' : 'Logo yuklash'}
          </button>
        </div>
      </section>

      {/* ── Nom ── */}
      <form onSubmit={saveName} className="card p-6 grid gap-4">
        <h2 className="font-semibold text-sm">Biznes nomi</h2>
        <input
          value={displayName}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
          placeholder="Masalan: Premium Wood"
        />
        <button
          disabled={saving || displayName.trim().length < 2}
          className="btn-primary sm:max-w-xs"
        >
          {saving ? 'Saqlanmoqda…' : 'Nomni saqlash'}
        </button>
      </form>
    </div>
  );
}
