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
});
