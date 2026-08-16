import { afterEach, describe, expect, it } from 'vitest';

import type { BirthData, FetchLike } from '../../tathaastu/types';
import { birthBody, placeDateBody } from '../body';
import {
  getAshtakootMilan,
  getPanchang,
  loadBirthChart,
  matchPeople,
  requestUrl,
  resolveTransport,
} from '../client';
import { DIVINE_ROUTES } from '../endpoints';

const ARJUN: BirthData = {
  name: 'Arjun',
  date_of_birth: '1990-05-15',
  time_of_birth: '06:30',
  latitude: 28.6139,
  longitude: 77.209,
  place_name: 'Delhi',
  gender: 'male',
};

const PRIYA: BirthData = {
  name: 'Priya',
  date_of_birth: '1992-08-22',
  time_of_birth: '14:15',
  latitude: 28.6139,
  longitude: 77.209,
  place_name: 'Delhi',
  gender: 'female',
};

function jsonFetch(
  handler: (url: string, init: { method: string; body?: string; headers: Record<string, string> }) => {
    status: number;
    body: unknown;
  },
): FetchLike {
  return async (url, init) => {
    const result = handler(url, init);
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      async text() {
        return JSON.stringify(result.body);
      },
    };
  };
}

const originalKey = process.env.DIVINE_API_KEY;
const originalProxy = process.env.DIVINE_PROXY_URL;
const originalToken = process.env.DIVINE_API_TOKEN;

afterEach(() => {
  if (originalKey === undefined) delete process.env.DIVINE_API_KEY;
  else process.env.DIVINE_API_KEY = originalKey;
  if (originalProxy === undefined) delete process.env.DIVINE_PROXY_URL;
  else process.env.DIVINE_PROXY_URL = originalProxy;
  if (originalToken === undefined) delete process.env.DIVINE_API_TOKEN;
  else process.env.DIVINE_API_TOKEN = originalToken;
});

describe('resolveTransport', () => {
  it('prefers a proxy URL and never attaches a key', () => {
    const transport = resolveTransport({
      proxyUrl: 'https://proxy.example/divine',
      apiKey: 'should-not-be-used',
    });
    expect(transport).toEqual({
      kind: 'proxy',
      base: 'https://proxy.example/divine',
      key: null,
      token: null,
    });
  });

  it('uses documented Divine hosts only when a server key is present', () => {
    const transport = resolveTransport({ proxyUrl: null, apiKey: 'secret' });
    expect(transport?.kind).toBe('direct');
    expect(transport?.key).toBe('secret');
    expect(transport?.token).toBe('secret');
    expect(requestUrl(DIVINE_ROUTES['find-panchang'], transport!)).toBe(
      'https://astroapi-1.divineapi.com/indian-api/v2/find-panchang',
    );
  });

  it('returns null when neither proxy nor key exists', () => {
    expect(resolveTransport({ proxyUrl: null, apiKey: null })).toBeNull();
  });

  it('never reads EXPO_PUBLIC_DIVINE_API_KEY', () => {
    process.env.EXPO_PUBLIC_DIVINE_API_KEY = 'leaked';
    delete process.env.DIVINE_API_KEY;
    delete process.env.DIVINE_PROXY_URL;
    expect(resolveTransport({ proxyUrl: null })).toBeNull();
    delete process.env.EXPO_PUBLIC_DIVINE_API_KEY;
  });
});

describe('getPanchang', () => {
  it('POSTs find-panchang with day/month/year and no key when using a proxy', async () => {
    let seen = '';
    let body: Record<string, unknown> = {};
    const fetchImpl = jsonFetch((url, init) => {
      seen = `${init.method} ${url}`;
      body = JSON.parse(init.body ?? '{}');
      return { status: 200, body: { success: 1, data: { tithis: [{ tithi: 'Ashtami' }] } } };
    });
    const res = await getPanchang(
      { date: '2026-08-14', lat: 19.076, lon: 72.8777, lang: 'en' },
      { fetchImpl, transport: { kind: 'proxy', base: 'https://proxy.example', key: null, token: null } },
    );
    expect(res.ok).toBe(true);
    expect(seen).toBe('POST https://proxy.example/indian-api/v2/find-panchang');
    expect(body).toMatchObject(placeDateBody({ date: '2026-08-14', lat: 19.076, lon: 72.8777, lang: 'en' }));
    expect(body).not.toHaveProperty('api_key');
  });

  it('adds Bearer + api_key only in direct/server mode', async () => {
    let headers: Record<string, string> = {};
    let body: Record<string, unknown> = {};
    const fetchImpl = jsonFetch((_url, init) => {
      headers = init.headers;
      body = JSON.parse(init.body ?? '{}');
      return { status: 200, body: { success: 1, data: {} } };
    });
    await getPanchang(
      { date: '2026-08-14', lat: 19.076, lon: 72.8777 },
      { fetchImpl, transport: { kind: 'direct', base: '', key: 'k', token: 'tok' } },
    );
    expect(headers.Authorization).toBe('Bearer tok');
    expect(body.api_key).toBe('k');
  });
});

