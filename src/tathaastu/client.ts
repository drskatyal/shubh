import { getTathaastuApiKey, getTathaastuProxyUrl } from '../config/env';
import { timezoneFor } from '../engine/time';
import { mergeMatch, normalizeChart, normalizeMatch } from './normalize';
import type {
  BirthData,
  BirthDataDocsAlias,
  CompatibilityRequest,
  CompatibilityRequestDocsAlias,
  FetchLike,
  NormalizedChart,
  NormalizedMatch,
  Query,
  ScoreQuery,
  TathaFail,
  TathaLoad,
  TathaResult,
} from './types';

export const TATHAASTU_HOST = 'https://api.tathaastuapi.com';

export type TathaTransport = {
  base: string;
  key: string | null;
};

export type TathaRequestOptions = {
  fetch?: typeof fetch;
  fetchImpl?: FetchLike;
  method?: 'GET' | 'POST';
  body?: unknown;
  transport?: TathaTransport | null;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function resolveTransport(opts?: {
  proxyUrl?: string | null;
  apiKey?: string | null;
}): TathaTransport | null {
  const proxy = (opts?.proxyUrl !== undefined ? opts.proxyUrl : getTathaastuProxyUrl())?.replace(
    /\/$/,
    '',
  );
  if (proxy) {
    return { base: proxy, key: null };
  }
  const key = opts?.apiKey !== undefined ? opts.apiKey : getTathaastuApiKey();
  if (key) {
    return { base: TATHAASTU_HOST, key };
  }
  return null;
}

export function setupCopy(language: 'hi' | 'en'): string {
  return language === 'hi'
    ? 'लाइव पंचांग के लिए ऐप को TATHAASTU_PROXY_URL से जोड़ें। कुंजी सर्वर / EAS secret में रहती है — ऐप में नहीं।'
    : 'Live panchang needs the app pointed at TATHAASTU_PROXY_URL. The key stays on the server / EAS secret — never in the app.';
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
    setup: status === 0 || status === 401 || extra?.setup,
    planNeeded: status === 402 || status === 429 || extra?.planNeeded,
    ...extra,
  };
}

function asFetchLike(options: TathaRequestOptions = {}): FetchLike {
  if (options.fetchImpl) return options.fetchImpl;
  if (options.fetch) {
    return async (url, init) => options.fetch!(url, init);
  }
  return fetch as FetchLike;
}

