import { describe, expect, it } from 'vitest';

import { getSkyState } from '../../engine';
import type { NormalizedDay } from '../../tathaastu/types';
import { buildShareCard, formatDateLabel } from '../shareDay';

function day(): NormalizedDay {
  return {
    date: '2026-08-14',
    city: 'Mumbai',
    tithi: { name: 'Dwitiya (2nd)', paksha: 'SHUKLA' },
    nakshatra: { name: 'Purva Phalguni' },
    yoga: { name: 'Parigha' },
    karana: { name: 'Balava' },
    festivals: [],
    good: [],
    avoid: [],
    rahu: { name: 'Rahu', start: '11:07', end: '12:43' },
    yamaganda: null,
    gulika: null,
    abhijit: null,
  };
}

describe('buildShareCard', () => {
  it('builds a square-card model for WhatsApp / IG', () => {
    const sky = getSkyState(19.076, 72.8777, new Date('2026-08-14T08:00:00+05:30'), {
      city: 'Mumbai',
      language: 'en',
    });
    const card = buildShareCard({ day: day(), sky, language: 'en', city: 'Mumbai' });
    expect(card.app).toBe('Shubh');
    expect(card.city).toBe('Mumbai');
    expect(card.tithi).toBe('Dwitiya (2nd)');
    expect(card.nakshatra).toBe('Purva Phalguni');
    expect(card.startLabel).toMatch(/Good|Avoid|शुभ|टालें/);
    expect(card.rahu).toContain('–');
    expect(card.dateLabel.length).toBeGreaterThan(4);
  });

  it('localizes the stamp and paksha in Hindi', () => {
    const sky = getSkyState(19.076, 72.8777, new Date('2026-08-14T08:00:00+05:30'), {
      city: 'मुंबई',
      language: 'hi',
    });
    const card = buildShareCard({ day: day(), sky, language: 'hi', city: 'मुंबई' });
    expect(card.app).toBe('शुभ');
    expect(card.paksha).toContain('शुक्ल');
    expect(card.startLabel).toMatch(/शुभ|टालें/);
  });
});

describe('formatDateLabel', () => {
  it('formats a civil date', () => {
    expect(formatDateLabel('2026-08-14', 'en')).toMatch(/14/);
  });
});
