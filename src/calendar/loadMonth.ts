import { getCalendarDay, getCalendarMonth, type TathaRequestOptions } from '../tathaastu/client';
import { normalizeCalendarDay, normalizeCalendarMonth } from '../tathaastu/normalize';
import type { CalendarDay, CalendarMonth, TathaSource } from '../tathaastu/types';

export async function loadCalendarMonth(input: {
  year: number;
  month: number;
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  fetch?: typeof fetch;
}): Promise<{
  ok: boolean;
  month?: CalendarMonth;
  source?: TathaSource;
  setup?: boolean;
  planNeeded?: boolean;
  error?: string;
}> {
  const options: TathaRequestOptions = { fetch: input.fetch };
  const result = await getCalendarMonth(
    { year: input.year, month: input.month, lat: input.lat, lon: input.lon, lang: input.lang },
    options,
  );
  if (result.ok) {
    return { ok: true, month: normalizeCalendarMonth(result.data, input.year, input.month), source: 'live' };
  }
  return {
    ok: false,
    setup: result.setup,
    planNeeded: result.planNeeded,
    error: result.error,
  };
}

export async function loadCalendarDay(input: {
  date: string;
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  fallback?: CalendarDay;
  fetch?: typeof fetch;
}): Promise<{ ok: boolean; day: CalendarDay; source?: TathaSource }> {
  if (input.fallback && (input.fallback.tithi || input.fallback.summary || input.fallback.festivals.length)) {
    return { ok: true, day: input.fallback, source: 'live' };
  }
  const result = await getCalendarDay(
    { date: input.date, lat: input.lat, lon: input.lon, lang: input.lang },
    { fetch: input.fetch },
  );
  if (result.ok) {
    const day = normalizeCalendarDay(result.data, input.date);
    if (day) return { ok: true, day, source: 'live' };
  }
  return {
    ok: Boolean(input.fallback),
    day: input.fallback ?? { date: input.date, festivals: [] },
    source: result.ok ? 'live' : undefined,
  };
}
