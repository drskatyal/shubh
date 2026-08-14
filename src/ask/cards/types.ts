import type { VerdictKind } from '../types';

export type TimelineSlot = {
  name: string;
  start: string;
  end: string;
  now: boolean;
};

export type VerdictCardModel = {
  kind: 'verdict';
  verdict: VerdictKind;
  nextTime: string | null;
  windowName: string;
  rahu: string;
  startLabel: string;
};

export type PanchangCardModel = {
  kind: 'panchang';
  tithi: string;
  nakshatra: string;
  yoga: string;
};

export type TimelineCardModel = {
  kind: 'timeline';
  slots: TimelineSlot[];
};

export type VerseCardModel = {
  kind: 'verse';
  text: string;
};

export type GoodAvoidCardModel = {
  kind: 'goodAvoid';
  good: string[];
  avoid: string[];
};

export type FestivalCardModel = {
  kind: 'festival';
  name: string;
  date: string;
  reason: string;
};

export type MatchCardModel = {
  kind: 'match';
  personA: string;
  personB: string;
  total: number;
  max: number;
  verdict: string;
  manglik: string;
  kutas: { label: string; score: number; max: number }[];
};

export type WindowCardModel = {
  kind: 'window';
  name: string;
  start: string;
  end: string;
  hot: boolean;
};

export type AskCard =
  | VerdictCardModel
  | PanchangCardModel
  | TimelineCardModel
  | VerseCardModel
  | GoodAvoidCardModel
  | FestivalCardModel
  | MatchCardModel
  | WindowCardModel;

export type AskTurn = {
  id: string;
  askedAt: number;
  question: string | null;
  cards: AskCard[];
};
