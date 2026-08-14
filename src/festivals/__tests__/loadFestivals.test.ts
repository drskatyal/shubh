import { afterEach, describe, expect, it } from 'vitest';

import { loadFestivalExplain, loadUpcomingFestivals, upcomingFrom } from '../loadFestivals';

const originalKey = process.env.DIVINE_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.DIVINE_API_KEY;
  else process.env.DIVINE_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('loadUpcomingFestivals', () => {
  it('does not ship mock festivals when the key is missing', async () => {
    delete process.env.DIVINE_API_KEY;
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

  it('reads live month festivals from the English calendar map', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await loadUpcomingFestivals({
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
      now: new Date('2026-08-14T08:00:00+05:30'),
      fetch: async (input) => {
        expect(String(input)).toContain('/indian-api/v1/english-calendar-festivals');
        return json(200, {
          success: 1,
          data: { janmashtami: { date: '2026-08-28' } },
        });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.festivals[0]).toMatchObject({ name: 'Janmashtami', date: '2026-08-28', key: 'janmashtami' });
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
  it('returns live explain text from find-festival', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await loadFestivalExplain({
      festival: 'janmashtami',
      date: '2026-08-28',
      fetch: async (input) => {
        expect(String(input)).toContain('/indian-api/v1/find-festival');
        return json(200, {
          success: 1,
          data: { dates: { '1': '2026-08-28' }, festival: 'janmashtami' },
        });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.explain?.date).toBe('2026-08-28');
    expect(result.explain?.humanReadable).toMatch(/Janmashtami|2026-08-28/);
  });
});
