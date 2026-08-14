import { describe, expect, it } from 'vitest';

import { festivalShareText, muhuratShareText } from '../cardText';

describe('share cards', () => {
  it('opens with Best date for {event}', () => {
    const text = muhuratShareText({
      language: 'en',
      eventLabel: 'Housewarming',
      date: '2026-08-23',
      score: 86,
      reason: 'Abhijit muhurat after sunrise; no Bhadra.',
      city: 'Delhi',
    });
    expect(text.startsWith('Best date for Housewarming')).toBe(true);
    expect(text).toContain('2026-08-23');
    expect(text).toContain('Score 86');
    expect(text).not.toMatch(/\bads?\b|sponsored/i);
  });

  it('uses the Hindi best-date line', () => {
    const text = muhuratShareText({
      language: 'hi',
      eventLabel: 'गृह प्रवेश',
      date: '2026-08-23',
      score: 86,
      reason: 'अभिजित मुहूर्त',
      city: 'दिल्ली',
    });
    expect(text.startsWith('गृह प्रवेश के लिए सबसे अच्छी तारीख')).toBe(true);
  });

  it('builds a festival card without ads', () => {
    const text = festivalShareText({
      language: 'en',
      name: 'Janmashtami',
      date: '2026-08-28',
      reason: 'Krishna Ashtami matched.',
      city: 'Delhi',
    });
    expect(text).toContain('Janmashtami');
    expect(text).toContain('2026-08-28');
    expect(text).not.toMatch(/\bads?\b|sponsored/i);
  });
});
