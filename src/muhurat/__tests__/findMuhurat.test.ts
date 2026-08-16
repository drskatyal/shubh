import { afterEach, describe, expect, it } from 'vitest';

import { findMuhuratDates } from '../findMuhurat';

const originalKey = process.env.DIVINE_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.DIVINE_API_KEY;
  else process.env.DIVINE_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('findMuhuratDates', () => {
  it('does not invent ranked dates when the key is missing', async () => {
    delete process.env.DIVINE_API_KEY;
    const result = await findMuhuratDates({
      event: 'griha_pravesh',
      lat: 28.6139,
      lon: 77.209,
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.dates).toEqual([]);
  });

  it('returns ranked live dates from muhurat/marriage', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await findMuhuratDates({
      event: 'marriage',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-09-14',
      fetch: async (input) => {
        expect(String(input)).toContain('/indian-api/v1/muhurat/marriage');
        return json(200, {
          success: 1,
          data: {
            dates: [
              { date: '2026-08-20', is_muhurat: 'true', weekday: 'Thursday' },
              { date: '2026-08-18', is_muhurat: 'true', weekday: 'Tuesday' },
              { date: '2026-08-19', is_muhurat: 'false' },
            ],
          },
        });
      },
    });
    expect(result.endpoint).toContain('/indian-api/v1/muhurat/marriage');
    expect(result.dates.map((row) => row.date)).toEqual(['2026-08-18', '2026-08-20']);
  });

  it('uses house-entering for griha pravesh', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await findMuhuratDates({
      event: 'griha_pravesh',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-08-31',
      fetch: async (input) => {
        expect(String(input)).toContain('/indian-api/v1/muhurat/house-entering');
        return json(200, {
          success: 1,
          data: { dates: [{ date: '2026-08-20', is_muhurat: 'true', score: 83 }] },
        });
      },
    });
    expect(result.dates[0]?.date).toBe('2026-08-20');
  });

  it('maps naming onto the marriage calendar', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const paths: string[] = [];
    const result = await findMuhuratDates({
      event: 'naming',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-08-31',
      fetch: async (input) => {
        paths.push(String(input));
        return json(200, {
          success: 1,
          data: { dates: [{ date: '2026-08-22', is_muhurat: 'true' }] },
        });
      },
    });
    expect(paths.some((url) => url.includes('/muhurat/marriage'))).toBe(true);
    expect(result.dates[0]?.date).toBe('2026-08-22');
  });
});
