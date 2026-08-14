export const DAY_TTL_MS = 6 * 60 * 60 * 1000;
export const LAST_KEY = 'shubh.tatha.last';

export type CacheStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export type CacheEntry<T> = {
  storedAt: number;
  value: T;
};

export function dayCacheKey(date: string, lat: number, lon: number, lang: string): string {
  return `shubh.tatha.day:${date}:${lat.toFixed(4)}:${lon.toFixed(4)}:${lang}`;
}

export function isFresh(storedAt: number, now: number, ttlMs = DAY_TTL_MS): boolean {
  return now - storedAt < ttlMs;
}

export async function readCache<T>(
  store: CacheStore,
  key: string,
  now: number,
  ttlMs = DAY_TTL_MS,
): Promise<T | null> {
  const raw = await store.getItem(key);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.storedAt !== 'number') return null;
    if (!isFresh(entry.storedAt, now, ttlMs)) return null;
    return entry.value;
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  store: CacheStore,
  key: string,
  value: T,
  now: number,
): Promise<void> {
  const entry: CacheEntry<T> = { storedAt: now, value };
  const json = JSON.stringify(entry);
  await store.setItem(key, json);
  await store.setItem(LAST_KEY, json);
}

export async function readLast<T>(store: CacheStore): Promise<T | null> {
  const raw = await store.getItem(LAST_KEY);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry?.value ?? null;
  } catch {
    return null;
  }
}

export function memoryStore(seed: Record<string, string> = {}): CacheStore {
  const map = new Map(Object.entries(seed));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
  };
}

export function asyncStorageStore(): CacheStore {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default as CacheStore;
    return AsyncStorage;
  } catch {
    return memoryStore();
  }
}
