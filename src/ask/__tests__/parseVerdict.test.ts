import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MOCK_SKY } from '../../fixtures/mockSky';
import { parseVerdict } from '../parseVerdict';

describe('parseVerdict', () => {
  it('reads now / wait / after and keeps a sky clock', () => {
    const wait = parseVerdict(
      JSON.stringify({
        verdict: 'wait',
        nextTime: '14:12',
        reason: 'Rahu Kaal is on.',
        displayText: 'Wait. Rahu Kaal lasts until 14:12.',
      }),
      MOCK_SKY,
    );
    assert.equal(wait.verdict, 'wait');
    assert.equal(wait.nextTime, '14:12');

    const now = parseVerdict(
      '```json\n{"verdict":"now","nextTime":"","reason":"Clear.","displayText":"You can leave now."}\n```',
      MOCK_SKY,
    );
    assert.equal(now.verdict, 'now');
    assert.equal(now.nextTime, null);

    const after = parseVerdict(
      '{"verdict":"after","nextTime":"14:12","reason":"Later.","displayText":"Go after 14:12."}',
      MOCK_SKY,
    );
    assert.equal(after.verdict, 'after');
  });

  it('drops a nextTime the sky JSON does not contain', () => {
    const parsed = parseVerdict(
      JSON.stringify({
        verdict: 'wait',
        nextTime: '15:00',
        reason: 'Invented.',
        displayText: 'Wait until 15:00.',
      }),
      MOCK_SKY,
    );
    assert.equal(parsed.nextTime, null);
  });

  it('rejects an unknown verdict', () => {
    assert.throws(() =>
      parseVerdict(
        '{"verdict":"maybe","reason":"x","displayText":"y"}',
        MOCK_SKY,
      ),
    );
  });
});
