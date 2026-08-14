import { GULIKA_PART, RAHU_PART, YAMAGANDA_PART } from './tables';
import type { Weekday } from './types';

export type ClockInterval = {
  start: Date;
  end: Date;
};

/**
 * One of the eight equal daytime parts. `part` is 1-indexed from sunrise.
 */
export function daylightPart(
  sunrise: Date,
  sunset: Date,
  part: number,
): ClockInterval {
  if (part < 1 || part > 8) {
    throw new Error(`Daylight part must be 1–8, got ${part}`);
  }
  const span = sunset.getTime() - sunrise.getTime();
  const eighth = span / 8;
  return {
    start: new Date(sunrise.getTime() + (part - 1) * eighth),
    end: new Date(sunrise.getTime() + part * eighth),
  };
}

export function rahuWindow(sunrise: Date, sunset: Date, weekday: Weekday): ClockInterval {
  return daylightPart(sunrise, sunset, RAHU_PART[weekday]);
}

export function yamagandaWindow(
  sunrise: Date,
  sunset: Date,
  weekday: Weekday,
): ClockInterval {
  return daylightPart(sunrise, sunset, YAMAGANDA_PART[weekday]);
}

export function gulikaWindow(sunrise: Date, sunset: Date, weekday: Weekday): ClockInterval {
  return daylightPart(sunrise, sunset, GULIKA_PART[weekday]);
}

/**
 * Abhijit: middle ~48 minutes of the day — the 8th of 15 equal daytime
 * muhurtas, centred on local solar noon (midpoint of sunrise and sunset).
 *
 * Sunday caveat (PRODUCT.md): South Indian almanacs do not treat Sunday
 * Abhijit as independently auspicious for starting something new.
 *
 * Classical caveat (Muhurta Chintamani / Drik): also not used on Wednesday.
 */
export function abhijitWindow(sunrise: Date, sunset: Date): ClockInterval {
  const span = sunset.getTime() - sunrise.getTime();
  const muhurta = span / 15;
  const noon = sunrise.getTime() + span / 2;
  return {
    start: new Date(noon - muhurta / 2),
    end: new Date(noon + muhurta / 2),
  };
}

export function isAbhijitObserved(weekday: Weekday): boolean {
  return weekday !== 0 && weekday !== 3;
}
