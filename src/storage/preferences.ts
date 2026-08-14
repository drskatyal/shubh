import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Language } from '../i18n/strings';
import type { City } from '../location/cities';

const LANGUAGE_KEY = 'shubh.language';
const CITY_KEY = 'shubh.city';

export async function loadLanguage(): Promise<Language | null> {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);
  return value === 'hi' || value === 'en' ? value : null;
}

export async function saveLanguage(language: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export async function loadCity(): Promise<City | null> {
  const raw = await AsyncStorage.getItem(CITY_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as City;
  } catch {
    return null;
  }
}

export async function saveCity(city: City): Promise<void> {
  await AsyncStorage.setItem(CITY_KEY, JSON.stringify(city));
}
