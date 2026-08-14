import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MOCK_SKY } from '../../fixtures/mockSky';
import { windowKindFromSky } from '../windowKind';

describe('windowKindFromSky', () => {
  it('maps the current slot name without touching clocks', () => {
    assert.equal(windowKindFromSky(MOCK_SKY), 'rahu');
    assert.equal(
      windowKindFromSky({
        ...MOCK_SKY,
        currentSlot: { ...MOCK_SKY.currentSlot, name: 'Abhijit' },
      }),
      'abhijit',
    );
    assert.equal(
      windowKindFromSky({
        ...MOCK_SKY,
        currentSlot: { ...MOCK_SKY.currentSlot, name: 'Choghadiya' },
      }),
      'other',
    );
    assert.equal(MOCK_SKY.rahu.end.clock, '14:12');
  });
});
