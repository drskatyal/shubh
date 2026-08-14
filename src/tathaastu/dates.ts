import { addCivilDays, civilDateInZone, timezoneFor } from '../engine/time';
import type { CivilDate } from '../engine/types';

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function isoFromCivil(civil: CivilDate): string {
  return `${civil.year}-${pad2(civil.month)}-${pad2(civil.day)}`;
}

export function civilFromIso(iso: string): CivilDate {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function todayIso(lat: number, lon: number, now = new Date()): string {
  return isoFromCivil(civilDateInZone(now, timezoneFor(lat, lon)));
}

export function addIsoDays(iso: string, days: number): string {
  return isoFromCivil(addCivilDays(civilFromIso(iso), days));
}

export function eachIsoDay(start: string, end: string, cap = 31): string[] {
  const out: string[] = [];
  let cursor = start;
  while (cursor <= end && out.length < cap) {
    out.push(cursor);
    cursor = addIsoDays(cursor, 1);
  }
  return out;
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
