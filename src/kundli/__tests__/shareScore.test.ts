import { describe, expect, it } from 'vitest';

import type { NormalizedMatch } from '../../tathaastu/types';
import { birthFormValid } from '../birth';
import { formatScoreCardText } from '../formatScoreCard';

const SAMPLE: NormalizedMatch = {
  personA: 'Priya',
  personB: 'Arjun',
  total: 28,
  max: 36,
  verdict: 'Good match',
  kutas: [
    { key: 'varna', label: 'Varna', score: 1, max: 1 },
    { key: 'vashya', label: 'Vashya', score: 2, max: 2 },
    { key: 'tara', label: 'Tara', score: 3, max: 3 },
    { key: 'yoni', label: 'Yoni', score: 3, max: 4 },
    { key: 'graha_maitri', label: 'Graha Maitri', score: 4, max: 5 },
    { key: 'gana', label: 'Gana', score: 5, max: 6 },
    { key: 'bhakoot', label: 'Bhakoot', score: 7, max: 7 },
    { key: 'nadi', label: 'Nadi', score: 3, max: 8 },
  ],
  manglik: { a: false, b: false },
};

describe('formatScoreCardText', () => {
  it('includes the 36-guna score and both names', () => {
    const text = formatScoreCardText(SAMPLE, 'en');
    expect(text).toContain('28');
    expect(text).toContain('36');
    expect(text).toContain('Priya');
    expect(text).toContain('Arjun');
    expect(text).toContain('Nadi 3/8');
  });

  it('uses Hindi title when language is hi', () => {
    const text = formatScoreCardText(SAMPLE, 'hi');
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
