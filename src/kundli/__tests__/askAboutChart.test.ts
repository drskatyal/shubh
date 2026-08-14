import { describe, expect, it } from 'vitest';

import { CreditWallet, MemoryCreditStore } from '../../billing/credits';
import { MOCK_BIRTH_CHART } from '../../fixtures/mockBirthChart';
import { toChartAskSummary } from '../../tathaastu/normalize';
import { askAboutChart, buildChartAskPrompt } from '../askAboutChart';

const summary = toChartAskSummary(MOCK_BIRTH_CHART);

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
    if (result.ok) expect(result.verdict.displayText).toMatch(/Taurus/);
    expect(wallet.remaining()).toBe(0);
  });
});
