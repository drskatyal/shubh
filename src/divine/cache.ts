import type { BirthData } from '../tathaastu/types';

export const PANCHANG_TTL_MS = 6 * 60 * 60 * 1000;

export function panchangCacheKey(input: {
  lat: number;
  lon: number;
  date: string;
  lang: string;
}): string {
  return `panchang:${input.date}:${input.lat.toFixed(3)}:${input.lon.toFixed(3)}:${input.lang}`;
}

export function birthTuple(data: BirthData, lang = 'en'): string {
  return [
    data.name.trim().toLowerCase(),
    data.date_of_birth,
    data.time_of_birth.slice(0, 5),
    data.latitude.toFixed(4),
    data.longitude.toFixed(4),
    lang,
  ].join('|');
}

export function kundliCacheKey(data: BirthData, lang = 'en'): string {
  return `kundli:${birthTuple(data, lang)}`;
}

export function matchCacheKey(personA: BirthData, personB: BirthData, lang = 'en'): string {
  return `match:${birthTuple(personA, lang)}::${birthTuple(personB, lang)}`;
}

export function isFresh(savedAt: number, ttlMs: number, now = Date.now()): boolean {
  return now - savedAt <= ttlMs;
}
