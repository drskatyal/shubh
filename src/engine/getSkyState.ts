import { liveChoghadiya } from './choghadiya';
import { currentWindow, evaluateStartSomethingNew, nextGoodWindow } from './rules';
import { daylightOn, nextDaylight, previousDaylight } from './sun';
import { civilDateInZone, timezoneFor, toSkyClock, weekdayInZone } from './time';
import type {
  GetSkyStateOptions,
  SkyKind,
  SkyState,
  SkyWindow,
  WindowKind,
} from './types';
import { WINDOW_DISPLAY_NAME } from './types';
import {
  abhijitWindow,
  gulikaWindow,
  isAbhijitObserved,
  rahuWindow,
  yamagandaWindow,
  type ClockInterval,
} from './windows';

function asKind(kind: 'inauspicious' | 'auspicious' | 'neutral'): SkyKind {
  if (kind === 'auspicious') return 'good';
  return kind;
}

function asWindow(
  name: WindowKind,
  interval: ClockInterval,
  timeZone: string,
  kind: SkyKind,
): SkyWindow {
  return {
    name: WINDOW_DISPLAY_NAME[name],
    start: toSkyClock(interval.start, timeZone),
    end: toSkyClock(interval.end, timeZone),
    kind,
  };
}

/**
 * On-device sky for this lat/lon at `date` (default: now).
 * Home glance and AskSheet both read this. Never a mock, never a network call.
 */
export function getSkyState(
  lat?: number,
  lon?: number,
  date: Date = new Date(),
  options: GetSkyStateOptions = {},
): SkyState {
  if (lat === undefined || lon === undefined || Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(
      'getSkyState requires lat and lon. Pass the live sky into AskSheet.',
    );
  }

  const timezone = timezoneFor(lat, lon);
  const civil = civilDateInZone(date, timezone);
  const today = daylightOn(lat, lon, civil, timezone);

  const inToday = date.getTime() >= today.sunrise.getTime();
  const daylight = inToday ? today : previousDaylight(lat, lon, civil, timezone);
  const following = inToday ? nextDaylight(lat, lon, civil, timezone) : today;

  const sunrise = daylight.sunrise;
  const sunset = daylight.sunset;
  const nextSunrise = following.sunrise;
  const weekday = weekdayInZone(sunrise, timezone);

  const rahu = rahuWindow(sunrise, sunset, weekday);
  const yamaganda = yamagandaWindow(sunrise, sunset, weekday);
  const gulika = gulikaWindow(sunrise, sunset, weekday);
  const abhijit = abhijitWindow(sunrise, sunset);
  const choghadiya = liveChoghadiya(
    sunrise,
    sunset,
    nextSunrise,
    weekday,
    date,
    timezone,
  );

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

  const glance = currentWindow(rules);
  const nextGood = nextGoodWindow(rules);
  const observed = isAbhijitObserved(weekday);

  return {
    city: options.city ?? '',
    timezone,
    asOf: toSkyClock(date, timezone),
    sunrise: toSkyClock(sunrise, timezone),
    sunset: toSkyClock(sunset, timezone),
    currentSlot: {
      name: WINDOW_DISPLAY_NAME[glance.name],
      kind: asKind(glance.kind),
      start: toSkyClock(new Date(glance.start), timezone),
      end: toSkyClock(new Date(glance.end), timezone),
    },
    rahu: asWindow('rahu', rahu, timezone, 'inauspicious'),
    yamaganda: asWindow('yamaganda', yamaganda, timezone, 'inauspicious'),
    gulika: asWindow('gulika', gulika, timezone, 'inauspicious'),
    abhijit: observed ? asWindow('abhijit', abhijit, timezone, 'good') : null,
    nextGoodWindow: nextGood
      ? {
          name: WINDOW_DISPLAY_NAME[nextGood.name],
          start: toSkyClock(new Date(nextGood.start), timezone),
          end: toSkyClock(new Date(nextGood.end), timezone),
          kind: nextGood.name === 'abhijit' || nextGood.name === 'amrit' || nextGood.name === 'shubh' || nextGood.name === 'labh' || nextGood.name === 'chal'
            ? 'good'
            : 'neutral',
        }
      : null,
    language: options.language,
    lat,
    lon,
    weekday,
    nextSunrise: toSkyClock(nextSunrise, timezone),
    choghadiya: {
      current: choghadiya.current,
      next: choghadiya.next,
    },
    currentWindow: glance,
    startingSomethingNew: evaluateStartSomethingNew(rules),
  };
}
