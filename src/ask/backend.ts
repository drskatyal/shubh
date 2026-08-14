import { getAskProxyUrl, getGeminiApiKey } from '../config/env';

export function askBackendReady(): boolean {
  return Boolean(getAskProxyUrl() || getGeminiApiKey());
}

export function askBackendKey(): string | null {
  return getGeminiApiKey() ?? (getAskProxyUrl() ? 'proxy' : null);
}
