import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Joriy so'rovning tenant konteksti. WorkspaceGuard har so'rovда to'ldiradi,
 * PrismaService esa shu bo'yicha avtomatik filtrlaydi. Shu bilan bir workspace
 * ma'lumoti ikkinchisiga hech qachon sizib chiqmaydi — hatto service'da
 * workspaceId ni unutib qo'ysang ham.
 */
export interface TenantStore {
  userId: string;
  workspaceId: string | null;
  role: string | null;
}

const storage = new AsyncLocalStorage<TenantStore>();

export function runWithTenant<T>(store: TenantStore, fn: () => T): T {
  return storage.run(store, fn);
}

export function getTenant(): TenantStore | undefined {
  return storage.getStore();
}

export function requireWorkspaceId(): string {
  const store = storage.getStore();
  if (!store?.workspaceId) {
    throw new Error('Workspace konteksti o‘rnatilmagan (workspaceId yo‘q).');
  }
  return store.workspaceId;
}
