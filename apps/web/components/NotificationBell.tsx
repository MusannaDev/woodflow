'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  MY_NOTIFICATIONS,
  UNREAD_COUNT,
} from '../lib/queries';

interface Noti {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(s: string): string {
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'hozir';
  if (m < 60) return `${m} daq oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'kecha';
  if (d < 7) return `${d} kun oldin`;
  return new Date(s).toLocaleDateString('uz-UZ');
}

/** dark=true — qorong'u sidebar/CEO header uchun (oq ikonka). */
export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: countData, refetch: refetchCount } = useQuery<{
    unreadCount: number;
  }>(UNREAD_COUNT, { pollInterval: 45000, fetchPolicy: 'cache-and-network' });
  const { data: listData, refetch: refetchList } = useQuery<{
    myNotifications: Noti[];
  }>(MY_NOTIFICATIONS, { skip: !open, fetchPolicy: 'cache-and-network' });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAll] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const unread = countData?.unreadCount ?? 0;
  const list = listData?.myNotifications ?? [];

  async function onItem(n: Noti) {
    setOpen(false);
    if (!n.read) {
      await markRead({ variables: { id: n.id } }).catch(() => null);
      refetchCount();
    }
    if (n.link) router.push(n.link);
  }

  async function onMarkAll() {
    await markAll().catch(() => null);
    await Promise.all([refetchCount(), refetchList()]);
  }

  return (
    <div className="relative flex-none">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Bildirishnomalar"
        className={`relative w-9 h-9 grid place-items-center rounded-xl transition-colors ${
          dark
            ? 'hover:bg-white/10 text-white/80'
            : 'hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
        }`}
      >
        <span className="text-lg leading-none">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-label="Yopish"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 mt-2 z-50 w-[min(92vw,360px)] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-[fadeIn_.15s_ease]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
              <span className="font-semibold text-sm flex-1">
                Bildirishnomalar
              </span>
              {unread > 0 && (
                <button
                  onClick={onMarkAll}
                  className="text-xs text-brand font-medium hover:underline"
                >
                  Hammasini o&apos;qildim
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {list.length === 0 ? (
                <p className="px-4 py-10 text-sm text-neutral-400 text-center">
                  🔔 Bildirishnoma yo&apos;q
                </p>
              ) : (
                <ul className="divide-y divide-neutral-50">
                  {list.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => onItem(n)}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-neutral-50 transition-colors ${
                          n.read ? '' : 'bg-brand-faint/40'
                        }`}
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-none ${
                            n.read ? 'bg-transparent' : 'bg-brand'
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-neutral-800 leading-snug">
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="block text-xs text-neutral-500 mt-0.5 leading-snug">
                              {n.body}
                            </span>
                          )}
                          <span className="block text-[11px] text-neutral-400 mt-1">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
