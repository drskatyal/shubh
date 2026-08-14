import { getTathaastuApiKey, getTathaastuProxyUrl } from '../config/env';
import { timezoneFor } from '../engine/time';
import { MOCK_BIRTH_CHART } from '../fixtures/mockBirthChart';
import { MOCK_COMPATIBILITY } from '../fixtures/mockCompatibility';
import { mergeMatch, normalizeChart, normalizeMatch } from './normalize';
import type {
  BirthData,
  BirthDataDocsAlias,
  CompatibilityRequest,
  CompatibilityRequestDocsAlias,
  FetchLike,
  NormalizedChart,
  NormalizedMatch,
  ScoreQuery,
  TathaLoad,
} from './types';

export const TATHAASTU_HOST = 'https://api.tathaastuapi.com';

export type TathaTransport = {
  base: string;
  key: string | null;
};

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
    ? 'लाइव कुंडली के लिए TATHAASTU_API_KEY सर्वर / EAS secret में डालें, और ऐप को TATHAASTU_PROXY_URL से जोड़ें। कुंजी ऐप में नहीं जाती।'
    : 'Live kundli needs TATHAASTU_API_KEY on the server / EAS secret, and the app pointed at TATHAASTU_PROXY_URL. The key never ships in the app.';
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

type HttpResult =
  | { ok: true; status: number; json: unknown }
  | { ok: false; status: number; reason: 'http' | 'network'; body: string };

export async function tathaFetch(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown },
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null },
): Promise<HttpResult> {
  const transport = opts?.transport !== undefined ? opts.transport : resolveTransport();
  if (!transport) {
    return { ok: false, status: 0, reason: 'http', body: 'missing_key' };
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (transport.key) headers['X-API-Key'] = transport.key;

  const fetchImpl = opts?.fetchImpl ?? (fetch as FetchLike);
  try {
    const res = await fetchImpl(`${transport.base}${path}`, {
      method: init.method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, reason: 'http', body: text };
    }
    try {
      return { ok: true, status: res.status, json: text ? JSON.parse(text) : {} };
    } catch {
      return { ok: false, status: res.status, reason: 'http', body: text };
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      reason: 'network',
      body: err instanceof Error ? err.message : 'network',
    };
  }
}

function shouldFallback(status: number): boolean {
  return status === 0 || status === 401 || status === 402 || status === 429;
}

async function postWithAliasRetry(
  path: string,
  openApiBody: unknown,
  aliasBody: unknown,
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null },
): Promise<HttpResult> {
  const first = await tathaFetch(path, { method: 'POST', body: openApiBody }, opts);
  if (first.ok || first.status !== 422) return first;
  return tathaFetch(path, { method: 'POST', body: aliasBody }, opts);
}

export async function createBirthChart(
  data: BirthData,
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null },
): Promise<HttpResult> {
  const openApi = toOpenApiBody(data);
  const alias = toDocsAliasBody(data);
  return postWithAliasRetry(
    '/v1/birth-chart?store=false&include_yogas=true',
    openApi,
    alias,
    opts,
  );
}

export async function getKundliTeaser(
  data: BirthData,
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null; lang?: 'hi' | 'en' },
): Promise<HttpResult> {
  const q = new URLSearchParams({
    date: data.date_of_birth,
    time: data.time_of_birth.slice(0, 5),
    lat: String(data.latitude),
    lon: String(data.longitude),
    name: data.name,
    lang: opts?.lang ?? 'en',
  });
  return tathaFetch(`/v1/kundli/teaser?${q.toString()}`, { method: 'GET' }, opts);
}

export async function getCompatibilityScore(
  personA: BirthData,
  personB: BirthData,
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null; mode?: 'full' | 'lite' },
): Promise<HttpResult> {
  const q = toScoreQuery(personA, personB, opts?.mode ?? 'lite');
  const params = new URLSearchParams({
    bride_dob: q.bride_dob,
    bride_time: q.bride_time,
    bride_lat: String(q.bride_lat),
    bride_lon: String(q.bride_lon),
    groom_dob: q.groom_dob,
    groom_time: q.groom_time,
    groom_lat: String(q.groom_lat),
    groom_lon: String(q.groom_lon),
    mode: q.mode ?? 'lite',
  });
  return tathaFetch(`/v1/compatibility/score?${params.toString()}`, { method: 'GET' }, opts);
}

