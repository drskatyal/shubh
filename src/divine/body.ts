import { timezoneFor, zonedParts } from '../engine/time';
import { civilFromIso } from '../tathaastu/dates';
import type { BirthData, FinderEvent } from '../tathaastu/types';
import type { DivineRouteId } from './endpoints';
import { DIVINE_ROUTES } from './endpoints';

/** App language → Divine `lan`. Their docs use tm/tl/ma, not ta/te/mr. */
export const DIVINE_LAN: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
  mr: 'ma',
  ma: 'ma',
  ta: 'tm',
  tm: 'tm',
  te: 'tl',
  tl: 'tl',
  ml: 'ml',
  kn: 'kn',
};

export type DivineLan = keyof typeof DIVINE_LAN | string;

export function toDivineLan(lang?: string | null): string {
  if (!lang) return 'en';
  return DIVINE_LAN[lang.toLowerCase()] ?? lang.toLowerCase();
}

export function timezoneOffsetHours(lat: number, lon: number, at = new Date()): number {
  const zone = timezoneFor(lat, lon);
  const zoned = zonedParts(at, zone);
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return Math.round(((asUtc - at.getTime()) / 60000 / 60) * 100) / 100;
}

export type PlaceDateInput = {
  date: string;
  lat: number;
  lon: number;
  lang?: string;
  place?: string | null;
  tzone?: number;
};

export type MonthInput = {
  year: number;
  month: number;
  lat: number;
  lon: number;
  lang?: string;
  place?: string | null;
  tzone?: number;
};

export type DivineBody = Record<string, string | number>;

function placeFields(input: {
  lat: number;
  lon: number;
  place?: string | null;
  tzone?: number;
  lang?: string;
}): DivineBody {
  const body: DivineBody = {
    lat: input.lat,
    lon: input.lon,
    tzone: input.tzone ?? timezoneOffsetHours(input.lat, input.lon),
    lan: toDivineLan(input.lang),
  };
  if (input.place?.trim()) body.place = input.place.trim();
  return body;
}

export function placeDateBody(input: PlaceDateInput): DivineBody {
  const civil = civilFromIso(input.date);
  return {
    day: civil.day,
    month: civil.month,
    year: civil.year,
    ...placeFields(input),
  };
}

export function monthBody(input: MonthInput): DivineBody {
  return {
    month: input.month,
    year: input.year,
    ...placeFields(input),
  };
}

function clockParts(time: string): { hour: number; min: number; sec: number } {
  const [hour = '0', min = '0', sec = '0'] = time.split(':');
  return { hour: Number(hour) || 0, min: Number(min) || 0, sec: Number(sec) || 0 };
}

export function birthBody(data: BirthData, lang?: string): DivineBody {
  const civil = civilFromIso(data.date_of_birth);
  const clock = clockParts(data.time_of_birth);
  return {
    full_name: data.name.trim() || 'Native',
    day: civil.day,
    month: civil.month,
    year: civil.year,
    hour: clock.hour,
    min: clock.min,
    sec: clock.sec,
    gender: data.gender === 'female' ? 'female' : 'male',
    place: data.place_name?.trim() || 'Unknown',
    lat: data.latitude,
    lon: data.longitude,
    tzone: timezoneOffsetHours(data.latitude, data.longitude),
    lan: toDivineLan(lang),
  };
}

export function matchPersonPrefix(data: BirthData, prefix: 'p1' | 'p2', lang?: string): DivineBody {
  const base = birthBody(data, lang);
  return {
    [`${prefix}_full_name`]: base.full_name,
    [`${prefix}_day`]: base.day,
    [`${prefix}_month`]: base.month,
    [`${prefix}_year`]: base.year,
    [`${prefix}_hour`]: base.hour,
    [`${prefix}_min`]: base.min,
    [`${prefix}_sec`]: base.sec,
    [`${prefix}_gender`]: prefix === 'p1' ? (data.gender === 'male' ? 'male' : 'female') : data.gender === 'male' ? 'male' : 'female',
    [`${prefix}_place`]: base.place,
    [`${prefix}_lat`]: base.lat,
    [`${prefix}_lon`]: base.lon,
    [`${prefix}_tzone`]: base.tzone,
  };
}

export function matchBody(personA: BirthData, personB: BirthData, lang?: string): DivineBody {
  return {
    ...matchPersonPrefix(personA, 'p1', lang),
    ...matchPersonPrefix(personB, 'p2', lang),
    lan: toDivineLan(lang),
  };
}

export const MUHURAT_ROUTE: Record<FinderEvent, DivineRouteId> = {
  marriage: 'muhurat-marriage',
  griha_pravesh: 'muhurat-house-entering',
  vehicle_purchase: 'muhurat-vehicle-purchase',
  business_start: 'muhurat-business-start',
  naming: 'muhurat-marriage',
  property_purchase: 'muhurat-property-purchase',
};

export function muhuratRouteFor(event: FinderEvent | string): DivineRouteId {
  if (event in MUHURAT_ROUTE) return MUHURAT_ROUTE[event as FinderEvent];
  const aliases: Record<string, DivineRouteId> = {
    marriage: 'muhurat-marriage',
    MARRIAGE: 'muhurat-marriage',
    griha_pravesh: 'muhurat-house-entering',
    GRIHA_PRAVESH: 'muhurat-house-entering',
    'house-entering': 'muhurat-house-entering',
    vehicle_purchase: 'muhurat-vehicle-purchase',
    VEHICLE_PURCHASE: 'muhurat-vehicle-purchase',
    business_start: 'muhurat-business-start',
    BUSINESS_START: 'muhurat-business-start',
    BUSINESS: 'muhurat-business-start',
    property_purchase: 'muhurat-property-purchase',
    naming: 'muhurat-marriage',
    NAMKARAN: 'muhurat-marriage',
    namkaran: 'muhurat-marriage',
    mundan: 'muhurat-marriage',
  };
  return aliases[event] ?? 'muhurat-marriage';
}

export function muhuratPathFor(event: FinderEvent | string): string {
  return DIVINE_ROUTES[muhuratRouteFor(event)].path;
}
