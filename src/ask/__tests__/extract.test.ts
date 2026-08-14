import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CreditWallet, MemoryCreditStore } from '../../billing/credits';
import { geocodePlace, personToBirth } from '../marriage/geo';
import { extractBirths } from '../marriage/extract';
import type { FetchLike } from '../gemini';
import {
  applyField,
  mergeExtract,
  missingFields,
  parseExtract,
} from '../marriage/parse';
import { buildExtractPrompt, EXTRACT_SCHEMA } from '../marriage/prompt';
import { runExtract } from '../marriage/runExtract';
import { askedShaadiNow, looksLikeMarriageAsk } from '../marriage/shaadiNow';
import type { MarriageExtract } from '../marriage/types';
import { RECORD_PROMPT } from '../marriage/copy';

const FULL: MarriageExtract = {
  person_a: {
    name: 'Arjun',
    day: 12,
    month: 3,
    year: 1992,
    hour: 6,
    min: 15,
    place: 'Delhi',
  },
  person_b: {
    name: 'Priya',
    day: 4,
    month: 8,
    year: 1994,
    hour: 14,
    min: 40,
    place: 'Mumbai',
  },
  intent: 'match',
  question: 'Dono ka milan batao',
};

describe('marriage extract', () => {
  it('parses JSON and treats 0 date parts as missing, not midnight as missing', () => {
    const parsed = parseExtract(
      JSON.stringify({
        person_a: { name: 'Arjun', day: 0, month: 3, year: 1992, hour: 0, min: 0, place: '' },
        person_b: { name: '', day: 4, month: 8, year: 1994, hour: 14, min: 40, place: 'Bombay' },
        intent: 'match',
        question: 'milan',
      }),
    );
    assert.equal(parsed.person_a.day, null);
    assert.equal(parsed.person_a.hour, 0);
    assert.equal(parsed.person_a.min, 0);
    assert.equal(parsed.person_a.place, null);
    assert.equal(parsed.person_b.name, null);
    assert.equal(parsed.person_b.place, 'Bombay');
  });

  it('does not invent a missing time when listing gaps', () => {
    const gaps = missingFields({
      ...FULL,
      person_a: { ...FULL.person_a, hour: null, min: null },
    });
    assert.deepEqual(
      gaps.map((row) => row.hint),
      ['Arjun ka samay?'],
    );
  });

  it('patches a short take onto the previous extract', () => {
    const prev = parseExtract(JSON.stringify({ ...FULL, person_a: { ...FULL.person_a, hour: null, min: null } }));
    const next = parseExtract(
      JSON.stringify({
        person_a: { name: null, day: null, month: null, year: null, hour: 7, min: 30, place: null },
        person_b: { name: null, day: null, month: null, year: null, hour: null, min: null, place: null },
        intent: 'other',
        question: '',
      }),
    );
    const merged = mergeExtract(prev, next);
    assert.equal(merged.person_a.name, 'Arjun');
    assert.equal(merged.person_a.hour, 7);
    assert.equal(merged.person_a.min, 30);
    assert.equal(merged.intent, 'match');
    assert.equal(merged.person_b.name, 'Priya');
  });

  it('geocodes Hindi/English city names and aliases', () => {
    const delhi = geocodePlace('दिल्ली');
    assert.ok(delhi);
    assert.ok(Math.abs(delhi.lat - 28.6139) < 0.01);
    const bombay = geocodePlace('Bombay');
    assert.ok(bombay);
    assert.ok(Math.abs(bombay.lat - 19.076) < 0.01);
    const birth = personToBirth(FULL.person_a);
    assert.ok(birth);
    assert.equal(birth.date_of_birth, '1992-03-12');
    assert.equal(birth.time_of_birth, '06:15');
    assert.equal(birth.place_name, 'Delhi');
  });

  it('tap-to-fix writes one field without a 12-box form', () => {
    const next = applyField(FULL, 'a', 'time', '08:05');
    assert.equal(next.person_a.hour, 8);
    assert.equal(next.person_a.min, 5);
    assert.equal(next.person_b.name, 'Priya');
  });

  it('stuffs panchang only when they asked ab shaadi kar sakte hain', () => {
    const day = {
      date: '2026-08-14',
      tithi: { name: 'Dwitiya', paksha: 'SHUKLA' },
      nakshatra: { name: 'Purva Phalguni' },
      yoga: { name: 'Parigha' },
      karana: { name: 'Balava' },
      festivals: [],
      good: ['Abhijit'],
      avoid: ['Rahu'],
      rahu: { name: 'Rahu', start: '12:24', end: '14:12' },
      yamaganda: null,
      gulika: null,
      abhijit: null,
    };
    const ignore = buildExtractPrompt({ language: 'hi', typed: 'dono ka milan', dayContext: day });
    assert.doesNotMatch(ignore.userText, /Today’s panchang/);
    assert.match(ignore.system, /Do not invent/);
    assert.match(ignore.system, /leave hour and min null/);
    const use = buildExtractPrompt({
      language: 'hi',
      typed: 'ab shaadi kar sakte hain?',
      dayContext: day,
    });
    assert.match(use.userText, /Today’s panchang/);
    assert.match(use.userText, /Dwitiya/);
    assert.equal(EXTRACT_SCHEMA.properties.intent.enum.includes('muhurat_marriage'), true);
    assert.ok(askedShaadiNow('ab shaadi kar sakte hain?'));
    assert.ok(looksLikeMarriageAsk('guna milan batao'));
    assert.equal(looksLikeMarriageAsk('ghar se nikalun?'), false);
    assert.match(RECORD_PROMPT, /ek baar mein/);
  });

  it('sends audio in one HTTP call and asks for JSON only', async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl: FetchLike = async (url, init) => {
      calls.push({ url, body: init.body });
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({
            candidates: [{ content: { parts: [{ text: JSON.stringify(FULL) }] } }],
          });
        },
      };
    };
    const extracted = await extractBirths({
      apiKey: 'test-key',
      audio: { base64: 'AAAA', mimeType: 'audio/m4a' },
      language: 'hi',
      fetchImpl,
    });
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /gemini-3\.1-flash-lite:generateContent/);
    const payload = JSON.parse(calls[0].body) as {
      systemInstruction: { parts: Array<{ text: string }> };
      contents: Array<{ parts: Array<Record<string, unknown>> }>;
    };
    assert.match(payload.systemInstruction.parts[0].text, /Do not preach/);
    assert.match(payload.systemInstruction.parts[0].text, /Never invent/);
    assert.deepEqual(payload.contents[0].parts[1].inlineData, {
      mimeType: 'audio/m4a',
      data: 'AAAA',
    });
    assert.equal(extracted.person_a.name, 'Arjun');
  });

  it('consumes one credit on first extract and not on a patch', async () => {
    const wallet = await CreditWallet.open(new MemoryCreditStore(), { devUnlock: false });
    assert.equal(wallet.remaining(), 1);
    const first = await runExtract({
      text: 'Arjun aur Priya',
      language: 'hi',
      wallet,
      apiKey: 'test',
      extract: async () => ({
        ...FULL,
        person_a: { ...FULL.person_a, hour: null, min: null },
      }),
    });
    assert.equal(first.ok, true);
    assert.equal(wallet.remaining(), 0);
    const patch = await runExtract({
      text: 'saat baje',
      language: 'hi',
      wallet,
      apiKey: 'test',
      previous: first.ok ? first.extract : undefined,
      consumeCredit: false,
      extract: async () => ({
        person_a: { name: null, day: null, month: null, year: null, hour: 7, min: 0, place: null },
        person_b: { name: null, day: null, month: null, year: null, hour: null, min: null, place: null },
        intent: 'other',
        question: '',
      }),
    });
    assert.equal(patch.ok, true);
    if (patch.ok) {
      assert.equal(patch.extract.person_a.hour, 7);
      assert.equal(patch.extract.person_a.name, 'Arjun');
    }
    assert.equal(wallet.remaining(), 0);
  });
});
