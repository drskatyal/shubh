import { describe, expect, it } from 'vitest';

import { DIVINE_LATER, DIVINE_NEVER, DIVINE_ROUTES } from '../endpoints';

describe('Divine v1 map', () => {
  it('keeps the documented v1 paths', () => {
    expect(DIVINE_ROUTES['find-panchang'].path).toBe('/indian-api/v2/find-panchang');
    expect(DIVINE_ROUTES['ashtakoot-milan'].path).toBe('/indian-api/v2/ashtakoot-milan');
    expect(DIVINE_ROUTES['horoscope-chart'].path).toBe('/indian-api/v1/horoscope-chart');
    expect(Object.keys(DIVINE_ROUTES).length).toBeGreaterThanOrEqual(18);
  });

  it('lists later and banned families without calling them', () => {
    expect(DIVINE_LATER.some((row) => row.path.includes('D60'))).toBe(true);
    expect(DIVINE_NEVER).toContain('/api/v5/daily-horoscope');
    expect(DIVINE_NEVER).toContain('tarot');
  });
});
