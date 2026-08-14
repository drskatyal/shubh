import { afterEach, describe, expect, it } from 'vitest';

import { loadCalendarMonth } from '../loadMonth';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

describe('calendar month', () => {
  it('uses a fixture month grid when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await loadCalendarMonth({
      year: 2026,
      month: 8,
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
    });
    expect(result.source).toBe('fixture');
    expect(result.month.days).toHaveLength(31);
    expect(result.month.days[27]?.festivals).toContain('Janmashtami');
  });

  it('calls GET /v1/calendar/month with year, month, lat, lon', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await loadCalendarMonth({
      year: 2026,
      month: 8,
      lat: 28.6139,
      lon: 77.209,
      lang: 'hi',
      fetch: async (input) => {
        const url = String(input);
        expect(url).toContain('/v1/calendar/month');
        expect(url).toContain('year=2026');
        expect(url).toContain('month=8');
        expect(url).toContain('lat=28.6139');
        expect(url).toContain('lang=hi');
        return new Response(
          JSON.stringify({ days: [{ date: '2026-08-14', tithi: { name: 'Ashtami' } }] }),
          { status: 200 },
        );
      },
    });
    expect(result.source).toBe('live');
    expect(result.month.days[13]?.tithi).toBe('Ashtami');
  });
});
