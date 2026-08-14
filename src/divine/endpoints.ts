/**
 * Official Divine Vedic Prakash routes.
 * Paths and hosts are from developers.divineapi.com — do not invent slugs.
 */
export type DivineRouteId =
  | 'find-panchang'
  | 'auspicious-timings'
  | 'inauspicious-timings'
  | 'find-choghadiya'
  | 'hora'
  | 'muhurat-marriage'
  | 'muhurat-house-entering'
  | 'muhurat-vehicle-purchase'
  | 'muhurat-business-start'
  | 'muhurat-property-purchase'
  | 'english-calendar-festivals'
  | 'date-specific-festivals'
  | 'find-festival'
  | 'basic-astro-details'
  | 'planetary-positions'
  | 'vimshottari-dasha'
  | 'horoscope-chart'
  | 'ashtakoot-milan'
  | 'dashakoot-milan';

export type DivineRoute = {
  id: DivineRouteId;
  host: string;
  path: string;
  screen: 'home' | 'muhurat' | 'festivals' | 'calendar' | 'kundli' | 'matching';
};

const HOST1 = 'https://astroapi-1.divineapi.com';
const HOST2 = 'https://astroapi-2.divineapi.com';
const HOST3 = 'https://astroapi-3.divineapi.com';

export const DIVINE_ROUTES: Record<DivineRouteId, DivineRoute> = {
  'find-panchang': {
    id: 'find-panchang',
    host: HOST1,
    path: '/indian-api/v2/find-panchang',
    screen: 'home',
  },
  'auspicious-timings': {
    id: 'auspicious-timings',
    host: HOST3,
    path: '/indian-api/v1/auspicious-timings',
    screen: 'home',
  },
  'inauspicious-timings': {
    id: 'inauspicious-timings',
    host: HOST3,
    path: '/indian-api/v1/inauspicious-timings',
    screen: 'home',
  },
  'find-choghadiya': {
    id: 'find-choghadiya',
    host: HOST2,
    path: '/indian-api/v1/find-choghadiya',
    screen: 'home',
  },
  hora: {
    id: 'hora',
    host: HOST3,
    path: '/indian-api/v1/muhurat/hora',
    screen: 'home',
  },
  'muhurat-marriage': {
    id: 'muhurat-marriage',
    host: HOST3,
    path: '/indian-api/v1/muhurat/marriage',
    screen: 'muhurat',
  },
  'muhurat-house-entering': {
    id: 'muhurat-house-entering',
    host: HOST3,
    path: '/indian-api/v1/muhurat/house-entering',
    screen: 'muhurat',
  },
  'muhurat-vehicle-purchase': {
    id: 'muhurat-vehicle-purchase',
    host: HOST3,
    path: '/indian-api/v1/muhurat/vehicle-purchase',
    screen: 'muhurat',
  },
  'muhurat-business-start': {
    id: 'muhurat-business-start',
    host: HOST3,
    path: '/indian-api/v1/muhurat/business-start',
    screen: 'muhurat',
  },
  'muhurat-property-purchase': {
    id: 'muhurat-property-purchase',
    host: HOST3,
    path: '/indian-api/v1/muhurat/property-purchase',
    screen: 'muhurat',
  },
  'english-calendar-festivals': {
    id: 'english-calendar-festivals',
    host: HOST3,
    path: '/indian-api/v1/english-calendar-festivals',
    screen: 'festivals',
  },
  'date-specific-festivals': {
    id: 'date-specific-festivals',
    host: HOST3,
    path: '/indian-api/v1/date-specific-festivals',
    screen: 'calendar',
  },
  'find-festival': {
    id: 'find-festival',
    host: HOST3,
    path: '/indian-api/v1/find-festival',
    screen: 'festivals',
  },
  'basic-astro-details': {
    id: 'basic-astro-details',
    host: HOST3,
    path: '/indian-api/v3/basic-astro-details',
    screen: 'kundli',
  },
  'planetary-positions': {
    id: 'planetary-positions',
    host: HOST3,
    path: '/indian-api/v2/planetary-positions',
    screen: 'kundli',
  },
  'vimshottari-dasha': {
    id: 'vimshottari-dasha',
    host: HOST3,
    path: '/indian-api/v1/vimshottari-dasha',
    screen: 'kundli',
  },
  'horoscope-chart': {
    id: 'horoscope-chart',
    host: HOST3,
    path: '/indian-api/v1/horoscope-chart',
    screen: 'kundli',
  },
  'ashtakoot-milan': {
    id: 'ashtakoot-milan',
    host: HOST3,
    path: '/indian-api/v2/ashtakoot-milan',
    screen: 'matching',
  },
  'dashakoot-milan': {
    id: 'dashakoot-milan',
    host: HOST3,
    path: '/indian-api/v2/dashakoot-milan',
    screen: 'matching',
  },
};

export const DIVINE_HOST_BY_PATH: Record<string, string> = Object.fromEntries(
  Object.values(DIVINE_ROUTES).map((route) => [route.path, route.host]),
);

export function horoscopeChartPath(chartId: string): string {
  return `${DIVINE_ROUTES['horoscope-chart'].path}/${chartId}`;
}

/** Documented later routes. Do not call these in v1. Paths from developers.divineapi.com. */
export const DIVINE_LATER = [
  { path: '/indian-api/v1/horoscope-chart/D2', why: 'Hora — after D1/D9' },
  { path: '/indian-api/v1/horoscope-chart/D10', why: 'Dashamsha — after D1/D9' },
  { path: '/indian-api/v1/horoscope-chart/D60', why: 'Shashtyamsha — after D1/D9' },
  { path: '/indian-api/v1/matching/manglik-dosha', why: 'Pair Manglik; v1 already reads Manglik from Ashtakoot' },
  { path: '/indian-api/v1/matching/vimshottari-dasha', why: 'Pair dashas' },
] as const;

export const DIVINE_NEVER = [
  '/api/v5/daily-horoscope',
  'tarot',
  'numerology',
  'western',
] as const;

export function hostForPath(path: string): string | null {
  const clean = path.split('?')[0] ?? path;
  if (DIVINE_HOST_BY_PATH[clean]) return DIVINE_HOST_BY_PATH[clean];
  const chart = clean.match(/^(\/indian-api\/v1\/horoscope-chart)\/[^/]+$/);
  if (chart) return HOST3;
  return null;
}
