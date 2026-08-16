import { describe, expect, it } from 'vitest';

import { normalizeDay } from '../normalizeDay';

describe('normalizeDay', () => {
  it('reads paksha from the tithi limb', () => {
    const day = normalizeDay(
      {
        date: '2026-08-14',
        tithi: { name: 'Dwitiya', paksha: 'SHUKLA' },
        nakshatra: { name: 'Purva Phalguni' },
      },
      '2026-08-14',
    );
    expect(day.tithi).toMatchObject({ name: 'Dwitiya', paksha: 'SHUKLA' });
  });

  it('reads paksha_name when paksha is absent', () => {
    const day = normalizeDay(
      { tithi: { name: 'Ashtami', paksha_name: 'KRISHNA' } },
      '2026-08-14',
    );
    expect(day.tithi?.paksha).toBe('KRISHNA');
  });

  it('reads Divine tithis / nakshatras / rahu_kaal', () => {
    const day = normalizeDay(
      {
        tithis: [{ tithi: 'Chaturdashi', paksha: 'Krishna', end_time: '2026-08-14 16:58:16' }],
        nakshatras: { nakshatra_list: [{ nak_name: 'Aradra', end_time: '2026-08-14 08:24:11' }] },
        yogas: [{ yoga_name: 'Harshana' }],
        karnas: [{ karana_name: 'Vishti' }],
        rahu_kaal: { start_time: '12:18', end_time: '14:01' },
        abhijit_muhurta: { start_time: '12:00', end_time: '12:48' },
      },
      '2026-08-14',
    );
    expect(day.tithi).toMatchObject({ name: 'Chaturdashi', paksha: 'Krishna' });
    expect(day.nakshatra?.name).toBe('Aradra');
    expect(day.yoga?.name).toBe('Harshana');
    expect(day.karana?.name).toBe('Vishti');
    expect(day.rahu).toMatchObject({ start: '12:18', end: '14:01' });
    expect(day.abhijit?.end).toBe('12:48');
    expect(day.good).toContain('Abhijit');
    expect(day.avoid).toContain('Rahu');
  });
});
