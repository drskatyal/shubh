import { timezoneOffsetHours } from '../../divine/body';
import { CITIES, searchCities, type City } from '../../location/cities';
import type { BirthData } from '../../tathaastu/types';
import { formatDate, formatTime } from './parse';
import type { ExtractedPerson, GeoPlace } from './types';

const ALIASES: Record<string, string> = {
  bombay: 'mumbai',
  bangalore: 'bengaluru',
  bengalore: 'bengaluru',
  calcutta: 'kolkata',
  madras: 'chennai',
  benaras: 'varanasi',
  banaras: 'varanasi',
  kashi: 'varanasi',
  newdelhi: 'delhi',
  'new delhi': 'delhi',
  ncr: 'delhi',
  gurgaon: 'delhi',
  gurugram: 'delhi',
  noida: 'delhi',
  poona: 'pune',
  trivandrum: 'thiruvananthapuram',
  cochin: 'kochi',
};

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0900-\u097f\s]/g, ' ')
    .replace(/\b(city|india|bharat|ji)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function geocodePlace(place: string | null | undefined, fallback?: City | null): GeoPlace | null {
  const raw = place?.trim();
  if (!raw) {
    if (!fallback) return null;
    return {
      place: fallback.nameEn,
      lat: fallback.lat,
      lon: fallback.lon,
      tzone: timezoneOffsetHours(fallback.lat, fallback.lon),
    };
  }

  const folded = fold(raw);
  const aliased = ALIASES[folded] ?? ALIASES[folded.replace(/\s/g, '')];
  const query = aliased ?? folded;
  const hits = searchCities(query);
  const exact =
    hits.find((city) => fold(city.nameEn) === query || fold(city.nameHi) === fold(raw) || city.id === query) ??
    CITIES.find((city) => fold(city.nameEn) === query || fold(city.nameHi) === fold(raw) || city.id === query) ??
    hits[0];

  if (!exact) {
    if (!fallback) return null;
    return {
      place: raw,
      lat: fallback.lat,
      lon: fallback.lon,
      tzone: timezoneOffsetHours(fallback.lat, fallback.lon),
    };
  }

  return {
    place: raw,
    lat: exact.lat,
    lon: exact.lon,
    tzone: timezoneOffsetHours(exact.lat, exact.lon),
  };
}

export function personToBirth(person: ExtractedPerson, fallback?: City | null): BirthData | null {
  const date = formatDate(person);
  const time = formatTime(person);
  if (!person.name || !date || !time) return null;
  const geo = geocodePlace(person.place, fallback);
  if (!geo) return null;
  return {
    name: person.name,
    date_of_birth: date,
    time_of_birth: time,
    latitude: geo.lat,
    longitude: geo.lon,
    place_name: geo.place,
  };
}
