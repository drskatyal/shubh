import { afterEach, describe, expect, it } from 'vitest';

import { loadCalendarMonth } from '../loadMonth';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('loadCalendarMonth', () => {
  it('does not fill a fake month when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await loadCalendarMonth({
      year: 2026,
      month: 8,
      lat: 28.6,
      lon: 77.2,
      lang: 'en',
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.month).toBeUndefined();
  });

  it('normalizes a live month grid', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await loadCalendarMonth({
      year: 2026,
      month: 8,
      lat: 28.6,
      lon: 77.2,
      lang: 'en',
      fetch: async (input) => {
        expect(String(input)).toContain('/v1/calendar/month');
        return json(200, {
          days: [{ date: '2026-08-14', tithi: { name: 'Ashtami' }, festivals: ['Ekadashi'] }],
        });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.month?.days).toHaveLength(31);
    expect(result.month?.days[13]).toMatchObject({ date: '2026-08-14', tithi: 'Ashtami' });
  });
});
