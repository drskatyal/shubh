import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  APPLE_KEYWORDS_MAX,
  APPLE_PROMO_MAX,
  APPLE_SUBTITLE_MAX,
  APPLE_TITLE_MAX,
  PLAY_FULL_NEEDLES,
  PLAY_SHORT_MAX,
  PLAY_SHORT_NEEDLES,
  PLAY_TITLE_MAX,
  STORE_BANNED,
  STORE_PHONE_SHOTS,
  STORE_SCREENSHOTS,
  LEGAL_PRIVACY_URL,
  LEGAL_SUPPORT_URL,
  appleEn,
  appleHi,
  assertStoreLimits,
  keywordsOverlapTitle,
  playEn,
  playHi,
} from '../aso';

const LISTING = [appleEn, appleHi, playEn, playHi];

function readListing(name: 'hi-IN' | 'en-IN') {
  return JSON.parse(
    readFileSync(new URL(`../../../store/play/${name}.json`, import.meta.url), 'utf8'),
  ) as {
    locale: string;
    defaultListing: boolean;
    title: string;
    shortDescription: string;
    fullDescription: string;
    whatsNew: string;
  };
}

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

  it('locks Play title to 30 and the Hindi-first short search line', () => {
    expect(playHi.title.length).toBeLessThanOrEqual(PLAY_TITLE_MAX);
    expect(playEn.title.length).toBeLessThanOrEqual(PLAY_TITLE_MAX);
    expect(playHi.title).toMatch(/शुभ/);
    expect(playHi.title).toMatch(/पंचांग/);
    expect(playHi.title).toMatch(/कुंडली|मिलान/);
    expect(playEn.title).toMatch(/Shubh/i);
    expect(playEn.title).toMatch(/panchang/i);
    expect(playEn.title).toMatch(/kundli|milan/i);
    expect(playHi.shortDescription.length).toBeLessThanOrEqual(PLAY_SHORT_MAX);
    expect(playEn.shortDescription.length).toBeLessThanOrEqual(PLAY_SHORT_MAX);
    const shortHay = `${playHi.shortDescription} ${playEn.shortDescription}`.toLowerCase();
    for (const needle of PLAY_SHORT_NEEDLES) {
      expect(shortHay).toContain(needle);
    }
    expect(playHi.shortDescription.startsWith('आज')).toBe(true);
  });

  it('writes Play full copy as natural sentences, Hindi first, not a keyword dump', () => {
    const fullHay = `${playHi.fullDescription} ${playEn.fullDescription}`.toLowerCase();
    for (const needle of PLAY_FULL_NEEDLES) {
      expect(fullHay).toContain(needle);
    }
    expect(playHi.fullDescription).toMatch(/राहुकाल/);
    expect(playHi.fullDescription).toMatch(/मुहूर्त/);
    expect(playHi.fullDescription).toMatch(/चौघड़िया/);
    expect(playHi.fullDescription).toMatch(/विवाह|शादी/);
    expect(playHi.fullDescription).not.toMatch(/खोज शब्द/);
    expect(playEn.fullDescription).not.toMatch(/Search words this listing/i);
    const hindiStart = playHi.fullDescription.trimStart();
    expect(hindiStart.charCodeAt(0)).toBeGreaterThan(0x0900);
    expect(assertStoreLimits).not.toThrow();
  });

  it('treats Hindi Play locale as its own default listing', () => {
    const hi = readListing('hi-IN');
    const en = readListing('en-IN');
    expect(hi.locale).toBe('hi-IN');
    expect(hi.defaultListing).toBe(true);
    expect(en.locale).toBe('en-IN');
    expect(en.defaultListing).toBe(false);
    expect(hi.title).toBe(playHi.title);
    expect(hi.shortDescription).toBe(playHi.shortDescription);
    expect(hi.fullDescription).toBe(playHi.fullDescription);
    expect(en.title).toBe(playEn.title);
    expect(en.shortDescription).toBe(playEn.shortDescription);
    expect(en.fullDescription).toBe(playEn.fullDescription);
  });

  it('never names a model in listing copy or the paste doc', () => {
    const blob = LISTING.flatMap((row) => Object.values(row)).join('\n');
    expect(blob).not.toMatch(STORE_BANNED);
    const doc = readFileSync(new URL('../../../docs/STORE-ASO.md', import.meta.url), 'utf8');
    expect(doc).not.toMatch(/gemini|openai|chatgpt|grok|\bllm\b|chatbot/i);
    expect(doc.startsWith('# Store ASO — Play first')).toBe(true);
    expect(doc).toMatch(/Closed testing in India/);
    expect(doc).toMatch(/hi-IN/);
    expect(doc.indexOf('## Play — Hindi')).toBeLessThan(doc.indexOf('## Apple'));
    const locales = [
      readFileSync(new URL('../../../store/locales/en.json', import.meta.url), 'utf8'),
      readFileSync(new URL('../../../store/locales/hi.json', import.meta.url), 'utf8'),
    ].join('\n');
    expect(locales).not.toMatch(STORE_BANNED);
  });

  it('puts feature graphic, then milan, panchang, muhurat — never a chat shot', () => {
    expect(STORE_SCREENSHOTS.map((shot) => shot.kind)).toEqual([
      'feature',
      'milan',
      'panchang',
      'muhurat',
    ]);
    expect(STORE_SCREENSHOTS[0]?.size).toBe('1024x500');
    expect(STORE_PHONE_SHOTS.map((shot) => shot.kind)).toEqual(['milan', 'panchang', 'muhurat']);
    const frames = readFileSync(new URL('../frames/StoreFrames.tsx', import.meta.url), 'utf8');
    expect(frames).not.toMatch(/AskComposer|chat bubble|iMessage|ChatGPT/i);
    expect(frames).toMatch(/FeatureGraphic|1024/);
    expect(frames).toMatch(/ScoreCard/);
    expect(frames).toMatch(/ShareCard/);
    expect(frames).toMatch(/Marriage muhurat/);
  });

  it('ships App Store Connect paste files with github.io URLs', () => {
    const en = JSON.parse(
      readFileSync(new URL('../../../store/ios/en-US.json', import.meta.url), 'utf8'),
    ) as typeof appleEn & {
      privacyUrl: string;
      supportUrl: string;
      reviewNotes: string;
      demoAccount: string;
      primaryCategory: string;
      copyright: string;
    };
    const hi = JSON.parse(
      readFileSync(new URL('../../../store/ios/hi.json', import.meta.url), 'utf8'),
    ) as typeof appleHi;
    expect(en.name).toBe(appleEn.title);
    expect(en.subtitle).toBe(appleEn.subtitle);
    expect(en.keywords).toBe(appleEn.keywords);
    expect(en.promotionalText).toBe(appleEn.promotionalText);
    expect(en.description).toBe(appleEn.description);
    expect(hi.name).toBe(appleHi.title);
    expect(hi.subtitle).toBe(appleHi.subtitle);
    expect(en.privacyUrl).toBe(LEGAL_PRIVACY_URL);
    expect(en.supportUrl).toBe(LEGAL_SUPPORT_URL);
    expect(en.demoAccount).toBe('No login.');
    expect(en.primaryCategory).toBe('Lifestyle');
    expect(en.copyright).toBe('2026 Sanyam Katyal');
    expect(en.reviewNotes).toMatch(/No login/);
    expect(en.reviewNotes).toMatch(/connect later/);
    expect(en.reviewNotes).not.toMatch(STORE_BANNED);
    const config = readFileSync(new URL('../../../app.config.ts', import.meta.url), 'utf8');
    expect(config).toMatch(/ITSAppUsesNonExemptEncryption:\s*false/);
    const submit = readFileSync(new URL('../../../docs/SUBMIT.md', import.meta.url), 'utf8');
    expect(submit).toMatch(/drskatyal\.github\.io\/shubh\/privacy\.html/);
    expect(submit).not.toMatch(/https:\/\/<host>/);
  });
});
