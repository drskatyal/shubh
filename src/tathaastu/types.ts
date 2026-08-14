export type TathaSource = 'live' | 'fixture' | 'fallback';

export type TathaOk<T> = {
  ok: true;
  data: T;
  source: TathaSource;
  status: number;
  endpoint: string;
  setup?: boolean;
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

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;
