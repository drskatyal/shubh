import type { NormalizedChart } from '../tathaastu/types';

/** Fixture when the TathaAstu key / plan is missing. Not a live Swiss-ephemeris chart. */
export const MOCK_BIRTH_CHART: NormalizedChart = {
  name: 'Arjun',
  placeName: 'Delhi',
  lagna: { sign: 'Taurus', nakshatra: 'Krittika' },
  moon: { sign: 'Cancer', nakshatra: 'Pushya' },
  planets: [
    { name: 'Sun', sign: 'Taurus', house: 1, nakshatra: 'Krittika' },
    { name: 'Moon', sign: 'Cancer', house: 3, nakshatra: 'Pushya' },
    { name: 'Mars', sign: 'Capricorn', house: 9, nakshatra: 'Uttara Ashadha' },
    { name: 'Mercury', sign: 'Aries', house: 12, nakshatra: 'Bharani' },
    { name: 'Jupiter', sign: 'Gemini', house: 2, nakshatra: 'Ardra' },
    { name: 'Venus', sign: 'Aries', house: 12, nakshatra: 'Ashwini' },
    { name: 'Saturn', sign: 'Capricorn', house: 9, nakshatra: 'Shravana' },
    { name: 'Rahu', sign: 'Aquarius', house: 10, nakshatra: 'Shatabhisha' },
    { name: 'Ketu', sign: 'Leo', house: 4, nakshatra: 'Magha' },
  ],
  dasha: {
    mahadasha: 'Jupiter',
    antardasha: 'Saturn',
    from: '2024-03-01',
    to: '2026-11-01',
  },
  insights: [
    'Lagna in Taurus, Moon in Cancer.',
    'Current dasha: Jupiter–Saturn.',
  ],
};
