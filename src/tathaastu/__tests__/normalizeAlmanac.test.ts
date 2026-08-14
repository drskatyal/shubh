import { describe, expect, it } from 'vitest';

import {
  normalizeCalendarMonth,
  normalizeExplain,
  normalizeFestivals,
  normalizeRankedDates,
  rankedDateFromSuitability,
} from '../normalizeAlmanac';

describe('normalize', () => {
  it('ranks muhurat dates by score', () => {
    const rows = normalizeRankedDates({
      dates: [
        { date: '2026-08-20', score: 70, reason: 'good', rating: 'GOOD' },
        { date: '2026-08-18', score: 88, reason: 'best', rating: 'EXCELLENT' },
      ],
    });
    expect(rows[0]).toMatchObject({ date: '2026-08-18', score: 88, reason: 'best' });
  });

  it('builds a reason from supporting_factors', () => {
    const row = rankedDateFromSuitability(
      {
        event: 'marriage',
        rating: 'AVOID',
        score: 18,
        blocking_factors: ['Bhadra active until 15:30'],
        supporting_factors: ['Abhijit Muhurat available 11:52–12:40'],
      },
      '2026-08-14',
    );
    expect(row).toMatchObject({
      date: '2026-08-14',
      score: 18,
      rating: 'AVOID',
      reason: 'Bhadra active until 15:30',
    });
  });

  it('reads festivals from a month days payload', () => {
    const fests = normalizeFestivals({
      days: [
        {
          date: '2026-08-28',
          festivals: [{ key: 'FESTIVAL_JANMASHTAMI', name: 'Janmashtami' }],
        },
      ],
    });
    expect(fests).toEqual([
      expect.objectContaining({ date: '2026-08-28', key: 'FESTIVAL_JANMASHTAMI', name: 'Janmashtami' }),
    ]);
  });

  it('keeps the documented explain shape', () => {
    const explain = normalizeExplain(
      {
        festival: 'FESTIVAL_MAHA_SHIVARATRI',
        date: '2026-02-16',
        matched: true,
        rule_code: 'SHIVARATRI',
        conditions: [{ field: 'paksha', expected: 'KRISHNA', actual: 'KRISHNA', matched: true }],
        human_readable: 'matched SHIVARATRI',
      },
      'FESTIVAL_MAHA_SHIVARATRI',
      '2026-02-16',
    );
    expect(explain.humanReadable).toBe('matched SHIVARATRI');
    expect(explain.conditions[0]?.matched).toBe(true);
  });

  it('fills a month grid and overlays day summaries', () => {
    const month = normalizeCalendarMonth(
      { days: [{ date: '2026-08-14', tithi: { name: 'Ashtami' }, festivals: ['Ekadashi'] }] },
      2026,
      8,
    );
    expect(month.days).toHaveLength(31);
    expect(month.days[13]).toMatchObject({ date: '2026-08-14', tithi: 'Ashtami', festivals: ['Ekadashi'] });
  });
});
