import type { CreditWallet } from '../../billing/credits';
import type { Language } from '../../engine';
import type { NormalizedDay } from '../../tathaastu/types';
import type { AskAudio } from '../types';
import { extractBirths } from './extract';
import { mergeExtract } from './parse';
import type { MarriageExtract } from './types';

export type ExtractSuccess = {
  ok: true;
  extract: MarriageExtract;
  remaining: number;
};

export type ExtractFailure = {
  ok: false;
  error: 'missing_key' | 'no_credits' | 'parse' | 'mic';
  message: string;
};

export async function runExtract(opts: {
  audio?: AskAudio | null;
  text?: string | null;
  language: Language;
  wallet: CreditWallet;
  apiKey: string | null;
  previous?: MarriageExtract | null;
  dayContext?: NormalizedDay | null;
  consumeCredit?: boolean;
  extract?: typeof extractBirths;
}): Promise<ExtractSuccess | ExtractFailure> {
  if (!opts.audio?.base64 && !opts.text?.trim()) {
    return { ok: false, error: 'mic', message: 'Record both births in one take.' };
  }
  if (!opts.apiKey) {
    return {
      ok: false,
      error: 'missing_key',
      message: 'Ask is not connected. Point the app at the proxy, then rebuild.',
    };
  }
  const charge = opts.consumeCredit !== false && !opts.previous;
  if (charge && !opts.wallet.canAsk()) {
    return {
      ok: false,
      error: 'no_credits',
      message: 'No asks left. Take a month or a pack to keep going.',
    };
  }

  try {
    const extract = opts.extract ?? extractBirths;
    const next = await extract({
      apiKey: opts.apiKey,
      audio: opts.audio,
      text: opts.text,
      language: opts.language,
      previous: opts.previous,
      dayContext: opts.dayContext,
    });
    const merged = opts.previous ? mergeExtract(opts.previous, next) : next;
    const remaining = charge ? await opts.wallet.consume() : opts.wallet.remaining();
    return { ok: true, extract: merged, remaining };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not hear the births';
    const error = message.includes('invalid extract') || message.includes('JSON') ? 'parse' : 'parse';
    return { ok: false, error, message };
  }
}
