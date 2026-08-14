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

export type TathaSource = 'live' | 'fixture';

export type TathaLoad<T> = {
  data: T;
  source: TathaSource;
  setup?: string;
  status?: number;
};

export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  },
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;
