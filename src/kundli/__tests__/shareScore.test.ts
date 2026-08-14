import { describe, expect, it } from 'vitest';

import { MOCK_COMPATIBILITY } from '../../fixtures/mockCompatibility';
import { birthFormValid } from '../birth';
import { formatScoreCardText } from '../formatScoreCard';

describe('formatScoreCardText', () => {
  it('includes the 36-guna score and both names', () => {
    const text = formatScoreCardText(MOCK_COMPATIBILITY, 'en');
    expect(text).toContain('28');
    expect(text).toContain('36');
    expect(text).toContain('Priya');
    expect(text).toContain('Arjun');
    expect(text).toContain('Nadi 3/8');
  });

  it('uses Hindi title when language is hi', () => {
    const text = formatScoreCardText(MOCK_COMPATIBILITY, 'hi');
    expect(text).toMatch(/शुभ/);
    expect(text).toContain('28');
  });
});

describe('birthFormValid', () => {
  it('requires name, ISO date, clock, and coordinates', () => {
    expect(
      birthFormValid({
        name: 'Arjun',
        date_of_birth: '1990-05-15',
        time_of_birth: '06:30',
        latitude: 28.6,
        longitude: 77.2,
      }),
    ).toBe(true);
    expect(
      birthFormValid({
        name: '',
        date_of_birth: '1990-05-15',
        time_of_birth: '06:30',
        latitude: 28.6,
        longitude: 77.2,
      }),
    ).toBe(false);
  });
});
