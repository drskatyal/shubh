import type { CreditSnapshot, CreditStore } from './credits';

const KEY = 'shubh.credits.v1';

export function createAsyncStorageStore(): CreditStore {
  return {
    async load() {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage')
          .default as { getItem(key: string): Promise<string | null> };
        const raw = await AsyncStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as CreditSnapshot) : null;
      } catch {
        return null;
      }
    },
    async save(snap) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage')
          .default as { setItem(key: string, value: string): Promise<void> };
        await AsyncStorage.setItem(KEY, JSON.stringify(snap));
      } catch {
        // Local persist is best-effort on web/tests.
      }
    },
  };
}
