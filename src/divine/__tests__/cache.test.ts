import { describe, expect, it } from 'vitest';

import { isFresh, kundliCacheKey, matchCacheKey, panchangCacheKey } from '../cache';
import type { BirthData } from '../../tathaastu/types';

const ARJUN: BirthData = {
  name: 'Arjun',
  date_of_birth: '1990-05-15',
  time_of_birth: '06:30',
  latitude: 28.6139,
  longitude: 77.209,
};

describe('cache keys', () => {
  it('keys panchang on city + date + language', () => {
    expect(panchangCacheKey({ lat: 19.076, lon: 72.8777, date: '2026-08-14', lang: 'hi' })).toBe(
      'panchang:2026-08-14:19.076:72.878:hi',
    );
  });

  it('keys kundli on the birth tuple', () => {
    expect(kundliCacheKey(ARJUN, 'en')).toBe('kundli:arjun|1990-05-15|06:30|28.6139|77.2090|en');
  });

  it('keys matching on both birth tuples', () => {
    const priya: BirthData = { ...ARJUN, name: 'Priya', date_of_birth: '1992-08-22', time_of_birth: '14:15' };
    expect(matchCacheKey(priya, ARJUN)).toContain('priya|1992-08-22|14:15');
    expect(matchCacheKey(priya, ARJUN)).toContain('arjun|1990-05-15|06:30');
  });

  it('treats panchang cache as fresh inside 6 hours', () => {
    const now = 1_000_000;
    expect(isFresh(now - 5 * 60 * 60 * 1000, 6 * 60 * 60 * 1000, now)).toBe(true);
    expect(isFresh(now - 7 * 60 * 60 * 1000, 6 * 60 * 60 * 1000, now)).toBe(false);
  });
});
