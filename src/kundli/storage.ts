import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BirthData, ChartAskSummary, NormalizedMatch } from '../tathaastu/types';

const FORM_KEY = 'shubh.kundli.form';
const MATCH_KEY = 'shubh.kundli.match';
const LAST_CHART_KEY = 'shubh.kundli.lastChart';
const LAST_MATCH_RESULT_KEY = 'shubh.kundli.lastMatchResult';

export type StoredPair = {
  personA: BirthData;
  personB: BirthData;
};

export async function loadKundliForm(): Promise<BirthData | null> {
  const raw = await AsyncStorage.getItem(FORM_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BirthData;
  } catch {
    return null;
  }
}

export async function saveKundliForm(data: BirthData): Promise<void> {
  await AsyncStorage.setItem(FORM_KEY, JSON.stringify(data));
}

export async function loadMatchForms(): Promise<StoredPair | null> {
  const raw = await AsyncStorage.getItem(MATCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPair;
  } catch {
    return null;
  }
}

export async function saveMatchForms(pair: StoredPair): Promise<void> {
  await AsyncStorage.setItem(MATCH_KEY, JSON.stringify(pair));
}

export async function loadLastChart(): Promise<ChartAskSummary | null> {
  const raw = await AsyncStorage.getItem(LAST_CHART_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChartAskSummary;
  } catch {
    return null;
  }
}

export async function saveLastChart(summary: ChartAskSummary): Promise<void> {
  await AsyncStorage.setItem(LAST_CHART_KEY, JSON.stringify(summary));
}

export async function loadLastMatch(): Promise<NormalizedMatch | null> {
  const raw = await AsyncStorage.getItem(LAST_MATCH_RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NormalizedMatch;
  } catch {
    return null;
  }
}

export async function saveLastMatch(match: NormalizedMatch): Promise<void> {
  await AsyncStorage.setItem(LAST_MATCH_RESULT_KEY, JSON.stringify(match));
}
