import { afterEach, describe, expect, it } from 'vitest';

import { loadFestivalExplain, loadUpcomingFestivals, upcomingFrom } from '../loadFestivals';
import { FIXTURE_FESTIVALS } from '../../tathaastu/fixtures';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

describe('festivals', () => {
  it('lists upcoming fixtures from today when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await loadUpcomingFestivals({
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
      now: new Date('2026-08-14T08:00:00+05:30'),
    });
    expect(result.source).toBe('fixture');
    expect(result.festivals[0]?.date >= '2026-08-14').toBe(true);
    expect(result.festivals.some((fest) => fest.key === 'FESTIVAL_JANMASHTAMI')).toBe(true);
  });

  it('filters past festival dates out of the upcoming list', () => {
    const rows = upcomingFrom(FIXTURE_FESTIVALS, '2026-09-01');
    expect(rows.every((fest) => fest.date >= '2026-09-01')).toBe(true);
    expect(rows[0]?.key).toBe('FESTIVAL_GANESH_CHATURTHI');
  });

  it('explains a festival from the documented endpoint or fixture', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const live = await loadFestivalExplain({
      festival: 'FESTIVAL_JANMASHTAMI',
      date: '2026-08-28',
      fetch: async (input) => {
        expect(String(input)).toContain('/v1/festivals/explain');
        expect(String(input)).toContain('festival=FESTIVAL_JANMASHTAMI');
        return new Response(
          JSON.stringify({
            festival: 'FESTIVAL_JANMASHTAMI',
            date: '2026-08-28',
            matched: true,
            rule_code: 'JANMASHTAMI',
            human_readable: 'Krishna Ashtami matched.',
            conditions: [{ field: 'tithi_num', expected: 8, actual: 8, matched: true }],
          }),
          { status: 200 },
        );
      },
    });
    expect(live.source).toBe('live');
    expect(live.explain.humanReadable).toContain('Krishna Ashtami');

    delete process.env.TATHAASTU_API_KEY;
    const fixture = await loadFestivalExplain({
      festival: 'FESTIVAL_JANMASHTAMI',
      date: '2026-08-28',
    });
    expect(fixture.source).toBe('fixture');
    expect(fixture.explain.ruleCode).toBe('JANMASHTAMI');
  });
});
