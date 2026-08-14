/**
 * Phase 1 home does not fetch these. Paths are from
 * https://api.tathaastuapi.com/openapi.json — do not invent new ones.
 * Sister PRs: kundli (#4), muhurat + festivals (#5).
 */
export const FUTURE_PATHS = {
  muhuratFind: '/v1/muhurat/find',
  muhuratDay: '/v1/muhurat/day',
  eventsFindDates: '/v1/events/find-dates',
  eventsSuitability: '/v1/events/suitability',
  festivals: '/v1/festivals',
  festivalsMonth: '/v1/festivals/month',
  festivalsExplain: '/v1/festivals/explain',
  calendarMonth: '/v1/calendar/month',
  birthChart: '/v1/birth-chart',
  compatibilityScore: '/v1/compatibility/score',
  compatibility: '/v1/compatibility',
} as const;
