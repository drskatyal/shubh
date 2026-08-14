import { getAskProxyUrl, getGeminiApiKey } from '../config/env';
import type { Language, SkyState } from '../engine';
import type { ChartAskSummary, NormalizedDay } from '../tathaastu/types';
import { GEMINI_MODEL, VERDICT_SCHEMA, buildAskPrompt } from './prompt';
import { parseVerdict } from './parseVerdict';
import type { AskAudio, AskVerdict } from './types';

export { getGeminiApiKey };

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

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
    throw new Error(payload.error?.message ?? 'Ask returned no text');
  }
  return text;
}

export async function askGemini(opts: {
  apiKey: string;
  audio?: AskAudio | null;
  text?: string | null;
  sky: SkyState;
  language: Language;
  dayContext?: NormalizedDay | null;
  chartContext?: ChartAskSummary | null;
  fetchImpl?: FetchLike;
}): Promise<AskVerdict> {
  const { system, userText } = buildAskPrompt(
    opts.sky,
    opts.language,
    opts.dayContext,
    opts.chartContext,
    opts.text,
  );
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
      responseSchema: VERDICT_SCHEMA,
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
  return parseVerdict(readText(payload), opts.sky);
}
