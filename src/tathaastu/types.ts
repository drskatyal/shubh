export type TathaSource = 'live' | 'fallback';

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  },
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export type TathaOk<T> = {
  ok: true;
  data: T;
  source: TathaSource;
  status: number;
  endpoint: string;
};

export type TathaFail = {
  ok: false;
  status: number;
  error: string;
  detail?: string;
  code?: string;
  endpoint: string;
  setup?: boolean;
  planNeeded?: boolean;
};

export type TathaResult<T> = TathaOk<T> | TathaFail;

export type TathaLoad<T> =
  | { ok: true; data: T; source: TathaSource; status: number }
  | {
      ok: false;
      error: string;
      setup?: boolean;
      planNeeded?: boolean;
      status?: number;
    };

/** OpenAPI `BirthData` — POST /v1/birth-chart and POST /v1/compatibility. */
export type BirthData = {
  name: string;
  date_of_birth: string;
  time_of_birth: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  gender?: 'male' | 'female' | 'other' | null;
  place_name?: string | null;
};

/** HTML docs alias body — retry only after OpenAPI names 422. */
export type BirthDataDocsAlias = {
  name: string;
  date: string;
  time: string;
  lat: number;
  lon: number;
  tz?: string;
};

export type CompatibilityRequest = {
  person_a: BirthData;
  person_b: BirthData;
};

export type CompatibilityRequestDocsAlias = {
  person1: BirthDataDocsAlias;
  person2: BirthDataDocsAlias;
};

export type ScoreQuery = {
  bride_dob: string;
  bride_time: string;
  bride_lat: number;
  bride_lon: number;
  groom_dob: string;
  groom_time: string;
  groom_lat: number;
  groom_lon: number;
  mode?: 'full' | 'lite';
};

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type PlanetRow = {
  name: PlanetName;
  sign: string;
  house: number | null;
  nakshatra: string | null;
};

export type DashaTeaser = {
  mahadasha: string;
  antardasha: string | null;
  from: string | null;
  to: string | null;
};

export type SignPoint = {
  sign: string;
  nakshatra: string | null;
};

export type NormalizedChart = {
  name: string;
  placeName: string | null;
  lagna: SignPoint;
  moon: SignPoint;
  planets: PlanetRow[];
  dasha: DashaTeaser | null;
  insights: string[];
};

export type KutaKey =
  | 'varna'
  | 'vashya'
  | 'tara'
  | 'yoni'
  | 'graha_maitri'
  | 'gana'
  | 'bhakoot'
  | 'nadi';

export type KutaScore = {
  key: KutaKey;
  label: string;
  score: number;
  max: number;
};

export type NormalizedMatch = {
  personA: string;
  personB: string;
  total: number;
  max: number;
  verdict: string;
  kutas: KutaScore[];
  manglik: { a: boolean | null; b: boolean | null };
};

/** Chart fields that may be sent to Gemini after an explicit tap. No birth PII. */
export type ChartAskSummary = {
  name: string;
  lagna: SignPoint;
  moon: SignPoint;
  planets: PlanetRow[];
  dasha: DashaTeaser | null;
  insights: string[];
};

export type FinderEvent =
  | 'marriage'
  | 'griha_pravesh'
  | 'vehicle_purchase'
  | 'business_start'
  | 'naming';

export const FINDER_EVENTS: FinderEvent[] = [
  'marriage',
  'griha_pravesh',
  'vehicle_purchase',
  'business_start',
  'naming',
];

export type EventRating = 'AVOID' | 'NEUTRAL' | 'GOOD' | 'EXCELLENT';

export type RankedDate = {
  date: string;
  score: number;
  rating: EventRating | string;
  reason: string;
  supporting: string[];
  blocking: string[];
};

export type Festival = {
  date: string;
  key: string;
  name: string;
  type?: string;
  tags: string[];
};

export type FestivalCondition = {
  field: string;
  expected: string;
  actual: string;
  matched: boolean;
};

export type FestivalExplain = {
  festival: string;
  date: string;
  matched: boolean;
  ruleCode?: string;
  humanReadable: string;
  conditions: FestivalCondition[];
};

export type CalendarDay = {
  date: string;
  vara?: string;
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
  festivals: string[];
  summary?: string;
};

export type CalendarMonth = {
  year: number;
  month: number;
  days: CalendarDay[];
};

export type DayLimb = {
  name: string;
  end?: string | null;
};

export type DayWindow = {
  name: string;
  start?: string | null;
  end?: string | null;
};

export type NormalizedDay = {
  date: string;
  city?: string;
  tithi: DayLimb | null;
  nakshatra: DayLimb | null;
  yoga: DayLimb | null;
  karana: DayLimb | null;
  vara?: string;
  festivals: string[];
  good: string[];
  avoid: string[];
  rahu: DayWindow | null;
  yamaganda: DayWindow | null;
  gulika: DayWindow | null;
  abhijit: DayWindow | null;
  brahma?: DayWindow | null;
  choghadiya?: string | null;
};
