import { afterEach, describe, expect, it } from 'vitest';

import { findMuhuratDates } from '../findMuhurat';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('findMuhuratDates', () => {
  it('does not invent ranked dates when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const result = await findMuhuratDates({
      event: 'griha_pravesh',
      lat: 28.6139,
      lon: 77.209,
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.dates).toEqual([]);
  });

  it('returns ranked live dates from GET /v1/muhurat/find', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await findMuhuratDates({
      event: 'marriage',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-09-14',
      fetch: async (input) => {
        expect(String(input)).toContain('/v1/muhurat/find');
        return json(200, {
          dates: [
            { date: '2026-08-20', score: 70, reason: 'good', rating: 'GOOD' },
            { date: '2026-08-18', score: 91, reason: 'best', rating: 'EXCELLENT' },
          ],
        });
      },
    });
    expect(result.endpoint).toBe('/v1/muhurat/find');
    expect(result.dates.map((row) => row.date)).toEqual(['2026-08-18', '2026-08-20']);
  });

  it('falls back to GET /v1/events/find-dates on 402', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const paths: string[] = [];
    const result = await findMuhuratDates({
      event: 'vehicle_purchase',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-09-14',
      fetch: async (input) => {
        const url = String(input);
        paths.push(url);
        if (url.includes('/muhurat/find')) {
          return json(402, { error: 'plan_upgrade_required' });
        }
        return json(200, {
          dates: [{ date: '2026-08-20', score: 83, reason: 'Labh hora', rating: 'EXCELLENT' }],
        });
      },
    });
    expect(result.endpoint).toBe('/v1/events/find-dates');
    expect(result.source).toBe('fallback');
    expect(result.dates[0]?.score).toBe(83);
    expect(paths.some((url) => url.includes('/events/find-dates'))).toBe(true);
  });

  it('scans GET /v1/events/suitability when find and find-dates are 402', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const result = await findMuhuratDates({
      event: 'business_start',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-08-16',
      fetch: async (input) => {
        const url = String(input);
        if (url.includes('/muhurat/find') || url.includes('/events/find-dates')) {
          return json(402, { error: 'plan_upgrade_required' });
        }
        if (url.includes('date=2026-08-15')) {
          return json(200, {
            event: 'business_start',
            rating: 'EXCELLENT',
            score: 84,
            supporting_factors: ['Jupiter hora'],
          });
        }
        return json(200, { event: 'business_start', rating: 'AVOID', score: 12, blocking_factors: ['Bhadra'] });
      },
    });
    expect(result.endpoint).toBe('/v1/events/suitability');
    expect(result.dates[0]).toMatchObject({ date: '2026-08-15', score: 84 });
  });

  it('maps naming through NAMKARAN when naming is rejected', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const events: string[] = [];
    const result = await findMuhuratDates({
      event: 'naming',
      lat: 28.6139,
      lon: 77.209,
      startDate: '2026-08-14',
      endDate: '2026-09-14',
      fetch: async (input) => {
        const url = new URL(String(input));
        events.push(url.searchParams.get('event') ?? '');
        if (url.searchParams.get('event') === 'naming') {
          return json(422, { error: 'unsupported event' });
        }
        return json(200, {
          dates: [{ date: '2026-08-22', score: 80, reason: 'namkaran', rating: 'EXCELLENT' }],
        });
      },
    });
    expect(events[0]).toBe('naming');
    expect(events).toContain('NAMKARAN');
    expect(result.eventUsed).toBe('NAMKARAN');
    expect(result.dates[0]?.date).toBe('2026-08-22');
  });
});
