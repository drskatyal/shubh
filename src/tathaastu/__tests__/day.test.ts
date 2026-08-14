import { describe, expect, it } from 'vitest';

import { getSkyState } from '../../engine';
import { memoryStore } from '../cache';
import { loadDay } from '../day';

const mumbai = {
  lat: 19.076,
  lon: 72.8777,
  date: '2026-08-14',
  lang: 'en' as const,
  city: 'Mumbai',
  at: new Date('2026-08-14T08:00:00+05:30'),
};

describe('loadDay', () => {
  it('uses live day-context limbs when the API answers', async () => {
    const sky = getSkyState(mumbai.lat, mumbai.lon, mumbai.at, { city: 'Mumbai', language: 'en' });
    const day = await loadDay(mumbai, {
      sky,
      store: memoryStore(),
      proxyUrl: 'http://proxy.test',
      fetchImpl: async (url) => {
        if (url.includes('/v1/day-context')) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({
                date: '2026-08-14',
                panchang: {
                  tithi: { name: 'Dwitiya (2nd)', paksha: 'SHUKLA' },
                  nakshatra: { name: 'Purva Phalguni' },
                  yoga: { name: 'Parigha' },
                  karana: { name: 'Balava' },
                },
              }),
          };
        }
        if (url.includes('/v1/timings')) {
          return {
            ok: true,
            status: 200,
            text: async () =>
              JSON.stringify({
                inauspicious: {
                  rahu_kaal: { start: '11:07', end: '12:43', label: 'Rahu Kaal' },
                  yamagandam: { start: '15:55', end: '17:31' },
                  gulika_kaal: { start: '07:55', end: '09:31' },
                },
              }),
          };
        }
        return { ok: false, status: 402, text: async () => '{"error":"plan"}' };
      },
    });
    expect(day.source).toBe('live');
    expect(day.tithi?.name).toBe('Dwitiya (2nd)');
    expect(day.rahu.startClock).toBe('11:07');
    expect(day.promptPayload.tithi).toEqual(day.tithi);
  });

  it('falls back to getSkyState timings when live calls fail', async () => {
    const sky = getSkyState(mumbai.lat, mumbai.lon, mumbai.at, { city: 'Mumbai', language: 'en' });
    const day = await loadDay(mumbai, {
      sky,
      store: memoryStore(),
      proxyUrl: 'http://proxy.test',
      fetchImpl: async () => ({
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: 'rate_limited' }),
      }),
    });
    expect(day.source).toBe('sky');
    expect(day.tithi).toBeNull();
    expect(day.rahu.startClock).toBe(sky.rahu.start.clock);
    expect(day.startSomething === 'good' || day.startSomething === 'avoid').toBe(true);
  });

  it('does not invent sample tithi when the key is missing', async () => {
    const sky = getSkyState(mumbai.lat, mumbai.lon, mumbai.at, { city: 'Mumbai', language: 'en' });
    const day = await loadDay(mumbai, {
      sky,
      store: memoryStore(),
      proxyUrl: null,
      apiKey: null,
    });
    expect(day.source).toBe('sky');
    expect(day.tithi).toBeNull();
  });
});
