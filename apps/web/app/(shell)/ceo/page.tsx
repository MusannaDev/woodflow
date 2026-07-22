'use client';

import { useQuery } from '@apollo/client';
import { PLATFORM_STATS } from '../../../lib/queries';

interface Stats {
  ownerCount: number;
  pendingCount: number;
  userCount: number;
  workerCount: number;
}

export default function CeoOverviewPage() {
  const { data, loading } = useQuery<{ platformStats: Stats }>(PLATFORM_STATS);
  const s = data?.platformStats;

  const cards = [
    ['Ownerlar', s?.ownerCount, 'faol biznes', '/ceo/ownerlar'],
    ['Kutayotgan', s?.pendingCount, "so'rov", '/ceo/sorovlar'],
    ['Foydalanuvchilar', s?.userCount, 'jami hisob', '/ceo/foydalanuvchilar'],
    ['Ishchilar', s?.workerCount, "a'zo", null],
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amber-500">⭑</span> Umumiy
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Platforma holati bir qarashda.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([l, v, sub, href]) => {
          const Card = (
            <div className="card rounded-xl p-4 h-full hover:border-brand/40 transition-colors">
              <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
                {l}
              </div>
              <div className="text-2xl md:text-3xl font-bold mt-1 tabular-nums">
                {loading ? '…' : (v ?? 0)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>
            </div>
          );
          return href ? (
            <a key={l} href={href}>
              {Card}
            </a>
          ) : (
            <div key={l}>{Card}</div>
          );
        })}
      </div>
    </div>
  );
}
