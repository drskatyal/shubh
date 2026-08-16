import { describe, expect, it } from 'vitest';

import {
  birthBody,
  matchBody,
  monthBody,
  muhuratPathFor,
  placeDateBody,
  toDivineLan,
} from '../body';
import type { BirthData } from '../../tathaastu/types';

const ARJUN: BirthData = {
  name: 'Arjun',
  date_of_birth: '1990-05-15',
  time_of_birth: '06:30',
  latitude: 28.6139,
  longitude: 77.209,
  place_name: 'Delhi',
  gender: 'male',
};

describe('toDivineLan', () => {
  it('keeps en and hi', () => {
    expect(toDivineLan('en')).toBe('en');
    expect(toDivineLan('hi')).toBe('hi');
  });

  it('maps later Indian codes onto Divine slugs', () => {
    expect(toDivineLan('ta')).toBe('tm');
    expect(toDivineLan('te')).toBe('tl');
    expect(toDivineLan('mr')).toBe('ma');
    expect(toDivineLan('bn')).toBe('bn');
  });
});

describe('body builders', () => {
  it('splits an ISO date into day/month/year for panchang', () => {
    const body = placeDateBody({ date: '2026-08-14', lat: 19.076, lon: 72.8777, lang: 'hi' });
    expect(body).toMatchObject({ day: 14, month: 8, year: 2026, lat: 19.076, lon: 72.8777, lan: 'hi' });
    expect(body).not.toHaveProperty('api_key');
  });

  it('builds a month body without a day', () => {
    expect(monthBody({ year: 2026, month: 8, lat: 28.6, lon: 77.2 })).toMatchObject({
      year: 2026,
      month: 8,
    });
  });

  it('maps birth data onto Divine full_name / clock fields', () => {
    const body = birthBody(ARJUN, 'en');
    expect(body).toMatchObject({
      full_name: 'Arjun',
      day: 15,
      month: 5,
      year: 1990,
      hour: 6,
      min: 30,
      sec: 0,
      gender: 'male',
      place: 'Delhi',
      lat: 28.6139,
      lon: 77.209,
    });
  });

  it('prefixes match partners as p1_ / p2_', () => {
    const priya: BirthData = { ...ARJUN, name: 'Priya', date_of_birth: '1992-08-22', gender: 'female' };
    const body = matchBody(priya, ARJUN);
    expect(body.p1_full_name).toBe('Priya');
    expect(body.p1_day).toBe(22);
    expect(body.p2_full_name).toBe('Arjun');
    expect(body.p2_year).toBe(1990);
  });

  it('maps finder chips onto documented muhurat paths', () => {
    expect(muhuratPathFor('marriage')).toBe('/indian-api/v1/muhurat/marriage');
    expect(muhuratPathFor('griha_pravesh')).toBe('/indian-api/v1/muhurat/house-entering');
    expect(muhuratPathFor('vehicle_purchase')).toBe('/indian-api/v1/muhurat/vehicle-purchase');
    expect(muhuratPathFor('business_start')).toBe('/indian-api/v1/muhurat/business-start');
    expect(muhuratPathFor('property_purchase')).toBe('/indian-api/v1/muhurat/property-purchase');
    expect(muhuratPathFor('naming')).toBe('/indian-api/v1/muhurat/marriage');
  });
});
