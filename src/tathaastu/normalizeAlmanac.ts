import { isIsoDate } from './dates';
import type {
  CalendarDay,
  CalendarMonth,
  EventRating,
  Festival,
  FestivalCondition,
  FestivalExplain,
  RankedDate,
} from './types';

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

export function asStringList(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((part) => part.trim()).filter(Boolean);
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      const rec = asRecord(item);
      return asString(rec?.name) ?? asString(rec?.title) ?? asString(rec?.festival);
    })
    .filter((item): item is string => Boolean(item));
}

function pickArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  for (const key of keys) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  if (rec.data !== undefined) return pickArray(rec.data, keys);
  if (rec.result !== undefined) return pickArray(rec.result, keys);
  return [];
}

function limbName(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  const rec = asRecord(value);
  if (!rec) return undefined;
  return asString(rec.name) ?? asString(rec.name_en) ?? asString(rec.name_hi);
}

function scoreFromRating(rating: string | undefined): number {
  switch ((rating ?? '').toUpperCase()) {
    case 'EXCELLENT':
      return 90;
    case 'GOOD':
      return 75;
    case 'NEUTRAL':
      return 50;
    case 'AVOID':
      return 15;
    default:
      return 0;
  }
}

function reasonFrom(rec: Record<string, unknown>, supporting: string[], blocking: string[]): string {
  return (
    asString(rec.reason) ??
    asString(rec.human_readable) ??
    asString(rec.explanation) ??
    asString(rec.summary) ??
    asString(rec.message) ??
    blocking[0] ??
    supporting[0] ??
    ''
  );
}

export function normalizeRankedDate(value: unknown, fallbackDate?: string): RankedDate | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const date =
    (isIsoDate(rec.date) ? rec.date : undefined) ??
    (isIsoDate(rec.day) ? rec.day : undefined) ??
    fallbackDate;
  if (!date) return null;
  const rating = (asString(rec.rating) ?? asString(rec.verdict) ?? 'NEUTRAL').toUpperCase();
  const score = asNumber(rec.score) ?? asNumber(rec.min_score) ?? scoreFromRating(rating);
  const supporting = asStringList(rec.supporting_factors ?? rec.supporting ?? rec.reasons);
  const blocking = asStringList(rec.blocking_factors ?? rec.blocking);
  return {
    date,
    score,
    rating: rating as EventRating | string,
    reason: reasonFrom(rec, supporting, blocking),
    supporting,
    blocking,
  };
}

function divineMuhuratRow(value: unknown): RankedDate | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const date = isIsoDate(rec.date) ? rec.date : undefined;
  if (!date) return null;
  const flag = rec.is_muhurat;
  const isGood = flag === true || flag === 'true' || flag === 1 || flag === '1';
  if (!isGood && rec.muhurats == null && rec.score == null && rec.rating == null) return null;
  if (!isGood && rec.score == null && rec.rating == null) return null;
  const windows = pickArray(rec, ['muhurats']);
  const first = asRecord(windows[0]);
  const start = asString(first?.muhurat_start) ?? asString(first?.start_time);
  const end = asString(first?.muhurat_end) ?? asString(first?.end_time);
  const reason =
    asString(rec.reason) ??
    (start && end ? `${start} – ${end}` : asString(rec.weekday) ?? 'Auspicious muhurat');
  return {
    date,
    score: asNumber(rec.score) ?? (isGood ? 85 : 20),
    rating: isGood ? 'EXCELLENT' : ((asString(rec.rating) ?? 'AVOID') as EventRating | string),
    reason,
    supporting: start && end ? [`${start} – ${end}`] : [],
    blocking: [],
  };
}

export function normalizeRankedDates(payload: unknown): RankedDate[] {
  const rec = asRecord(payload);
  const notes = rec ? pickArray(rec, ['month_notes']) : [];
  const rows = pickArray(payload, ['dates', 'results', 'muhurats', 'items', 'days']);
  const ranked = rows
    .map((row) => {
      const rec = asRecord(row);
      const divine = divineMuhuratRow(row);
      if (divine) {
        if (!divine.reason && notes.length) {
          const note = asRecord(notes[0]);
          return { ...divine, reason: asString(note?.reason) ?? divine.reason };
        }
        return divine;
      }
      if (rec && rec.is_muhurat != null) return null;
      return normalizeRankedDate(row);
    })
    .filter((row): row is RankedDate => row !== null);
  ranked.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
  return ranked;
}

