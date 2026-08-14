import {
  findEventDates,
  findMuhurat,
  getEventSuitability,
  type TathaRequestOptions,
} from '../tathaastu/client';
import { addIsoDays, eachIsoDay, todayIso } from '../tathaastu/dates';
import { EVENT_CANDIDATES, looksUnsupportedEvent, minRatingForScore } from '../tathaastu/events';
import { normalizeRankedDates, rankedDateFromSuitability } from '../tathaastu/normalize';
import type { FinderEvent, RankedDate, TathaFail, TathaResult, TathaSource } from '../tathaastu/types';

export type FinderEndpoint = '/v1/muhurat/find' | '/v1/events/find-dates' | '/v1/events/suitability';

export type FinderResult = {
  ok: boolean;
  dates: RankedDate[];
  source?: TathaSource;
  endpoint?: FinderEndpoint;
  eventUsed: string;
  setup?: boolean;
  planNeeded?: boolean;
  error?: string;
};

const GOOD = new Set(['GOOD', 'EXCELLENT']);

function keepUsable(dates: RankedDate[], minScore: number): RankedDate[] {
  const good = dates.filter((row) => GOOD.has(String(row.rating).toUpperCase()) || row.score >= minScore);
  return (good.length ? good : dates.filter((row) => String(row.rating).toUpperCase() !== 'AVOID')).sort(
    (a, b) => b.score - a.score || a.date.localeCompare(b.date),
  );
}

async function tryFind(
  call: typeof findMuhurat,
  event: string,
  input: {
    startDate: string;
    endDate: string;
    lat: number;
    lon: number;
    minScore: number;
    minRating: string;
  },
  options?: TathaRequestOptions,
): Promise<TathaResult<unknown>> {
  return call({ event, ...input }, options);
}

export async function findMuhuratDates(input: {
  event: FinderEvent;
  lat: number;
  lon: number;
  startDate?: string;
  endDate?: string;
  minScore?: number;
  fetch?: typeof fetch;
}): Promise<FinderResult> {
  const minScore = input.minScore ?? 60;
  const startDate = input.startDate ?? todayIso(input.lat, input.lon);
  const endDate = input.endDate ?? addIsoDays(startDate, 60);
  const minRating = minRatingForScore(minScore);
  const options: TathaRequestOptions = { fetch: input.fetch };
  const query = { startDate, endDate, lat: input.lat, lon: input.lon, minScore, minRating };
  const candidates = EVENT_CANDIDATES[input.event];

  const walk = async (
    call: typeof findMuhurat,
  ): Promise<
    | { result: TathaResult<unknown> & { ok: true }; eventUsed: string }
    | { plan: TathaFail; eventUsed: string }
    | null
  > => {
    let lastFail: TathaFail | null = null;
    for (const event of candidates) {
      const result = await tryFind(call, event, query, options);
      if (result.ok) return { result, eventUsed: event };
      lastFail = result;
      if (result.setup || result.planNeeded) return { plan: result, eventUsed: event };
      if (looksUnsupportedEvent(result.status, result.error, result.detail)) continue;
      if (result.status === 402) return { plan: result, eventUsed: event };
    }
    return lastFail ? { plan: lastFail, eventUsed: candidates[0] } : null;
  };

  const primary = await walk(findMuhurat);
  if (primary && 'result' in primary && primary.result.ok) {
    return {
      ok: true,
      dates: keepUsable(normalizeRankedDates(primary.result.data), minScore),
      source: 'live',
      endpoint: '/v1/muhurat/find',
      eventUsed: primary.eventUsed,
    };
  }
  if (primary && 'plan' in primary && primary.plan.setup && primary.plan.status === 0) {
    return {
      ok: false,
      dates: [],
      eventUsed: input.event,
      setup: true,
      error: primary.plan.error,
    };
  }

  const alias = await walk(findEventDates);
  if (alias && 'result' in alias && alias.result.ok) {
    return {
      ok: true,
      dates: keepUsable(normalizeRankedDates(alias.result.data), minScore),
      source: 'fallback',
      endpoint: '/v1/events/find-dates',
      eventUsed: alias.eventUsed,
    };
  }

  if (
    (primary && 'plan' in primary && primary.plan.status === 402) ||
    (alias && 'plan' in alias && alias.plan.status === 402)
  ) {
    const scanned = await scanSuitability({
      event: candidates.find((name) => name === name.toLowerCase()) ?? candidates[0],
      startDate,
      endDate,
      lat: input.lat,
      lon: input.lon,
      minScore,
      options,
    });
    if (scanned.setup) {
      return { ok: false, dates: [], eventUsed: scanned.eventUsed, setup: true };
    }
    if (scanned.dates.length) {
      return {
        ok: true,
        dates: keepUsable(scanned.dates, minScore),
        source: 'fallback',
        endpoint: '/v1/events/suitability',
        eventUsed: scanned.eventUsed,
      };
    }
    return {
      ok: false,
      dates: [],
      eventUsed: scanned.eventUsed,
      planNeeded: true,
      error: 'plan_upgrade_required',
    };
  }

  const fail = (alias && 'plan' in alias && alias.plan) || (primary && 'plan' in primary && primary.plan);
  return {
    ok: false,
    dates: [],
    eventUsed: input.event,
    setup: fail ? fail.setup : true,
    planNeeded: fail ? fail.planNeeded : false,
    error: fail ? fail.error : 'unavailable',
  };
}

async function scanSuitability(input: {
  event: string;
  startDate: string;
  endDate: string;
  lat: number;
  lon: number;
  minScore: number;
  options?: TathaRequestOptions;
}): Promise<{ dates: RankedDate[]; eventUsed: string; setup?: boolean }> {
  const dates: RankedDate[] = [];
  let eventUsed = input.event;
  for (const date of eachIsoDay(input.startDate, input.endDate, 31)) {
    let result = await getEventSuitability(
      { date, lat: input.lat, lon: input.lon, event: eventUsed },
      input.options,
    );
    if (!result.ok && looksUnsupportedEvent(result.status, result.error, result.detail)) {
      for (const candidate of EVENT_CANDIDATES.naming.includes(input.event)
        ? EVENT_CANDIDATES.naming
        : [input.event]) {
        result = await getEventSuitability(
          { date, lat: input.lat, lon: input.lon, event: candidate },
          input.options,
        );
        if (result.ok) {
          eventUsed = candidate;
          break;
        }
        if (result.setup) return { dates: [], eventUsed, setup: true };
      }
    }
    if (!result.ok) {
      if (result.setup) return { dates: [], eventUsed, setup: true };
      continue;
    }
    const row = rankedDateFromSuitability(result.data, date, eventUsed);
    if (row) dates.push(row);
  }
  return { dates, eventUsed };
}
