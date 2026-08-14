import { describe, expect, it } from 'vitest';

import { resolveTransport, tathaGet } from '../client';
import { TATHAASTU_HOST } from '../paths';

describe('resolveTransport', () => {
  it('prefers the proxy and does not attach a key', () => {
    expect(resolveTransport({ proxyUrl: 'http://127.0.0.1:8787', apiKey: 'sk_live_x' })).toEqual({
      base: 'http://127.0.0.1:8787',
      key: null,
    });
  });

  it('uses the public host only when a Node key is supplied', () => {
    expect(resolveTransport({ proxyUrl: null, apiKey: 'sk_live_x' })).toEqual({
      base: TATHAASTU_HOST,
      key: 'sk_live_x',
    });
  });

  it('returns null when neither proxy nor key exist', () => {
    expect(resolveTransport({ proxyUrl: null, apiKey: null })).toBeNull();
  });
});

describe('tathaGet', () => {
  it('sends X-API-Key only on the direct host', async () => {
    const headers: string[] = [];
    const result = await tathaGet(
      '/v1/panchang/today',
      { lat: 19.076, lon: 72.8777, lang: 'en' },
      {
        apiKey: 'sk_live_test',
        proxyUrl: null,
        fetchImpl: async (url, init) => {
          headers.push(init.headers['X-API-Key'] ?? '');
          expect(url).toContain('https://api.tathaastuapi.com/v1/panchang/today');
          return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ tithi: { name: 'Dwitiya' } }),
          };
        },
      },
    );
    expect(result.ok).toBe(true);
    expect(headers).toEqual(['sk_live_test']);
  });

  it('omits the key when calling the proxy', async () => {
    let seenKey: string | undefined;
    const result = await tathaGet(
      '/panchang/today',
      { lat: 28.6, lon: 77.2 },
      {
        proxyUrl: 'http://proxy.test',
        apiKey: 'should-not-be-sent',
        fetchImpl: async (url, init) => {
          seenKey = init.headers['X-API-Key'];
          expect(url.startsWith('http://proxy.test/v1/panchang/today')).toBe(true);
          return { ok: true, status: 200, text: async () => '{}' };
        },
      },
    );
    expect(result.ok).toBe(true);
    expect(seenKey).toBeUndefined();
  });

  it('maps 401 without throwing', async () => {
    const result = await tathaGet(
      '/v1/day-context',
      { date: '2026-08-14', lat: 19, lon: 72 },
      {
        apiKey: 'bad',
        proxyUrl: null,
        fetchImpl: async () => ({
          ok: false,
          status: 401,
          text: async () => JSON.stringify({ error: 'authentication_required' }),
        }),
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(401);
  });
});
