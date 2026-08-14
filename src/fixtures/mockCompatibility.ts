import type { NormalizedMatch } from '../tathaastu/types';

/** Fixture Ashtakoota card when the TathaAstu key / plan is missing. */
export const MOCK_COMPATIBILITY: NormalizedMatch = {
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
