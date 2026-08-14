import { asRecord, asString, asStringList, normalizeFestivals } from './normalizeAlmanac';
import type { DayLimb, DayWindow, NormalizedDay } from './types';

function limb(value: unknown): DayLimb | null {
  if (typeof value === 'string' && value.trim()) {
    return { name: value.trim() };
  }
  const rec = asRecord(value);
  if (!rec) return null;
  const name =
    asString(rec.name) ??
    asString(rec.name_en) ??
    asString(rec.name_hi) ??
    asString(rec.tithi) ??
    asString(rec.nakshatra) ??
    asString(rec.yoga) ??
    asString(rec.karana);
  if (!name) return null;
  return {
    name,
    end: asString(rec.end) ?? asString(rec.ends_at) ?? asString(rec.end_time),
    paksha: asString(rec.paksha) ?? asString(rec.paksha_name),
  };
}

function windowOf(value: unknown, fallbackName: string): DayWindow | null {
  if (typeof value === 'string' && value.trim()) {
    return { name: fallbackName, start: null, end: value.trim() };
  }
  const rec = asRecord(value);
  if (!rec) return null;
  const start =
    asString(rec.start) ?? asString(rec.start_time) ?? asString(rec.from) ?? asString(rec.begin);
  const end = asString(rec.end) ?? asString(rec.end_time) ?? asString(rec.to);
  const name = asString(rec.name) ?? fallbackName;
  if (!start && !end && !asString(rec.name)) return null;
  return { name, start, end };
}

function pickWindow(root: Record<string, unknown>, keys: string[], name: string): DayWindow | null {
  for (const key of keys) {
    if (root[key] != null) {
      const found = windowOf(root[key], name);
      if (found) return found;
    }
  }
  return null;
}

function listFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        const rec = asRecord(item);
        return asString(rec?.name) ?? asString(rec?.text) ?? asString(rec?.reason);
      })
      .filter((item): item is string => Boolean(item));
  }
  const rec = asRecord(value);
  if (!rec) return asStringList(value);
  return listFrom(rec.items ?? rec.list ?? rec.reasons ?? rec.actions);
}

export function normalizeDay(raw: unknown, fallbackDate: string): NormalizedDay {
  const root = asRecord(raw) ?? {};
  const panchang = asRecord(root.panchang) ?? asRecord(root.day) ?? root;
  const timings = asRecord(root.timings) ?? asRecord(panchang.timings) ?? {};
  const conditions = asRecord(root.conditions) ?? asRecord(panchang.conditions) ?? {};
  const date =
    asString(root.date) ?? asString(panchang.date) ?? asString(root.gregorian_date) ?? fallbackDate;

  const festivals = normalizeFestivals(
    root.festivals ?? panchang.festivals,
    date,
  ).map((fest) => fest.name);
  const extra = asStringList(root.festivals ?? panchang.festivals);

  return {
    date,
    city: asString(root.city) ?? asString(root.place) ?? asString(panchang.city),
    tithi: limb(panchang.tithi ?? root.tithi),
    nakshatra: limb(panchang.nakshatra ?? root.nakshatra),
    yoga: limb(panchang.yoga ?? root.yoga),
    karana: limb(panchang.karana ?? root.karana),
    vara: asString(asRecord(panchang.vara)?.name) ?? asString(panchang.vara) ?? asString(root.weekday),
    festivals: festivals.length ? festivals : extra,
    good: listFrom(
      conditions.good ??
        conditions.auspicious ??
        root.good ??
        root.auspicious ??
        panchang.good,
    ),
    avoid: listFrom(
      conditions.avoid ??
        conditions.inauspicious ??
        root.avoid ??
        root.inauspicious ??
        panchang.avoid,
    ),
    rahu: pickWindow({ ...timings, ...panchang, ...root }, ['rahu', 'rahukaal', 'rahu_kaal'], 'Rahu'),
    yamaganda: pickWindow(
      { ...timings, ...panchang, ...root },
      ['yamaganda', 'yamagandam', 'yama_ganda'],
      'Yamaganda',
    ),
    gulika: pickWindow({ ...timings, ...panchang, ...root }, ['gulika', 'gulikaal', 'gulika_kaal'], 'Gulika'),
    abhijit: pickWindow({ ...timings, ...panchang, ...root }, ['abhijit', 'abhijit_muhurat'], 'Abhijit'),
    brahma: pickWindow({ ...timings, ...panchang, ...root }, ['brahma', 'brahma_muhurat'], 'Brahma'),
    choghadiya:
      asString(root.choghadiya) ??
      asString(panchang.choghadiya) ??
      asString(asRecord(root.current_choghadiya)?.name) ??
      asString(asRecord(timings.choghadiya)?.current),
  };
}
