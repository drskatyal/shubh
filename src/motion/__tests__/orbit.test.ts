import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EARTH_PHASE,
  MOON_PHASE,
  SCENE_BODY_NODES,
  SKIA_NODE_BUDGET,
  STARS,
  STAR_COUNT,
  STILL_CLOCK_MS,
  SUN_PERIOD_MS,
  SUN_PHASE,
  clockMs,
  orbitalPosition,
  starField,
} from '../orbit.ts';

describe('clockMs', () => {
  it('freezes on the composed still when Reduce Motion is on', () => {
    assert.equal(clockMs(88_000, true), STILL_CLOCK_MS);
    assert.equal(STILL_CLOCK_MS, 0);
  });

  it('passes elapsed time through when motion is allowed', () => {
    assert.equal(clockMs(12_500, false), 12_500);
  });
});

describe('orbitalPosition', () => {
  it('places the still sun in the upper-right and the moon lower-left', () => {
    const sun = orbitalPosition(STILL_CLOCK_MS, SUN_PERIOD_MS, 100, 60, SUN_PHASE);
    const moon = orbitalPosition(STILL_CLOCK_MS, 156_000, 108, 67, MOON_PHASE);
    const earth = orbitalPosition(STILL_CLOCK_MS, 72_000, 62, 37, EARTH_PHASE);
    assert.ok(sun.x > 0 && sun.y < 0, `sun ${sun.x},${sun.y}`);
    assert.ok(moon.x < 0 && moon.y > 0, `moon ${moon.x},${moon.y}`);
    assert.ok(earth.x < 0, `earth ${earth.x},${earth.y}`);
  });

  it('repeats every period', () => {
    const a = orbitalPosition(1_000, SUN_PERIOD_MS, 80, 40, SUN_PHASE);
    const b = orbitalPosition(1_000 + SUN_PERIOD_MS, SUN_PERIOD_MS, 80, 40, SUN_PHASE);
    assert.ok(Math.abs(a.x - b.x) < 1e-9);
    assert.ok(Math.abs(a.y - b.y) < 1e-9);
  });
});

describe('starField', () => {
  it('is deterministic and stays on the unit square', () => {
    assert.equal(STARS.length, STAR_COUNT);
    assert.deepEqual(starField(STAR_COUNT), STARS);
    assert.ok(STAR_COUNT + SCENE_BODY_NODES <= SKIA_NODE_BUDGET);
    for (const star of STARS) {
      assert.ok(star.x >= 0 && star.x <= 1);
      assert.ok(star.y >= 0 && star.y <= 1);
      assert.ok(star.r > 0);
    }
  });
});
