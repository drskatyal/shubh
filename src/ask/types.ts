import type { Language, SkyState } from '../engine';

export type { Language, SkyState };

export type VerdictKind = 'now' | 'wait' | 'after';

export type AskVerdict = {
  verdict: VerdictKind;
  nextTime: string | null;
  reason: string;
  displayText: string;
};

export type AskAudio = {
  base64: string;
  mimeType: string;
};

export type AskSuccess = {
  ok: true;
  verdict: AskVerdict;
  remaining: number;
};

export type AskErrorCode = 'missing_key' | 'no_credits' | 'gemini' | 'parse' | 'mic';

export type AskFailure = {
  ok: false;
  error: AskErrorCode;
  message: string;
};

export type AskResult = AskSuccess | AskFailure;
