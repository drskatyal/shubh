import type { Language } from '../../engine';
import type { NormalizedDay } from '../../tathaastu/types';
import { askedShaadiNow } from './shaadiNow';
import type { MarriageExtract } from './types';

export function buildExtractPrompt(input: {
  language: Language;
  typed?: string | null;
  previous?: MarriageExtract | null;
  dayContext?: NormalizedDay | null;
}): { system: string; userText: string } {
  const tongue = input.language === 'hi' ? 'Hindi (Devanagari or the speaker’s tongue)' : 'the speaker’s language';
  const system = [
    'Extract two people’s birth facts from speech or text. Return JSON only. No chat. No verse. No advice.',
    'Rules:',
    '- Do not preach. Do not interpret the match. Do not invent a kundli.',
    '- If a time was not spoken, leave hour and min null. Never invent, guess, or default a missing time (not 0, not 12:00, not sunrise).',
    '- If a date part was not spoken, leave that number null. Never invent a year.',
    '- Empty name or place → null, not a placeholder.',
    '- person_a is the first person / ladka / groom if gendered; person_b is the second / ladki / bride.',
    '- intent is match (guna milan), muhurat_marriage (when to marry / shaadi muhurat), or other.',
    `- question is a short restated ask in ${tongue}.`,
    '- If a previous JSON is supplied, fill only the missing fields from this new take. Keep every field that was already known unless the speaker clearly corrects it.',
    '- Today’s panchang JSON, if present, may be used only when they asked whether they can marry now (“ab shaadi kar sakte hain?”). Otherwise ignore it completely.',
  ].join('\n');

  const usePanchang = askedShaadiNow(input.typed) || askedShaadiNow(input.previous?.question);
  const dayLine =
    usePanchang && input.dayContext
      ? `\nToday’s panchang (use only because they asked if they can marry now):\n${JSON.stringify({
          tithi: input.dayContext.tithi,
          nakshatra: input.dayContext.nakshatra,
          yoga: input.dayContext.yoga,
          good: input.dayContext.good,
          avoid: input.dayContext.avoid,
        })}`
      : '';
  const prevLine = input.previous
    ? `\nPrevious extract (fill gaps only):\n${JSON.stringify(input.previous)}`
    : '';
  const asked = input.typed?.trim() ? `\nTyped words:\n${input.typed.trim()}` : '';
  const userText = `Language: ${input.language}${asked}${prevLine}${dayLine}\nExtract both births from the audio or text.`;
  return { system, userText };
}

const PERSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', nullable: true },
    day: { type: 'INTEGER', nullable: true },
    month: { type: 'INTEGER', nullable: true },
    year: { type: 'INTEGER', nullable: true },
    hour: { type: 'INTEGER', nullable: true },
    min: { type: 'INTEGER', nullable: true },
    place: { type: 'STRING', nullable: true },
  },
  required: ['name', 'day', 'month', 'year', 'hour', 'min', 'place'],
} as const;

export const EXTRACT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    person_a: PERSON_SCHEMA,
    person_b: PERSON_SCHEMA,
    intent: { type: 'STRING', enum: ['match', 'muhurat_marriage', 'other'] },
    question: { type: 'STRING' },
  },
  required: ['person_a', 'person_b', 'intent', 'question'],
} as const;
