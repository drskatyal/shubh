import tzLookup from 'tz-lookup';

import type { CivilDate } from './types';

export function timezoneFor(lat: number, lon: number): string {
  return tzLookup(lat, lon);
}

export function civilDateInZone(date: Date, timeZone: string): CivilDate {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

export function addCivilDays(civil: CivilDate, days: number): CivilDate {
  const utc = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/**
 * Instant that displays as the given civil clock time in `timeZone`.
 */
export function zonedInstant(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  let date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  for (let i = 0; i < 4; i += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
    const shown = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    const wanted = Date.UTC(year, month - 1, day, hour, minute, second);
    date = new Date(date.getTime() + (wanted - shown));
  }
  return date;
}

export function weekdayInZone(date: Date, timeZone: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(date);
  const map: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = map[name];
  if (weekday === undefined) {
    throw new Error(`Unknown weekday ${name}`);
  }
  return weekday;
}

export function contains(start: Date, end: Date, at: Date): boolean {
  return at.getTime() >= start.getTime() && at.getTime() < end.getTime();
}

export function toIso(date: Date): string {
  return date.toISOString();
}
