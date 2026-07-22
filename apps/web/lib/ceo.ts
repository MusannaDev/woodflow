/** CEO panel bo'limlari uchun umumiy yordamchilar, tiplar va konstantalar. */

export const uzDate = (s: string) => new Date(s).toLocaleDateString('uz-UZ');
export const fmtMoney = (n: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(n);

export const STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Faol', cls: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'Kutmoqda', cls: 'bg-amber-100 text-amber-700' },
  REJECTED: { label: 'Rad etilgan', cls: 'bg-red-100 text-red-600' },
};

export const ROLE: Record<string, string> = {
  CEO: 'bg-purple-100 text-purple-700',
  Owner: 'bg-amber-100 text-amber-700',
  Ishchi: 'bg-blue-100 text-blue-700',
  '—': 'bg-neutral-100 text-neutral-400',
};

export const KIND: Record<string, { label: string; cls: string }> = {
  BOTH: { label: "🌲🪵 Yog'och+Taxta", cls: 'bg-emerald-50 text-emerald-700' },
  WOOD_ONLY: { label: "🌲 Yog'och", cls: 'bg-lime-50 text-lime-700' },
  LUMBER_ONLY: { label: '🪵 Taxta', cls: 'bg-orange-50 text-orange-700' },
};

export const KIND_OPTIONS = [
  { value: 'BOTH', label: "Yog'och + Taxta", hint: 'ikkala makon' },
  { value: 'WOOD_ONLY', label: "Faqat Yog'och", hint: 'bitta makon' },
  { value: 'LUMBER_ONLY', label: 'Faqat Taxta', hint: 'bitta makon' },
];

export const PSTATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: '⏳ Kutilmoqda', cls: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '✓ Tasdiqlandi', cls: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: '✕ Rad etildi', cls: 'bg-red-100 text-red-600' },
};

/** Biznes billing holatiga qarab nishon. */
export function billingBadge(o: {
  freeAccess: boolean;
  blocked: boolean;
  paidUntil: string | null;
}): { label: string; cls: string } | null {
  if (o.freeAccess) return { label: '🎁 Tekin', cls: 'bg-blue-50 text-blue-600' };
  if (o.blocked) return { label: '🔒 Bloklangan', cls: 'bg-red-50 text-red-600' };
  if (o.paidUntil)
    return {
      label: `✓ ${uzDate(o.paidUntil)}`,
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
