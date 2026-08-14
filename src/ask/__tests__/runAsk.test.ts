import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CreditWallet, MemoryCreditStore } from '../../billing/credits';
import { MOCK_SKY } from '../../fixtures/mockSky';
import { runAsk } from '../runAsk';
import type { AskVerdict } from '../types';

const spoken = 'Can I leave the house now?';

function leaveHouseVerdict(language: 'hi' | 'en'): AskVerdict {
  const nextTime = MOCK_SKY.rahu.end.clock;
  if (language === 'hi') {
    return {
      verdict: 'wait',
      nextTime,
      reason: 'अभी राहु काल है।',
      displayText: `घर से अभी न निकलें। राहु काल ${nextTime} तक है।`,
    };
  }
  return {
    verdict: 'wait',
    nextTime,
    reason: 'Rahu Kaal is on now.',
    displayText: `Wait. Rahu Kaal lasts until ${nextTime}.`,
  };
}

async function walletWithFreeSample() {
  return CreditWallet.open(new MemoryCreditStore(), { devUnlock: false });
}

describe('runAsk', () => {
  it('returns wait in en for a spoken leave-the-house ask and decrements credits', async () => {
    const wallet = await walletWithFreeSample();
    assert.equal(wallet.remaining(), 1);

    const result = await runAsk({
      audio: { base64: Buffer.from(spoken).toString('base64'), mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      wallet,
      apiKey: 'test',
      ask: async () => leaveHouseVerdict('en'),
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.verdict, 'wait');
    assert.equal(result.verdict.nextTime, '14:12');
    assert.match(result.verdict.displayText, /14:12/);
    assert.equal(result.remaining, 0);
    assert.equal(wallet.remaining(), 0);
  });

  it('returns wait in hi with the same sky clocks', async () => {
    const wallet = await walletWithFreeSample();
    const result = await runAsk({
      audio: { base64: Buffer.from(spoken).toString('base64'), mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'hi',
      wallet,
      apiKey: 'test',
      ask: async () => leaveHouseVerdict('hi'),
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict.verdict, 'wait');
    assert.equal(result.verdict.nextTime, '14:12');
    assert.match(result.verdict.displayText, /14:12/);
    assert.match(result.verdict.displayText, /राहु/);
  });

  it('gates a second ask at 0 credits', async () => {
    const wallet = await walletWithFreeSample();
    await runAsk({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      wallet,
      apiKey: 'test',
      ask: async () => leaveHouseVerdict('en'),
    });

    const blocked = await runAsk({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      wallet,
      apiKey: 'test',
      ask: async () => leaveHouseVerdict('en'),
    });

    assert.equal(blocked.ok, false);
    if (blocked.ok) return;
    assert.equal(blocked.error, 'no_credits');
    assert.equal(wallet.remaining(), 0);
  });

  it('does not consume a credit when Gemini is missing or fails', async () => {
    const wallet = await walletWithFreeSample();
    const missing = await runAsk({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      wallet,
      apiKey: null,
      ask: async () => leaveHouseVerdict('en'),
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, 'missing_key');
    assert.equal(wallet.remaining(), 1);

    const failed = await runAsk({
      audio: { base64: 'AA', mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      wallet,
      apiKey: 'test',
      ask: async () => {
        throw new Error('Gemini 503');
      },
    });
    assert.equal(failed.ok, false);
    assert.equal(wallet.remaining(), 1);
  });
});
