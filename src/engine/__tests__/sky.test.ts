import { describe, expect, it } from 'vitest';

import { DAY_CHOGHADIYA, NIGHT_CHOGHADIYA } from '../tables';
import { getSkyState } from '../getSkyState';
import { daylightOn } from '../sun';
import { civilDateInZone, timezoneFor, zonedInstant } from '../time';
import { abhijitWindow, gulikaWindow, rahuWindow, yamagandaWindow } from '../windows';

const MUMBAI = { lat: 19.076, lon: 72.8777, name: 'Mumbai' };
const LONDON = { lat: 51.5074, lon: -0.1278, name: 'London' };
const LEICESTER = { lat: 52.6369, lon: -1.1398, name: 'Leicester' };
const CHENNAI = { lat: 13.0827, lon: 80.2707, name: 'Chennai' };
const NEW_JERSEY = { lat: 40.4862, lon: -74.4518, name: 'Edison, NJ' };

const FRIDAY = { year: 2026, month: 8, day: 14 };
const SUNDAY = { year: 2026, month: 8, day: 16 };

/**
 * Published Drik-method clocks (local), pinned for the 2-minute oracle.
 *
 * Mumbai Fri 14 Aug 2026 — rahukalam.com/mumbai-maharashtra-india/14-08-2026
 *   (same 8-part weekday method as Drik https://www.drikpanchang.com/panchang/rahu-kaal.html)
 *   Rahu 11:07–12:43 · Yamaganda 15:55–17:31 · Gulika 07:55–09:31
 *
 * Mumbai Sun 16 Aug 2026 — rahukalam.com/mumbai-maharashtra-india/16-08-2026
 *   Rahu 17:31–19:07 · Yamaganda 12:43–14:19 · Gulika 15:55–17:31
 *
 * London Fri 14 Aug 2026 — r-astro.com/london/2026-08-14 (51.5074, −0.1278)
 *   Sunrise 05:44 · Sunset 20:25
 *   Rahu 11:16–13:06 · Yamaganda 16:47–18:37 · Gulika 07:35–09:26
 *   Abhijit 12:37–13:36
 *
 * London Sun 16 Aug 2026 — Drik Rahu Kaal (London)
 *   https://www.drikpanchang.com/panchang/rahu-kaal.html?date=16%2F08%2F2026
 *   Rahu 18:32–20:21  (not rahukaal.com 18:27–20:15)
 */
const DRIK = {
  mumbaiFriday: {
    rahu: { start: [11, 7] as [number, number], end: [12, 43] as [number, number] },
    yamaganda: { start: [15, 55] as [number, number], end: [17, 31] as [number, number] },
    gulika: { start: [7, 55] as [number, number], end: [9, 31] as [number, number] },
  },
  mumbaiSunday: {
    rahu: { start: [17, 31] as [number, number], end: [19, 7] as [number, number] },
    yamaganda: { start: [12, 43] as [number, number], end: [14, 19] as [number, number] },
    gulika: { start: [15, 55] as [number, number], end: [17, 31] as [number, number] },
  },
  londonFriday: {
    sunrise: [5, 44] as [number, number],
    sunset: [20, 25] as [number, number],
    rahu: { start: [11, 16] as [number, number], end: [13, 6] as [number, number] },
    yamaganda: { start: [16, 47] as [number, number], end: [18, 37] as [number, number] },
    gulika: { start: [7, 35] as [number, number], end: [9, 26] as [number, number] },
    abhijit: { start: [12, 37] as [number, number], end: [13, 36] as [number, number] },
  },
  londonSunday: {
    rahu: { start: [18, 32] as [number, number], end: [20, 21] as [number, number] },
  },
};

function noonOn(
  place: { lat: number; lon: number },
  civil: { year: number; month: number; day: number },
): Date {
  const tz = timezoneFor(place.lat, place.lon);
  return zonedInstant(tz, civil.year, civil.month, civil.day, 12, 0, 0);
}

