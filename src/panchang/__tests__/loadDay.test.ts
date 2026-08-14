import { afterEach, describe, expect, it } from 'vitest';

import { loadLiveDay } from '../loadDay';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('loadLiveDay', () => {
  it('does not invent a panchang when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.day).toBeUndefined();
  });

  it('uses GET /v1/day-context when live', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      date: '2026-08-14',
      fetch: async (input) => {
        expect(String(input)).toContain('/v1/day-context');
        return json(200, {
          date: '2026-08-14',
          tithi: { name: 'Ashtami' },
          nakshatra: { name: 'Rohini' },
          yoga: { name: 'Siddha' },
          karana: { name: 'Bava' },
          rahu: { start: '10:12', end: '11:41' },
        });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.day?.tithi?.name).toBe('Ashtami');
    expect(result.day?.rahu?.end).toBe('11:41');
  });

  it('falls back to panchang/today + timings on 402', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const paths: string[] = [];
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      date: '2026-08-14',
      fetch: async (input) => {
        const url = String(input);
        paths.push(url);
        if (url.includes('/day-context')) return json(402, { error: 'plan' });
        if (url.includes('/panchang/today')) {
          return json(200, { tithi: 'Navami', nakshatra: 'Mrigashira' });
        }
        return json(200, { rahu: { start: '09:00', end: '10:30' } });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.source).toBe('fallback');
    expect(result.day?.tithi?.name).toBe('Navami');
    expect(paths.some((url) => url.includes('/panchang/today'))).toBe(true);
  });
});
