import {
  getDayContext,
  getPanchang,
  getPanchangToday,
  getTimings,
  type TathaRequestOptions,
} from '../tathaastu/client';
import { todayIso } from '../tathaastu/dates';
import { normalizeDay } from '../tathaastu/normalizeDay';
import type { NormalizedDay, TathaSource } from '../tathaastu/types';

export type DayLoad = {
  ok: boolean;
  day?: NormalizedDay;
  source?: TathaSource;
  setup?: boolean;
  planNeeded?: boolean;
  error?: string;
  endpoint?: string;
};

const INCLUDE = 'timings,hora,choghadiya,festivals';

function mergeRaw(primary: unknown, extra: unknown): unknown {
  const a = primary && typeof primary === 'object' ? (primary as Record<string, unknown>) : {};
  const b = extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : {};
  return { ...a, timings: b.timings ?? b, ...b, ...a };
}

export async function loadLiveDay(input: {
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  date?: string;
  fetch?: typeof fetch;
}): Promise<DayLoad> {
  const date = input.date ?? todayIso(input.lat, input.lon);
  const options: TathaRequestOptions = { fetch: input.fetch };
  const query = { date, lat: input.lat, lon: input.lon, lang: input.lang };

  const context = await getDayContext(query, options);
  if (context.ok) {
    return {
      ok: true,
      day: normalizeDay(context.data, date),
      source: 'live',
      endpoint: context.endpoint,
    };
  }
  if (context.setup && context.status === 0) {
    return { ok: false, setup: true, error: context.error, endpoint: context.endpoint };
  }

  if (context.status === 402 || context.status === 429) {
    const today = await getPanchangToday(
      { lat: input.lat, lon: input.lon, lang: input.lang, include: INCLUDE },
      options,
    );
    const timings = await getTimings({ date, lat: input.lat, lon: input.lon }, options);
    if (today.ok) {
      return {
        ok: true,
        day: normalizeDay(mergeRaw(today.data, timings.ok ? timings.data : {}), date),
        source: 'fallback',
        endpoint: today.endpoint,
        planNeeded: !timings.ok,
      };
    }
  }

  const panchang = await getPanchang({ ...query, include: INCLUDE }, options);
  if (panchang.ok) {
    const timings = await getTimings({ date, lat: input.lat, lon: input.lon }, options);
    return {
      ok: true,
      day: normalizeDay(mergeRaw(panchang.data, timings.ok ? timings.data : {}), date),
      source: 'fallback',
      endpoint: panchang.endpoint,
    };
  }

  return {
    ok: false,
    setup: context.setup || panchang.setup,
    planNeeded: context.planNeeded || panchang.planNeeded,
    error: panchang.error || context.error,
    endpoint: panchang.endpoint || context.endpoint,
  };
}
