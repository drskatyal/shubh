import { STRINGS } from '../../i18n/strings';
import type { ShareCardModel } from '../../home/shareDay';
import type { NormalizedMatch, RankedDate } from '../../tathaastu/types';

/** Store-shot only. Not the in-app happy path. */
export const FRAME_MATCH: NormalizedMatch = {
  personA: 'Ananya',
  personB: 'Rohan',
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

export const FRAME_PANCHANG: ShareCardModel = {
  app: STRINGS.en.appName,
  city: 'Mumbai',
  date: '2026-08-14',
  dateLabel: 'Friday, 14 Aug',
  tithi: 'Shukla Dwitiya',
  paksha: 'Shukla Paksha',
  nakshatra: 'Purva Phalguni',
  startSomething: 'good',
  startLabel: 'Good',
  rule: 'for starting something new',
  windowName: 'Abhijit',
  rahu: 'Rahu Kaal 12:24–14:12',
};

export const FRAME_MUHURAT: RankedDate[] = [
  {
    date: '2026-08-20',
    score: 88,
    rating: 'EXCELLENT',
    reason: 'सूर्योदय के बाद अभिजित; भद्रा नहीं',
    supporting: ['अभिजित'],
    blocking: [],
  },
  {
    date: '2026-08-24',
    score: 76,
    rating: 'GOOD',
    reason: 'शुक्ल पक्ष; स्थिर तिथि',
    supporting: [],
    blocking: [],
  },
  {
    date: '2026-09-02',
    score: 71,
    rating: 'GOOD',
    reason: 'चुने हुए समय पर राहु नहीं',
    supporting: [],
    blocking: [],
  },
];
