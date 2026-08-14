/**
 * Allowlisted TathaAstu paths from
 * https://api.tathaastuapi.com/openapi.json (2026-08-14).
 * Do not add a path that is not in that document.
 */
export const TATHAASTU_HOST = 'https://api.tathaastuapi.com';

export const TATHA_PATHS = {
  dayContext: '/v1/day-context',
  panchang: '/v1/panchang',
  panchangToday: '/v1/panchang/today',
  panchangLite: '/v1/panchang/lite',
  timings: '/v1/timings',
  choghadiya: '/v1/choghadiya',
} as const;

export type TathaPath = (typeof TATHA_PATHS)[keyof typeof TATHA_PATHS];

/** docs.html include list for /v1/panchang and /v1/panchang/today */
export const TATHA_INCLUDE = 'timings,hora,choghadiya,festivals';

export function asV1Path(path: string): string {
  if (path.startsWith('/v1/')) return path;
  return path.startsWith('/') ? `/v1${path}` : `/v1/${path}`;
}
