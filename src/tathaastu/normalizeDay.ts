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

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const rec = asRecord(item);
      if (rec) return rec;
    }
    return null;
  }
  return asRecord(value);
}

function divineTithi(root: Record<string, unknown>): DayLimb | null {
  const direct = limb(root.tithi);
  if (direct) return direct;
  const row = firstRecord(root.tithis);
  if (!row) return null;
  const name = asString(row.tithi) ?? asString(row.name);
  if (!name) return null;
  return { name, end: asString(row.end_time) ?? asString(row.end), paksha: asString(row.paksha) };
}

function divineNakshatra(root: Record<string, unknown>): DayLimb | null {
  const direct = limb(root.nakshatra);
  if (direct) return direct;
  const pack = asRecord(root.nakshatras) ?? root;
  const row = firstRecord(pack.nakshatra_list) ?? firstRecord(pack.nakshatra_pada);
  if (!row) return null;
  const name = asString(row.nak_name) ?? asString(row.name);
  if (!name) return null;
  return { name, end: asString(row.end_time) ?? asString(row.end) };
}

function divineYoga(root: Record<string, unknown>): DayLimb | null {
  const direct = limb(root.yoga);
  if (direct) return direct;
  const row = firstRecord(root.yogas);
  if (!row) return null;
  const name = asString(row.yoga_name) ?? asString(row.name);
  if (!name) return null;
  return { name, end: asString(row.end_time) ?? asString(row.end) };
}

function divineKarana(root: Record<string, unknown>): DayLimb | null {
  const direct = limb(root.karana);
  if (direct) return direct;
  const row = firstRecord(root.karnas) ?? firstRecord(root.karanas);
  if (!row) return null;
  const name = asString(row.karana_name) ?? asString(row.name);
  if (!name) return null;
  return { name, end: asString(row.end_time) ?? asString(row.end), paksha: asString(row.paksha) };
}

function namedIfPresent(window: DayWindow | null, label: string): string[] {
  return window ? [label] : [];
}

export function normalizeDay(raw: unknown, fallbackDate: string): NormalizedDay {
  const root = asRecord(raw) ?? {};
  const panchang = asRecord(root.panchang) ?? asRecord(root.day) ?? asRecord(root.data) ?? root;
  const timings = asRecord(root.timings) ?? asRecord(panchang.timings) ?? {};
  const auspicious = asRecord(root.auspicious) ?? asRecord(panchang.auspicious) ?? {};
  const inauspicious = asRecord(root.inauspicious) ?? asRecord(panchang.inauspicious) ?? {};
  const conditions = asRecord(root.conditions) ?? asRecord(panchang.conditions) ?? {};
  const date =
    asString(root.date) ?? asString(panchang.date) ?? asString(root.gregorian_date) ?? fallbackDate;
  const bag = { ...inauspicious, ...auspicious, ...timings, ...panchang, ...root };

  const festivals = normalizeFestivals(
    root.festivals ?? panchang.festivals,
    date,
  ).map((fest) => fest.name);
  const extra = asStringList(root.festivals ?? panchang.festivals);

  const rahu = pickWindow(bag, ['rahu', 'rahukaal', 'rahu_kaal'], 'Rahu');
  const yamaganda = pickWindow(bag, ['yamaganda', 'yamagandam', 'yama_ganda'], 'Yamaganda');
  const gulika = pickWindow(bag, ['gulika', 'gulikaal', 'gulika_kaal', 'gulkai_kaal', 'gulikai_kalam'], 'Gulika');
  const abhijit = pickWindow(bag, ['abhijit', 'abhijit_muhurat', 'abhijit_muhurta'], 'Abhijit');
  const brahma = pickWindow(bag, ['brahma', 'brahma_muhurat', 'brahma_muhurta'], 'Brahma');

  const good = listFrom(
    conditions.good ?? conditions.auspicious ?? root.good ?? root.auspicious ?? panchang.good,
  );
  const avoid = listFrom(
    conditions.avoid ?? conditions.inauspicious ?? root.avoid ?? root.inauspicious ?? panchang.avoid,
  );

  return {
    date,
    city: asString(root.city) ?? asString(root.place) ?? asString(panchang.city),
    tithi: divineTithi(panchang) ?? divineTithi(root),
    nakshatra: divineNakshatra(panchang) ?? divineNakshatra(root),
    yoga: divineYoga(panchang) ?? divineYoga(root),
    karana: divineKarana(panchang) ?? divineKarana(root),
    vara: asString(asRecord(panchang.vara)?.name) ?? asString(panchang.vara) ?? asString(root.weekday),
    festivals: festivals.length ? festivals : extra,
    good: good.length ? good : [...namedIfPresent(abhijit, 'Abhijit'), ...namedIfPresent(brahma, 'Brahma')],
    avoid: avoid.length
      ? avoid
      : [...namedIfPresent(rahu, 'Rahu'), ...namedIfPresent(yamaganda, 'Yamaganda'), ...namedIfPresent(gulika, 'Gulika')],
    rahu,
    yamaganda,
    gulika,
    abhijit,
    brahma,
    choghadiya:
      asString(root.choghadiya) ??
      asString(panchang.choghadiya) ??
      asString(asRecord(root.current_choghadiya)?.name) ??
      asString(asRecord(timings.choghadiya)?.current),
  };
}
