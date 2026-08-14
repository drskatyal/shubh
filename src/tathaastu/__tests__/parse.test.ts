import { describe, expect, it } from 'vitest';

import {
  clockFrom,
  clockInRange,
  currentChoghadiya,
  hasLimbs,
  parseLimbs,
  parseTimings,
} from '../parse';

const demoPanchang = {
  date: '2026-08-14',
  tithi: {
    number: 2,
    name: 'Dwitiya (2nd)',
    paksha: 'SHUKLA',
    period: { start: '2026-08-13 20:42:00', end: '2026-08-14 18:47:00' },
  },
  nakshatra: { number: 11, name: 'Purva Phalguni' },
  yoga: { number: 19, name: 'Parigha' },
  karana: { number: 3, name: 'Balava', auspicious: true },
};

const demoMuhurat = {
  sun: { sunrise: '06:02', sunset: '19:00' },
  auspicious: {
    brahma_muhurta: { name: 'Brahma Muhurta', start: '04:26', end: '05:14' },
    abhijit_muhurat: { start: '12:05', end: '12:56', available: true },
  },
  inauspicious: {
    rahu_kaal: { start: '10:53', end: '12:31', label: 'Rahu Kaal' },
    yamagandam: { start: '14:08', end: '15:45' },
    gulika_kaal: { start: '07:39', end: '09:16' },
  },
};

describe('parseLimbs', () => {
  it('reads the documented / demo panchang limbs', () => {
    const limbs = parseLimbs(demoPanchang);
    expect(limbs.tithi.name).toBe('Dwitiya (2nd)');
    expect(limbs.tithi.paksha).toBe('SHUKLA');
    expect(limbs.tithi.endClock).toBe('18:47');
    expect(limbs.nakshatra.name).toBe('Purva Phalguni');
    expect(hasLimbs(demoPanchang)).toBe(true);
  });

  it('reads day-context nested panchang', () => {
    const limbs = parseLimbs({ date: '2026-08-14', panchang: demoPanchang });
    expect(limbs.yoga.name).toBe('Parigha');
    expect(limbs.karana.name).toBe('Balava');
  });
});

describe('parseTimings', () => {
  it('reads the demo muhurat nest used by /v1/timings docs', () => {
    const timings = parseTimings(demoMuhurat);
    expect(timings.rahu).toEqual({ name: 'Rahu Kaal', startClock: '10:53', endClock: '12:31' });
    expect(timings.yamaganda?.startClock).toBe('14:08');
    expect(timings.gulika?.startClock).toBe('07:39');
    expect(timings.abhijit?.startClock).toBe('12:05');
    expect(timings.brahma?.name).toBe('Brahma Muhurta');
  });
});

describe('clock helpers', () => {
  it('normalizes clocks from ISO-ish strings', () => {
    expect(clockFrom('2026-08-14 18:47:00')).toBe('18:47');
    expect(clockFrom('6:02')).toBe('06:02');
  });

  it('finds the current choghadiya including midnight wrap', () => {
    const slots = [
      { name: 'Amrit', startClock: '06:00', endClock: '07:30', period: 'day' as const },
      { name: 'Kaal', startClock: '23:00', endClock: '00:30', period: 'night' as const },
    ];
    expect(currentChoghadiya(slots, '06:15')?.name).toBe('Amrit');
    expect(currentChoghadiya(slots, '23:40')?.name).toBe('Kaal');
    expect(clockInRange('00:10', '23:00', '00:30')).toBe(true);
  });
});
