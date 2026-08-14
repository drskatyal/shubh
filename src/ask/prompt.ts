import type { Language, SkyState } from '../engine';

export const GEMINI_MODEL = 'gemini-3.1-flash-lite';

export function buildAskPrompt(
  sky: SkyState,
  language: Language,
  dayContext?: Record<string, unknown> | null,
): { system: string; userText: string } {
  const tongue = language === 'hi' ? 'Hindi (Devanagari)' : 'English';
  const system = [
    'You are Shubh’s classifier and explainer. You map a spoken task onto today’s computed sky.',
    'Rules:',
    '- Use ONLY the clocks in the sky JSON. Never invent, estimate, round, or convert times.',
    '- If the JSON says Rahu ends at 14:12, the answer uses 14:12 — not 2pm, not 14:15.',
    '- You are not a priest. No kundli, no horoscope, no birth chart, no rashifal.',
    '- Verdict is exactly one of: now, wait, after.',
    '  - now: the task can start in the current window.',
    '  - wait: stay put until a specific clock that already appears in the JSON; set nextTime to that clock.',
    '  - after: the next suitable window is later today (or there is none left); set nextTime to a clock from the JSON when one exists.',
    `- Write reason and displayText in ${tongue}.`,
    '- If the audio is unclear, treat it as a generic “starting something new” and say so.',
    'Reply with JSON only, matching the schema.',
  ].join('\n');

  const parts = [
    `Language: ${language}`,
    `Sky for this city, this minute:\n${JSON.stringify(sky)}`,
  ];
  if (dayContext) {
    parts.push(`TathaAstu day-context:\n${JSON.stringify(dayContext)}`);
  }
  return { system, userText: parts.join('\n\n') };
}

export const VERDICT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: { type: 'STRING', enum: ['now', 'wait', 'after'] },
    nextTime: {
      type: 'STRING',
      nullable: true,
      description: 'A clock string copied from the sky JSON, or empty.',
    },
    reason: { type: 'STRING' },
    displayText: { type: 'STRING' },
  },
  required: ['verdict', 'reason', 'displayText'],
} as const;
