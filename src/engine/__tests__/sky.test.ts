import { describe, expect, it } from 'vitest';

import { getSkyState } from '../getSkyState';
import { daylightOn } from '../sun';
import { civilDateInZone, timezoneFor, zonedInstant } from '../time';
import { rahuWindow } from '../windows';

const MUMBAI = { lat: 19.076, lon: 72.8777, name: 'Mumbai' };
const LONDON = { lat: 51.5074, lon: -0.1278, name: 'London' };
const LEICESTER = { lat: 52.6369, lon: -1.1398, name: 'Leicester' };
const CHENNAI = { lat: 13.0827, lon: 80.2707, name: 'Chennai' };
const NEW_JERSEY = { lat: 40.4862, lon: -74.4518, name: 'Edison, NJ' };

const FRIDAY = { year: 2026, month: 8, day: 14 };
const SUNDAY = { year: 2026, month: 8, day: 16 };

/**
 * Published Drik-method Rahu Kaal (local clock), pinned for the 2-minute test.
 *
 * Mumbai Fri 14 Aug 2026: 11:07–12:43
 *   https://rahukalam.com/mumbai-maharashtra-india/14-08-2026
 *   (same 8-part weekday method as Drik Panchang
 *   https://www.drikpanchang.com/panchang/rahu-kaal.html)
 *
 * Mumbai Sun 16 Aug 2026: 17:31–19:07
 *   https://rahukalam.com/mumbai-maharashtra-india/16-08-2026
 *
 * London Fri 14 Aug 2026: 11:16–13:06
 *   https://r-astro.com/london/2026-08-14
 *
 * London Sun 16 Aug 2026: 18:27–20:15
 *   https://rahukaal.com/2643743/london-england-united-kingdom
 */
const DRIK_RAHU = {
  mumbaiFriday: { start: [11, 7], end: [12, 43] as [number, number] },
  mumbaiSunday: { start: [17, 31], end: [19, 7] as [number, number] },
  londonFriday: { start: [11, 16], end: [13, 6] as [number, number] },
  londonSunday: { start: [18, 27], end: [20, 15] as [number, number] },
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

describe('getSkyState — London and Mumbai, weekday + Sunday', () => {
  it('uses Asia/Kolkata for Mumbai and Europe/London for London', () => {
    expect(timezoneFor(MUMBAI.lat, MUMBAI.lon)).toBe('Asia/Kolkata');
    expect(timezoneFor(LONDON.lat, LONDON.lon)).toBe('Europe/London');
  });

  it('Friday 14 Aug 2026 is weekday 5; Sunday 16 Aug 2026 is weekday 0', () => {
    const mumbaiFri = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY));
    const londonSun = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, SUNDAY));
    expect(mumbaiFri.weekday).toBe(5);
    expect(londonSun.weekday).toBe(0);
  });

  it('never emits a fixed IST 07:30–09:00 Rahu table', () => {
    const mumbai = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY));
    const london = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    expect(mumbai.rahu.start).not.toBe(london.rahu.start);
    const [mh, mm] = localHm(mumbai.rahu.start, mumbai.timezone);
    expect(mh === 7 && mm === 30).toBe(false);
  });

  it('Mumbai Friday Rahu is within 2 minutes of Drik-method published times', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, FRIDAY));
    expect(withinTwoMinutes(localHm(sky.rahu.start, sky.timezone), DRIK_RAHU.mumbaiFriday.start)).toBe(
      true,
    );
    expect(withinTwoMinutes(localHm(sky.rahu.end, sky.timezone), DRIK_RAHU.mumbaiFriday.end)).toBe(
      true,
    );
  });

  it('Mumbai Sunday Rahu is the 8th daylight part, within 2 minutes of Drik', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, SUNDAY));
    expect(sky.weekday).toBe(0);
    expect(withinTwoMinutes(localHm(sky.rahu.start, sky.timezone), DRIK_RAHU.mumbaiSunday.start)).toBe(
      true,
    );
    expect(withinTwoMinutes(localHm(sky.rahu.end, sky.timezone), DRIK_RAHU.mumbaiSunday.end)).toBe(
      true,
    );
  });

  it('London Friday Rahu is within 2 minutes of Drik-method published times', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    expect(withinTwoMinutes(localHm(sky.rahu.start, sky.timezone), DRIK_RAHU.londonFriday.start)).toBe(
      true,
    );
    expect(withinTwoMinutes(localHm(sky.rahu.end, sky.timezone), DRIK_RAHU.londonFriday.end)).toBe(
      true,
    );
  });

  it('London Sunday Rahu is within 2 minutes of Drik-method published times', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, SUNDAY));
    expect(withinTwoMinutes(localHm(sky.rahu.start, sky.timezone), DRIK_RAHU.londonSunday.start)).toBe(
      true,
    );
    expect(withinTwoMinutes(localHm(sky.rahu.end, sky.timezone), DRIK_RAHU.londonSunday.end)).toBe(
      true,
    );
  });

  it('Friday day Choghadiya starts with Chal (weekday lord Venus)', () => {
    const sky = getSkyState(LONDON.lat, LONDON.lon, noonOn(LONDON, FRIDAY));
    expect(sky.choghadiya.current.period).toBe('day');
    const first = getSkyState(
      LONDON.lat,
      LONDON.lon,
      new Date(new Date(sky.sunrise).getTime() + 60_000),
    );
    expect(first.choghadiya.current.name).toBe('chal');
  });

  it('does not treat Sunday Abhijit as independently auspicious', () => {
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, noonOn(MUMBAI, SUNDAY));
    expect(sky.abhijit.observed).toBe(false);
  });

  it('panchang day before sunrise is still yesterday', () => {
    const tz = timezoneFor(MUMBAI.lat, MUMBAI.lon);
    const beforeDawn = zonedInstant(tz, FRIDAY.year, FRIDAY.month, FRIDAY.day, 3, 0, 0);
    const sky = getSkyState(MUMBAI.lat, MUMBAI.lon, beforeDawn);
    expect(sky.weekday).toBe(4);
    expect(new Date(sky.nextSunrise).getTime()).toBeGreaterThan(beforeDawn.getTime());
  });
});

describe('sunrise sanity — Leicester, Chennai, New Jersey', () => {
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
