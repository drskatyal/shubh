import puppeteer from 'puppeteer-core';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = '/opt/cursor/artifacts/screenshots';
mkdirSync(OUT, { recursive: true });

const shots = [
  'home',
  'match',
  'confirm',
  'milan',
  'muhurat',
  'festivals',
  'kundli',
  'ask',
  'paywall',
  'firstopen',
  'privacy',
  'terms',
  'support',
];

const waitFor = {
  home: /शुभ|मुंबई|टालें|अच्छा/,
  match: /Yeh sab record kar dijiye|रिकॉर्ड/,
  confirm: /हमने यह समझा|Rohan|Ananya/,
  milan: /28|अच्छा मेल|\/ 36/,
  muhurat: /मुहूर्त|उत्तम|विवाह|Excellent/,
  festivals: /त्योहार|जन्माष्टमी/,
  kundli: /कुंडली|Rohan|Taurus/,
  ask: /पूछो|रुकें|Rahu/,
  paywall: /शुभ खोलो|₹199/,
  firstopen: /इसी जगह से|हिन्दी/,
  privacy: /जन्म की बात|Birth details/,
  terms: /पंचांग है, पुजारी|almanac, not a priest/,
  support: /खरीद वापस|Restore/,
};

const devices = [
  { name: 'iphone', width: 390, height: 844, scale: 3, shots },
  { name: 'pixel', width: 412, height: 915, scale: 3, shots },
  { name: 'desktop', width: 1440, height: 900, scale: 2, shots },
  { name: 'ios67', width: 440, height: 956, scale: 3, shots: ['milan', 'home', 'muhurat'] },
  { name: 'ios65', width: 430, height: 932, scale: 3, shots: ['milan', 'home', 'muhurat'] },
  { name: 'ipad13', width: 1032, height: 1376, scale: 2, shots: ['milan', 'home', 'muhurat'] },
];

const profile = mkdtempSync(join(tmpdir(), 'shubh-chrome-'));

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--user-data-dir=${profile}`,
  ],
});

for (const device of devices) {
  const page = await browser.newPage();
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.scale,
  });
  for (const shot of device.shots) {
    const url = `http://127.0.0.1:8081/?shot=${shot}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction(
      (needle) => new RegExp(needle).test(document.body?.innerText ?? ''),
      { timeout: 45000 },
      waitFor[shot].source,
    );
    await new Promise((r) => setTimeout(r, 800));
    const file = `${OUT}/${device.name}-${shot}.png`;
    await page.screenshot({ path: file, type: 'png' });
    const debug = await page.evaluate(() => ({
      href: location.href,
      text: document.body.innerText.slice(0, 140).replace(/\n/g, ' | '),
    }));
    console.log(file, JSON.stringify(debug));
  }
  await page.close();
}

await browser.close();
console.log('done');
