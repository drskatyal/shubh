import { describe, expect, it } from 'vitest';

import { buildGlance } from '../buildGlance';

describe('buildGlance', () => {
  it('puts tithi on the widget line', () => {
    const glance = buildGlance({
      city: 'Mumbai',
      windowName: 'Rahu Kaal',
      tithi: 'Dwitiya',
      state: 'wait',
      language: 'en',
    });
    expect(glance.windowName).toBe('Dwitiya');
    expect(glance.tithi).toBeUndefined();
    expect(glance.city).toBe('Mumbai');
    expect(glance.state).toBe('wait');
  });

  it('keeps the window name when tithi is missing', () => {
    const glance = buildGlance({
      city: 'Delhi',
      windowName: 'Abhijit',
      state: 'now',
      language: 'hi',
    });
    expect(glance.windowName).toBe('Abhijit');
    expect(glance.tithi).toBeUndefined();
  });

  it('does not duplicate tithi when it already is the window line', () => {
    const glance = buildGlance({
      city: 'Pune',
      windowName: 'Tritiya',
      tithi: 'Tritiya',
      state: 'now',
      language: 'en',
    });
    expect(glance.windowName).toBe('Tritiya');
    expect(glance.tithi).toBeUndefined();
  });
});
