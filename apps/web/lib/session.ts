/**
 * Sessiya: token + workspace'lar localStorage'da.
 * Har GraphQL so'rovga Authorization va x-workspace-id header sifatida ketadi.
 */

export interface WorkspaceBrief {
  id: string;
  name: string;
  type: 'WOOD_TRADING' | 'LUMBER_PRODUCTION';
  role: string;
}

const TOKEN_KEY = 'wf_token';
const WS_LIST_KEY = 'wf_workspaces';
const WS_CURRENT_KEY = 'wf_current_ws';
const NAME_KEY = 'wf_name';

export const session = {
  save(token: string, name: string, workspaces: WorkspaceBrief[]): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(NAME_KEY, name);
    localStorage.setItem(WS_LIST_KEY, JSON.stringify(workspaces));
    if (workspaces.length > 0 && !localStorage.getItem(WS_CURRENT_KEY)) {
      localStorage.setItem(WS_CURRENT_KEY, workspaces[0].id);
    }
  },

  token(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  userName(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(NAME_KEY) ?? '';
  },

  workspaces(): WorkspaceBrief[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(WS_LIST_KEY) ?? '[]');
    } catch {
      return [];
    }
  },

  currentWorkspaceId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WS_CURRENT_KEY);
  },

  currentWorkspace(): WorkspaceBrief | null {
    const id = session.currentWorkspaceId();
    return session.workspaces().find((w) => w.id === id) ?? null;
  },

  setCurrentWorkspace(id: string): void {
    localStorage.setItem(WS_CURRENT_KEY, id);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(WS_LIST_KEY);
    localStorage.removeItem(WS_CURRENT_KEY);
  },
};