export function rankedDateFromSuitability(payload: unknown, date: string, event?: string): RankedDate | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  if (rec.rating !== undefined || rec.score !== undefined) {
    return normalizeRankedDate({ ...rec, date }, date);
  }
  const events = asRecord(rec.events) ?? asRecord(rec.ratings) ?? asRecord(rec.data);
  if (events && event) {
    const hit = events[event] ?? events[event.toLowerCase()] ?? events[event.toUpperCase()];
    if (hit) return normalizeRankedDate({ ...asRecord(hit), date }, date);
  }
  const rows = pickArray(payload, ['events', 'ratings', 'results']);
  const match = event
    ? rows.find((row) => {
        const item = asRecord(row);
        const name = asString(item?.event);
        return name && name.toLowerCase() === event.toLowerCase();
      })
    : rows[0];
  return match ? normalizeRankedDate({ ...asRecord(match), date }, date) : null;
}

function festivalKey(rec: Record<string, unknown>, name: string): string {
  return (
    asString(rec.key) ??
    asString(rec.festival) ??
    asString(rec.festival_key) ??
    asString(rec.festival_id) ??
    asString(rec.id) ??
    name
  );
}

export function normalizeFestival(value: unknown, fallbackDate?: string): Festival | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const name =
    asString(rec.name) ??
    asString(rec.festival_name) ??
    asString(rec.title) ??
    asString(rec.festival);
  const date =
    (isIsoDate(rec.date) ? rec.date : undefined) ??
    (isIsoDate(rec.gregorian_date) ? rec.gregorian_date : undefined) ??
    fallbackDate;
  if (!name || !date) return null;
  return {
    date,
    key: festivalKey(rec, name),
    name,
    type: asString(rec.type) ?? asString(rec.kind),
    tags: asStringList(rec.tags),
  };
}

function titleFromKey(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function festivalDateFrom(value: unknown): string | undefined {
  const rec = asRecord(value);
  if (!rec) return undefined;
  if (isIsoDate(rec.date)) return rec.date;
  const smartas = asRecord(rec.smartas);
  if (smartas && isIsoDate(smartas.date)) return smartas.date;
  const vaishnavas = asRecord(rec.vaishnavas);
  if (vaishnavas && isIsoDate(vaishnavas.date)) return vaishnavas.date;
  if (Array.isArray(rec) === false && Array.isArray(value)) {
    const first = asRecord(value[0]);
    if (first && isIsoDate(first.date)) return first.date;
  }
  return undefined;
}

function festivalsFromDivineMap(payload: unknown, fallbackDate?: string): Festival[] {
  const rec = asRecord(payload);
  if (!rec) return [];
  const out: Festival[] = [];
  for (const [key, value] of Object.entries(rec)) {
    if (key === 'success' || key === 'data') continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        const row = asRecord(item);
        const date = (row && isIsoDate(row.date) ? row.date : undefined) ?? fallbackDate;
        const name = asString(row?.name) ?? titleFromKey(key);
        if (!date) continue;
        out.push({ date, key, name, tags: [] });
      }
      continue;
    }
    const date = festivalDateFrom(value) ?? fallbackDate;
    if (!date) continue;
    const nested = asRecord(value);
    const name = asString(nested?.name) ?? titleFromKey(key);
    out.push({ date, key, name, tags: [] });
  }
  return out;
}

