import type { CreditWallet } from '../billing/credits';
import type { Language, SkyState } from '../engine';
import type { NormalizedDay } from '../tathaastu/types';
import { askGemini } from './gemini';
import { speakVerdict } from './speakVerdict';
import type { AskAudio, AskResult } from './types';

export async function runAsk(opts: {
  audio: AskAudio;
  sky: SkyState;
  language: Language;
  wallet: CreditWallet;
  apiKey: string | null;
  dayContext?: NormalizedDay | null;
  ask?: typeof askGemini;
}): Promise<AskResult> {
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
    const ask = opts.ask ?? askGemini;
    const verdict = await ask({
      apiKey: opts.apiKey,
      audio: opts.audio,
      sky: opts.sky,
      language: opts.language,
      dayContext: opts.dayContext,
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