export async function tathaRequest<T>(
  path: string,
  query: Query = {},
  options: TathaRequestOptions = {},
): Promise<TathaResult<T>> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const transport = options.transport !== undefined ? options.transport : resolveTransport();
  if (!transport) {
    return fail(endpoint, 0, 'missing_key', {
      setup: true,
      detail: 'TATHAASTU_PROXY_URL (or a server TATHAASTU_API_KEY) is not set.',
    });
  }

  const url = `${trimSlash(transport.base)}${endpoint}${encodeQuery(query)}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (transport.key) headers['X-API-Key'] = transport.key;

  try {
    const res = await asFetchLike(options)(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { error: text };
      }
    }
    if (!res.ok) {
      const rec = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
      return fail(endpoint, res.status, String(rec.error ?? rec.message ?? res.status), {
        detail: typeof rec.detail === 'string' ? rec.detail : typeof rec.message === 'string' ? rec.message : undefined,
        code: typeof rec.code === 'string' ? rec.code : undefined,
      });
    }
    return { ok: true, data: parsed as T, source: 'live', status: res.status, endpoint };
  } catch (err) {
    return fail(endpoint, 0, err instanceof Error ? err.message : 'Network error');
  }
}

export function tathaGet<T>(
  path: string,
  query?: Query,
  options?: TathaRequestOptions,
): Promise<TathaResult<T>> {
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

function withTimezone(data: BirthData): BirthData {
  if (data.timezone) return data;
  try {
    return { ...data, timezone: timezoneFor(data.latitude, data.longitude) };
  } catch {
    return { ...data, timezone: 'Asia/Kolkata' };
  }
}

export function toOpenApiBody(data: BirthData): BirthData {
  const next = withTimezone(data);
  return {
    name: next.name.trim(),
    date_of_birth: next.date_of_birth,
    time_of_birth: next.time_of_birth,
    latitude: next.latitude,
    longitude: next.longitude,
    timezone: next.timezone,
    gender: next.gender ?? null,
    place_name: next.place_name ?? null,
  };
}

export function toDocsAliasBody(data: BirthData): BirthDataDocsAlias {
  const next = withTimezone(data);
  return {
    name: next.name.trim(),
    date: next.date_of_birth,
    time: next.time_of_birth,
    lat: next.latitude,
    lon: next.longitude,
    tz: next.timezone,
  };
}

export function toScoreQuery(bride: BirthData, groom: BirthData, mode: 'full' | 'lite' = 'lite'): ScoreQuery {
  return {
    bride_dob: bride.date_of_birth,
    bride_time: bride.time_of_birth.slice(0, 5),
    bride_lat: bride.latitude,
    bride_lon: bride.longitude,
    groom_dob: groom.date_of_birth,
    groom_time: groom.time_of_birth.slice(0, 5),
    groom_lat: groom.latitude,
    groom_lon: groom.longitude,
    mode,
  };
}

async function postWithAliasRetry(
  path: string,
  openApiBody: unknown,
  aliasBody: unknown,
  opts?: TathaRequestOptions,
): Promise<TathaResult<unknown>> {
  const first = await tathaPost(path, openApiBody, {}, opts);
  if (first.ok || first.status !== 422) return first;
  return tathaPost(path, aliasBody, {}, opts);
}

export async function createBirthChart(
  data: BirthData,
  opts?: TathaRequestOptions,
): Promise<TathaResult<unknown>> {
  return postWithAliasRetry(
    '/v1/birth-chart?store=false&include_yogas=true',
    toOpenApiBody(data),
    toDocsAliasBody(data),
    opts,
  );
}

export async function getKundliTeaser(
  data: BirthData,
  opts?: TathaRequestOptions & { lang?: 'hi' | 'en' },
): Promise<TathaResult<unknown>> {
  return tathaGet(
    '/v1/kundli/teaser',
    {
      date: data.date_of_birth,
      time: data.time_of_birth.slice(0, 5),
      lat: data.latitude,
      lon: data.longitude,
      name: data.name,
      lang: opts?.lang ?? 'en',
    },
    opts,
  );
}

export async function getCompatibilityScore(
  personA: BirthData,
  personB: BirthData,
  opts?: TathaRequestOptions & { mode?: 'full' | 'lite' },
): Promise<TathaResult<unknown>> {
  const q = toScoreQuery(personA, personB, opts?.mode ?? 'lite');
  return tathaGet('/v1/compatibility/score', { ...q }, opts);
}

export async function createCompatibility(
  personA: BirthData,
  personB: BirthData,
  opts?: TathaRequestOptions,
): Promise<TathaResult<unknown>> {
  const openApi: CompatibilityRequest = {
    person_a: toOpenApiBody(personA),
    person_b: toOpenApiBody(personB),
  };
  const alias: CompatibilityRequestDocsAlias = {
    person1: toDocsAliasBody(personA),
    person2: toDocsAliasBody(personB),
  };
  return postWithAliasRetry('/v1/compatibility?store=false', openApi, alias, opts);
}

export async function loadBirthChart(
  data: BirthData,
  opts?: TathaRequestOptions & { language?: 'hi' | 'en' },
): Promise<TathaLoad<NormalizedChart>> {
  const language = opts?.language ?? 'en';
  const live = await createBirthChart(data, opts);
  if (live.ok) {
    return { ok: true, data: normalizeChart(live.data, data.name), source: 'live', status: live.status };
  }

  if (live.status === 402) {
    const teaser = await getKundliTeaser(data, { ...opts, lang: language });
    if (teaser.ok) {
      return {
        ok: true,
        data: normalizeChart(teaser.data, data.name),
        source: 'live',
        status: teaser.status,
      };
    }
  }

  return {
    ok: false,
    error: live.error,
    setup: live.setup,
    planNeeded: live.planNeeded,
    status: live.status,
  };
}

export async function matchPeople(
  personA: BirthData,
  personB: BirthData,
  opts?: TathaRequestOptions,
): Promise<TathaLoad<NormalizedMatch>> {
  const names = { a: personA.name, b: personB.name };
  const scoreRes = await getCompatibilityScore(personA, personB, opts);
  let score: NormalizedMatch | null = null;
  if (scoreRes.ok) {
    score = normalizeMatch(scoreRes.data, names.a, names.b);
  }

  const fullRes =
    scoreRes.ok || scoreRes.status === 402
      ? await createCompatibility(personA, personB, opts)
      : scoreRes;

  if (fullRes.ok) {
    const full = normalizeMatch(fullRes.data, names.a, names.b);
    return {
      ok: true,
      data: score ? mergeMatch(score, full) : full,
      source: 'live',
      status: fullRes.status,
    };
  }

  if (score) {
    return { ok: true, data: score, source: 'live', status: scoreRes.status };
  }

  const fail = !fullRes.ok ? fullRes : !scoreRes.ok ? scoreRes : null;
  return {
    ok: false,
    error: fail?.error ?? 'unavailable',
    setup: fail?.setup,
    planNeeded: fail?.planNeeded,
    status: fail?.status ?? fullRes.status,
  };
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
  return tathaGet('/v1/muhurat/find', muhuratFindQuery(input), options);
}

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
  return tathaGet('/v1/events/find-dates', muhuratFindQuery(input), options);
}

export function getEventSuitability(
  input: { date: string; lat: number; lon: number; event?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/events/suitability', input, options);
}

export function getFestivalsMonth(
  input: { year: number; month: number; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/festivals/month', input, options);
}

export function explainFestival(
  input: { date: string; festival: string; location_id?: number },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/festivals/explain', input, options);
}

export function getCalendarMonth(
  input: { year: number; month: number; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/calendar/month', input, options);
}

export function getCalendarDay(
  input: { date: string; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/calendar/day', input, options);
}

export function getDayContext(
  input: { date: string; lat: number; lon: number; lang?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/day-context', input, options);
}

export function getPanchang(
  input: { date: string; lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/panchang', input, options);
}

export function getPanchangToday(
  input: { lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/panchang/today', input, options);
}

export function getPanchangLite(
  input: { date: string; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/panchang/lite', input, options);
}

export function getTimings(
  input: { date: string; lat: number; lon: number; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet('/v1/timings', input, options);
}
