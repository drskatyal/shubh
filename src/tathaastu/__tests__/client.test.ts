import { afterEach, describe, expect, it } from 'vitest';

import { findMuhurat, muhuratFindQuery, tathaGet } from '../client';

const originalKey = process.env.TATHAASTU_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.TATHAASTU_API_KEY;
  else process.env.TATHAASTU_API_KEY = originalKey;
});

describe('tathaastu client', () => {
  it('sends PRODUCT lat/lon + date-range aliases for /v1/muhurat/find', () => {
    expect(
      muhuratFindQuery({
        event: 'marriage',
        startDate: '2026-08-14',
        endDate: '2026-10-13',
        lat: 28.6139,
        lon: 77.209,
        minScore: 60,
        minRating: 'GOOD',
      }),
    ).toEqual({
      event: 'marriage',
      start_date: '2026-08-14',
      end_date: '2026-10-13',
      start: '2026-08-14',
      end: '2026-10-13',
      lat: 28.6139,
      lon: 77.209,
      min_score: 60,
      min_rating: 'GOOD',
    });
  });

  it('returns setup without fetching when the key is missing', async () => {
    delete process.env.TATHAASTU_API_KEY;
    const fetchImpl = async () => {
      throw new Error('network should not run');
    };
    const result = await tathaGet('/muhurat/find', { event: 'marriage' }, { fetch: fetchImpl });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(401);
    expect(result.setup).toBe(true);
    expect(result.endpoint).toBe('/muhurat/find');
  });

  it('calls the documented path with X-API-Key when a key is present', async () => {
    process.env.TATHAASTU_API_KEY = 'test-key';
    const seen: { url: string; key?: string }[] = [];
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      seen.push({ url: String(input), key: headers.get('X-API-Key') ?? undefined });
      return new Response(JSON.stringify({ dates: [] }), { status: 200 });
    };
    const result = await findMuhurat(
      {
        event: 'griha_pravesh',
        startDate: '2026-08-14',
        endDate: '2026-09-14',
        lat: 19.076,
        lon: 72.8777,
        minScore: 60,
        minRating: 'GOOD',
      },
      { fetch: fetchImpl },
    );
    expect(result.ok).toBe(true);
    expect(seen[0]?.key).toBe('test-key');
    expect(seen[0]?.url).toContain('/v1/muhurat/find');
    expect(seen[0]?.url).toContain('lat=19.076');
    expect(seen[0]?.url).toContain('start_date=2026-08-14');
    expect(seen[0]?.url).toContain('start=2026-08-14');
  });
});
