import { describe, expect, it } from 'vitest';

import { STRINGS } from '../strings';

describe('hi/en copy', () => {
  it('keeps Hindi strings in Devanagari without falling back to English labels', () => {
    expect(STRINGS.hi.appName).toBe('शुभ');
    expect(STRINGS.hi.almanac.muhurat).toBe('मुहूर्त');
    expect(STRINGS.hi.almanac.events.griha_pravesh).toBe('गृह प्रवेश');
    expect(STRINGS.hi.kundliTitle).toBe('जन्म कुंडली');
    expect(STRINGS.en.asoLine).toMatch(/panchang|kundli|guna milan|rahukaal|muhurat/i);
    expect(STRINGS.hi.asoLine).toMatch(/पंचांग|कुंडली|गुण मिलान|राहु|मुहूर्त/);
    expect(`${STRINGS.en.micSlot} ${STRINGS.en.subtitle}`).not.toMatch(/pandit|gemini|ai astrologer/i);
    expect(STRINGS.hi.almanac.liveNeedsKey).not.toMatch(/fixtures|नमूना कुंडली/);
    expect(STRINGS.en.almanac.liveNeedsKey).not.toMatch(/fixture/i);
  });

  it('has matching keys in both languages', () => {
    expect(Object.keys(STRINGS.hi).sort()).toEqual(Object.keys(STRINGS.en).sort());
    expect(Object.keys(STRINGS.hi.almanac.events)).toEqual(Object.keys(STRINGS.en.almanac.events));
  });
});
