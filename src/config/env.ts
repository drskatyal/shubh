type Extra = {
  GEMINI_API_KEY?: string;
  REVENUECAT_API_KEY?: string;
  TATHAASTU_PROXY_URL?: string;
};

function readExtra(): Extra {
  try {
    // Lazy require so node tests do not load Expo.
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

/** GEMINI_API_KEY from env or EAS extra. Never read a committed file. */
export function getGeminiApiKey(): string | null {
  return (
    trim(process.env.GEMINI_API_KEY) ??
    trim(process.env.EXPO_PUBLIC_GEMINI_API_KEY) ??
    trim(readExtra().GEMINI_API_KEY)
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

/**
 * Public proxy origin only — not a secret.
 * Same name as PR #4 / #5 so the three TathaAstu lanes share one client.
 */
export function getTathaastuProxyUrl(): string | null {
  return (
    trim(process.env.TATHAASTU_PROXY_URL) ??
    trim(process.env.EXPO_PUBLIC_TATHAASTU_PROXY_URL) ??
    trim(readExtra().TATHAASTU_PROXY_URL)
  );
}

/**
 * Server / Node-test key only. Never EXPO_PUBLIC_, never written into extra.
 * The app binary must use the proxy.
 */
export function getTathaastuApiKey(): string | null {
  return trim(process.env.TATHAASTU_API_KEY);
}

export function getTathaastuBaseUrl(): string {
  const proxy = getTathaastuProxyUrl();
  return proxy ?? 'https://api.tathaastuapi.com';
}
