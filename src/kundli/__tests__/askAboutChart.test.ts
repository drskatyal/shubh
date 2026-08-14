import { describe, expect, it } from 'vitest';

import { CreditWallet, MemoryCreditStore } from '../../billing/credits';
import { toChartAskSummary } from '../../tathaastu/normalize';
import type { NormalizedChart } from '../../tathaastu/types';
import { askAboutChart, buildChartAskPrompt } from '../askAboutChart';

const SAMPLE: NormalizedChart = {
  name: 'Arjun',
  placeName: 'Delhi',
  lagna: { sign: 'Taurus', nakshatra: 'Krittika' },
  moon: { sign: 'Cancer', nakshatra: 'Pushya' },
  planets: [
    { name: 'Sun', sign: 'Taurus', house: 1, nakshatra: 'Krittika' },
    { name: 'Moon', sign: 'Cancer', house: 3, nakshatra: 'Pushya' },
    { name: 'Mars', sign: 'Capricorn', house: 9, nakshatra: null },
    { name: 'Mercury', sign: 'Aries', house: 12, nakshatra: null },
    { name: 'Jupiter', sign: 'Gemini', house: 2, nakshatra: null },
    { name: 'Venus', sign: 'Aries', house: 12, nakshatra: null },
    { name: 'Saturn', sign: 'Capricorn', house: 9, nakshatra: null },
    { name: 'Rahu', sign: 'Aquarius', house: 10, nakshatra: null },
    { name: 'Ketu', sign: 'Leo', house: 4, nakshatra: null },
  ],
  dasha: { mahadasha: 'Jupiter', antardasha: 'Saturn', from: '2024-03-01', to: '2026-11-01' },
  insights: ['Lagna in Taurus, Moon in Cancer.'],
};

const summary = toChartAskSummary(SAMPLE);

describe('buildChartAskPrompt', () => {
  it('embeds the computed summary and forbids birth PII', () => {
    const { system, userText } = buildChartAskPrompt(summary, 'en');
    expect(userText).toContain('Taurus');
    expect(userText).toContain('Jupiter');
    expect(userText).not.toMatch(/1990-05-15|06:30|28\.6139/);
    expect(system).toMatch(/Never ask for or invent a birth date/);
    expect(system).toMatch(/Do not request documents/);
  });

  it('asks for Hindi when language is hi', () => {
    const { system } = buildChartAskPrompt(summary, 'hi');
    expect(system).toMatch(/Hindi/);
  });
});

describe('askAboutChart gate', () => {
  it('does not call Gemini until armed by a tap', async () => {
    let called = 0;
    const wallet = await CreditWallet.open(new MemoryCreditStore(), { devUnlock: false });
    const result = await askAboutChart({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      summary,
      language: 'en',
      wallet,
      apiKey: 'test',
      armed: false,
      ask: async () => {
        called += 1;
        return { verdict: 'now', nextTime: null, reason: 'x', displayText: 'y' };
      },
    });
    expect(result.ok).toBe(false);
    expect(called).toBe(0);
    expect(wallet.remaining()).toBe(1);
  });

  it('sends only after the user tap arms the hook', async () => {
    const wallet = await CreditWallet.open(new MemoryCreditStore(), { devUnlock: false });
    const result = await askAboutChart({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      summary,
      language: 'en',
      wallet,
      apiKey: 'test',
      armed: true,
      ask: async (opts) => {
        expect(JSON.stringify(opts.summary)).not.toMatch(/date_of_birth|latitude/);
        return { verdict: 'now', nextTime: null, reason: 'Lagna is Taurus.', displayText: 'Taurus lagna.' };
      },
    });
    expect(result.ok).toBe(true);
  });
});
