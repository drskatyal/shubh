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
    const dock = readFileSync(new URL('../marriage/RecordDock.tsx', import.meta.url), 'utf8');
    const webAudio = readFileSync(new URL('../webAudio.ts', import.meta.url), 'utf8');
    const webShare = readFileSync(new URL('../../share/webShare.ts', import.meta.url), 'utf8');
    const draw = readFileSync(new URL('../../share/drawCard.ts', import.meta.url), 'utf8');
    assert.doesNotMatch(page, /ChatGPT|powered by|chatbot|Ask the AI/i);
    assert.doesNotMatch(composer, /chat|assistant|Gemini/i);
    assert.doesNotMatch(matching, /chatbot|Ask the AI|powered by|BirthForm/i);
    assert.doesNotMatch(flow, /chatbot|Ask the AI|powered by|AskComposer|TextInput/i);
    assert.doesNotMatch(marriageCopy, BANNED);
    assert.doesNotMatch(cards, BANNED);
    assert.doesNotMatch(dock, BANNED);
    assert.doesNotMatch(dock, /TextInput|या लिखें|Or write/i);
    assert.doesNotMatch(webAudio, BANNED);
    assert.doesNotMatch(webShare, BANNED);
    assert.doesNotMatch(draw, BANNED);
    assert.match(webAudio, /From a file/);
    assert.match(dock, /fileInsteadLabel/);
    assert.match(composer, /पूछो|Ask/);
    assert.match(matching, /MarriageFlow/);
    assert.match(marriageCopy, /Yeh sab record kar dijiye/);
    assert.match(marriageCopy, /Record/);
    assert.match(dock, /Record/);
  });

  it('store listing paste doc stays provider-silent', () => {
    const paywall = readFileSync(new URL('../../billing/Paywall.tsx', import.meta.url), 'utf8');
    assert.doesNotMatch(paywall, BANNED);
    assert.match(paywall, /Open Shubh|शुभ खोलो/);
    const aso = readFileSync(new URL('../../../docs/STORE-ASO.md', import.meta.url), 'utf8');
    const backend = readFileSync(new URL('../../../docs/BACKEND.md', import.meta.url), 'utf8');
    const submit = readFileSync(new URL('../../../docs/SUBMIT.md', import.meta.url), 'utf8');
    const privacy = readFileSync(new URL('../../../docs/PRIVACY.md', import.meta.url), 'utf8');
    const legal = readFileSync(new URL('../../legal/copy.ts', import.meta.url), 'utf8');
    const firstOpen = readFileSync(new URL('../../home/FirstOpenSheet.tsx', import.meta.url), 'utf8');
    assert.doesNotMatch(aso, BANNED);
    assert.doesNotMatch(backend, BANNED);
    assert.doesNotMatch(submit, BANNED);
    assert.doesNotMatch(privacy, BANNED);
    assert.doesNotMatch(legal, BANNED);
    assert.doesNotMatch(firstOpen, BANNED);
    assert.match(submit, /Closed testing in India/);
    assert.match(submit, /feature-graphic/);
    assert.match(privacy, /Birth details|जन्म की बात/);
    assert.match(aso, /Shubh: Panchang & Kundli/);
    assert.match(aso, /01-milan/);
    assert.match(aso, /feature-graphic/);
    assert.match(aso, /Closed testing in India/);
  });
});
