import { getDateSpecificFestivals, getEnglishCalendarFestivals, getPanchang, type DivineRequestOptions } from '../divine/client';
import { normalizeCalendarDay, normalizeCalendarMonth, normalizeFestivals } from '../tathaastu/normalize';
import { normalizeDay } from '../tathaastu/normalizeDay';
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
  const options: DivineRequestOptions = { fetch: input.fetch };
  const result = await getEnglishCalendarFestivals(
    { year: input.year, month: input.month, lat: input.lat, lon: input.lon, lang: input.lang },
    options,
  );
  if (!result.ok) {
    return {
      ok: false,
      setup: result.setup,
      planNeeded: result.planNeeded,
      error: result.error,
    };
  }

  const festivals = normalizeFestivals(result.data);
  const byDate = new Map<string, string[]>();
  for (const fest of festivals) {
    const list = byDate.get(fest.date) ?? [];
    list.push(fest.name);
    byDate.set(fest.date, list);
  }
  const days = [...byDate.entries()].map(([date, names]) => ({
    date,
    festivals: names,
  }));
  return {
    ok: true,
    month: normalizeCalendarMonth({ days }, input.year, input.month),
    source: 'live',
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
  const options: DivineRequestOptions = { fetch: input.fetch };
  const query = { date: input.date, lat: input.lat, lon: input.lon, lang: input.lang };
  const [panchang, festivals] = await Promise.all([
    getPanchang(query, options),
    getDateSpecificFestivals(query, options),
  ]);
  if (panchang.ok) {
    const day = normalizeDay(panchang.data, input.date);
    const extra = festivals.ok ? normalizeFestivals(festivals.data, input.date).map((fest) => fest.name) : [];
    return {
      ok: true,
      day: {
        date: day.date,
        tithi: day.tithi?.name,
        nakshatra: day.nakshatra?.name,
        yoga: day.yoga?.name,
        karana: day.karana?.name,
        vara: day.vara,
        festivals: extra.length ? extra : day.festivals,
      },
      source: 'live',
    };
  }
  if (festivals.ok) {
    const day = normalizeCalendarDay({ date: input.date, festivals: festivals.data }, input.date);
    if (day) return { ok: true, day, source: 'live' };
  }
  return {
    ok: Boolean(input.fallback),
    day: input.fallback ?? { date: input.date, festivals: [] },
    source: panchang.ok ? 'live' : undefined,
  };
}
