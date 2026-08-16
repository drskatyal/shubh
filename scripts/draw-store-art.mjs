import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/workspace';
const ART = '/opt/cursor/artifacts/screenshots';
mkdirSync(join(ROOT, 'assets'), { recursive: true });
mkdirSync(join(ROOT, 'store/play'), { recursive: true });
mkdirSync(ART, { recursive: true });

const iconHtml = `<!doctype html>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; width: 1024px; height: 1024px; background: #0B1020; }
  .mark {
    width: 1024px; height: 1024px; display: flex; align-items: center; justify-content: center;
    flex-direction: column; font-family: "Noto Serif Devanagari", "Noto Serif", Georgia, serif;
  }
  .ring {
    width: 640px; height: 640px; border-radius: 50%;
    border: 18px solid #E8C578;
    box-shadow: 0 0 80px rgba(232, 197, 120, 0.28);
    display: flex; align-items: center; justify-content: center;
  }
  .glyph { color: #E8C578; font-size: 340px; font-weight: 700; line-height: 1; margin-top: -20px; }
</style>
<div class="mark"><div class="ring"><div class="glyph">शु</div></div></div>`;

const featureHtml = `<!doctype html>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; width: 1024px; height: 500px; background: #06070E; }
  .g {
    width: 1024px; height: 500px; padding: 48px 56px; box-sizing: border-box;
    font-family: "Noto Serif Devanagari", "Noto Sans Devanagari", Georgia, serif;
    background:
      radial-gradient(circle at 18% 30%, rgba(232,197,120,0.16), transparent 36%),
      radial-gradient(circle at 82% 70%, rgba(80,100,180,0.18), transparent 40%),
      #0B1020;
    color: #F4EEE0;
  }
  .brand { color: #E8C578; letter-spacing: 8px; font-size: 16px; font-weight: 800; }
  h1 { margin: 18px 0 28px; font-size: 34px; font-weight: 700; }
  .row { display: flex; gap: 18px; }
  .tile {
    flex: 1; border: 1px solid rgba(232,197,120,0.35); border-radius: 20px;
    padding: 18px 16px; background: rgba(12,16,32,0.72);
  }
  .k { color: rgba(244,238,224,0.7); font-size: 15px; margin-bottom: 8px; }
  .v { color: #E8C578; font-size: 28px; font-weight: 700; }
</style>
<div class="g">
  <div class="brand">SHUBH</div>
  <h1>कुंडली मिलान · आज का पंचांग · मुहूर्त</h1>
  <div class="row">
    <div class="tile"><div class="k">गुण मिलान</div><div class="v">28 / 36</div></div>
    <div class="tile"><div class="k">आज का पंचांग</div><div class="v">राहुकाल</div></div>
    <div class="tile"><div class="k">मुहूर्त</div><div class="v">60 दिन</div></div>
  </div>
</div>`;

const profile = `/tmp/shubh-art-${Date.now()}`;
const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', `--user-data-dir=${profile}`],
});

async function shot(html, width, height, path) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path, type: 'png', omitBackground: false });
  await page.close();
  console.log(path);
}

await shot(iconHtml, 1024, 1024, join(ROOT, 'assets/icon.png'));
await shot(iconHtml, 1024, 1024, join(ROOT, 'assets/splash-icon.png'));
await shot(iconHtml, 512, 512, join(ROOT, 'assets/android-icon-foreground.png'));
await shot(
  `<!doctype html><style>html,body{margin:0;width:512px;height:512px;background:#0B1020}</style>`,
  512,
  512,
  join(ROOT, 'assets/android-icon-background.png'),
);
await shot(
  `<!doctype html><style>html,body{margin:0;width:432px;height:432px;background:transparent}
  .g{width:432px;height:432px;display:flex;align-items:center;justify-content:center;
  font:700 160px "Noto Serif Devanagari",serif;color:#fff}</style><div class="g">शु</div>`,
  432,
  432,
  join(ROOT, 'assets/android-icon-monochrome.png'),
);
await shot(iconHtml, 48, 48, join(ROOT, 'assets/favicon.png'));
await shot(featureHtml, 1024, 500, join(ROOT, 'store/play/feature-graphic.png'));
await shot(featureHtml, 1024, 500, join(ART, 'feature-graphic.png'));

await browser.close();
writeFileSync(join(ART, 'art-ok.txt'), 'ok\n');
console.log('store art done');
