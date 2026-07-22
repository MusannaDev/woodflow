'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { USER_DETAIL } from '../../../../../lib/queries';
import { ROLE, uzDate } from '../../../../../lib/ceo';

interface Membership {
  workspaceName: string;
  businessName: string | null;
  role: string;
}
interface Detail {
  id: string;
  name: string;
  phone: string;
  platformRole: string;
  roleLabel: string;
  ownedBusinessName: string | null;
  createdAt: string;
  memberships: Membership[];
}

const roleName = (r: string) =>
  r === 'OWNER' ? 'Egasi' : r === 'WORKER' ? 'Ishchi' : r;

export default function UserDetailPage() {
  const params = useParams();
  const userId = String(params.id);
  const { data, loading, error } = useQuery<{ userDetail: Detail }>(
    USER_DETAIL,
    { variables: { userId }, fetchPolicy: 'cache-and-network' },
  );

  if (loading && !data)
    return <p className="text-neutral-500">Yuklanmoqda…</p>;
  if (error)
    return <p className="text-red-600 text-sm">Xato: {error.message}</p>;

  const d = data!.userDetail;

  return (
    <div className="grid grid-cols-1 gap-6">
      <Link
        href="/ceo/foydalanuvchilar"
        className="text-sm text-neutral-500 hover:text-brand transition-colors w-fit"
      >
        ← Foydalanuvchilar
      </Link>

      {/* Sarlavha */}
      <div className="card p-5 flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-500 grid place-items-center text-2xl font-bold flex-none">
          {d.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{d.name}</h1>
          <p className="text-sm text-neutral-500">{d.phone}</p>
        </div>
        <span
          className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${
            ROLE[d.roleLabel] ?? ROLE['—']
          }`}
        >
          {d.roleLabel}
        </span>
      </div>

      {/* Ma'lumot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          ['Platforma roli', d.platformRole],
          ['Biznesi', d.ownedBusinessName ?? '—'],
          ["Ro'yxatdan", uzDate(d.createdAt)],
        ].map(([l, v]) => (
          <div key={l} className="card rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
              {l}
            </div>
            <div className="text-sm font-bold mt-1 truncate">{v}</div>
          </div>
        ))}
      </div>

      {/* A'zoliklar */}
      <section className="card overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-neutral-100 font-semibold text-sm">
          Makon a&apos;zoliklari ({d.memberships.length})
        </h2>
        {d.memberships.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500 text-center">
            Hech qanday makonga a&apos;zo emas.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {d.memberships.map((m, i) => (
              <li key={i} className="px-5 py-3.5 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand flex-none" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {m.workspaceName}
                  </span>
                  {m.businessName && (
                    <span className="block text-xs text-neutral-500 truncate">
                      {m.businessName}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium rounded-full px-2.5 py-1 bg-neutral-100 text-neutral-600 flex-none">
                  {roleName(m.role)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
