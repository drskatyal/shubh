import { describe, expect, it } from 'vitest';

import { findMuhuratDates } from '../../muhurat/findMuhurat';
import { loadUpcomingFestivals } from '../../festivals/loadFestivals';

const key = process.env.TATHAASTU_API_KEY?.trim();

describe.skipIf(!key)('live TathaAstu (TATHAASTU_API_KEY)', () => {
  it('returns ranked muhurat dates from the live API or a documented fallback', async () => {
    const result = await findMuhuratDates({
      event: 'marriage',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-09-14',
    });
    expect(result.dates.length).toBeGreaterThan(0);
    expect(result.dates[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.endpoint === 'fixture' ? result.setup || result.planNeeded : true).toBe(true);
  });

  it('returns upcoming festivals from /v1/festivals/month', async () => {
    const result = await loadUpcomingFestivals({
      lat: 28.6139,
      lon: 77.209,
      lang: 'en',
      now: new Date('2026-08-14T08:00:00+05:30'),
    });
    expect(result.festivals.length).toBeGreaterThan(0);
  });
});
