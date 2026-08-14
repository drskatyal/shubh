type Extra = {
  REVENUECAT_API_KEY?: string;
  DIVINE_PROXY_URL?: string;
  ASK_PROXY_URL?: string;
};

function readExtra(): Extra {
  try {
    const Constants = require('expo-constants').default as {
      expoConfig?: { extra?: Extra };
    };
    return Constants.expoConfig?.extra ?? {};
  } catch {
    return {};
  }
}

function trim(value: string | undefined): string | null {
  const next = value?.trim();
  return next ? next : null;
}

/**
 * Server / Node-test key only. Never written into Expo extra.
 * The app binary should call the proxy instead.
 */
export function getGeminiApiKey(): string | null {
  return trim(process.env.GEMINI_API_KEY);
}

export function getAskProxyUrl(): string | null {
  return (
    trim(process.env.EXPO_PUBLIC_ASK_PROXY_URL) ??
    trim(readExtra().ASK_PROXY_URL) ??
    getDivineProxyUrl()
  );
}

export function getRevenueCatApiKey(): string | null {
  return (
    trim(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY) ??
    trim(process.env.REVENUECAT_API_KEY) ??
    trim(readExtra().REVENUECAT_API_KEY)
  );
}

export function isDevUnlock(): boolean {
  return process.env.EXPO_PUBLIC_SHUBH_DEV_UNLOCK === '1';
}

/** Public proxy URL only. Never an API key. */
export function getDivineProxyUrl(): string | null {
  return (
    trim(process.env.EXPO_PUBLIC_DIVINE_PROXY_URL) ??
    trim(process.env.DIVINE_PROXY_URL) ??
    trim(readExtra().DIVINE_PROXY_URL)
  );
}

/**
 * Server / Node-test key only. Not EXPO_PUBLIC_, not written into extra.
 * The app binary must use the proxy instead.
 */
export function getDivineApiKey(): string | null {
  return trim(process.env.DIVINE_API_KEY);
}

/** Optional Bearer token. Defaults to DIVINE_API_KEY when unset. */
export function getDivineApiToken(): string | null {
  return trim(process.env.DIVINE_API_TOKEN);
}