describe('loadBirthChart', () => {
  it('returns a setup error when the key is missing — never a sample chart', async () => {
    const loaded = await loadBirthChart(ARJUN, { transport: null, language: 'en' });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) {
      expect(loaded.setup).toBe(true);
      expect(loaded.error).toMatch(/missing_key/);
    }
  });

  it('does not invent a chart on 401', async () => {
    const fetchImpl = jsonFetch(() => ({ status: 401, body: { success: 0, msg: 'unauthorized' } }));
    const loaded = await loadBirthChart(ARJUN, {
      fetchImpl,
      transport: { kind: 'direct', base: '', key: 'bad', token: 'bad' },
    });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.setup).toBe(true);
  });

  it('POSTs basic-astro-details and planetary-positions', async () => {
    const calls: string[] = [];
    const fetchImpl = jsonFetch((url, init) => {
      calls.push(`${init.method} ${url}`);
      expect(JSON.parse(init.body ?? '{}')).toMatchObject({ full_name: 'Arjun', day: 15, month: 5, year: 1990 });
      if (url.includes('basic-astro-details')) {
        return { status: 200, body: { success: 1, data: { moonsign: 'Cancer', full_name: 'Arjun' } } };
      }
      if (url.includes('planetary-positions')) {
        return {
          status: 200,
          body: { success: 1, data: { planets: [{ name: 'Moon', sign: 'Cancer', house: 3 }] } },
        };
      }
      return { status: 200, body: { success: 1, data: {} } };
    });
    const loaded = await loadBirthChart(ARJUN, {
      fetchImpl,
      transport: { kind: 'direct', base: '', key: 'k', token: 'k' },
    });
    expect(loaded.ok).toBe(true);
    expect(calls.some((line) => line.includes('/indian-api/v3/basic-astro-details'))).toBe(true);
    expect(calls.some((line) => line.includes('/indian-api/v2/planetary-positions'))).toBe(true);
    expect(calls.some((line) => line.includes('/indian-api/v1/horoscope-chart/D1'))).toBe(true);
    expect(calls.some((line) => line.includes('/indian-api/v1/horoscope-chart/D9'))).toBe(true);
    expect(birthBody(ARJUN).full_name).toBe('Arjun');
  });
});

describe('matchPeople', () => {
  it('POSTs ashtakoot-milan then dashakoot-milan', async () => {
    const calls: string[] = [];
    const fetchImpl = jsonFetch((url, init) => {
      calls.push(`${init.method} ${url}`);
      if (url.includes('ashtakoot-milan')) {
        return {
          status: 200,
          body: {
            success: 1,
            data: {
              ashtakoot_milan: { nadi: { points_obtained: 3, max_ponits: 8 } },
              ashtakoot_milan_result: { points_obtained: 28, max_ponits: 36, content: 'Good match' },
              manglik_dosha: { p1: 'false', p2: 'false' },
            },
          },
        };
      }
      return { status: 200, body: { success: 1, data: {} } };
    });
    const loaded = await matchPeople(PRIYA, ARJUN, {
      fetchImpl,
      transport: { kind: 'direct', base: '', key: 'k', token: 'k' },
    });
    expect(calls[0]).toContain('/indian-api/v2/ashtakoot-milan');
    expect(calls[1]).toContain('/indian-api/v2/dashakoot-milan');
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.data.total).toBe(28);
      expect(loaded.data.kutas.find((kuta) => kuta.key === 'nadi')?.score).toBe(3);
    }
  });

  it('does not return a sample Priya/Arjun pair when transport is missing', async () => {
    const loaded = await matchPeople(PRIYA, ARJUN, { transport: null });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.setup).toBe(true);
  });
});

describe('getAshtakootMilan', () => {
  it('sends p1_/p2_ fields', async () => {
    let body: Record<string, unknown> = {};
    const fetchImpl = jsonFetch((_url, init) => {
      body = JSON.parse(init.body ?? '{}');
      return { status: 200, body: { success: 1, data: {} } };
    });
    await getAshtakootMilan(PRIYA, ARJUN, {
      fetchImpl,
      transport: { kind: 'proxy', base: 'https://proxy.example', key: null, token: null },
    });
    expect(body.p1_full_name).toBe('Priya');
    expect(body.p2_full_name).toBe('Arjun');
  });
});
