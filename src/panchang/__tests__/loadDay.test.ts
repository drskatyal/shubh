import { afterEach, describe, expect, it } from 'vitest';

import { loadLiveDay } from '../loadDay';

const originalKey = process.env.DIVINE_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.DIVINE_API_KEY;
  else process.env.DIVINE_API_KEY = originalKey;
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('loadLiveDay', () => {
  it('does not invent a panchang when the key is missing', async () => {
    delete process.env.DIVINE_API_KEY;
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      fetch: async () => {
        throw new Error('should not fetch');
      },
    });
    expect(result.ok).toBe(false);
    expect(result.setup).toBe(true);
    expect(result.day).toBeUndefined();
  });

  it('uses POST find-panchang when live', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      date: '2026-08-14',
      fetch: async (input) => {
        const url = String(input);
        if (url.includes('/indian-api/v2/find-panchang')) {
          return json(200, {
            success: 1,
            data: {
              date: '2026-08-14',
              tithis: [{ tithi: 'Ashtami', paksha: 'Krishna', end_time: '2026-08-14 18:00:00' }],
              nakshatras: { nakshatra_list: [{ nak_name: 'Rohini' }] },
              yogas: [{ yoga_name: 'Siddha' }],
              karnas: [{ karana_name: 'Bava' }],
            },
          });
        }
        if (url.includes('inauspicious-timings')) {
          return json(200, {
            success: 1,
            data: { rahu_kaal: { start_time: '10:12', end_time: '11:41' } },
          });
        }
        return json(200, { success: 1, data: {} });
      },
    });
    expect(result.ok).toBe(true);
    expect(result.day?.tithi?.name).toBe('Ashtami');
    expect(result.day?.rahu?.end).toBe('11:41');
  });

  it('does not invent limbs when Divine returns 402', async () => {
    process.env.DIVINE_API_KEY = 'test-key';
    const result = await loadLiveDay({
      lat: 19.076,
      lon: 72.8777,
      lang: 'en',
      date: '2026-08-14',
      fetch: async () => json(402, { success: 0, msg: 'plan' }),
    });
    expect(result.ok).toBe(false);
    expect(result.planNeeded).toBe(true);
    expect(result.day).toBeUndefined();
  });
});
