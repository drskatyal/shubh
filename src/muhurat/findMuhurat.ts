import { findMuhuratMonth, type DivineRequestOptions } from '../divine/client';
import { addIsoDays, civilFromIso, todayIso } from '../tathaastu/dates';
import { EVENT_CANDIDATES } from '../tathaastu/events';
import { normalizeRankedDates } from '../tathaastu/normalize';
import type { FinderEvent, RankedDate, TathaSource } from '../tathaastu/types';

export type FinderEndpoint =
  | '/indian-api/v1/muhurat/marriage'
  | '/indian-api/v1/muhurat/house-entering'
  | '/indian-api/v1/muhurat/vehicle-purchase'
  | '/indian-api/v1/muhurat/business-start'
  | '/indian-api/v1/muhurat/property-purchase';

export type FinderResult = {
  ok: boolean;
  dates: RankedDate[];
  source?: TathaSource;
  endpoint?: FinderEndpoint | string;
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

function monthsCovering(startDate: string, endDate: string): { year: number; month: number }[] {
  const start = civilFromIso(startDate);
  const end = civilFromIso(endDate);
  const out: { year: number; month: number }[] = [];
  let year = start.year;
  let month = start.month;
  while (year < end.year || (year === end.year && month <= end.month)) {
    out.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    if (out.length > 6) break;
  }
  return out;
}

export async function findMuhuratDates(input: {
  event: FinderEvent;
  lat: number;
  lon: number;
  startDate?: string;
  endDate?: string;
  days?: number;
  minScore?: number;
  place?: string;
  fetch?: typeof fetch;
}): Promise<FinderResult> {
  const minScore = input.minScore ?? 60;
  const startDate = input.startDate ?? todayIso(input.lat, input.lon);
  const endDate = input.endDate ?? addIsoDays(startDate, input.days ?? 60);
  const options: DivineRequestOptions = { fetch: input.fetch };
  const candidates = EVENT_CANDIDATES[input.event];

  let lastSetup = false;
  let lastPlan = false;
  let lastError = 'unavailable';
  let endpoint: string | undefined;
  let eventUsed = candidates[0] ?? input.event;

  for (const event of candidates) {
    const collected: RankedDate[] = [];
    let failed = false;
    for (const month of monthsCovering(startDate, endDate)) {
      const result = await findMuhuratMonth(
        event,
        { ...month, lat: input.lat, lon: input.lon, place: input.place },
        options,
      );
      endpoint = result.ok || !result.ok ? result.endpoint : endpoint;
      if (!result.ok) {
        lastSetup = Boolean(result.setup);
        lastPlan = Boolean(result.planNeeded);
        lastError = result.error;
        if (result.setup && result.status === 0) {
          return { ok: false, dates: [], eventUsed: input.event, setup: true, error: result.error };
        }
        failed = true;
        break;
      }
      collected.push(
        ...normalizeRankedDates(result.data).filter((row) => row.date >= startDate && row.date <= endDate),
      );
    }
    if (!failed && collected.length) {
      const seen = new Set<string>();
      const unique = collected.filter((row) => {
        if (seen.has(row.date)) return false;
        seen.add(row.date);
        return true;
      });
      return {
        ok: true,
        dates: keepUsable(unique, minScore),
        source: 'live',
        endpoint,
        eventUsed: event,
      };
    }
    if (!failed) {
      return {
        ok: true,
        dates: [],
        source: 'live',
        endpoint,
        eventUsed: event,
      };
    }
    eventUsed = event;
  }

  return {
    ok: false,
    dates: [],
    eventUsed,
    setup: lastSetup,
    planNeeded: lastPlan,
    error: lastError,
    endpoint,
  };
}
