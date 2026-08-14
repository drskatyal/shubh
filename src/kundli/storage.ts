import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BirthData } from '../tathaastu/types';

const FORM_KEY = 'shubh.kundli.form';
const MATCH_KEY = 'shubh.kundli.match';

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
