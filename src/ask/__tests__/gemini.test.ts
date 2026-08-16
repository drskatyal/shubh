import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MOCK_SKY } from '../../fixtures/mockSky';
import { askGemini, type FetchLike } from '../gemini';

describe('askGemini', () => {
  it('posts audio in one HTTP call with the sky JSON', async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl: FetchLike = async (url, init) => {
      calls.push({ url, body: init.body });
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        verdict: 'wait',
                        nextTime: '14:12',
                        reason: 'Rahu Kaal is on.',
                        displayText: 'Wait. Rahu Kaal lasts until 14:12.',
                      }),
                    },
                  ],
                },
              },
            ],
          });
        },
      };
    };

    const verdict = await askGemini({
      apiKey: 'test-key',
      audio: { base64: 'AAAA', mimeType: 'audio/m4a' },
      sky: MOCK_SKY,
      language: 'en',
      fetchImpl,
    });

    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /gemini-3\.1-flash-lite:generateContent/);
    assert.match(calls[0].url, /key=test-key/);
    const payload = JSON.parse(calls[0].body) as {
      contents: Array<{ parts: Array<Record<string, unknown>> }>;
      generationConfig?: { thinkingConfig?: { thinkingLevel?: string } };
    };
    const parts = payload.contents[0].parts;
    assert.match(String(parts[0].text), /14:12/);
    assert.deepEqual(parts[1].inlineData, {
      mimeType: 'audio/m4a',
      data: 'AAAA',
    });
    assert.equal(payload.generationConfig?.thinkingConfig?.thinkingLevel, 'LOW');
    assert.equal(verdict.verdict, 'wait');
    assert.equal(verdict.nextTime, '14:12');
  });
});
