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
    expect(glance.tithi).toBe('Dwitiya');
    expect(glance.city).toBe('Mumbai');
    expect(glance.state).toBe('wait');
  });
});
