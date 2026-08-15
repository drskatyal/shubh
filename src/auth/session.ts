import { isSupabaseConfigured } from './config';

const KEY = 'shubh.auth.v1';

export type AuthUser = {
  id: string;
  phone: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

let memory: AuthSession | null = null;

function storage(): {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
} | null {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured()) return null;
  if (memory) return memory;
  const store = storage();
  if (!store) return null;
  try {
    const raw = await store.getItem(KEY);
    if (!raw) return null;
    memory = JSON.parse(raw) as AuthSession;
    return memory;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getAuthSession();
  return session?.user ?? null;
}

export async function setAuthSession(session: AuthSession | null): Promise<void> {
  memory = session;
  const store = storage();
  if (!store) return;
  try {
    if (session) await store.setItem(KEY, JSON.stringify(session));
    else await store.removeItem(KEY);
  } catch {
    // Session persist is best-effort on web/tests.
  }
}

export async function signOut(): Promise<void> {
  await setAuthSession(null);
}

/** Test helper. Does not persist. */
export function resetAuthMemory(): void {
  memory = null;
}
