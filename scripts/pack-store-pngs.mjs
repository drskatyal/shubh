import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ART = '/opt/cursor/artifacts/screenshots';
const PLAY = '/workspace/store/play';
const IOS = '/workspace/store/ios';

mkdirSync(PLAY, { recursive: true });
mkdirSync(join(IOS, '6.7'), { recursive: true });
mkdirSync(join(IOS, '6.5'), { recursive: true });
mkdirSync(join(IOS, 'ipad13'), { recursive: true });

function mustCopy(from, to) {
  if (!existsSync(from)) throw new Error(`missing ${from}`);
  copyFileSync(from, to);
  console.log(to);
}

const playMap = [
  ['iphone-milan.png', '01-milan-score-ring.png'],
  ['iphone-home.png', '02-today-panchang.png'],
  ['iphone-muhurat.png', '03-marriage-muhurat.png'],
  ['iphone-festivals.png', '04-festivals.png'],
  ['iphone-kundli.png', '05-kundli.png'],
  ['iphone-paywall.png', '06-paywall.png'],
];

for (const [src, dest] of playMap) {
  mustCopy(join(ART, src), join(PLAY, dest));
}

if (existsSync(join(ART, 'feature-graphic.png'))) {
  mustCopy(join(ART, 'feature-graphic.png'), join(PLAY, 'feature-graphic.png'));
}

const iosShots = [
  ['milan', '01-milan-score-ring.png'],
  ['home', '02-today-panchang.png'],
  ['muhurat', '03-marriage-muhurat.png'],
  ['firstopen', '04-first-open.png'],
  ['festivals', '05-festivals.png'],
  ['kundli', '06-kundli.png'],
  ['paywall', '07-paywall.png'],
];

for (const [shot, file] of iosShots) {
  mustCopy(join(ART, `ios67-${shot}.png`), join(IOS, '6.7', file));
  mustCopy(join(ART, `ios65-${shot}.png`), join(IOS, '6.5', file));
  mustCopy(join(ART, `ipad13-${shot}.png`), join(IOS, 'ipad13', file));
}

const { assertIosSizes } = await import('./assert-ios-sizes.mjs');
assertIosSizes();

console.log('store pngs packed');
