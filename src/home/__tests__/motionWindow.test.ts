import { describe, expect, it } from 'vitest';

import { toMotionVerdict, toMotionWindow } from '../motionWindow';

describe('toMotionWindow', () => {
  it('passes named windows through to the motion palette', () => {
    expect(toMotionWindow('rahu')).toBe('rahu');
    expect(toMotionWindow('abhijit')).toBe('abhijit');
    expect(toMotionWindow('labh')).toBe('labh');
  });

  it('maps remaining Choghadiya names to other', () => {
    expect(toMotionWindow('chal')).toBe('other');
    expect(toMotionWindow('udveg')).toBe('other');
    expect(toMotionWindow('kaal')).toBe('other');
    expect(toMotionWindow('rog')).toBe('other');
  });
});

describe('toMotionVerdict', () => {
  it('forwards now/wait from RULES', () => {
    expect(toMotionVerdict('now')).toBe('now');
    expect(toMotionVerdict('wait')).toBe('wait');
  });
});
