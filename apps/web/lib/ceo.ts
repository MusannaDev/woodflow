/** CEO panel bo'limlari uchun umumiy yordamchilar, tiplar va konstantalar. */

import { dateFmt, fmt } from './format';
import { MsgKey } from './i18n/messages';

/** Sana — joriy tilda (nom tarixiy sabablarga ko'ra `uzDate`). */
export const uzDate = (s: string) => dateFmt(s);
export const fmtMoney = (n: number) => fmt(n);

/** Biznes holati — faqat ranglar; yorliq `bizStatus.*` kalitidan olinadi. */
export const STATUS_CLS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-600',
};

/** Rol nishoni ranglari — kalit backend'dan keladigan `roleLabel`. */
export const ROLE: Record<string, string> = {
  CEO: 'bg-purple-100 text-purple-700',
  Owner: 'bg-amber-100 text-amber-700',
  Ishchi: 'bg-blue-100 text-blue-700',
  '—': 'bg-neutral-100 text-neutral-400',
};

/** Biznes turi nishoni ranglari; yorliq `kind.*` kalitidan. */
export const KIND_CLS: Record<string, string> = {
  BOTH: 'bg-emerald-50 text-emerald-700',
  WOOD_ONLY: 'bg-lime-50 text-lime-700',
  LUMBER_ONLY: 'bg-orange-50 text-orange-700',
};

export const KIND_OPTIONS: {
  value: string;
  label: MsgKey;
  hint: MsgKey;
}[] = [
  { value: 'BOTH', label: 'kindOpt.BOTH', hint: 'kindHint.two' },
  { value: 'WOOD_ONLY', label: 'kindOpt.WOOD_ONLY', hint: 'kindHint.one' },
  { value: 'LUMBER_ONLY', label: 'kindOpt.LUMBER_ONLY', hint: 'kindHint.one' },
];

/** To'lov holati ranglari; yorliq `payStatus.*` kalitidan. */
export const PSTATUS_CLS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

/**
 * Biznes billing holatiga qarab nishon — tarjima kaliti va parametrlari
 * bilan (matn komponentda `t()` orqali hosil qilinadi).
 */
export function billingBadge(o: {
  freeAccess: boolean;
  blocked: boolean;
  paidUntil: string | null;
}): { key: MsgKey; vars?: Record<string, string>; cls: string } | null {
  if (o.freeAccess)
    return { key: 'billing.free', cls: 'bg-blue-50 text-blue-600' };
  if (o.blocked)
    return { key: 'billing.blocked', cls: 'bg-red-50 text-red-600' };
  if (o.paidUntil)
    return {
      key: 'billing.paidUntil',
      vars: { date: uzDate(o.paidUntil) },
      cls: 'bg-emerald-50 text-emerald-700',
    };
  return null;
}

export interface OwnerRow {
  userId: string;
  name: string;
  phone: string;
  businessId: string;
  businessName: string;
  status: string;
  kind: string;
  freeAccess: boolean;
  blocked: boolean;
  paidUntil: string | null;
  logoUrl: string | null;
  workspaceCount: number;
  createdAt: string;
}

export interface UserRow {
  id: string;
  name: string;
  phone: string;
  platformRole: string;
  roleLabel: string;
  businessName: string | null;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  businessName: string | null;
  ownerName: string | null;
  amountUzs: number;
  months: number;
  note: string | null;
  status: string;
  createdAt: string;
}

export interface RequestRow {
  id: string;
  userName: string;
  userPhone: string;
  businessName: string | null;
  createdAt: string;
}
