import { describe, expect, it } from 'vitest';

import { isTempleWidth, TEMPLE_MIN_WIDTH } from '../layout';

describe('temple layout', () => {
  it('keeps phones as phones', () => {
    expect(isTempleWidth(390)).toBe(false);
    expect(isTempleWidth(412)).toBe(false);
    expect(isTempleWidth(768)).toBe(false);
  });

  it('opens the side-rail temple on a desktop width', () => {
    expect(TEMPLE_MIN_WIDTH).toBe(1100);
    expect(isTempleWidth(1440)).toBe(true);
  });
});
