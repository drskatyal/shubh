import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MOCK_SKY } from '../../fixtures/mockSky';
import { clocksInSky } from '../parseVerdict';
import { GEMINI_MODEL, buildAskPrompt } from '../prompt';

describe('buildAskPrompt', () => {
  it('embeds this-minute sky JSON and every clock verbatim', () => {
    const { userText, system } = buildAskPrompt(MOCK_SKY, 'en');
    assert.match(userText, /Language: en/);
    assert.match(userText, /Mumbai/);
    for (const clock of clocksInSky(MOCK_SKY)) {
      assert.ok(userText.includes(clock), `missing clock ${clock}`);
    }
    assert.match(system, /Never invent/);
    assert.match(system, /14:12/);
    assert.equal(GEMINI_MODEL, 'gemini-3.7-flash');
  });

  it('asks for Hindi display when language is hi', () => {
    const { system, userText } = buildAskPrompt(MOCK_SKY, 'hi');
    assert.match(system, /Hindi/);
    assert.match(userText, /Language: hi/);
  });
});
