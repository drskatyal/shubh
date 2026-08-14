import {
  getAuspiciousTimings,
  getChoghadiya,
  getHora,
  getInauspiciousTimings,
  getPanchang,
  type DivineRequestOptions,
} from '../divine/client';
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mergeDayPayload(parts: unknown[]): unknown {
  return parts.reduce<Record<string, unknown>>((acc, part) => {
    const rec = asRecord(part);
    return {
      ...acc,
      ...rec,
      auspicious: { ...asRecord(acc.auspicious), ...asRecord(rec.abhijit_muhurta ? rec : rec.auspicious) },
      inauspicious: {
        ...asRecord(acc.inauspicious),
        ...asRecord(rec.rahu_kaal ? rec : rec.inauspicious),
      },
    };
  }, {});
}

export async function loadLiveDay(input: {
  lat: number;
  lon: number;
  lang: 'hi' | 'en';
  date?: string;
  place?: string;
  fetch?: typeof fetch;
}): Promise<DayLoad> {
  const date = input.date ?? todayIso(input.lat, input.lon);
  const options: DivineRequestOptions = { fetch: input.fetch };
  const query = { date, lat: input.lat, lon: input.lon, lang: input.lang, place: input.place };

  const [panchang, auspicious, inauspicious, choghadiya, hora] = await Promise.all([
    getPanchang(query, options),
    getAuspiciousTimings(query, options),
    getInauspiciousTimings(query, options),
    getChoghadiya(query, options),
    getHora(query, options),
  ]);

  if (!panchang.ok && panchang.setup && panchang.status === 0) {
    return { ok: false, setup: true, error: panchang.error, endpoint: panchang.endpoint };
  }

  if (!panchang.ok) {
    return {
      ok: false,
      setup: panchang.setup,
      planNeeded: panchang.planNeeded,
      error: panchang.error,
      endpoint: panchang.endpoint,
    };
  }

  const merged = mergeDayPayload([
    panchang.data,
    auspicious.ok ? auspicious.data : {},
    inauspicious.ok ? inauspicious.data : {},
    choghadiya.ok ? choghadiya.data : {},
    hora.ok ? hora.data : {},
  ]);

  return {
    ok: true,
    day: normalizeDay(merged, date),
    source: 'live',
    endpoint: panchang.endpoint,
    planNeeded: !auspicious.ok || !inauspicious.ok,
  };
}
