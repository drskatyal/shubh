import type { CreditWallet } from '../billing/credits';
import type { Language, SkyState } from '../engine';
import type { ChartAskSummary, NormalizedDay } from '../tathaastu/types';
import { askGemini } from './gemini';
import { speakVerdict } from './speakVerdict';
import type { AskAudio, AskResult } from './types';

export async function runAsk(opts: {
  audio?: AskAudio | null;
  text?: string | null;
  sky: SkyState;
  language: Language;
  wallet: CreditWallet;
  apiKey: string | null;
  dayContext?: NormalizedDay | null;
  chartContext?: ChartAskSummary | null;
  ask?: typeof askGemini;
}): Promise<AskResult> {
  if (!opts.audio?.base64 && !opts.text?.trim()) {
    return {
      ok: false,
      error: 'mic',
      message: 'Speak or write what you want to ask.',
    };
  }
  if (!opts.apiKey) {
    return {
      ok: false,
      error: 'missing_key',
      message: 'Ask is not connected. Point the app at the proxy, then rebuild.',
    };
  }
  if (!opts.wallet.canAsk()) {
    return {
      ok: false,
      error: 'no_credits',
      message: 'No asks left. Take a month or a pack to keep going.',
    };
  }

  try {
    const ask = opts.ask ?? askGemini;
    const verdict = await ask({
      apiKey: opts.apiKey,
      audio: opts.audio,
      text: opts.text,
      sky: opts.sky,
      language: opts.language,
      dayContext: opts.dayContext,
      chartContext: opts.chartContext,
    });
    const remaining = await opts.wallet.consume();
    await speakVerdict(verdict);
    return { ok: true, verdict, remaining };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ask failed';
    const error = message.includes('invalid verdict') || message.includes('JSON')
      ? 'parse'
      : 'gemini';
    return { ok: false, error, message };
  }
}
