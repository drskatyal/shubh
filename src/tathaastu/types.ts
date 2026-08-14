import type { Language, SkyState } from '../engine';

export type DaySource = 'live' | 'sky' | 'cache';

export type DayLimb = {
  name: string;
  paksha?: string;
  number?: number;
  auspicious?: boolean;
  startClock?: string;
  endClock?: string;
};

export type DayWindow = {
  name: string;
  startClock: string;
  endClock: string;
};

export type DayChoghadiya = {
  name: string;
  startClock: string;
  endClock: string;
  period: 'day' | 'night';
};

export type StartSomething = 'good' | 'avoid';

export type DayContextView = {
  source: DaySource;
  date: string;
  city: string;
  language: Language;
  tithi: DayLimb | null;
  nakshatra: DayLimb | null;
  yoga: DayLimb | null;
  karana: DayLimb | null;
  startSomething: StartSomething;
  rahu: DayWindow;
  yamaganda: DayWindow;
  gulika: DayWindow;
  abhijit: DayWindow | null;
  brahma: DayWindow | null;
  choghadiya: DayChoghadiya;
  sky: SkyState;
  promptPayload: Record<string, unknown>;
};

export type Query = Record<string, string | number | boolean | undefined | null>;

export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  },
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export type TathaTransport = {
  base: string;
  key: string | null;
};

export type TathaOk<T = unknown> = {
  ok: true;
  status: number;
  endpoint: string;
  data: T;
  source: 'live';
  json: T;
};

export type TathaFail = {
  ok: false;
  status: number;
  endpoint: string;
  error: string;
  detail?: string;
  code?: string;
};

export type TathaResult<T = unknown> = TathaOk<T> | TathaFail;

export type DayRequest = {
  lat: number;
  lon: number;
  date: string;
  lang: Language;
  city: string;
  at?: Date;
};
