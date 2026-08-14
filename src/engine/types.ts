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
};

export type CurrentWindow = NamedInterval & {
  kind: 'inauspicious' | 'auspicious' | 'neutral';
};

export type SkyState = {
  lat: number;
  lon: number;
  timezone: string;
  asOf: string;
  weekday: Weekday;
  sunrise: string;
  sunset: string;
  nextSunrise: string;
  rahu: SkyInterval;
  yamaganda: SkyInterval;
  gulika: SkyInterval;
  abhijit: SkyInterval & { observed: boolean };
  choghadiya: {
    current: ChoghadiyaSlot;
    next: ChoghadiyaSlot;
  };
  currentWindow: CurrentWindow;
  startingSomethingNew: StartSomethingState;
  nextGoodWindow: NamedInterval | null;
};

export type CivilDate = {
  year: number;
  month: number;
  day: number;
};
