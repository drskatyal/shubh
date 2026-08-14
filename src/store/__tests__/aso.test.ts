import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  APPLE_KEYWORDS_MAX,
  APPLE_PROMO_MAX,
  APPLE_SUBTITLE_MAX,
  APPLE_TITLE_MAX,
  PLAY_SHORT_MAX,
  STORE_BANNED,
  STORE_SCREENSHOTS,
  appleEn,
  appleHi,
  keywordsOverlapTitle,
  playEn,
  playHi,
} from '../aso';

const LISTING = [appleEn, appleHi, playEn, playHi];

describe('store ASO', () => {
  it('keeps Apple title, subtitle, and keywords inside limits', () => {
    expect(appleEn.title.length).toBeLessThanOrEqual(APPLE_TITLE_MAX);
    expect(appleHi.title.length).toBeLessThanOrEqual(APPLE_TITLE_MAX);
    expect(appleEn.subtitle.length).toBeLessThanOrEqual(APPLE_SUBTITLE_MAX);
    expect(appleHi.subtitle.length).toBeLessThanOrEqual(APPLE_SUBTITLE_MAX);
    expect(appleEn.keywords.length).toBeLessThanOrEqual(APPLE_KEYWORDS_MAX);
    expect(appleHi.keywords.length).toBeLessThanOrEqual(APPLE_KEYWORDS_MAX);
    expect(appleEn.promotionalText.length).toBeLessThanOrEqual(APPLE_PROMO_MAX);
    expect(appleHi.promotionalText.length).toBeLessThanOrEqual(APPLE_PROMO_MAX);
    expect(appleEn.title).toMatch(/Shubh/i);
    expect(appleEn.title).toMatch(/panchang/i);
    expect(appleEn.title).toMatch(/kundli|milan/i);
    expect(appleHi.title).toMatch(/शुभ/);
    expect(appleHi.title).toMatch(/पंचांग/);
    expect(appleHi.title).toMatch(/कुंडली|मिलान/);
    expect(appleEn.subtitle).toMatch(/rahu|muhurat|festival/i);
    expect(appleHi.subtitle).toMatch(/राहु|मुहूर्त|त्योहार/);
  });

  it('does not repeat title words in Apple keywords', () => {
    expect(keywordsOverlapTitle(appleEn.title, appleEn.keywords)).toEqual([]);
    expect(keywordsOverlapTitle(appleHi.title, appleHi.keywords)).toEqual([]);
    expect(appleEn.keywords).toMatch(/guna milan/);
    expect(appleEn.keywords).toMatch(/rahukaal/);
    expect(appleEn.keywords).toMatch(/choghadiya/);
    expect(appleEn.keywords).toMatch(/shaadi|vivah/);
    expect(appleHi.keywords).toMatch(/गुण मिलान/);
  });

  it('keeps Play short descriptions inside 80 characters and search-rich', () => {
    expect(playEn.shortDescription.length).toBeLessThanOrEqual(PLAY_SHORT_MAX);
    expect(playHi.shortDescription.length).toBeLessThanOrEqual(PLAY_SHORT_MAX);
    expect(playHi.shortDescription).toMatch(/पंचांग/);
    expect(playHi.shortDescription).toMatch(/गुण मिलान/);
    expect(playHi.shortDescription).toMatch(/कुंडली/);
    expect(playHi.fullDescription).toMatch(/राहुकाल/);
    expect(playHi.fullDescription).toMatch(/मुहूर्त/);
    expect(playHi.fullDescription).toMatch(/चौघड़िया/);
    expect(playHi.fullDescription).toMatch(/विवाह|शादी/);
  });

  it('never names a model in listing copy or the paste doc', () => {
    const blob = LISTING.flatMap((row) => Object.values(row)).join('\n');
    expect(blob).not.toMatch(STORE_BANNED);
    const doc = readFileSync(new URL('../../../docs/STORE-ASO.md', import.meta.url), 'utf8');
    expect(doc).not.toMatch(/gemini|openai|chatgpt|grok|\bllm\b|chatbot/i);
    const locales = [
      readFileSync(new URL('../../../store/locales/en.json', import.meta.url), 'utf8'),
      readFileSync(new URL('../../../store/locales/hi.json', import.meta.url), 'utf8'),
    ].join('\n');
    expect(locales).not.toMatch(STORE_BANNED);
  });

  it('puts milan, panchang, then muhurat first — never a chat shot', () => {
    expect(STORE_SCREENSHOTS.map((shot) => shot.kind)).toEqual(['milan', 'panchang', 'muhurat']);
    const frames = readFileSync(new URL('../frames/StoreFrames.tsx', import.meta.url), 'utf8');
    expect(frames).not.toMatch(/AskComposer|chat bubble|iMessage|ChatGPT/i);
    expect(frames).toMatch(/ScoreCard/);
    expect(frames).toMatch(/ShareCard/);
    expect(frames).toMatch(/Marriage muhurat/);
  });
});
