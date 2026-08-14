export type Language = 'hi' | 'en';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ChoghadiyaName =
  | 'amrit'
  | 'shubh'
  | 'labh'
  | 'chal'
  | 'udveg'
  | 'kaal'
  | 'rog';

export type WindowKind =
  | 'rahu'
  | 'yamaganda'
  | 'gulika'
  | 'abhijit'
  | ChoghadiyaName;

export type StartSomethingState = 'now' | 'wait';

/** ISO-8601 with the city's offset, plus the wall clock Gemini must copy. */
export type SkyClock = {
  iso: string;
  clock: string;
};

export type SkyKind = 'good' | 'inauspicious' | 'neutral';

export type SkyWindow = {
  name: string;
  start: SkyClock;
  end: SkyClock;
  kind?: SkyKind;
};

export type SkyInterval = {
  start: string;
  end: string;
};

export type NamedInterval = SkyInterval & {
  name: WindowKind;
};

export type ChoghadiyaSlot = NamedInterval & {
  name: ChoghadiyaName;
  period: 'day' | 'night';
  auspicious: boolean;
  startClock: SkyClock;
  endClock: SkyClock;
};

export type CurrentWindow = NamedInterval & {
  kind: 'inauspicious' | 'auspicious' | 'neutral';
};

/**
 * This-city, this-minute sky. Home glance and AskSheet share this object.
 * Ask never computes these times — it only reads them.
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
  /** Null on Sunday / Wednesday — not independently auspicious. */
  abhijit: SkyWindow | null;
  nextGoodWindow: SkyWindow | null;
  language?: Language;
  lat: number;
  lon: number;
  weekday: Weekday;
  nextSunrise: SkyClock;
  choghadiya: {
    current: ChoghadiyaSlot;
    next: ChoghadiyaSlot;
  };
  currentWindow: CurrentWindow;
  startingSomethingNew: StartSomethingState;
};

export type GetSkyStateOptions = {
  city?: string;
  language?: Language;
};

export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

/** English names stuffed into the Ask JSON so the model can copy them. */
export const WINDOW_DISPLAY_NAME: Record<WindowKind, string> = {
  rahu: 'Rahu Kaal',
  yamaganda: 'Yamaganda',
  gulika: 'Gulika',
  abhijit: 'Abhijit',
  amrit: 'Amrit',
  shubh: 'Shubh',
  labh: 'Labh',
  chal: 'Chal',
  udveg: 'Udveg',
  kaal: 'Kaal',
  rog: 'Rog',
};
