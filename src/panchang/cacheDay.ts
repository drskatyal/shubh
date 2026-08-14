import type { NormalizedDay } from '../tathaastu/types';

const TTL_MS = 6 * 60 * 60 * 1000;
const KEY = 'shubh.day-context';

type Cached = {
  key: string;
  savedAt: number;
  day: NormalizedDay;
};

function cacheId(lat: number, lon: number, lang: string, date: string): string {
  return `${date}:${lat.toFixed(3)}:${lon.toFixed(3)}:${lang}`;
}

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

export async function readCachedDay(input: {
  lat: number;
  lon: number;
  lang: string;
  date: string;
  now?: number;
}): Promise<NormalizedDay | null> {
  const store = await storage();
  if (!store) return null;
  try {
    const raw = await store.getItem(KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as Cached;
    if (cached.key !== cacheId(input.lat, input.lon, input.lang, input.date)) return null;
    if ((input.now ?? Date.now()) - cached.savedAt > TTL_MS) return null;
    return cached.day;
  } catch {
    return null;
  }
}

export async function writeCachedDay(input: {
  lat: number;
  lon: number;
  lang: string;
  date: string;
  day: NormalizedDay;
}): Promise<void> {
  const store = await storage();
  if (!store) return;
  const payload: Cached = {
    key: cacheId(input.lat, input.lon, input.lang, input.date),
    savedAt: Date.now(),
    day: input.day,
  };
  await store.setItem(KEY, JSON.stringify(payload));
}
