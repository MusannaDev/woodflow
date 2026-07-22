/**
 * Sessiya: token, workspace'lar, biznes (nom/logo), platforma roli va
 * kutish holati — localStorage'da. Har GraphQL so'rovga Authorization va
 * x-workspace-id header sifatida ketadi.
 */

export interface WorkspaceBrief {
  id: string;
  name: string;
  type: 'WOOD_TRADING' | 'LUMBER_PRODUCTION';
  role: string;
}

export interface BusinessBrief {
  id: string;
  name: string;
  logoUrl: string | null;
  status: string; // PENDING | ACTIVE | REJECTED
  blocked?: boolean; // obuna tugagan, faqat /tolov ochiq
  paidUntil?: string | null;
  freeAccess?: boolean;
}

export interface AuthData {
  token: string;
  name: string;
  platformRole: string; // CEO | USER
  workspaces: WorkspaceBrief[];
  business: BusinessBrief | null;
  pending: string | null; // CEO_APPROVAL | OWNER_APPROVAL | WAITING_EMPLOYEE | REJECTED
}

const KEYS = {
  token: 'wf_token',
  name: 'wf_name',
  list: 'wf_workspaces',
  current: 'wf_current_ws',
  business: 'wf_business',
  platformRole: 'wf_platform_role',
  pending: 'wf_pending',
} as const;

const get = (k: string) =>
  typeof window === 'undefined' ? null : localStorage.getItem(k);

export const session = {
  save(data: AuthData): void {
    localStorage.setItem(KEYS.token, data.token);
    localStorage.setItem(KEYS.name, data.name);
    localStorage.setItem(KEYS.list, JSON.stringify(data.workspaces));
    localStorage.setItem(KEYS.platformRole, data.platformRole);
    if (data.business) {
      localStorage.setItem(KEYS.business, JSON.stringify(data.business));
    } else {
      localStorage.removeItem(KEYS.business);
    }
    if (data.pending) {
      localStorage.setItem(KEYS.pending, data.pending);
    } else {
      localStorage.removeItem(KEYS.pending);
    }
    // Joriy workspace yangi ro'yxatda bo'lmasa — birinchisiga o'tamiz
    const current = get(KEYS.current);
    const stillValid = data.workspaces.some((w) => w.id === current);
    if (data.workspaces.length > 0 && !stillValid) {
      localStorage.setItem(KEYS.current, data.workspaces[0].id);
    }
    if (data.workspaces.length === 0) {
      localStorage.removeItem(KEYS.current);
    }
  },

  token: () => get(KEYS.token),
  userName: () => get(KEYS.name) ?? '',
  platformRole: () => get(KEYS.platformRole) ?? 'USER',
  pending: () => get(KEYS.pending),

  business(): BusinessBrief | null {
    try {
      const raw = get(KEYS.business);
      return raw ? (JSON.parse(raw) as BusinessBrief) : null;
    } catch {
      return null;
    }
  },

  workspaces(): WorkspaceBrief[] {
    try {
      return JSON.parse(get(KEYS.list) ?? '[]');
    } catch {
      return [];
    }
  },

  currentWorkspaceId: () => get(KEYS.current),

  currentWorkspace(): WorkspaceBrief | null {
    const id = session.currentWorkspaceId();
    return session.workspaces().find((w) => w.id === id) ?? null;
  },

  setCurrentWorkspace(id: string): void {
    localStorage.setItem(KEYS.current, id);
  },

  clear(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

/** Backend REST bazasi (logo upload va rasm URL'lari uchun). */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010/graphql'
).replace(/\/graphql$/, '');