export function normalizeFestivals(payload: unknown, fallbackDate?: string): Festival[] {
  const rec = asRecord(payload);
  const direct = pickArray(payload, ['festivals', 'results', 'items', 'data']);
  const fromDays: Festival[] = [];
  const days = rec ? pickArray(rec, ['days']) : [];
  for (const day of days) {
    const dayRec = asRecord(day);
    const date = isIsoDate(dayRec?.date) ? dayRec.date : fallbackDate;
    const nested = pickArray(day, ['festivals', 'items']);
    if (nested.length) {
      for (const item of nested) {
        const fest = normalizeFestival(item, date);
        if (fest) fromDays.push(fest);
      }
    } else {
      const fest = normalizeFestival(day, date);
      if (fest) fromDays.push(fest);
    }
  }
  const fromDirect = direct
    .map((item) => normalizeFestival(item, fallbackDate))
    .filter((item): item is Festival => item !== null);
  const fromMap = !fromDirect.length && !fromDays.length ? festivalsFromDivineMap(payload, fallbackDate) : [];
  const merged = fromDirect.length ? fromDirect : fromDays.length ? fromDays : fromMap;
  const seen = new Set<string>();
  return merged.filter((fest) => {
    const id = `${fest.date}:${fest.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function normalizeExplain(payload: unknown, festival: string, date: string): FestivalExplain {
  const rec = asRecord(payload) ?? {};
  const dates = asRecord(rec.dates);
  const firstDate = dates
    ? Object.values(dates).find((value): value is string => isIsoDate(value))
    : undefined;
  const conditionsRaw = pickArray(rec, ['conditions']);
  const conditions: FestivalCondition[] = conditionsRaw.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      field: asString(row.field) ?? '',
      expected: String(row.expected ?? ''),
      actual: String(row.actual ?? ''),
      matched: row.matched === true || row.matched === 'true',
    };
  });
  const human =
    asString(rec.human_readable) ??
    asString(rec.reason) ??
    asString(rec.explanation) ??
    asString(rec.content) ??
    (firstDate ? `${titleFromKey(festival)} falls on ${firstDate}.` : '');
  return {
    festival: asString(rec.festival) ?? festival,
    date: isIsoDate(rec.date) ? rec.date : firstDate ?? date,
    matched: rec.matched !== false,
    ruleCode: asString(rec.rule_code) ?? asString(rec.rule) ?? festival,
    humanReadable: human,
    conditions,
  };
}

function emptyMonthGrid(year: number, month: number): CalendarDay[] {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: CalendarDay[] = [];
  for (let day = 1; day <= last; day += 1) {
    days.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      festivals: [],
    });
  }
  return days;
}

export function normalizeCalendarDay(value: unknown, fallbackDate?: string): CalendarDay | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const panchang = asRecord(rec.panchang) ?? rec;
  const date =
    (isIsoDate(rec.date) ? rec.date : undefined) ??
    (isIsoDate(panchang.date) ? panchang.date : undefined) ??
    fallbackDate;
  if (!date) return null;
  const festivals = normalizeFestivals(rec.festivals ?? panchang.festivals, date).map((f) => f.name);
  const extraNames = asStringList(rec.festivals ?? panchang.festivals);
  return {
    date,
    vara: limbName(panchang.vara) ?? limbName(rec.vara) ?? asString(rec.weekday),
    tithi: limbName(panchang.tithi) ?? limbName(rec.tithi),
    nakshatra: limbName(panchang.nakshatra) ?? limbName(rec.nakshatra),
    yoga: limbName(panchang.yoga) ?? limbName(rec.yoga),
    karana: limbName(panchang.karana) ?? limbName(rec.karana),
    festivals: festivals.length ? festivals : extraNames,
    summary: asString(rec.summary) ?? asString(panchang.summary),
  };
}

export function normalizeCalendarMonth(payload: unknown, year: number, month: number): CalendarMonth {
  const rec = asRecord(payload);
  const grid = emptyMonthGrid(year, month);
  const byDate = new Map(grid.map((day) => [day.date, day]));

  const rows = pickArray(payload, ['days', 'calendar', 'dates', 'items']);
  for (const row of rows) {
    const day = normalizeCalendarDay(row);
    if (day) byDate.set(day.date, { ...byDate.get(day.date), ...day, festivals: day.festivals });
  }

  if (rec) {
    for (const [key, value] of Object.entries(rec)) {
      if (!isIsoDate(key)) continue;
      const day = normalizeCalendarDay(value, key);
      if (day) byDate.set(day.date, { ...byDate.get(day.date), ...day });
    }
  }

  return {
    year,
    month,
    days: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
}
