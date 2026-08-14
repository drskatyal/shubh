import type { ChoghadiyaName, Weekday } from './types';

/**
 * Rahu Kaal weekday parts, 1-indexed from local sunrise.
 *
 * Source: Drik Panchang, “About Rahu Kaal”
 * https://www.drikpanchang.com/panchang/rahu-kaal.html
 *
 * “On Monday Rahu Kaal falls on the 2nd period, Saturday on the 3rd period,
 * Friday on the 4th period, Wednesday on the 5th period, Thursday on the 6th
 * period, Tuesday on the 7th period and Sunday on the 8th period.”
 *
 * PRODUCT.md: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3.
 */
export const RAHU_PART: Record<Weekday, number> = {
  0: 8,
  1: 2,
  2: 7,
  3: 5,
  4: 6,
  5: 4,
  6: 3,
};

/**
 * Yamaganda weekday parts, 1-indexed from local sunrise.
 *
 * Same 8-part daylight split as Drik’s Rahu method
 * (https://www.drikpanchang.com/panchang/rahu-kaal.html).
 * Weekday chart: standard panchang table published with that split, e.g.
 * https://tools.pomantra.com/yamaganda/
 *
 * Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6.
 */
export const YAMAGANDA_PART: Record<Weekday, number> = {
  0: 5,
  1: 4,
  2: 3,
  3: 2,
  4: 1,
  5: 7,
  6: 6,
};

/**
 * Gulika weekday parts, 1-indexed from local sunrise.
 *
 * Same 8-part daylight split as Drik’s Rahu method
 * (https://www.drikpanchang.com/panchang/rahu-kaal.html).
 * Weekday chart: standard panchang table published with that split
 * (Sun=7 … Sat=1), e.g. the Gulika column on
 * https://induwara.lk/tools/sri-lanka-rahu-kalaya-calculator
 *
 * Sun=7, Mon=6, Tue=5, Wed=4, Thu=3, Fri=2, Sat=1.
 */
export const GULIKA_PART: Record<Weekday, number> = {
  0: 7,
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

/**
 * Day Choghadiya, sunrise → sunset.
 *
 * Source: Drik Panchang Choghadiya notes
 * https://www.drikpanchang.com/muhurat/choghadiya.html
 *
 * First daytime muhurta is the weekday lord, then Venus, Mercury, Moon,
 * Saturn, Jupiter, Mars. Planet → name: Sun=Udveg, Venus=Chal, Mercury=Labh,
 * Moon=Amrit, Saturn=Kaal, Jupiter=Shubh, Mars=Rog. The 8th repeats the 1st.
 *
 * Table also printed at https://astroccult.net/chaughadia_muhurats.html
 */
export const DAY_CHOGHADIYA: Record<Weekday, ChoghadiyaName[]> = {
  0: ['udveg', 'chal', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg'],
  1: ['amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chal', 'labh', 'amrit'],
  2: ['rog', 'udveg', 'chal', 'labh', 'amrit', 'kaal', 'shubh', 'rog'],
  3: ['labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chal', 'labh'],
  4: ['shubh', 'rog', 'udveg', 'chal', 'labh', 'amrit', 'kaal', 'shubh'],
  5: ['chal', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'chal'],
  6: ['kaal', 'shubh', 'rog', 'udveg', 'chal', 'labh', 'amrit', 'kaal'],
};

/**
 * Night Choghadiya, sunset → next sunrise.
 *
 * Source: same Drik notes + night table at
 * https://astroccult.net/chaughadia_muhurats.html
 */
export const NIGHT_CHOGHADIYA: Record<Weekday, ChoghadiyaName[]> = {
  0: ['shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh'],
  1: ['chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal'],
  2: ['kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal'],
  3: ['udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg'],
  4: ['amrit', 'chal', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit'],
  5: ['rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog'],
  6: ['labh', 'udveg', 'shubh', 'amrit', 'chal', 'rog', 'kaal', 'labh'],
};

export const AUSPICIOUS_CHOGHADIYA: ReadonlySet<ChoghadiyaName> = new Set([
  'amrit',
  'shubh',
  'labh',
  'chal',
]);
