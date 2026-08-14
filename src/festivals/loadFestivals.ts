import { explainFestival, getFestivalsMonth, type TathaRequestOptions } from '../tathaastu/client';
import { civilFromIso, todayIso } from '../tathaastu/dates';
import { FIXTURE_FESTIVALS, fixtureExplain } from '../tathaastu/fixtures';
import { normalizeExplain, normalizeFestivals } from '../tathaastu/normalize';
import type { Festival, FestivalExplain, TathaSource } from '../tathaastu/types';

export type UpcomingFestivals = {
  festivals: Festival[];
  source: TathaSource;
  setup?: boolean;
  planNeeded?: boolean;
};

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
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

  if (months.every((result) => !result.ok && result.setup)) {
    return {
      festivals: upcomingFrom(FIXTURE_FESTIVALS, today, input.limit),
      source: 'fixture',
      setup: true,
    };
  }

  const live: Festival[] = [];
  let planNeeded = false;
  for (const result of months) {
    if (result.ok) live.push(...normalizeFestivals(result.data));
    else if (result.planNeeded) planNeeded = true;
  }

  if (live.length) {
    return { festivals: upcomingFrom(live, today, input.limit), source: 'live' };
  }

  return {
    festivals: upcomingFrom(FIXTURE_FESTIVALS, today, input.limit),
    source: 'fixture',
    setup: months.some((result) => !result.ok && result.setup),
    planNeeded,
  };
}

export function upcomingFrom(festivals: Festival[], today: string, limit = 12): Festival[] {
  return festivals
    .filter((fest) => fest.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export async function loadFestivalExplain(input: {
  festival: string;
  date: string;
  fetch?: typeof fetch;
}): Promise<{ explain: FestivalExplain; source: TathaSource; setup?: boolean }> {
  const result = await explainFestival(
    { festival: input.festival, date: input.date },
    { fetch: input.fetch },
  );
  if (result.ok) {
    return { explain: normalizeExplain(result.data, input.festival, input.date), source: 'live' };
  }
  return {
    explain: fixtureExplain(input.festival, input.date),
    source: 'fixture',
    setup: result.setup,
  };
}
