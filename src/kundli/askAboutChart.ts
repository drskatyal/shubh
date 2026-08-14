import type { CreditWallet } from '../billing/credits';
import type { FetchLike } from '../ask/gemini';
import { GEMINI_MODEL, VERDICT_SCHEMA } from '../ask/prompt';
import { extractJsonObject } from '../ask/parseVerdict';
import type { AskAudio, AskResult, AskVerdict, VerdictKind } from '../ask/types';
import type { Language } from '../engine';
import { chartSummaryHasBirthPii } from '../tathaastu/normalize';
import type { ChartAskSummary } from '../tathaastu/types';

export function buildChartAskPrompt(
  summary: ChartAskSummary,
  language: Language,
): { system: string; userText: string } {
  const tongue = language === 'hi' ? 'Hindi (Devanagari)' : 'English';
  const system = [
    'You are Shubh’s chart explainer. The user already generated a kundli and tapped Ask about this chart.',
    'Rules:',
    '- Use ONLY the chart summary JSON. It has lagna, moon, planets, and a dasha teaser.',
    '- Never ask for or invent a birth date, birth time, latitude, longitude, or timezone.',
    '- Do not request documents, PDFs, or premium reports.',
    '- Verdict is exactly one of: now, wait, after — about acting on what the summary already shows, not a new horoscope.',
    `- Write reason and displayText in ${tongue}.`,
    'Reply with JSON only, matching the schema.',
  ].join('\n');

  const userText = `Language: ${language}\nComputed chart summary (no birth PII):\n${JSON.stringify(summary)}`;
  return { system, userText };
}

function asVerdict(value: unknown): VerdictKind {
  if (value === 'now' || value === 'wait' || value === 'after') return value;
  throw new Error('Model returned an invalid verdict');
}

export function parseChartAskVerdict(raw: string): AskVerdict {
  const json = extractJsonObject(raw);
  const reason = typeof json.reason === 'string' ? json.reason.trim() : '';
  const displayText = typeof json.displayText === 'string' ? json.displayText.trim() : '';
  if (!reason || !displayText) {
    throw new Error('Model omitted reason or displayText');
  }
  return {
    verdict: asVerdict(json.verdict),
    nextTime: null,
    reason,
    displayText,
  };
}

export async function askGeminiAboutChart(opts: {
  apiKey: string;
  audio: AskAudio;
  summary: ChartAskSummary;
  language: Language;
  fetchImpl?: FetchLike;
}): Promise<AskVerdict> {
  if (chartSummaryHasBirthPii(opts.summary)) {
    throw new Error('Chart summary must not include birth date, time, or place');
  }
  const { system, userText } = buildChartAskPrompt(opts.summary, opts.language);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: userText },
          {
            inlineData: {
              mimeType: opts.audio.mimeType,
              data: opts.audio.base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: VERDICT_SCHEMA,
    },
  };

  const fetchImpl = opts.fetchImpl ?? (fetch as FetchLike);
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${raw.slice(0, 240)}`);
  }
  const payload = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();
  if (!text) {
    throw new Error(payload.error?.message ?? 'Gemini returned no text');
  }
  return parseChartAskVerdict(text);
}

export async function askAboutChart(opts: {
  audio: AskAudio;
  summary: ChartAskSummary;
  language: Language;
  wallet: CreditWallet;
  apiKey: string | null;
  armed: boolean;
  ask?: typeof askGeminiAboutChart;
}): Promise<AskResult> {
  if (!opts.armed) {
    return {
      ok: false,
      error: 'gemini',
      message: 'Chart ask stays off until the user taps Ask about this chart.',
    };
  }
  if (chartSummaryHasBirthPii(opts.summary)) {
    return {
      ok: false,
      error: 'gemini',
      message: 'Refusing to send birth date, time, or place to Gemini.',
    };
  }
  if (!opts.apiKey) {
    return {
      ok: false,
      error: 'missing_key',
      message:
        'Gemini is not configured. Set GEMINI_API_KEY in your env or as an EAS secret, then rebuild. The key is never committed.',
    };
  }
  if (!opts.wallet.canAsk()) {
    return {
      ok: false,
      error: 'no_credits',
      message: 'No asks left. Buy a month or a pack to keep going.',
    };
  }

  try {
    const ask = opts.ask ?? askGeminiAboutChart;
    const verdict = await ask({
      apiKey: opts.apiKey,
      audio: opts.audio,
      summary: opts.summary,
      language: opts.language,
    });
    const remaining = await opts.wallet.consume();
    return { ok: true, verdict, remaining };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ask failed';
    return { ok: false, error: 'gemini', message };
  }
}
