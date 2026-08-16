/**
 * Compatibility barrel. The live vendor is Divine Vedic Prakash (`src/divine`).
 * Screens and loaders keep these names so Phase 1 does not get a rewrite.
 */
export {
  findFestival as explainFestival,
  findMuhuratMonth as findMuhurat,
  getEnglishCalendarFestivals as getCalendarMonth,
  getEnglishCalendarFestivals as getFestivalsMonth,
  getDateSpecificFestivals as getCalendarDay,
  getPanchang as getDayContext,
  getPanchang,
  getPanchang as getPanchangLite,
  getPanchang as getPanchangToday,
  getInauspiciousTimings as getTimings,
  loadBirthChart,
  matchPeople,
  resolveTransport,
  setupCopy,
} from '../divine/client';
export type { DivineRequestOptions as TathaRequestOptions, DivineTransport as TathaTransport } from '../divine/client';
export { muhuratPathFor as muhuratFindQuery } from '../divine/body';
