import { getTathaastuApiKey, getTathaastuProxyUrl } from '../config/env';
import { asV1Path, TATHAASTU_HOST, TATHA_PATHS } from './paths';
import type { FetchLike, Query, TathaFail, TathaResult, TathaTransport } from './types';

export { TATHAASTU_HOST };

export type TathaRequestOptions = {
  fetch?: FetchLike;
  fetchImpl?: FetchLike;
  method?: 'GET' | 'POST';
  body?: unknown;
  transport?: TathaTransport | null;
  proxyUrl?: string | null;
  apiKey?: string | null;
};

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
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

/**
 * Proxy first (key stays on the server). Direct key only in Node / tests.
 * Matches PR #4 `resolveTransport` so kundli/muhurat can share this file.
 */
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

function fail(endpoint: string, status: number, error: string, extra?: Partial<TathaFail>): TathaFail {
  return { ok: false, status, endpoint, error, ...extra };
}

/**
 * Shared live GET/POST. Path is `/v1/…` or a short `/panchang/today`
 * (PR #5 style) — both normalize to OpenAPI paths.
 */
export async function tathaFetch(
  path: string,
  init: { method?: 'GET' | 'POST'; body?: unknown; query?: Query } = {},
  opts: TathaRequestOptions = {},
): Promise<TathaResult> {
  const endpoint = asV1Path(path);
  const transport =
    opts.transport !== undefined
      ? opts.transport
      : resolveTransport({ proxyUrl: opts.proxyUrl, apiKey: opts.apiKey });
  if (!transport) {
    return fail(endpoint, 0, 'missing_key');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (transport.key) headers['X-API-Key'] = transport.key;

  const fetchImpl = opts.fetchImpl ?? opts.fetch ?? (globalThis.fetch as FetchLike | undefined);
  if (!fetchImpl) {
    return fail(endpoint, 0, 'no_fetch');
  }

  const url = `${trimSlash(transport.base)}${endpoint}${encodeQuery(init.query ?? {})}`;
  try {
    const res = await fetchImpl(url, {
      method: init.method ?? 'GET',
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = {};
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { error: text.slice(0, 240) };
      }
    }
    const rec = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    if (!res.ok) {
      return fail(endpoint, res.status, String(rec.error ?? rec.message ?? `http_${res.status}`), {
        detail: typeof rec.detail === 'string' ? rec.detail : undefined,
        code: typeof rec.code === 'string' ? rec.code : undefined,
      });
    }
    return { ok: true, status: res.status, endpoint, data: parsed, json: parsed, source: 'live' };
  } catch (err) {
    return fail(endpoint, 0, err instanceof Error ? err.message : 'network');
  }
}

export function tathaRequest<T>(
  path: string,
  query: Query = {},
  options: TathaRequestOptions = {},
): Promise<TathaResult<T>> {
  return tathaFetch(path, { method: options.method ?? 'GET', body: options.body, query }, options) as Promise<
    TathaResult<T>
  >;
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

export function isQuotaStatus(status: number): boolean {
  return status === 401 || status === 402 || status === 429;
}

export function getDayContext(
  input: { date: string; lat: number; lon: number; lang?: string; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.dayContext, input, options);
}

export function getPanchang(
  input: { date: string; lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.panchang, input, options);
}

export function getPanchangToday(
  input: { lat?: number; lon?: number; lang?: string; include?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.panchangToday, input, options);
}

export function getPanchangLite(
  input: { date: string; lat?: number; lon?: number; lang?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.panchangLite, input, options);
}

export function getTimings(
  input: { date: string; lat: number; lon: number; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.timings, input, options);
}

export function getChoghadiya(
  input: { date: string; lat: number; lon: number; region?: string },
  options?: TathaRequestOptions,
) {
  return tathaGet(TATHA_PATHS.choghadiya, input, options);
}
