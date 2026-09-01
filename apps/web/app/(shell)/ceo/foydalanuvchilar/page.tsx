'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ALL_USERS } from '../../../../lib/queries';
import { ROLE, UserRow, uzDate } from '../../../../lib/ceo';
import { useEnumLabel, useI18n } from '../../../../lib/i18n';

export default function FoydalanuvchilarPage() {
  const { t } = useI18n();
  const label = useEnumLabel();
  const { data, loading } = useQuery<{ allUsers: UserRow[] }>(ALL_USERS);
  const [q, setQ] = useState('');
  const rows = data?.allUsers ?? [];

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(t) ||
        u.phone.toLowerCase().includes(t) ||
        (u.businessName ?? '').toLowerCase().includes(t),
    );
  }, [rows, q]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold">{t('ceo.users.title')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('ceo.users.sub')}</p>
      </div>

      <section className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-3 flex-wrap">
          <h2 className="font-semibold text-sm flex-1">
            {t('ceo.users.count', { n: rows.length })}
          </h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('ceo.users.searchPh')}
            className="field-input !py-2 w-full sm:w-64"
          />
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            {t('common.loading')}
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-500 text-center">
            {q ? t('ceo.users.noMatch') : t('ceo.users.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filtered.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/ceo/foydalanuvchilar/${u.id}`}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-neutral-50/70 transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-500 grid place-items-center font-semibold text-sm flex-none">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium truncate group-hover:text-brand transition-colors">
                      {u.name}
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">
                      {u.phone}
                      {u.businessName ? ` · ${u.businessName}` : ''}
                    </span>
                  </span>
                  <span className="hidden sm:block text-xs text-neutral-400 flex-none">
                    {uzDate(u.createdAt)}
                  </span>
                  <span
                    className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-none ${
                      ROLE[u.roleLabel] ?? ROLE['—']
                    }`}
                  >
                    {label('ceoRole', u.roleLabel)}
                  </span>
                  <span className="text-neutral-300 group-hover:text-brand transition-colors">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
