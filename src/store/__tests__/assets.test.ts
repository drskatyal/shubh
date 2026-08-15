import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const play = [
  'feature-graphic.png',
  '01-milan-score-ring.png',
  '02-today-panchang.png',
  '03-marriage-muhurat.png',
  '04-festivals.png',
  '05-kundli.png',
  '06-paywall.png',
];

describe('store pack files', () => {
  it('ships Play graphics and the three lead iOS sizes', () => {
    for (const file of play) {
      const path = new URL(`../../../store/play/${file}`, import.meta.url);
      expect(existsSync(path), file).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(8_000);
    }
    for (const folder of ['6.7', '6.5', 'ipad13']) {
      for (const file of play.slice(1, 4)) {
        const path = new URL(`../../../store/ios/${folder}/${file}`, import.meta.url);
        expect(existsSync(path), `${folder}/${file}`).toBe(true);
        expect(statSync(path).size).toBeGreaterThan(8_000);
      }
    }
    expect(statSync(new URL('../../../assets/icon.png', import.meta.url)).size).toBeGreaterThan(8_000);
  });
});
