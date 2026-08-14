import { getDivineApiKey, getDivineApiToken, getDivineProxyUrl } from '../config/env';
import { mergeMatch, normalizeChart, normalizeMatch } from '../tathaastu/normalize';
import type {
  BirthData,
  FetchLike,
  NormalizedChart,
  NormalizedMatch,
  TathaFail,
  TathaLoad,
  TathaResult,
} from '../tathaastu/types';
import { birthBody, matchBody, monthBody, muhuratRouteFor, placeDateBody, type MonthInput, type PlaceDateInput } from './body';
import { kundliCacheKey, matchCacheKey } from './cache';
import {
  DIVINE_ROUTES,
  horoscopeChartPath,
  type DivineRoute,
  type DivineRouteId,
} from './endpoints';
import { readPersisted, writePersisted } from './persist';

export type DivineTransport = {
  kind: 'proxy' | 'direct';
  base: string;
  key: string | null;
  token: string | null;
};

export type DivineRequestOptions = {
  fetch?: typeof fetch;
  fetchImpl?: FetchLike;
  transport?: DivineTransport | null;
  language?: 'hi' | 'en' | string;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function resolveTransport(opts?: {
  proxyUrl?: string | null;
  apiKey?: string | null;
  token?: string | null;
}): DivineTransport | null {
  const proxy = (opts?.proxyUrl !== undefined ? opts.proxyUrl : getDivineProxyUrl())?.replace(/\/$/, '');
  if (proxy) {
    return { kind: 'proxy', base: proxy, key: null, token: null };
  }
  const key = opts?.apiKey !== undefined ? opts.apiKey : getDivineApiKey();
  if (key) {
    const token = opts?.token !== undefined ? opts.token : getDivineApiToken();
    return { kind: 'direct', base: '', key, token: token ?? key };
  }
  return null;
}

export function setupCopy(language: 'hi' | 'en'): string {
  return language === 'hi'
    ? 'लाइव पंचांग के लिए ऐप को DIVINE_PROXY_URL से जोड़ें। कुंजी सर्वर / EAS secret में रहती है — ऐप में नहीं।'
    : 'Live panchang needs the app pointed at DIVINE_PROXY_URL. The key stays on the server / EAS secret — never in the app.';
}

function fail(endpoint: string, status: number, error: string, extra?: Partial<TathaFail>): TathaFail {
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

function asFetchLike(options: DivineRequestOptions = {}): FetchLike {
  if (options.fetchImpl) return options.fetchImpl;
  if (options.fetch) {
    return async (url, init) => options.fetch!(url, init);
  }
  return fetch as FetchLike;
}

function unwrapPayload(parsed: unknown): { data: unknown; error?: string; success?: number } {
  if (!parsed || typeof parsed !== 'object') return { data: parsed };
  const rec = parsed as Record<string, unknown>;
  const success = typeof rec.success === 'number' ? rec.success : undefined;
  const error =
    typeof rec.msg === 'string'
      ? rec.msg
      : typeof rec.message === 'string'
        ? rec.message
        : typeof rec.error === 'string'
          ? rec.error
          : undefined;
  if (rec.data !== undefined) return { data: rec.data, error, success };
  return { data: parsed, error, success };
}

export function requestUrl(route: DivineRoute, transport: DivineTransport, path = route.path): string {
  if (transport.kind === 'proxy') {
    return `${trimSlash(transport.base)}${path}`;
  }
  return `${trimSlash(route.host)}${path}`;
}

export async function divineRequest(
  routeId: DivineRouteId,
  body: Record<string, string | number>,
  options: DivineRequestOptions = {},
  pathOverride?: string,
): Promise<TathaResult<unknown>> {
  const route = DIVINE_ROUTES[routeId];
  const endpoint = pathOverride ?? route.path;
  const transport = options.transport !== undefined ? options.transport : resolveTransport();
  if (!transport) {
    return fail(endpoint, 0, 'missing_key', {
      setup: true,
      detail: 'DIVINE_PROXY_URL (or a server DIVINE_API_KEY) is not set.',
    });
  }

  const payload = { ...body };
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (transport.kind === 'direct') {
    if (transport.key) payload.api_key = transport.key;
    if (transport.token) headers.Authorization = `Bearer ${transport.token}`;
  }

  const url = requestUrl(route, transport, endpoint);
  try {
    const res = await asFetchLike(options)(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
    const unwrapped = unwrapPayload(parsed);
    if (!res.ok || unwrapped.success === 0) {
      const status = !res.ok ? res.status : 400;
      return fail(endpoint, status, unwrapped.error ?? String(res.status), {
        detail: unwrapped.error,
      });
    }
    return { ok: true, data: unwrapped.data, source: 'live', status: res.status, endpoint };
  } catch (err) {
    return fail(endpoint, 0, err instanceof Error ? err.message : 'Network error');
  }
}

export function getPanchang(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('find-panchang', placeDateBody(input), options);
}

export function getAuspiciousTimings(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('auspicious-timings', placeDateBody(input), options);
}

export function getInauspiciousTimings(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('inauspicious-timings', placeDateBody(input), options);
}

export function getChoghadiya(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('find-choghadiya', placeDateBody(input), options);
}

export function getHora(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('hora', placeDateBody(input), options);
}

export function findMuhuratMonth(
  event: string,
  input: MonthInput,
  options?: DivineRequestOptions,
) {
  return divineRequest(muhuratRouteFor(event), monthBody(input), options);
}

export function getEnglishCalendarFestivals(input: MonthInput, options?: DivineRequestOptions) {
  return divineRequest('english-calendar-festivals', monthBody(input), options);
}

export function getDateSpecificFestivals(input: PlaceDateInput, options?: DivineRequestOptions) {
  return divineRequest('date-specific-festivals', placeDateBody(input), options);
}

export function findFestival(
  input: MonthInput & { festival: string },
  options?: DivineRequestOptions,
) {
  return divineRequest('find-festival', { ...monthBody(input), festival: input.festival }, options);
}

export function getBasicAstroDetails(data: BirthData, options?: DivineRequestOptions) {
  return divineRequest('basic-astro-details', birthBody(data, options?.language), options);
}

export function getPlanetaryPositions(data: BirthData, options?: DivineRequestOptions) {
  return divineRequest('planetary-positions', birthBody(data, options?.language), options);
}

export function getVimshottariDasha(data: BirthData, options?: DivineRequestOptions) {
  return divineRequest(
    'vimshottari-dasha',
    { ...birthBody(data, options?.language), dasha_type: 'antar-dasha' },
    options,
  );
}

export function getHoroscopeChart(
  data: BirthData,
  chartId: 'D1' | 'D9',
  options?: DivineRequestOptions,
) {
  return divineRequest(
    'horoscope-chart',
    birthBody(data, options?.language),
    options,
    horoscopeChartPath(chartId),
  );
}

export function getAshtakootMilan(
  personA: BirthData,
  personB: BirthData,
  options?: DivineRequestOptions,
) {
  return divineRequest('ashtakoot-milan', matchBody(personA, personB, options?.language), options);
}

export function getDashakootMilan(
  personA: BirthData,
  personB: BirthData,
  options?: DivineRequestOptions,
) {
  return divineRequest('dashakoot-milan', matchBody(personA, personB, options?.language), options);
}

function chartImage(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return typeof raw === 'string' ? raw : null;
  const rec = raw as Record<string, unknown>;
  const value = rec.svg ?? rec.image ?? rec.url ?? rec.chart;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function loadBirthChart(
  data: BirthData,
  opts?: DivineRequestOptions,
): Promise<TathaLoad<NormalizedChart>> {
  const language = opts?.language ?? 'en';
  const cacheKey = kundliCacheKey(data, language);
  const cached = await readPersisted<NormalizedChart>(cacheKey);
  if (cached) {
    return { ok: true, data: cached, source: 'live', status: 200 };
  }

  const [basic, planets, dasha, d1, d9] = await Promise.all([
    getBasicAstroDetails(data, opts),
    getPlanetaryPositions(data, opts),
    getVimshottariDasha(data, opts),
    getHoroscopeChart(data, 'D1', opts),
    getHoroscopeChart(data, 'D9', opts),
  ]);

  if (!basic.ok && !planets.ok) {
    const failRes = !basic.ok ? basic : planets;
    return {
      ok: false,
      error: failRes.error,
      setup: failRes.setup,
      planNeeded: failRes.planNeeded,
      status: failRes.status,
    };
  }

  const merged = {
    ...(basic.ok && typeof basic.data === 'object' ? (basic.data as object) : {}),
    ...(planets.ok && typeof planets.data === 'object' ? (planets.data as object) : {}),
    vimshottari_dasha: dasha.ok ? dasha.data : undefined,
    vargas: {
      d1: d1.ok ? chartImage(d1.data) : null,
      d9: d9.ok ? chartImage(d9.data) : null,
    },
  };
  const chart = normalizeChart(merged, data.name);
  await writePersisted(cacheKey, chart);
  return { ok: true, data: chart, source: 'live', status: basic.ok ? basic.status : planets.status };
}

export async function matchPeople(
  personA: BirthData,
  personB: BirthData,
  opts?: DivineRequestOptions,
): Promise<TathaLoad<NormalizedMatch>> {
  const language = opts?.language ?? 'en';
  const cacheKey = matchCacheKey(personA, personB, language);
  const cached = await readPersisted<NormalizedMatch>(cacheKey);
  if (cached) {
    return { ok: true, data: cached, source: 'live', status: 200 };
  }

  const ashta = await getAshtakootMilan(personA, personB, opts);
  if (!ashta.ok) {
    return {
      ok: false,
      error: ashta.error,
      setup: ashta.setup,
      planNeeded: ashta.planNeeded,
      status: ashta.status,
    };
  }

  const dasha = await getDashakootMilan(personA, personB, opts);
  const primary = normalizeMatch(ashta.data, personA.name, personB.name);
  const merged = dasha.ok ? mergeMatch(primary, normalizeMatch(dasha.data, personA.name, personB.name)) : primary;
  const next = dasha.ok ? { ...merged, total: primary.total || merged.total, max: primary.max || 36, kutas: primary.kutas } : primary;
  await writePersisted(cacheKey, next);
  return { ok: true, data: next, source: 'live', status: ashta.status };
}
