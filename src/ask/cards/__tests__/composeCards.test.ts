import { describe, expect, it } from 'vitest';

import { MOCK_SKY } from '../../../fixtures/mockSky';
import type { NormalizedDay, NormalizedMatch } from '../../../tathaastu/types';
import { composeAskCards } from '../composeCards';
import { askCardShareText } from '../shareText';

const day: NormalizedDay = {
  date: '2026-08-14',
  tithi: { name: 'Dwitiya', paksha: 'SHUKLA' },
  nakshatra: { name: 'Purva Phalguni' },
  yoga: { name: 'Parigha' },
  karana: { name: 'Balava' },
  festivals: ['Janmashtami'],
  good: ['Abhijit after noon'],
  avoid: ['Travel in Rahu'],
  rahu: { name: 'Rahu', start: '12:24', end: '14:12' },
  yamaganda: null,
  gulika: null,
  abhijit: null,
};

const match: NormalizedMatch = {
  personA: 'Priya',
  personB: 'Arjun',
  total: 28,
  max: 36,
  verdict: 'Good match',
  kutas: [],
  manglik: { a: false, b: true },
};

describe('composeAskCards', () => {
  it('builds mixed cards, not one text blob', () => {
    const cards = composeAskCards({
      verdict: {
        verdict: 'wait',
        nextTime: '14:12',
        reason: 'Rahu is on.',
        displayText: 'Wait. Rahu Kaal lasts until 14:12.',
      },
      sky: MOCK_SKY,
      language: 'en',
      day,
      match,
    });
    const kinds = cards.map((card) => card.kind);
    expect(kinds).toContain('verdict');
    expect(kinds).toContain('timeline');
    expect(kinds).toContain('verse');
    expect(kinds).toContain('panchang');
    expect(kinds).toContain('goodAvoid');
    expect(kinds).toContain('festival');
    expect(kinds).toContain('match');
    expect(kinds).toContain('window');
    expect(cards.find((card) => card.kind === 'match')).toMatchObject({ total: 28, max: 36 });
  });

  it('share text never names a model', () => {
    const cards = composeAskCards({
      verdict: {
        verdict: 'now',
        nextTime: null,
        reason: 'Clear.',
        displayText: 'You can start.',
      },
      sky: MOCK_SKY,
      language: 'en',
      day,
    });
    const blob = cards.map((card) => askCardShareText(card, 'en')).join('\n');
    expect(blob).not.toMatch(/gemini|openai|chatgpt|llm|\bai\b|powered by|chatbot/i);
  });
});
