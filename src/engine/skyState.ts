export type Language = 'hi' | 'en';

export type SkyClock = {
  /** ISO-8601 with offset in the user's timezone. */
  iso: string;
  /** Wall clock the model must copy, e.g. "14:12". */
  clock: string;
};

export type SkyKind = 'good' | 'inauspicious' | 'neutral';

export type SkyWindow = {
  name: string;
  start: SkyClock;
  end: SkyClock;
  kind?: SkyKind;
};

/**
 * This-city, this-minute sky. Clock/home fills this from on-device math.
 * Ask never computes or invents these times.
 */
export type SkyState = {
  city: string;
  timezone: string;
  asOf: SkyClock;
  sunrise: SkyClock;
  sunset: SkyClock;
  currentSlot: SkyWindow & { kind: SkyKind };
  rahu: SkyWindow;
  yamaganda: SkyWindow;
  gulika: SkyWindow;
  /** Null when the engine applies the Sunday caveat. */
  abhijit: SkyWindow | null;
  nextGoodWindow: SkyWindow | null;
  language?: Language;
};
