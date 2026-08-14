import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  VERDICT_BEAT_MS,
  createVerdictBeat,
  verdictBeatEnvelope,
  verdictBeatProgress,
} from '../verdictBeat.ts';

describe('verdictBeat', () => {
  it('tracks a 1.4s beat', () => {
    const beat = createVerdictBeat('now', 1_000);
    assert.equal(beat.durationMs, VERDICT_BEAT_MS);
    assert.equal(verdictBeatProgress(null, 1_000), 0);
    assert.equal(verdictBeatProgress(beat, 1_000), 0);
    assert.ok(Math.abs(verdictBeatProgress(beat, 1_700) - 0.5) < 1e-9);
    assert.equal(verdictBeatProgress(beat, 2_400), 1);
  });

  it('peaks in the middle and is still at the ends', () => {
    assert.equal(verdictBeatEnvelope(0), 0);
    assert.equal(verdictBeatEnvelope(1), 0);
    assert.ok(verdictBeatEnvelope(0.5) > 0.99);
    assert.ok(verdictBeatEnvelope(0.25) > 0.7);
  });
});
