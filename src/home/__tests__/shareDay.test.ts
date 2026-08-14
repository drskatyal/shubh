import { describe, expect, it } from 'vitest';

import { getSkyState } from '../../engine';
import { buildShareCard, formatDateLabel } from '../shareDay';
import type { DayContextView } from '../../tathaastu';

function day(): DayContextView {
  const sky = getSkyState(19.076, 72.8777, new Date('2026-08-14T08:00:00+05:30'), {
    city: 'Mumbai',
    language: 'en',
  });
  return {
    source: 'live',
    date: '2026-08-14',
    city: 'Mumbai',
    language: 'en',
    tithi: { name: 'Dwitiya (2nd)', paksha: 'SHUKLA' },
    nakshatra: { name: 'Purva Phalguni' },
    yoga: { name: 'Parigha' },
    karana: { name: 'Balava' },
    startSomething: 'avoid',
    rahu: { name: 'Rahu Kaal', startClock: '11:07', endClock: '12:43' },
    yamaganda: { name: 'Yamaganda', startClock: '15:55', endClock: '17:31' },
    gulika: { name: 'Gulika', startClock: '07:55', endClock: '09:31' },
    abhijit: { name: 'Abhijit', startClock: '12:16', endClock: '13:04' },
    brahma: { name: 'Brahma Muhurta', startClock: '04:54', endClock: '05:42' },
    choghadiya: { name: 'chal', startClock: '06:19', endClock: '07:55', period: 'day' },
    sky,
    promptPayload: {},
  };
}

describe('buildShareCard', () => {
  it('builds a square-card model for WhatsApp / IG', () => {
    const card = buildShareCard(day());
    expect(card.app).toBe('Shubh');
    expect(card.city).toBe('Mumbai');
    expect(card.tithi).toBe('Dwitiya (2nd)');
    expect(card.nakshatra).toBe('Purva Phalguni');
    expect(card.startLabel).toBe('Avoid');
    expect(card.rahu).toContain('11:07');
    expect(card.dateLabel.length).toBeGreaterThan(4);
  });

  it('localizes the stamp and paksha in Hindi', () => {
    const card = buildShareCard({ ...day(), language: 'hi' });
    expect(card.app).toBe('शुभ');
    expect(card.startLabel).toBe('टालें');
    expect(card.paksha).toContain('शुक्ल');
  });
});

describe('formatDateLabel', () => {
  it('formats a civil date', () => {
    expect(formatDateLabel('2026-08-14', 'en')).toMatch(/14/);
  });
});
