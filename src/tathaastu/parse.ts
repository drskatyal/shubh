import type { DayChoghadiya, DayLimb, DayWindow } from './types';

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Pull HH:mm from "12:31", "12:31:00", or "2026-08-14 18:47:00". */
export function clockFrom(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function pick(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

export function parseLimb(raw: unknown, fallback: string): DayLimb {
  const record = asRecord(raw);
  const period = asRecord(record.period);
  const name =
    asString(record.name) ??
    asString(record.full_name) ??
    asString(record.label) ??
    fallback;
  const limb: DayLimb = { name };
  const paksha = asString(record.paksha);
  if (paksha) limb.paksha = paksha;
  const number = asNumber(record.number);
  if (number !== undefined) limb.number = number;
  if (typeof record.auspicious === 'boolean') limb.auspicious = record.auspicious;
  const start = clockFrom(period.start);
  const end = clockFrom(period.end);
  if (start) limb.startClock = start;
  if (end) limb.endClock = end;
  return limb;
}

export function parseWindow(
  raw: unknown,
  fallbackName: string,
): DayWindow | null {
  const record = asRecord(raw);
  const start =
    clockFrom(record.start) ??
    clockFrom(record.begin) ??
    clockFrom(asRecord(record.period).start);
  const end = clockFrom(record.end) ?? clockFrom(asRecord(record.period).end);
  if (!start || !end) return null;
  const name =
    asString(record.name) ??
    asString(record.label) ??
    asString(record.label_south) ??
    fallbackName;
  return { name, startClock: start, endClock: end };
}

function windowFromPair(
  start: unknown,
  end: unknown,
  name: string,
): DayWindow | null {
  const startClock = clockFrom(start);
  const endClock = clockFrom(end);
  if (!startClock || !endClock) return null;
  return { name, startClock, endClock };
}

/** Limbs may sit at the root (`/v1/panchang`) or under `panchang` (`/v1/day-context`). */
export function panchangBlock(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw);
  const nested = asRecord(root.panchang);
  if (nested.tithi || nested.nakshatra) {
    return nested;
  }
  return root;
}

export function parseLimbs(raw: unknown): {
  tithi: DayLimb;
  nakshatra: DayLimb;
  yoga: DayLimb;
  karana: DayLimb;
} {
  const block = panchangBlock(raw);
  return {
    tithi: parseLimb(block.tithi, 'Tithi'),
    nakshatra: parseLimb(block.nakshatra, 'Nakshatra'),
    yoga: parseLimb(block.yoga, 'Yoga'),
    karana: parseLimb(block.karana, 'Karana'),
  };
}

export type ParsedTimings = {
  rahu: DayWindow | null;
  yamaganda: DayWindow | null;
  gulika: DayWindow | null;
  abhijit: DayWindow | null;
  brahma: DayWindow | null;
  sunrise?: string;
  sunset?: string;
};

/**
 * Accepts `/v1/timings`, `/v1/panchang` extras, and the `/v1/demo/muhurat`
 * nest (same window names the timings docs list).
 */
export function parseTimings(raw: unknown): ParsedTimings {
  const root = asRecord(raw);
  const auspicious = asRecord(root.auspicious);
  const inauspicious = asRecord(root.inauspicious);
  const timings = asRecord(root.timings);
  const sun = asRecord(root.sun);

  const rahu =
    parseWindow(pick(root, ['rahu_kaal', 'rahukaal', 'rahu']), 'Rahu Kaal') ??
    parseWindow(pick(inauspicious, ['rahu_kaal', 'rahukaal', 'rahu']), 'Rahu Kaal') ??
    parseWindow(pick(timings, ['rahu_kaal', 'rahukaal', 'rahu']), 'Rahu Kaal');

  const yamaganda =
    parseWindow(pick(root, ['yamagandam', 'yamaganda']), 'Yamaganda') ??
    parseWindow(pick(inauspicious, ['yamagandam', 'yamaganda']), 'Yamaganda') ??
    parseWindow(pick(timings, ['yamagandam', 'yamaganda']), 'Yamaganda');

  const gulika =
    parseWindow(pick(root, ['gulika_kaal', 'gulikaal', 'gulika']), 'Gulika') ??
    parseWindow(pick(inauspicious, ['gulika_kaal', 'gulikaal', 'gulika']), 'Gulika') ??
    parseWindow(pick(timings, ['gulika_kaal', 'gulikaal', 'gulika']), 'Gulika');

  const abhijitRaw = pick(root, ['abhijit_muhurat', 'abhijit']) ??
    pick(auspicious, ['abhijit_muhurat', 'abhijit']) ??
    pick(timings, ['abhijit_muhurat', 'abhijit']);
  const abhijitRecord = asRecord(abhijitRaw);
  const abhijit =
    abhijitRecord.available === false
      ? null
      : parseWindow(abhijitRaw, 'Abhijit');

  const brahma =
    parseWindow(pick(root, ['brahma_muhurta', 'brahma']), 'Brahma Muhurta') ??
    parseWindow(pick(auspicious, ['brahma_muhurta', 'brahma']), 'Brahma Muhurta') ??
    parseWindow(pick(timings, ['brahma_muhurta', 'brahma']), 'Brahma Muhurta');

  const sunrise =
    clockFrom(sun.sunrise) ??
    clockFrom(timings.sunrise) ??
    clockFrom(root.sunrise);
  const sunset =
    clockFrom(sun.sunset) ??
    clockFrom(timings.sunset) ??
    clockFrom(root.sunset);

  return { rahu, yamaganda, gulika, abhijit, brahma, sunrise, sunset };
}

function periodOf(slot: Record<string, unknown>, index: number): 'day' | 'night' {
  const period = asString(slot.period) ?? asString(slot.type);
  if (period === 'night' || period === 'Night') return 'night';
  if (period === 'day' || period === 'Day') return 'day';
  return index < 8 ? 'day' : 'night';
}

function slotsFrom(raw: unknown): DayChoghadiya[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        const record = asRecord(item);
        const window = parseWindow(record, asString(record.name) ?? 'Choghadiya');
        if (!window) return null;
        return {
          name: window.name,
          startClock: window.startClock,
          endClock: window.endClock,
          period: periodOf(record, index),
        };
      })
      .filter((slot): slot is DayChoghadiya => slot !== null);
  }
  const record = asRecord(raw);
  const nested = record.day || record.night || record.periods || record.slots;
  if (Array.isArray(record.day) || Array.isArray(record.night)) {
    const day = slotsFrom(record.day).map((slot) => ({ ...slot, period: 'day' as const }));
    const night = slotsFrom(record.night).map((slot) => ({ ...slot, period: 'night' as const }));
    return [...day, ...night];
  }
  if (nested) return slotsFrom(nested);
  return [];
}

