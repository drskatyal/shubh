import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { INAUSPICIOUS, resolvePalette, windowPalette } from '../palette.ts';
import { WINDOW_KINDS, type WindowKind } from '../types.ts';

describe('windowPalette', () => {
  for (const kind of WINDOW_KINDS) {
    it(`has a full palette for ${kind}`, () => {
      const palette = windowPalette(kind);
      for (const key of [
        'skyDeep',
        'skyMid',
        'glow',
        'orbit',
        'sun',
        'sunCore',
        'moon',
        'earth',
        'star',
      ] as const) {
        assert.match(palette[key], /^#[0-9A-Fa-f]{6}$/);
      }
    });
  }

  it('keeps inauspicious windows duskier than Abhijit', () => {
    const abhijit = windowPalette('abhijit').glow;
    for (const kind of ['rahu', 'yamaganda', 'gulika'] as WindowKind[]) {
      assert.ok(INAUSPICIOUS.has(kind));
      assert.notEqual(windowPalette(kind).glow, abhijit);
    }
  });
});

describe('resolvePalette', () => {
  it('leaves the window palette alone without a verdict', () => {
    assert.deepEqual(resolvePalette('labh'), windowPalette('labh'));
  });

  it('warms now toward the auspicious sun', () => {
    const now = resolvePalette('rahu', 'now');
    assert.equal(now.sun, windowPalette('shubh').sun);
    assert.equal(now.glow, windowPalette('abhijit').glow);
  });

  it('cools wait toward moon and dusk', () => {
    const wait = resolvePalette('shubh', 'wait');
    assert.equal(wait.moon, windowPalette('amrit').moon);
    assert.equal(wait.skyMid, windowPalette('other').skyMid);
  });

  it('brightens the path for after', () => {
    const after = resolvePalette('other', 'after');
    assert.equal(after.orbit, windowPalette('abhijit').orbit);
  });
});
