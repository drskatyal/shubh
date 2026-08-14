import { liveChoghadiya } from './choghadiya';
import { currentWindow, evaluateStartSomethingNew, nextGoodWindow } from './rules';
import { daylightOn, nextDaylight, previousDaylight } from './sun';
import { civilDateInZone, timezoneFor, toIso, weekdayInZone } from './time';
import type { SkyState } from './types';
import {
  abhijitWindow,
  gulikaWindow,
  isAbhijitObserved,
  rahuWindow,
  yamagandaWindow,
} from './windows';

/**
 * On-device sky for this lat/lon at `date` (default: now).
 * The ask PR should JSON-serialize this and stuff it into the prompt.
 */
export function getSkyState(lat: number, lon: number, date: Date = new Date()): SkyState {
  const timezone = timezoneFor(lat, lon);
  const civil = civilDateInZone(date, timezone);
  const today = daylightOn(lat, lon, civil, timezone);

  const inToday = date.getTime() >= today.sunrise.getTime();
  const daylight = inToday ? today : previousDaylight(lat, lon, civil, timezone);
  const following = inToday
    ? nextDaylight(lat, lon, civil, timezone)
    : today;

  const sunrise = daylight.sunrise;
  const sunset = daylight.sunset;
  const nextSunrise = following.sunrise;
  const weekday = weekdayInZone(sunrise, timezone);

  const rahu = rahuWindow(sunrise, sunset, weekday);
  const yamaganda = yamagandaWindow(sunrise, sunset, weekday);
  const gulika = gulikaWindow(sunrise, sunset, weekday);
  const abhijit = abhijitWindow(sunrise, sunset);
  const choghadiya = liveChoghadiya(sunrise, sunset, nextSunrise, weekday, date);

  const rules = {
    at: date,
    weekday,
    rahu,
    yamaganda,
    gulika,
    abhijit,
    choghadiya: choghadiya.current,
    nextChoghadiya: choghadiya.next,
    sunset,
    nextSunrise,
  };

  return {
    lat,
    lon,
    timezone,
    asOf: toIso(date),
    weekday,
    sunrise: toIso(sunrise),
    sunset: toIso(sunset),
    nextSunrise: toIso(nextSunrise),
    rahu: { start: toIso(rahu.start), end: toIso(rahu.end) },
    yamaganda: { start: toIso(yamaganda.start), end: toIso(yamaganda.end) },
    gulika: { start: toIso(gulika.start), end: toIso(gulika.end) },
    abhijit: {
      start: toIso(abhijit.start),
      end: toIso(abhijit.end),
      observed: isAbhijitObserved(weekday),
    },
    choghadiya: {
      current: choghadiya.current,
      next: choghadiya.next,
    },
    currentWindow: currentWindow(rules),
    startingSomethingNew: evaluateStartSomethingNew(rules),
    nextGoodWindow: nextGoodWindow(rules),
  };
}
