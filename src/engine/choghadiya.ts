import { AUSPICIOUS_CHOGHADIYA, DAY_CHOGHADIYA, NIGHT_CHOGHADIYA } from './tables';
import { contains, toIso, toSkyClock } from './time';
import type { ChoghadiyaName, ChoghadiyaSlot, Weekday } from './types';

export type LiveChoghadiya = {
  current: ChoghadiyaSlot;
  next: ChoghadiyaSlot;
  slots: ChoghadiyaSlot[];
};

function splitEight(
  start: Date,
  end: Date,
  names: ChoghadiyaName[],
  period: 'day' | 'night',
  timeZone: string,
): ChoghadiyaSlot[] {
  const span = end.getTime() - start.getTime();
  const eighth = span / 8;
  return names.map((name, index) => {
    const slotStart = new Date(start.getTime() + index * eighth);
    const slotEnd = new Date(start.getTime() + (index + 1) * eighth);
    return {
      name,
      start: toIso(slotStart),
      end: toIso(slotEnd),
      startClock: toSkyClock(slotStart, timeZone),
      endClock: toSkyClock(slotEnd, timeZone),
      period,
      auspicious: AUSPICIOUS_CHOGHADIYA.has(name),
    };
  });
}

export function choghadiyaSlots(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  weekday: Weekday,
  timeZone: string,
): ChoghadiyaSlot[] {
  return [
    ...splitEight(sunrise, sunset, DAY_CHOGHADIYA[weekday], 'day', timeZone),
    ...splitEight(sunset, nextSunrise, NIGHT_CHOGHADIYA[weekday], 'night', timeZone),
  ];
}

export function liveChoghadiya(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  weekday: Weekday,
  at: Date,
  timeZone: string,
): LiveChoghadiya {
  const slots = choghadiyaSlots(sunrise, sunset, nextSunrise, weekday, timeZone);
  const index = slots.findIndex((slot) =>
    contains(new Date(slot.start), new Date(slot.end), at),
  );
  if (index < 0) {
    throw new Error(`No Choghadiya covers ${at.toISOString()}`);
  }
  const current = slots[index];
  const next = slots[index + 1] ?? slots[0];
  return { current, next, slots };
}
