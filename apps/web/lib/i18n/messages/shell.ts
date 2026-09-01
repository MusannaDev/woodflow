import { Msg } from '../types';

/** App shell, bildirishnomalar va vaqt iboralari. */
export const shell = {
  'shell.brandDefault': ['RS Development', 'RS Development'],

  'noti.title': ['Bildirishnomalar', 'Notifications'],
  'noti.markAll': ['Hammasini o‘qildim', 'Mark all as read'],
  'noti.empty': ['🔔 Bildirishnoma yo‘q', '🔔 No notifications'],
  'noti.now': ['hozir', 'just now'],
  'noti.minutes': ['{n} daq oldin', '{n} min ago'],
  'noti.hours': ['{n} soat oldin', '{n} h ago'],
  'noti.yesterday': ['kecha', 'yesterday'],
  'noti.days': ['{n} kun oldin', '{n} d ago'],
} as const satisfies Record<string, Msg>;
