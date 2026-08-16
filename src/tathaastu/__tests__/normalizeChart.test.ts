import { describe, expect, it } from 'vitest';

import { chartSummaryHasBirthPii, normalizeChart, normalizeMatch, toChartAskSummary } from '../normalizeChart';

describe('normalizeChart', () => {
  it('reads lagna, moon, planets, and dasha from a nested payload', () => {
    const chart = normalizeChart(
      {
        name: 'Arjun',
        lagna: { sign: 'Taurus', nakshatra: 'Krittika' },
        planets: {
          Moon: { sign: 'Cancer', house: 3, nakshatra: 'Pushya' },
          Sun: { rashi: 'Taurus', bhava: 1 },
        },
        vimshottari_dasha: {
          current: { mahadasha: { lord: 'Jupiter', from: '2024-03-01' }, antardasha: { lord: 'Saturn' } },
        },
      },
      'Fallback',
    );
    expect(chart.lagna.sign).toBe('Taurus');
    expect(chart.moon.sign).toBe('Cancer');
    expect(chart.planets.find((p) => p.name === 'Sun')?.house).toBe(1);
    expect(chart.dasha).toMatchObject({ mahadasha: 'Jupiter', antardasha: 'Saturn' });
  });

  it('accepts teaser-shaped lagna / moon_sign / insights', () => {
    const chart = normalizeChart(
      { lagna: 'Libra', moon_sign: 'Pisces', insights: ['One', 'Two'] },
      'Arjun',
    );
    expect(chart.lagna.sign).toBe('Libra');
    expect(chart.moon.sign).toBe('Pisces');
    expect(chart.insights).toEqual(['One', 'Two']);
  });
});

describe('normalizeMatch', () => {
  it('reads Divine ashtakoot_milan points_obtained', () => {
    const match = normalizeMatch(
      {
        ashtakoot_milan: {
          varna: { points_obtained: 1, max_ponits: 1 },
          nadi: { points_obtained: 0, max_ponits: 8 },
        },
        ashtakoot_milan_result: { points_obtained: 28, max_ponits: 36, content: 'Favorable' },
        manglik_dosha: { p1: 'false', p2: 'true' },
      },
      'Priya',
      'Arjun',
    );
    expect(match.total).toBe(28);
    expect(match.max).toBe(36);
    expect(match.verdict).toBe('Favorable');
    expect(match.kutas.find((kuta) => kuta.key === 'nadi')?.score).toBe(0);
    expect(match.manglik).toEqual({ a: false, b: true });
  });

  it('reads a 36-guna total and eight kutas', () => {
    const match = normalizeMatch(
      {
        total_score: 28,
        max_score: 36,
        verdict: 'Good match',
        kutas: {
          varna: { score: 1, max: 1 },
          nadi: 3,
        },
      },
      'Priya',
      'Arjun',
    );
    expect(match.total).toBe(28);
    expect(match.max).toBe(36);
    expect(match.kutas).toHaveLength(8);
    expect(match.kutas.find((k) => k.key === 'nadi')?.score).toBe(3);
  });
});

describe('toChartAskSummary', () => {
  it('drops place and never includes birth PII keys', () => {
    const summary = toChartAskSummary(
      normalizeChart(
        { name: 'Arjun', lagna: 'Taurus', moon_sign: 'Cancer', place_name: 'Delhi' },
        'Arjun',
      ),
    );
    expect(summary).not.toHaveProperty('placeName');
    expect(chartSummaryHasBirthPii(summary)).toBe(false);
    const blob = JSON.stringify(summary);
    expect(blob).not.toMatch(/date_of_birth|time_of_birth|"lat"|"lon"|latitude|longitude/);
  });
});
