import type { FinderEvent } from './types';

/**
 * PRODUCT chips → documented API event names.
 * OpenAPI muhurat/find uses MARRIAGE / NAMKARAN / BUSINESS.
 * docs.html + /v1/events/suitability use marriage / mundan / business_start.
 * naming is not in either list — PRODUCT says map to mundan or education_start.
 */
export const EVENT_CANDIDATES: Record<FinderEvent, string[]> = {
  marriage: ['marriage', 'MARRIAGE'],
  griha_pravesh: ['griha_pravesh', 'GRIHA_PRAVESH'],
  vehicle_purchase: ['vehicle_purchase', 'VEHICLE_PURCHASE'],
  business_start: ['business_start', 'BUSINESS_START', 'BUSINESS'],
  naming: ['naming', 'NAMKARAN', 'namkaran', 'mundan', 'education_start', 'EDUCATION'],
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
