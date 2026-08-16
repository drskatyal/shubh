async function storage(): Promise<{
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
} | null> {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    return null;
  }
}

type Envelope<T> = {
  savedAt: number;
  value: T;
};

export async function readPersisted<T>(key: string, ttlMs?: number, now = Date.now()): Promise<T | null> {
  const store = await storage();
  if (!store) return null;
  try {
    const raw = await store.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as Envelope<T>;
    if (ttlMs != null && now - cached.savedAt > ttlMs) return null;
    return cached.value;
  } catch {
    return null;
  }
}

export async function writePersisted<T>(key: string, value: T): Promise<void> {
  const store = await storage();
  if (!store) return;
  const payload: Envelope<T> = { savedAt: Date.now(), value };
  try {
    await store.setItem(key, JSON.stringify(payload));
  } catch {
    // Node tests / missing window — skip device cache.
  }
}
