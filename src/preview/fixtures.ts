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
    place: 'पुणे',
  },
  person_b: {
    name: 'Ananya',
    day: 4,
    month: 8,
    year: 1996,
    hour: 9,
    min: 40,
    place: 'मुंबई',
  },
  intent: 'match',
  question: '',
};

export const PREVIEW_MATCH: NormalizedMatch = {
  ...FRAME_MATCH,
  verdict: 'अच्छा मेल',
};

export const PREVIEW_MUHURAT: RankedDate[] = FRAME_MUHURAT;

export const PREVIEW_FESTIVALS: Festival[] = [
  { key: 'janmashtami', name: 'जन्माष्टमी', date: '2026-08-14', type: 'festival', tags: [] },
  { key: 'ganesh', name: 'गणेश चतुर्थी', date: '2026-08-27', type: 'festival', tags: [] },
  { key: 'navratri', name: 'शरद नवरात्रि', date: '2026-10-11', type: 'festival', tags: [] },
];

export const PREVIEW_CHART: NormalizedChart = {
  name: 'Rohan',
  placeName: 'पुणे',
  lagna: { sign: 'वृषभ', nakshatra: 'रोहिणी' },
  moon: { sign: 'कर्क', nakshatra: 'पुष्य' },
  planets: [
    { name: 'सूर्य', sign: 'सिंह', house: 4, nakshatra: null },
    { name: 'चंद्र', sign: 'कर्क', house: 3, nakshatra: 'पुष्य' },
    { name: 'मंगल', sign: 'मेष', house: 12, nakshatra: null },
    { name: 'बुध', sign: 'कन्या', house: 5, nakshatra: null },
    { name: 'गुरु', sign: 'धनु', house: 8, nakshatra: null },
    { name: 'शुक्र', sign: 'तुला', house: 6, nakshatra: null },
    { name: 'शनि', sign: 'कुंभ', house: 10, nakshatra: null },
  ],
  dasha: { mahadasha: 'गुरु', antardasha: 'शनि', from: null, to: null },
  insights: [],
};

export const PREVIEW_ASK_TURN: AskTurn = {
  id: 'preview-ask',
  askedAt: Date.now(),
  question: 'अब घर से निकलूँ?',
  cards: [
    {
      kind: 'verdict',
      verdict: 'wait',
      nextTime: '16:40',
      windowName: 'राहु काल',
      rahu: 'राहु काल 15:12–16:40',
      startLabel: 'रुकें',
    },
    {
      kind: 'panchang',
      tithi: 'शुक्ल द्वितीया',
      nakshatra: 'पूर्व फाल्गुनी',
      yoga: 'सिद्ध',
    },
    {
      kind: 'verse',
      text: 'अभिजित के बाद निकलना बेहतर है। राहु अभी कार्ड पर है।',
    },
  ],
};
