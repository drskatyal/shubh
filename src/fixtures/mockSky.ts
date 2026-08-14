import type { SkyState } from '../engine';

/**
 * Fixture for ask tests and the pre-merge host.
 * Not a panchang calculation — the engine PR replaces this with getSkyState().
 */
export const MOCK_SKY: SkyState = {
  city: 'Mumbai',
  timezone: 'Asia/Kolkata',
  asOf: { iso: '2026-08-14T13:40:00+05:30', clock: '13:40' },
  sunrise: { iso: '2026-08-14T06:18:00+05:30', clock: '06:18' },
  sunset: { iso: '2026-08-14T19:02:00+05:30', clock: '19:02' },
  currentSlot: {
    name: 'Rahu Kaal',
    kind: 'inauspicious',
    start: { iso: '2026-08-14T12:24:00+05:30', clock: '12:24' },
    end: { iso: '2026-08-14T14:12:00+05:30', clock: '14:12' },
  },
  rahu: {
    name: 'Rahu Kaal',
    kind: 'inauspicious',
    start: { iso: '2026-08-14T12:24:00+05:30', clock: '12:24' },
    end: { iso: '2026-08-14T14:12:00+05:30', clock: '14:12' },
  },
  yamaganda: {
    name: 'Yamaganda',
    kind: 'inauspicious',
    start: { iso: '2026-08-14T07:54:00+05:30', clock: '07:54' },
    end: { iso: '2026-08-14T09:30:00+05:30', clock: '09:30' },
  },
  gulika: {
    name: 'Gulika',
    kind: 'inauspicious',
    start: { iso: '2026-08-14T10:48:00+05:30', clock: '10:48' },
    end: { iso: '2026-08-14T12:24:00+05:30', clock: '12:24' },
  },
  abhijit: {
    name: 'Abhijit',
    kind: 'good',
    start: { iso: '2026-08-14T12:16:00+05:30', clock: '12:16' },
    end: { iso: '2026-08-14T13:04:00+05:30', clock: '13:04' },
  },
  nextGoodWindow: {
    name: 'Shubh',
    kind: 'good',
    start: { iso: '2026-08-14T14:12:00+05:30', clock: '14:12' },
    end: { iso: '2026-08-14T15:48:00+05:30', clock: '15:48' },
  },
};
