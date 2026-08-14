import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { speakVerdict } from '../speakVerdict';

describe('speakVerdict', () => {
  it('is a no-op hook in v1', async () => {
    await speakVerdict({
      verdict: 'now',
      nextTime: null,
      reason: 'Clear.',
      displayText: 'You can go.',
    });
    assert.ok(true);
  });
});