export async function createCompatibility(
  personA: BirthData,
  personB: BirthData,
  opts?: { fetchImpl?: FetchLike; transport?: TathaTransport | null },
): Promise<HttpResult> {
  const a = toOpenApiBody(personA);
  const b = toOpenApiBody(personB);
  const openApi: CompatibilityRequest = { person_a: a, person_b: b };
  const alias: CompatibilityRequestDocsAlias = {
    person1: toDocsAliasBody(personA),
    person2: toDocsAliasBody(personB),
  };
  return postWithAliasRetry('/v1/compatibility?store=false', openApi, alias, opts);
}

export async function loadBirthChart(
  data: BirthData,
  opts?: {
    fetchImpl?: FetchLike;
    transport?: TathaTransport | null;
    language?: 'hi' | 'en';
  },
): Promise<TathaLoad<NormalizedChart>> {
  const language = opts?.language ?? 'en';
  const transport = opts?.transport !== undefined ? opts.transport : resolveTransport();
  if (!transport) {
    return {
      data: { ...MOCK_BIRTH_CHART, name: data.name || MOCK_BIRTH_CHART.name },
      source: 'fixture',
      setup: setupCopy(language),
      status: 0,
    };
  }

  const live = await createBirthChart(data, { ...opts, transport });
  if (live.ok) {
    return { data: normalizeChart(live.json, data.name), source: 'live', status: live.status };
  }

  if (live.status === 402) {
    const teaser = await getKundliTeaser(data, { ...opts, transport, lang: language });
    if (teaser.ok) {
      return { data: normalizeChart(teaser.json, data.name), source: 'live', status: teaser.status };
    }
  }

  if (shouldFallback(live.status)) {
    return {
      data: { ...MOCK_BIRTH_CHART, name: data.name || MOCK_BIRTH_CHART.name },
      source: 'fixture',
      setup: setupCopy(language),
      status: live.status,
    };
  }

  return {
    data: { ...MOCK_BIRTH_CHART, name: data.name || MOCK_BIRTH_CHART.name },
    source: 'fixture',
    setup: setupCopy(language),
    status: live.status,
  };
}

export async function matchPeople(
  personA: BirthData,
  personB: BirthData,
  opts?: {
    fetchImpl?: FetchLike;
    transport?: TathaTransport | null;
    language?: 'hi' | 'en';
  },
): Promise<TathaLoad<NormalizedMatch>> {
  const language = opts?.language ?? 'en';
  const names = {
    a: personA.name || MOCK_COMPATIBILITY.personA,
    b: personB.name || MOCK_COMPATIBILITY.personB,
  };
  const fixture: TathaLoad<NormalizedMatch> = {
    data: { ...MOCK_COMPATIBILITY, personA: names.a, personB: names.b },
    source: 'fixture',
    setup: setupCopy(language),
    status: 0,
  };

  const transport = opts?.transport !== undefined ? opts.transport : resolveTransport();
  if (!transport) {
    return fixture;
  }

  const scoreRes = await getCompatibilityScore(personA, personB, { ...opts, transport });
  let score: NormalizedMatch | null = null;
  if (scoreRes.ok) {
    score = normalizeMatch(scoreRes.json, names.a, names.b);
  }

  const fullRes =
    scoreRes.ok || scoreRes.status === 402
      ? await createCompatibility(personA, personB, { ...opts, transport })
      : scoreRes;

  if (fullRes.ok) {
    const full = normalizeMatch(fullRes.json, names.a, names.b);
    return {
      data: score ? mergeMatch(score, full) : full,
      source: 'live',
      status: fullRes.status,
    };
  }

  if (score) {
    return { data: score, source: 'live', status: scoreRes.status };
  }

  if (shouldFallback(scoreRes.status) || shouldFallback(fullRes.status)) {
    return { ...fixture, status: fullRes.status || scoreRes.status };
  }

  return { ...fixture, status: fullRes.status || scoreRes.status };
}
