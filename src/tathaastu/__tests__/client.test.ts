import { afterEach, describe, expect, it } from 'vitest';

import {
  createBirthChart,
  getCompatibilityScore,
  loadBirthChart,
  matchPeople,
  resolveTransport,
  toOpenApiBody,
  toScoreQuery,
} from '../client';
import type { BirthData, FetchLike } from '../types';

const ARJUN: BirthData = {
  name: 'Arjun',
  date_of_birth: '1990-05-15',
  time_of_birth: '06:30',
  latitude: 28.6139,
  longitude: 77.209,
  place_name: 'Delhi',
};

const PRIYA: BirthData = {
  name: 'Priya',
  date_of_birth: '1992-08-22',
  time_of_birth: '14:15',
  latitude: 28.6139,
  longitude: 77.209,
  place_name: 'Delhi',
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

const originalKey = process.env.TATHAASTU_API_KEY;
const originalProxy = process.env.TATHAASTU_PROXY_URL;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
  if (originalProxy === undefined) delete process.env.TATHAASTU_PROXY_URL;
  else process.env.TATHAASTU_PROXY_URL = originalProxy;
});

describe('resolveTransport', () => {
  it('prefers a proxy URL and never attaches a key', () => {
    const transport = resolveTransport({
      proxyUrl: 'https://proxy.example/tatha',
      apiKey: 'should-not-be-used',
    });
    expect(transport).toEqual({ base: 'https://proxy.example/tatha', key: null });
  });

  it('uses the production host only when a server key is present', () => {
    const transport = resolveTransport({ proxyUrl: null, apiKey: 'secret' });
    expect(transport?.base).toBe('https://api.tathaastuapi.com');
    expect(transport?.key).toBe('secret');
  });

  it('returns null when neither proxy nor key exists', () => {
    expect(resolveTransport({ proxyUrl: null, apiKey: null })).toBeNull();
  });

  it('never reads EXPO_PUBLIC_TATHAASTU_API_KEY', () => {
    process.env.EXPO_PUBLIC_TATHAASTU_API_KEY = 'leaked';
    delete process.env.TATHAASTU_API_KEY;
    delete process.env.TATHAASTU_PROXY_URL;
    expect(resolveTransport({ proxyUrl: null })).toBeNull();
    delete process.env.EXPO_PUBLIC_TATHAASTU_API_KEY;
  });
});

describe('request bodies', () => {
  it('sends OpenAPI BirthData field names', () => {
    const body = toOpenApiBody(ARJUN);
    expect(body).toMatchObject({
      name: 'Arjun',
      date_of_birth: '1990-05-15',
      time_of_birth: '06:30',
      latitude: 28.6139,
      longitude: 77.209,
    });
    expect(body).not.toHaveProperty('date');
    expect(body).not.toHaveProperty('lat');
  });

  it('maps person 1/2 onto bride/groom query keys from OpenAPI', () => {
    const q = toScoreQuery(PRIYA, ARJUN);
    expect(q.bride_dob).toBe('1992-08-22');
    expect(q.groom_dob).toBe('1990-05-15');
    expect(q.mode).toBe('lite');
  });
});

describe('createBirthChart', () => {
  it('POSTs /v1/birth-chart with store=false', async () => {
    const calls: string[] = [];
    const fetchImpl = jsonFetch((url, init) => {
      calls.push(`${init.method} ${url}`);
      expect(JSON.parse(init.body ?? '{}')).toMatchObject({ date_of_birth: '1990-05-15' });
      return { status: 200, body: { lagna: 'Taurus', moon_sign: 'Cancer' } };
    });
    const res = await createBirthChart(ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(res.ok).toBe(true);
    expect(calls[0]).toBe('POST https://api.tathaastuapi.com/v1/birth-chart?store=false&include_yogas=true');
  });

  it('retries HTML docs aliases after a 422', async () => {
    const bodies: unknown[] = [];
    const fetchImpl = jsonFetch((_url, init) => {
      const parsed = JSON.parse(init.body ?? '{}');
      bodies.push(parsed);
      if ('date_of_birth' in parsed) return { status: 422, body: { detail: 'date' } };
      return { status: 200, body: { lagna: 'Taurus' } };
    });
    const res = await createBirthChart(ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(res.ok).toBe(true);
    expect(bodies[1]).toMatchObject({ date: '1990-05-15', lat: 28.6139, lon: 77.209 });
  });
});

describe('getCompatibilityScore', () => {
  it('GETs /v1/compatibility/score with bride_* and groom_*', async () => {
    let seen = '';
    const fetchImpl = jsonFetch((url) => {
      seen = url;
      return { status: 200, body: { total_score: 28, max_score: 36 } };
    });
    await getCompatibilityScore(PRIYA, ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(seen).toContain('/v1/compatibility/score?');
    expect(seen).toContain('bride_dob=1992-08-22');
    expect(seen).toContain('groom_dob=1990-05-15');
    expect(seen).toContain('mode=lite');
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
    const fetchImpl = jsonFetch(() => ({ status: 401, body: { error: 'authentication_required' } }));
    const loaded = await loadBirthChart(ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'bad' },
      language: 'hi',
    });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.setup).toBe(true);
  });

  it('uses GET /v1/kundli/teaser when birth-chart is 402', async () => {
    const paths: string[] = [];
    const fetchImpl = jsonFetch((url) => {
      paths.push(url);
      if (url.includes('/v1/birth-chart')) return { status: 402, body: { error: 'plan' } };
      return { status: 200, body: { lagna: 'Libra', moon_sign: 'Pisces', insights: ['Teaser'] } };
    });
    const loaded = await loadBirthChart(ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.data.lagna.sign).toBe('Libra');
    expect(paths.some((p) => p.includes('/v1/kundli/teaser?'))).toBe(true);
  });
});

describe('matchPeople', () => {
  it('prefers GET score then POST /v1/compatibility', async () => {
    const calls: string[] = [];
    const fetchImpl = jsonFetch((url, init) => {
      calls.push(`${init.method} ${url.split('?')[0]}`);
      if (url.includes('/score')) {
        return { status: 200, body: { total_score: 26, max_score: 36, verdict: 'Fair' } };
      }
      return {
        status: 200,
        body: {
          total: 28,
          max: 36,
          verdict: 'Good match',
          kutas: { varna: 1, vashya: 2, tara: 3, yoni: 3, graha_maitri: 4, gana: 5, bhakoot: 7, nadi: 3 },
        },
      };
    });
    const loaded = await matchPeople(PRIYA, ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(calls[0]).toBe('GET https://api.tathaastuapi.com/v1/compatibility/score');
    expect(calls[1]).toBe('POST https://api.tathaastuapi.com/v1/compatibility');
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.data.total).toBe(28);
      expect(loaded.data.kutas.find((k) => k.key === 'nadi')?.max).toBe(8);
    }
  });

  it('keeps the lite score when the full POST is 402', async () => {
    const fetchImpl = jsonFetch((url) => {
      if (url.includes('/score')) return { status: 200, body: { total_score: 22, verdict: 'Okay' } };
      return { status: 402, body: { error: 'plan' } };
    });
    const loaded = await matchPeople(PRIYA, ARJUN, {
      fetchImpl,
      transport: { base: 'https://api.tathaastuapi.com', key: 'k' },
    });
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.data.total).toBe(22);
  });

  it('does not return a sample Priya/Arjun pair when transport is missing', async () => {
    const loaded = await matchPeople(PRIYA, ARJUN, { transport: null });
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.setup).toBe(true);
  });
});
