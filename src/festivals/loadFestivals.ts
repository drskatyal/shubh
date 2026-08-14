import { explainFestival, getFestivalsMonth, type TathaRequestOptions } from '../tathaastu/client';
import { civilFromIso, todayIso } from '../tathaastu/dates';
import { normalizeExplain, normalizeFestivals } from '../tathaastu/normalize';
import type { Festival, FestivalExplain, TathaSource } from '../tathaastu/types';

export type UpcomingFestivals = {
  ok: boolean;
  festivals: Festival[];
  source?: TathaSource;
  setup?: boolean;
  planNeeded?: boolean;
  error?: string;
};

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export function upcomingFrom(festivals: Festival[], today: string, limit = 12): Festival[] {
  return festivals
    .filter((fest) => fest.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function loadUpcomingFestivals(input: {
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  now?: Date;
  fetch?: typeof fetch;
  limit?: number;
}): Promise<UpcomingFestivals> {
  const today = todayIso(input.lat, input.lon, input.now);
  const { year, month } = civilFromIso(today);
  const following = nextMonth(year, month);
  const options: TathaRequestOptions = { fetch: input.fetch };
  const months = [
    await getFestivalsMonth({ year, month, lat: input.lat, lon: input.lon, lang: input.lang }, options),
    await getFestivalsMonth(
      { year: following.year, month: following.month, lat: input.lat, lon: input.lon, lang: input.lang },
      options,
    ),
  ];

  if (months.every((result) => !result.ok && result.setup && result.status === 0)) {
    const first = months[0];
    return { ok: false, festivals: [], setup: true, error: first && !first.ok ? first.error : undefined };
  }

  const live: Festival[] = [];
  let planNeeded = false;
  for (const result of months) {
    if (result.ok) live.push(...normalizeFestivals(result.data));
    else if (result.planNeeded) planNeeded = true;
  }

  if (live.length) {
    return { ok: true, festivals: upcomingFrom(live, today, input.limit), source: 'live' };
  }

  return {
    ok: false,
    festivals: [],
    setup: months.some((result) => !result.ok && result.setup),
    planNeeded,
    error: months.find((result) => !result.ok)?.error,
  };
}

export async function loadFestivalExplain(input: {
  festival: string;
  date: string;
  fetch?: typeof fetch;
}): Promise<{ ok: boolean; explain?: FestivalExplain; source?: TathaSource; setup?: boolean; error?: string }> {
  const result = await explainFestival(
    { festival: input.festival, date: input.date },
    { fetch: input.fetch },
  );
  if (result.ok) {
    return { ok: true, explain: normalizeExplain(result.data, input.festival, input.date), source: 'live' };
  }
  return { ok: false, setup: result.setup, error: result.error };
}
