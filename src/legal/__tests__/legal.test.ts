import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { legalBody, legalTitle } from '../copy';

const BANNED = /gemini|openai|chatgpt|grok|\bllm\b|artificial intelligence|powered by|ask the ai|chatbot|\ba\.i\.\b/i;

describe('legal pages', () => {
  it('stays bilingual and provider-silent', () => {
    for (const page of ['privacy', 'terms', 'support'] as const) {
      expect(legalTitle(page, 'hi').length).toBeGreaterThan(1);
      expect(legalTitle(page, 'en').length).toBeGreaterThan(1);
      expect(legalBody(page, 'hi')).not.toMatch(BANNED);
      expect(legalBody(page, 'en')).not.toMatch(BANNED);
    }
    expect(legalBody('privacy', 'hi')).toMatch(/जन्म की बात/);
    expect(legalBody('privacy', 'en')).toMatch(/Birth details/);
    expect(legalBody('terms', 'en')).toMatch(/almanac, not a priest/);
    expect(legalBody('support', 'hi')).toMatch(/खरीद वापस/);
  });

  it('is linked from paywall and home', () => {
    const paywall = readFileSync(new URL('../../billing/Paywall.tsx', import.meta.url), 'utf8');
    const home = readFileSync(new URL('../../home/HomeScreen.tsx', import.meta.url), 'utf8');
    expect(paywall).toMatch(/onOpenLegal/);
    expect(paywall).toMatch(/privacy/);
    expect(home).toMatch(/FirstOpenSheet/);
    expect(home).toMatch(/openLegal/);
  });
});
