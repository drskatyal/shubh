import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IOS = join(ROOT, 'store/ios');

const SIZES = {
  '6.7': [1320, 2868],
  '6.5': [1290, 2796],
  ipad13: [2064, 2752],
};

const FILES = [
  '01-milan-score-ring.png',
  '02-today-panchang.png',
  '03-marriage-muhurat.png',
  '04-first-open.png',
  '05-festivals.png',
  '06-kundli.png',
  '07-paywall.png',
];

export function pngSize(path) {
  const buf = readFileSync(path);
  if (buf.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error(`${path} is not a PNG`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function assertIosSizes() {
  const errors = [];
  for (const [folder, [width, height]] of Object.entries(SIZES)) {
    for (const file of FILES) {
      const path = join(IOS, folder, file);
      if (!existsSync(path)) {
        errors.push(`missing ${folder}/${file}`);
        continue;
      }
      const size = pngSize(path);
      if (size.width !== width || size.height !== height) {
        errors.push(
          `${folder}/${file} is ${size.width}×${size.height}, need ${width}×${height}`,
        );
      }
    }
  }
  if (errors.length) {
    throw new Error(`App Store screenshot sizes failed:\n${errors.join('\n')}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('assert-ios-sizes.mjs')) {
  assertIosSizes();
  console.log('ios sizes ok');
}
