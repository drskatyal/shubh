import { getAskProxyUrl } from '../../config/env';
import type { Language } from '../../engine';
import type { NormalizedDay } from '../../tathaastu/types';
import { GEMINI_MODEL } from '../prompt';
import type { AskAudio } from '../types';
import type { FetchLike } from '../gemini';
import { parseExtract } from './parse';
import { buildExtractPrompt, EXTRACT_SCHEMA } from './prompt';
import type { MarriageExtract } from './types';

type ModelResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

function readText(payload: ModelResponse): string {
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();
  if (!text) {
    throw new Error(payload.error?.message ?? 'Extract returned no text');
  }
  return text;
}

export async function extractBirths(opts: {
  apiKey: string;
  audio?: AskAudio | null;
  text?: string | null;
  language: Language;
  previous?: MarriageExtract | null;
  dayContext?: NormalizedDay | null;
  fetchImpl?: FetchLike;
}): Promise<MarriageExtract> {
  const { system, userText } = buildExtractPrompt({
    language: opts.language,
    typed: opts.text,
    previous: opts.previous,
    dayContext: opts.dayContext,
  });
  const proxy = getAskProxyUrl();
  const url = proxy
    ? `${proxy.replace(/\/$/, '')}/ask`
    : `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const parts: Array<Record<string, unknown>> = [{ text: userText }];
  if (opts.audio?.base64) {
    parts.push({
      inlineData: {
        mimeType: opts.audio.mimeType,
        data: opts.audio.base64,
      },
    });
  }

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: EXTRACT_SCHEMA,
      thinkingConfig: { thinkingLevel: 'LOW' },
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
    throw new Error(`Ask ${res.status}: ${raw.slice(0, 240)}`);
  }
  const payload = JSON.parse(raw) as ModelResponse;
  return parseExtract(readText(payload));
}
