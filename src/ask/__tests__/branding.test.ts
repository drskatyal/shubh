import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { privacyLine, remainingLabel, setupCopy } from '../copy';

const BANNED = /gemini|openai|chatgpt|grok|\bllm\b|artificial intelligence|powered by|ask the ai|chatbot|\ba\.i\.\b/i;

describe('ask copy never names a model', () => {
  it('user-facing helpers stay provider-silent', () => {
    for (const language of ['en', 'hi'] as const) {
      assert.doesNotMatch(privacyLine(language), BANNED);
      assert.doesNotMatch(setupCopy(language), BANNED);
      assert.doesNotMatch(remainingLabel(language, 3), BANNED);
    }
  });

  it('Ask page source has no banned chrome', () => {
    const page = readFileSync(new URL('../AskPage.tsx', import.meta.url), 'utf8');
    const composer = readFileSync(new URL('../AskComposer.tsx', import.meta.url), 'utf8');
    const matching = readFileSync(new URL('../../kundli/MatchingScreen.tsx', import.meta.url), 'utf8');
    const flow = readFileSync(new URL('../marriage/MarriageFlow.tsx', import.meta.url), 'utf8');
    const marriageCopy = readFileSync(new URL('../marriage/copy.ts', import.meta.url), 'utf8');
    const cards = readFileSync(new URL('../marriage/ConfirmBirthCards.tsx', import.meta.url), 'utf8');
    assert.doesNotMatch(page, /ChatGPT|powered by|chatbot|Ask the AI/i);
    assert.doesNotMatch(composer, /chat|assistant|Gemini/i);
    assert.doesNotMatch(matching, /chatbot|Ask the AI|powered by/i);
    assert.doesNotMatch(flow, /chatbot|Ask the AI|powered by/i);
    assert.doesNotMatch(marriageCopy, BANNED);
    assert.doesNotMatch(cards, BANNED);
    assert.match(composer, /पूछो|Ask/);
    assert.match(marriageCopy, /Yeh sab record kar dijiye/);
    assert.match(marriageCopy, /Record/);
  });
});
