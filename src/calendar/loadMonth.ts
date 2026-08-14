import { getCalendarDay, getCalendarMonth, type TathaRequestOptions } from '../tathaastu/client';
import { fixtureCalendarMonth } from '../tathaastu/fixtures';
import { normalizeCalendarDay, normalizeCalendarMonth } from '../tathaastu/normalize';
import type { CalendarDay, CalendarMonth, TathaSource } from '../tathaastu/types';

export async function loadCalendarMonth(input: {
  year: number;
  month: number;
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  fetch?: typeof fetch;
}): Promise<{ month: CalendarMonth; source: TathaSource; setup?: boolean; planNeeded?: boolean }> {
  const options: TathaRequestOptions = { fetch: input.fetch };
  const result = await getCalendarMonth(
    { year: input.year, month: input.month, lat: input.lat, lon: input.lon, lang: input.lang },
    options,
  );
  if (result.ok) {
    return { month: normalizeCalendarMonth(result.data, input.year, input.month), source: 'live' };
  }
  return {
    month: fixtureCalendarMonth(input.year, input.month),
    source: 'fixture',
    setup: result.setup,
    planNeeded: result.planNeeded,
  };
}

export async function loadCalendarDay(input: {
  date: string;
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  fallback?: CalendarDay;
  fetch?: typeof fetch;
}): Promise<{ day: CalendarDay; source: TathaSource }> {
  if (input.fallback && (input.fallback.tithi || input.fallback.summary || input.fallback.festivals.length)) {
    return { day: input.fallback, source: 'live' };
  }
  const result = await getCalendarDay(
    { date: input.date, lat: input.lat, lon: input.lon, lang: input.lang },
    { fetch: input.fetch },
  );
  if (result.ok) {
    const day = normalizeCalendarDay(result.data, input.date);
    if (day) return { day, source: 'live' };
  }
  return {
    day: input.fallback ?? { date: input.date, festivals: [] },
    source: result.ok ? 'live' : 'fixture',
  };
}
