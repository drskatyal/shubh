import { getTathaastuApiKey, getTathaastuBaseUrl } from '../config/env';
import type { Query, TathaFail, TathaResult } from './types';

export const TATHAASTU_PUBLIC_BASE = 'https://api.tathaastuapi.com/v1';

export type TathaRequestOptions = {
  fetch?: typeof fetch;
  method?: 'GET' | 'POST';
  body?: unknown;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function encodeQuery(query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}

function fail(
  endpoint: string,
  status: number,
  error: string,
  extra?: Partial<TathaFail>,
): TathaFail {
  return {
    ok: false,
    status,
    error,
    endpoint,
    setup: status === 401 || extra?.setup,
    planNeeded: status === 402 || status === 429 || extra?.planNeeded,
    ...extra,
  };
}

export async function tathaRequest<T>(
  path: string,
  query: Query = {},
  options: TathaRequestOptions = {},
): Promise<TathaResult<T>> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const key = getTathaastuApiKey();
  if (!key) {
    return fail(endpoint, 401, 'Missing or invalid API key. Pass X-API-Key header.', {
      setup: true,
      detail: 'TATHAASTU_API_KEY is not set. Using fixtures.',
    });
  }

  const url = `${trimSlash(getTathaastuBaseUrl())}${endpoint}${encodeQuery(query)}`;
  const headers: Record<string, string> = { Accept: 'application/json', 'X-API-Key': key };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  try {
    const fetchImpl = options.fetch ?? fetch;
    const response = await fetchImpl(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { error: text };
      }
    }
    if (!response.ok) {
      const rec = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
      return fail(endpoint, response.status, String(rec.error ?? rec.message ?? response.statusText), {
        detail: typeof rec.detail === 'string' ? rec.detail : typeof rec.message === 'string' ? rec.message : undefined,
        code: typeof rec.code === 'string' ? rec.code : undefined,
      });
    }
    return { ok: true, data: parsed as T, source: 'live', status: response.status, endpoint };
  } catch (err) {
    return fail(endpoint, 0, err instanceof Error ? err.message : 'Network error');
  }
}

export function tathaGet<T>(path: string, query?: Query, options?: TathaRequestOptions): Promise<TathaResult<T>> {
  return tathaRequest<T>(path, query, options);
}

export function tathaPost<T>(
  path: string,
  body: unknown,
  query?: Query,
  options?: TathaRequestOptions,
): Promise<TathaResult<T>> {
  return tathaRequest<T>(path, query, { ...options, method: 'POST', body });
}

export function muhuratFindQuery(input: {
  event: string;
  startDate: string;
  endDate: string;
  lat: number;
  lon: number;
  minScore?: number;
  minRating?: string;
}): Query {
  const minScore = input.minScore ?? 60;
  return {
    event: input.event,
    start_date: input.startDate,
    end_date: input.endDate,
    start: input.startDate,
    end: input.endDate,
    lat: input.lat,
    lon: input.lon,
    min_score: minScore,
    min_rating: input.minRating,
  };
}

/** GET /v1/muhurat/find — PRODUCT + docs.html (lat/lon + date range). */
export function findMuhurat(
  input: {
    event: string;
    startDate: string;
    endDate: string;
    lat: number;
    lon: number;
    minScore?: number;
    minRating?: string;
  },
  options?: TathaRequestOptions,
) {
  return tathaGet('/muhurat/find', muhuratFindQuery(input), options);
}

/** GET /v1/events/find-dates — OpenAPI alias of /v1/muhurat/find. */
export function findEventDates(
  input: {
    event: string;
    startDate: string;
    endDate: string;
    lat: number;
    lon: number;
    minScore?: number;
    minRating?: string;
  },
  options?: TathaRequestOptions,
) {
  return tathaGet('/events/find-dates', muhuratFindQuery(input), options);
}

/** GET /v1/events/suitability */
export function getEventSuitability(
  input: { date: string; lat: number; lon: number; event?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/events/suitability', input, options);
}

/** GET /v1/festivals */
export function getFestivals(
  input: { date: string; lat?: number; lon?: number; lang?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/festivals', input, options);
}

/** GET /v1/festivals/month */
export function getFestivalsMonth(
  input: { year: number; month: number; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/festivals/month', input, options);
}

/** GET /v1/festivals/explain */
export function explainFestival(
  input: { date: string; festival: string; location_id?: number },
  options?: TathaRequestOptions,
) {
  return tathaGet('/festivals/explain', input, options);
}

/** GET /v1/calendar/month */
export function getCalendarMonth(
  input: { year: number; month: number; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/calendar/month', input, options);
}

/** GET /v1/calendar/day */
export function getCalendarDay(
  input: { date: string; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/calendar/day', input, options);
}

/** Shared home-PR contract. This PR does not render panchang home. */
export function getDayContext(
  input: { date: string; lat: number; lon: number; lang?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/day-context', input, options);
}

export function getPanchang(
  input: { date: string; lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/panchang', input, options);
}

export function getPanchangToday(
  input: { lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/panchang/today', input, options);
}

export function getPanchangLite(
  input: { date: string; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/panchang/lite', input, options);
}

export function getTimings(
  input: { date: string; lat: number; lon: number; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/timings', input, options);
}
