import { Body, Observer, SearchRiseSet } from 'astronomy-engine';

import type { CivilDate } from './types';
import { addCivilDays, zonedInstant } from './time';

export type Daylight = {
  sunrise: Date;
  sunset: Date;
};

/**
 * Local geometric sunrise / sunset for lat/lon on a civil date in `timeZone`.
 * Uses astronomy-engine SearchRiseSet (standard refraction, upper limb).
 * Never a fixed IST 7:30–9:00 table.
 */
export function daylightOn(
  lat: number,
  lon: number,
  civil: CivilDate,
  timeZone: string,
): Daylight {
  const observer = new Observer(lat, lon, 0);
  const localMidnight = zonedInstant(timeZone, civil.year, civil.month, civil.day, 0, 0, 0);

  const rise = SearchRiseSet(Body.Sun, observer, +1, localMidnight, 1.5);
  if (!rise) {
    throw new Error(
      `No sunrise for ${civil.year}-${civil.month}-${civil.day} at ${lat},${lon}`,
    );
  }
  const sunrise = rise.date;
  const set = SearchRiseSet(Body.Sun, observer, -1, sunrise, 1.5);
  if (!set) {
    throw new Error(`No sunset after sunrise at ${lat},${lon}`);
  }

  return { sunrise, sunset: set.date };
}

export function nextDaylight(
  lat: number,
  lon: number,
  civil: CivilDate,
  timeZone: string,
): Daylight {
  return daylightOn(lat, lon, addCivilDays(civil, 1), timeZone);
}

export function previousDaylight(
  lat: number,
  lon: number,
  civil: CivilDate,
  timeZone: string,
): Daylight {
  return daylightOn(lat, lon, addCivilDays(civil, -1), timeZone);
}
