import type { FinderEvent } from './types';

/**
 * PRODUCT chips → Divine muhurat routes.
 * naming has no Divine endpoint — map to marriage (closest life-event calendar).
 */
export const EVENT_CANDIDATES: Record<FinderEvent, string[]> = {
  marriage: ['marriage'],
  griha_pravesh: ['griha_pravesh'],
  vehicle_purchase: ['vehicle_purchase'],
  business_start: ['business_start'],
  naming: ['naming', 'marriage'],
  property_purchase: ['property_purchase'],
};

export function minRatingForScore(minScore: number): 'EXCELLENT' | 'GOOD' | 'NEUTRAL' {
  if (minScore >= 80) return 'EXCELLENT';
  if (minScore >= 60) return 'GOOD';
  return 'NEUTRAL';
}

export function looksUnsupportedEvent(status: number, error: string, detail?: string): boolean {
  if (status !== 400 && status !== 422) return false;
  const blob = `${error} ${detail ?? ''}`.toLowerCase();
  return /event|unsupported|unknown|invalid/.test(blob);
}