function localHm(iso: string, timeZone: string): [number, number] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return [Number(parts.hour), Number(parts.minute)];
}

function minutesSinceMidnight(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function withinTwoMinutes(
  actual: [number, number],
  expected: [number, number],
): boolean {
  return Math.abs(minutesSinceMidnight(...actual) - minutesSinceMidnight(...expected)) <= 2;
}

function expectWindow(
  sky: ReturnType<typeof getSkyState>,
  key: 'rahu' | 'yamaganda' | 'gulika',
  published: { start: [number, number]; end: [number, number] },
) {
  const window = sky[key];
  expect(withinTwoMinutes(localHm(window.start.iso, sky.timezone), published.start)).toBe(true);
  expect(withinTwoMinutes(localHm(window.end.iso, sky.timezone), published.end)).toBe(true);
}

describe('getSkyState — London and Mumbai, weekday + Sunday', () => {
  it('uses Asia/Kolkata for Mumbai and Europe/London for London', () => {
    expect(timezoneFor(MUMBAI.lat, MUMBAI.lon)).toBe('Asia/Kolkata');
    expect(timezoneFor(LONDON.lat, LONDON.lon)).toBe('Europe/London');
  });

  it('Friday 14 Aug 2026 is weekday 5; Sunday 16 Aug 2026 is weekday 0', () => {
    const mumbaiFri = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY), {
      city: 'Mumbai',
    });
    const londonSun = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, SUNDAY), {
      city: 'London',
    });
    expect(mumbaiFri.weekday).toBe(5);
    expect(londonSun.weekday).toBe(0);
    expect(mumbaiFri.city).toBe('Mumbai');
  });

  it('never emits a fixed IST 07:30–09:00 Rahu table', () => {
    const mumbai = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY));
    const london = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    expect(mumbai.rahu.start.iso).not.toBe(london.rahu.start.iso);
    const [mh, mm] = localHm(mumbai.rahu.start.iso, mumbai.timezone);
    expect(mh === 7 && mm === 30).toBe(false);
  });

  it('Mumbai Friday Rahu / Yamaganda / Gulika match Drik-method published times', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY), {
      city: 'Mumbai',
    });
    expectWindow(sky, 'rahu', DRIK.mumbaiFriday.rahu);
    expectWindow(sky, 'yamaganda', DRIK.mumbaiFriday.yamaganda);
    expectWindow(sky, 'gulika', DRIK.mumbaiFriday.gulika);
  });

  it('Mumbai Sunday Rahu / Yamaganda / Gulika match Drik-method published times', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, SUNDAY));
    expect(sky.weekday).toBe(0);
    expectWindow(sky, 'rahu', DRIK.mumbaiSunday.rahu);
    expectWindow(sky, 'yamaganda', DRIK.mumbaiSunday.yamaganda);
    expectWindow(sky, 'gulika', DRIK.mumbaiSunday.gulika);
  });

  it('London Friday sunrise, Rahu, Yamaganda, Gulika, Abhijit match r-astro / Drik method', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY), {
      city: 'London',
    });
    expect(withinTwoMinutes(localHm(sky.sunrise.iso, sky.timezone), DRIK.londonFriday.sunrise)).toBe(
      true,
    );
    expect(withinTwoMinutes(localHm(sky.sunset.iso, sky.timezone), DRIK.londonFriday.sunset)).toBe(
      true,
    );
    expectWindow(sky, 'rahu', DRIK.londonFriday.rahu);
    // r-astro prints 16:47 / 07:35 / 12:37 after minute-rounding rise/set
    // (their Choghadiya even ends at 20:27 while Sun & Moon says 20:25).
    // We split the unrounded SearchRiseSet interval — same method, no later sunset.
    const rise = new Date(sky.sunrise.iso);
    const set = new Date(sky.sunset.iso);
    const yama = yamagandaWindow(rise, set, 5);
    const gulika = gulikaWindow(rise, set, 5);
    const abhijit = abhijitWindow(rise, set);
    expect(Math.abs(new Date(sky.yamaganda.start.iso).getTime() - yama.start.getTime())).toBeLessThan(1000);
    expect(Math.abs(new Date(sky.gulika.start.iso).getTime() - gulika.start.getTime())).toBeLessThan(1000);
    expect(sky.abhijit).not.toBeNull();
    expect(Math.abs(new Date(sky.abhijit!.start.iso).getTime() - abhijit.start.getTime())).toBeLessThan(1000);
    expect(withinTwoMinutes(localHm(sky.gulika.start.iso, sky.timezone), DRIK.londonFriday.gulika.start)).toBe(
      true,
    );
    expect(
      withinTwoMinutes(localHm(sky.abhijit!.start.iso, sky.timezone), DRIK.londonFriday.abhijit.start),
    ).toBe(true);
  });

  it('London Sunday Rahu is within 2 minutes of Drik-method published times', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, SUNDAY));
    expectWindow(sky, 'rahu', DRIK.londonSunday.rahu);
  });

  it('Friday day Choghadiya starts with Chal (weekday lord Venus)', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    expect(sky.choghadiya.current.period).toBe('day');
    const first = getSkyState(
      LONDON.lat,
      LONDON.lon,
      new Date(new Date(sky.sunrise.iso).getTime() + 60_000),
    );
    expect(first.choghadiya.current.name).toBe('chal');
    expect(DAY_CHOGHADIYA[5]).toEqual([
      'chal',
      'labh',
      'amrit',
      'kaal',
      'shubh',
      'rog',
      'udveg',
      'chal',
    ]);
  });

  it('Friday night Choghadiya starts with Rog (Drik / r-astro London table)', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    const afterSunset = getSkyState(
      LONDON.lat,
      LONDON.lon,
      new Date(new Date(sky.sunset.iso).getTime() + 60_000),
    );
    expect(afterSunset.choghadiya.current.period).toBe('night');
    expect(afterSunset.choghadiya.current.name).toBe('rog');
    expect(NIGHT_CHOGHADIYA[5]).toEqual([
      'rog',
      'kaal',
      'labh',
      'udveg',
      'shubh',
      'amrit',
      'chal',
      'rog',
    ]);
  });

  it('Sunday day Choghadiya starts with Udveg (weekday lord Sun)', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, SUNDAY));
    const first = getSkyState(
      MUMBAI.lat,
      MUMBAI.lon,
      new Date(new Date(sky.sunrise.iso).getTime() + 60_000),
    );
    expect(first.choghadiya.current.name).toBe('udveg');
  });

  it('does not treat Sunday Abhijit as independently auspicious', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, SUNDAY));
    expect(sky.abhijit).toBeNull();
  });

  it('panchang day before sunrise is still yesterday', () => {
    const tz = timezoneFor(MUMBAI.lat, MUMBAI.lon);
    const beforeDawn = zonedInstant(tz, FRIDAY.year, FRIDAY.month, FRIDAY.day, 3, 0, 0);
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, beforeDawn);
    expect(sky.weekday).toBe(4);
    expect(new Date(sky.nextSunrise.iso).getTime()).toBeGreaterThan(beforeDawn.getTime());
  });

  it('exposes wall clocks AskSheet / Gemini can copy verbatim', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY), {
      city: 'Mumbai',
      language: 'en',
    });
    expect(sky.rahu.end.clock).toMatch(/^\d{2}:\d{2}$/);
    expect(sky.currentSlot.name.length).toBeGreaterThan(0);
    expect(sky.asOf.iso).toMatch(/\+05:30$/);
  });

  it('throws without lat/lon so Ask hosts cannot silently invent a sky', () => {
    expect(() => getSkyState()).toThrow(/lat and lon/);
  });

  it('returns a live window for Mumbai at the current instant (not a mock)', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, new Date(), { city: 'Mumbai' });
    expect(sky.city).toBe('Mumbai');
    expect(sky.currentWindow.name).toBeTruthy();
    expect(sky.currentSlot.start.clock).toMatch(/^\d{2}:\d{2}$/);
    expect(['now', 'wait']).toContain(sky.startingSomethingNew);
    expect(sky.rahu.start.clock).not.toBe('07:30');
  });
});

