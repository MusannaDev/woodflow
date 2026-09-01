'use client';

import { useQuery } from '@apollo/client';
import { useI18n } from '../../../lib/i18n';
import { MsgKey } from '../../../lib/i18n/messages';
import { PLATFORM_STATS } from '../../../lib/queries';

interface Stats {
  ownerCount: number;
  pendingCount: number;
  userCount: number;
  workerCount: number;
}

export default function CeoOverviewPage() {
  const { t } = useI18n();
  const { data, loading } = useQuery<{ platformStats: Stats }>(PLATFORM_STATS);
  const s = data?.platformStats;

  const cards: [MsgKey, number | undefined, MsgKey, string | null][] = [
    ['ceo.card.owners', s?.ownerCount, 'ceo.card.ownersSub', '/ceo/ownerlar'],
    ['ceo.card.pending', s?.pendingCount, 'ceo.card.pendingSub', '/ceo/sorovlar'],
    [
      'ceo.card.users',
      s?.userCount,
      'ceo.card.usersSub',
      '/ceo/foydalanuvchilar',
    ],
    ['ceo.card.workers', s?.workerCount, 'ceo.card.workersSub', null],
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amber-500">⭑</span> {t('ceo.overview')}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{t('ceo.overviewSub')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([l, v, sub, href]) => {
          const Card = (
            <div className="card rounded-xl p-4 h-full hover:border-brand/40 transition-colors">
              <div className="text-[11px] tracking-wide text-neutral-500 font-medium">
                {t(l)}
              </div>
              <div className="text-2xl md:text-3xl font-bold mt-1 tabular-nums">
                {loading ? '…' : (v ?? 0)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{t(sub)}</div>
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
