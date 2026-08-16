import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  getAskProxyUrl,
  getDivineApiKey,
  getDivineProxyUrl,
  getGeminiApiKey,
  getRevenueCatApiKey,
  getSupabaseAnonKey,
  getSupabaseUrl,
  isDevUnlock,
  isSupabaseConfigured,
} from '../env';

describe('empty-key boot', () => {
  it('reads no secrets from the environment in tests', () => {
    expect(getDivineApiKey()).toBeNull();
    expect(getGeminiApiKey()).toBeNull();
    expect(getRevenueCatApiKey()).toBeNull();
    expect(getDivineProxyUrl()).toBeNull();
    expect(getAskProxyUrl()).toBeNull();
    expect(getSupabaseUrl()).toBeNull();
    expect(getSupabaseAnonKey()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
    expect(isDevUnlock()).toBe(false);
  });

  it('documents every placeholder and EAS secret name', () => {
    const example = readFileSync(new URL('../../../.env.example', import.meta.url), 'utf8');
    const keys = readFileSync(new URL('../../../docs/KEYS.md', import.meta.url), 'utf8');
    for (const name of [
      'DIVINE_API_KEY',
      'DIVINE_API_TOKEN',
      'GEMINI_API_KEY',
      'EXPO_PUBLIC_REVENUECAT_API_KEY',
      'EXPO_PUBLIC_DIVINE_PROXY_URL',
      'EXPO_PUBLIC_ASK_PROXY_URL',
      'EXPO_PUBLIC_SHUBH_DEV_UNLOCK',
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ]) {
      expect(example).toContain(name);
      expect(keys).toContain(name);
    }
    expect(example).not.toMatch(/AIza|sk-|rc_live|rc_sb_/);
    expect(example).not.toMatch(/SERVICE_ROLE|service_role/);
    expect(keys).toMatch(/Never put the service role/);
  });
});
