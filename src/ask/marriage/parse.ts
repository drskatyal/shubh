import { hintFor } from './copy';
import type { ExtractedPerson, ExtractIntent, MarriageExtract, MissingField } from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '0' || /^n\/?a$/i.test(trimmed) || trimmed === '-') return null;
  return trimmed;
}

function asInt(value: unknown, min: number, max: number): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i === 0 && min > 0) return null;
  if (i < min || i > max) return null;
  return i;
}

function parsePerson(raw: unknown): ExtractedPerson {
  const rec = asRecord(raw) ?? {};
  return {
    name: asString(rec.name),
    day: asInt(rec.day, 1, 31),
    month: asInt(rec.month, 1, 12),
    year: asInt(rec.year, 1900, 2100),
    hour: asInt(rec.hour, 0, 23),
    min: asInt(rec.min, 0, 59),
    place: asString(rec.place),
  };
}

function parseIntent(value: unknown): ExtractIntent {
  const key = String(value ?? '').trim();
  if (key === 'muhurat_marriage' || key === 'match' || key === 'other') return key;
  return 'match';
}

export function emptyPerson(): ExtractedPerson {
  return { name: null, day: null, month: null, year: null, hour: null, min: null, place: null };
}

export function emptyExtract(): MarriageExtract {
  return { person_a: emptyPerson(), person_b: emptyPerson(), intent: 'match', question: '' };
}

export function parseExtract(raw: string): MarriageExtract {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(cleaned) as unknown;
  const rec = asRecord(parsed);
  if (!rec) throw new Error('invalid extract');
  return {
    person_a: parsePerson(rec.person_a ?? rec.personA),
    person_b: parsePerson(rec.person_b ?? rec.personB),
    intent: parseIntent(rec.intent),
    question: asString(rec.question) ?? '',
  };
}

function preferString(next: string | null, prev: string | null): string | null {
  return next ?? prev;
}

function preferNum(next: number | null, prev: number | null): number | null {
  return next ?? prev;
}

export function mergePerson(prev: ExtractedPerson, next: ExtractedPerson): ExtractedPerson {
  return {
    name: preferString(next.name, prev.name),
    day: preferNum(next.day, prev.day),
    month: preferNum(next.month, prev.month),
    year: preferNum(next.year, prev.year),
    hour: preferNum(next.hour, prev.hour),
    min: preferNum(next.min, prev.min),
    place: preferString(next.place, prev.place),
  };
}

export function mergeExtract(prev: MarriageExtract, next: MarriageExtract): MarriageExtract {
  return {
    person_a: mergePerson(prev.person_a, next.person_a),
    person_b: mergePerson(prev.person_b, next.person_b),
    intent: next.intent !== 'other' ? next.intent : prev.intent,
    question: next.question || prev.question,
  };
}

function personMissing(person: ExtractedPerson, side: 'a' | 'b'): MissingField[] {
  const out: MissingField[] = [];
  if (!person.name) out.push({ side, field: 'name', hint: hintFor(side, 'name') });
  if (person.day == null || person.month == null || person.year == null) {
    out.push({ side, field: 'date', hint: hintFor(side, 'date', person.name) });
  }
  if (person.hour == null || person.min == null) {
    out.push({ side, field: 'time', hint: hintFor(side, 'time', person.name) });
  }
  if (!person.place) out.push({ side, field: 'place', hint: hintFor(side, 'place', person.name) });
  return out;
}

export function missingFields(extract: MarriageExtract): MissingField[] {
  return [...personMissing(extract.person_a, 'a'), ...personMissing(extract.person_b, 'b')];
}

export function formatDate(person: ExtractedPerson): string {
  if (person.day == null || person.month == null || person.year == null) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${person.year}-${pad(person.month)}-${pad(person.day)}`;
}

export function formatTime(person: ExtractedPerson): string {
  if (person.hour == null || person.min == null) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(person.hour)}:${pad(person.min)}`;
}

export function applyField(
  extract: MarriageExtract,
  side: 'a' | 'b',
  field: 'name' | 'date' | 'time' | 'place',
  value: string,
): MarriageExtract {
  const person = { ...(side === 'a' ? extract.person_a : extract.person_b) };
  const trimmed = value.trim();
  if (field === 'name') person.name = trimmed || null;
  if (field === 'place') person.place = trimmed || null;
  if (field === 'date') {
    const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      person.year = Number(match[1]);
      person.month = Number(match[2]);
      person.day = Number(match[3]);
    } else {
      person.year = null;
      person.month = null;
      person.day = null;
    }
  }
  if (field === 'time') {
    const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      person.hour = Number(match[1]);
      person.min = Number(match[2]);
    } else {
      person.hour = null;
      person.min = null;
    }
  }
  return side === 'a' ? { ...extract, person_a: person } : { ...extract, person_b: person };
}