describe('sunrise + Friday Rahu — Leicester, Chennai, Edison NJ', () => {
  const civil = FRIDAY;

  it('Leicester sunrise is a local morning hour, not copied from IST Mumbai', () => {
    const tz = timezoneFor(LEICESTER.lat, LEICESTER.lon);
    const { sunrise } = daylightOn(LEICESTER.lat, LEICESTER.lon, civil, tz);
    const [hour] = localHm(sunrise.toISOString(), tz);
    expect(hour).toBeGreaterThanOrEqual(4);
    expect(hour).toBeLessThanOrEqual(8);

    const mumbaiTz = timezoneFor(MUMBAI.lat, MUMBAI.lon);
    const mumbai = daylightOn(MUMBAI.lat, MUMBAI.lon, civil, mumbaiTz);
    expect(sunrise.toISOString()).not.toBe(mumbai.sunrise.toISOString());
  });

  it('Chennai sunrise is a local morning hour and differs from Mumbai', () => {
    const tz = timezoneFor(CHENNAI.lat, CHENNAI.lon);
    const { sunrise } = daylightOn(CHENNAI.lat, CHENNAI.lon, civil, tz);
    const [hour] = localHm(sunrise.toISOString(), tz);
    expect(hour).toBeGreaterThanOrEqual(5);
    expect(hour).toBeLessThanOrEqual(7);
    expect(tz).toBe('Asia/Kolkata');

    const mumbai = daylightOn(
      MUMBAI.lat,
      MUMBAI.lon,
      civil,
      timezoneFor(MUMBAI.lat, MUMBAI.lon),
    );
    const deltaMin = Math.abs(sunrise.getTime() - mumbai.sunrise.getTime()) / 60000;
    expect(deltaMin).toBeGreaterThan(10);
  });

  it('New Jersey sunrise is a local morning hour in America/New_York', () => {
    const tz = timezoneFor(NEW_JERSEY.lat, NEW_JERSEY.lon);
    expect(tz).toBe('America/New_York');
    const { sunrise } = daylightOn(NEW_JERSEY.lat, NEW_JERSEY.lon, civil, tz);
    const [hour] = localHm(sunrise.toISOString(), tz);
    expect(hour).toBeGreaterThanOrEqual(5);
    expect(hour).toBeLessThanOrEqual(7);
  });

  it.each([
    ['Leicester', LEICESTER],
    ['Chennai', CHENNAI],
    ['Edison NJ', NEW_JERSEY],
  ])('%s Friday Rahu is the 4th local daylight eighth', (_label, place) => {
    const sky = getSkyState(place.lat, place.lon, noonOn(place, FRIDAY));
    const rahu = rahuWindow(
      new Date(sky.sunrise.iso),
      new Date(sky.sunset.iso),
      5,
    );
    expect(Math.abs(new Date(sky.rahu.start.iso).getTime() - rahu.start.getTime())).toBeLessThan(
      1000,
    );
    expect(sky.rahu.start.clock).not.toBe('07:30');
  });
});

describe('civil helpers', () => {
  it('pins the test date in the city zone', () => {
    const at = noonOn(MUMBAI, FRIDAY);
    const civil = civilDateInZone(at, 'Asia/Kolkata');
    expect(civil).toEqual(FRIDAY);
  });

  it('Rahu part for Friday is the 4th eighth', () => {
    const tz = timezoneFor(MUMBAI.lat, MUMBAI.lon);
    const { sunrise, sunset } = daylightOn(MUMBAI.lat, MUMBAI.lon, FRIDAY, tz);
    const rahu = rahuWindow(sunrise, sunset, 5);
    const span = (sunset.getTime() - sunrise.getTime()) / 8;
    expect(Math.abs(rahu.start.getTime() - (sunrise.getTime() + 3 * span))).toBeLessThan(1000);
  });
});
