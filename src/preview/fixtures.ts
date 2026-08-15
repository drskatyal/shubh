import type { MarriageExtract } from '../ask/marriage/types';
import type { AskTurn } from '../ask/cards/types';
import type { Festival, NormalizedChart, NormalizedMatch, RankedDate } from '../tathaastu/types';
import { FRAME_MATCH, FRAME_MUHURAT } from '../store/frames/fixtures';

/** Screenshot-only. Never the live matching happy path. */
export const PREVIEW_EXTRACT: MarriageExtract = {
  person_a: {
    name: 'Rohan',
    day: 12,
    month: 3,
    year: 1994,
    hour: 6,
    min: 15,
    place: 'Pune',
  },
  person_b: {
    name: 'Ananya',
    day: 4,
    month: 8,
    year: 1996,
    hour: 9,
    min: 40,
    place: 'Mumbai',
  },
  intent: 'match',
  question: '',
};

export const PREVIEW_MATCH: NormalizedMatch = FRAME_MATCH;

export const PREVIEW_MUHURAT: RankedDate[] = FRAME_MUHURAT;

export const PREVIEW_FESTIVALS: Festival[] = [
  { key: 'janmashtami', name: 'Janmashtami', date: '2026-08-14', type: 'festival', tags: [] },
  { key: 'ganesh', name: 'Ganesh Chaturthi', date: '2026-08-27', type: 'festival', tags: [] },
  { key: 'navratri', name: 'Sharad Navratri', date: '2026-10-11', type: 'festival', tags: [] },
];

export const PREVIEW_CHART: NormalizedChart = {
  name: 'Rohan',
  placeName: 'Pune',
  lagna: { sign: 'Taurus', nakshatra: 'Rohini' },
  moon: { sign: 'Cancer', nakshatra: 'Pushya' },
  planets: [
    { name: 'Sun', sign: 'Leo', house: 4, nakshatra: null },
    { name: 'Moon', sign: 'Cancer', house: 3, nakshatra: 'Pushya' },
    { name: 'Mars', sign: 'Aries', house: 12, nakshatra: null },
    { name: 'Mercury', sign: 'Virgo', house: 5, nakshatra: null },
    { name: 'Jupiter', sign: 'Sagittarius', house: 8, nakshatra: null },
    { name: 'Venus', sign: 'Libra', house: 6, nakshatra: null },
    { name: 'Saturn', sign: 'Aquarius', house: 10, nakshatra: null },
  ],
  dasha: { mahadasha: 'Jupiter', antardasha: 'Saturn', from: null, to: null },
  insights: [],
};

export const PREVIEW_ASK_TURN: AskTurn = {
  id: 'preview-ask',
  askedAt: Date.now(),
  question: 'Ab ghar se nikalun?',
  cards: [
    {
      kind: 'verdict',
      verdict: 'wait',
      nextTime: '16:40',
      windowName: 'Rahu Kaal',
      rahu: 'Rahu Kaal 15:12–16:40',
      startLabel: 'रुकें',
    },
    {
      kind: 'panchang',
      tithi: 'Shukla Dwitiya',
      nakshatra: 'Purva Phalguni',
      yoga: 'Siddha',
    },
    {
      kind: 'verse',
      text: 'Abhijit ke baad nikalna better hai. Rahu abhi card par hai.',
    },
  ],
};
