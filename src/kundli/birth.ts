import { cityLabel, type City } from '../location/cities';
import type { BirthData } from '../tathaastu/types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

export function emptyBirth(defaults?: { name?: string; city?: City | null }): BirthData {
  return {
    name: defaults?.name ?? '',
    date_of_birth: '',
    time_of_birth: '',
    latitude: defaults?.city?.lat ?? 28.6139,
    longitude: defaults?.city?.lon ?? 77.209,
    place_name: defaults?.city ? cityLabel(defaults.city, 'en') : 'Delhi',
  };
}

export function birthFormValid(data: BirthData): boolean {
  return (
    data.name.trim().length > 0 &&
    DATE_RE.test(data.date_of_birth) &&
    TIME_RE.test(data.time_of_birth) &&
    Number.isFinite(data.latitude) &&
    Number.isFinite(data.longitude)
  );
}
