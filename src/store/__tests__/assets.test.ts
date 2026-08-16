import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { APPLE_IOS_SHOTS, APPLE_IOS_SIZES } from '../aso';

const play = [
  'feature-graphic.png',
  '01-milan-score-ring.png',
  '02-today-panchang.png',
  '03-marriage-muhurat.png',
  '04-festivals.png',
  '05-kundli.png',
  '06-paywall.png',
];

function pngSize(url: URL) {
  const buf = readFileSync(url);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('store pack files', () => {
  it('ships Play graphics and exact-size App Store shots 01–07', () => {
    for (const file of play) {
      const path = new URL(`../../../store/play/${file}`, import.meta.url);
      expect(existsSync(path), file).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(8_000);
    }
    for (const [folder, size] of Object.entries(APPLE_IOS_SIZES)) {
      for (const shot of APPLE_IOS_SHOTS) {
        const path = new URL(`../../../store/ios/${folder}/${shot.file}`, import.meta.url);
        expect(existsSync(path), `${folder}/${shot.file}`).toBe(true);
        expect(statSync(path).size).toBeGreaterThan(8_000);
        expect(pngSize(path)).toEqual(size);
      }
    }
    expect(statSync(new URL('../../../assets/icon.png', import.meta.url)).size).toBeGreaterThan(8_000);
    expect(APPLE_IOS_SHOTS.map((row) => row.file).join(' ')).not.toMatch(/ask/i);
  });
});