export function parseChoghadiyaList(raw: unknown): DayChoghadiya[] {
  const root = asRecord(raw);
  const fromRoot = slotsFrom(root.choghadiya ?? root);
  return fromRoot;
}

function minutesOf(clock: string): number {
  const [h, m] = clock.split(':').map(Number);
  return h * 60 + m;
}

/** True when `clock` is in [start, end), including ranges that wrap midnight. */
export function clockInRange(clock: string, start: string, end: string): boolean {
  const at = minutesOf(clock);
  const from = minutesOf(start);
  const to = minutesOf(end);
  if (from === to) return false;
  if (from < to) return at >= from && at < to;
  return at >= from || at < to;
}

export function currentChoghadiya(
  slots: DayChoghadiya[],
  clock: string,
): DayChoghadiya | null {
  return slots.find((slot) => clockInRange(clock, slot.startClock, slot.endClock)) ?? null;
}

export function liteTithi(raw: unknown): DayLimb {
  const root = asRecord(raw);
  if (root.tithi) return parseLimb(root.tithi, 'Tithi');
  const name = asString(root.tithi_name) ?? asString(root.name);
  return {
    name: name ?? 'Tithi',
    paksha: asString(root.paksha),
  };
}

export function hasLimbs(raw: unknown): boolean {
  const block = panchangBlock(raw);
  return Boolean(asRecord(block.tithi).name || asRecord(block.nakshatra).name);
}

export function hasTimingWindows(raw: unknown): boolean {
  const parsed = parseTimings(raw);
  return Boolean(parsed.rahu || parsed.yamaganda || parsed.gulika);
}
