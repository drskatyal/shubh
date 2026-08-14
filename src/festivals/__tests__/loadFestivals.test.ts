import { afterEach, describe, expect, it } from 'vitest';

import { loadFestivalExplain, loadUpcomingFestivals, upcomingFrom } from '../loadFestivals';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('loadUpcomingFestivals', () => {
  it('does not ship mock festivals when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await loadUpcomingFestivals({
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.festivals).toEqual([]);
  });

  it('reads live month festivals', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await loadUpcomingFestivals({
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
      now: new Date('2026-08-14T08:00:00+05:30'),
      fetch: async () =>
        json(200, {
          days: [{ date: '2026-08-28', festivals: [{ key: 'FESTIVAL_JANMASHTAMI', name: 'Janmashtami' }] }],
        }),
    });
    expect(result.ok).toBe(true);
    expect(result.festivals[0]).toMatchObject({ name: 'Janmashtami', date: '2026-08-28' });
  });
});

describe('upcomingFrom', () => {
  it('keeps only dates on or after today', () => {
    const rows = upcomingFrom(
      [
        { date: '2026-08-10', key: 'a', name: 'Past', tags: [] },
        { date: '2026-08-20', key: 'b', name: 'Soon', tags: [] },
      ],
      '2026-08-14',
    );
    expect(rows.map((row) => row.name)).toEqual(['Soon']);
  });
});

describe('loadFestivalExplain', () => {
  it('returns live explain text', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await loadFestivalExplain({
      festival: 'FESTIVAL_JANMASHTAMI',
      date: '2026-08-28',
      fetch: async () =>
        json(200, { festival: 'FESTIVAL_JANMASHTAMI', human_readable: 'Krishna ashtami', matched: true }),
    });
    expect(result.ok).toBe(true);
    expect(result.explain?.humanReadable).toBe('Krishna ashtami');
  });
});
