export const WINDOW_KINDS = [
  'rahu',
  'yamaganda',
  'gulika',
  'abhijit',
  'labh',
  'amrit',
  'shubh',
  'other',
] as const;

export type WindowKind = (typeof WINDOW_KINDS)[number];

export const VERDICTS = ['now', 'wait', 'after'] as const;

export type Verdict = (typeof VERDICTS)[number];

export type MotionLocale = 'en' | 'hi';

export type SkyStageProps = {
  windowKind: WindowKind;
  /** Sustained glance tint. Ask results should also call `playVerdict`. */
  verdict?: Verdict | null;
  /**
   * Reserved for callers. The canvas never draws words — Hindi and English
   * glance copy belongs in the overlay, not here.
   */
  locale?: MotionLocale;
  /** Test / preview override. When omitted, follows the OS Reduce Motion setting. */
  reduceMotion?: boolean;
};
