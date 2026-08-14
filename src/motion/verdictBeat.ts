import type { Verdict } from './types';

export const VERDICT_BEAT_MS = 1400;

export type VerdictBeat = {
  verdict: Verdict;
  startedAt: number;
  durationMs: number;
};

export function createVerdictBeat(verdict: Verdict, now: number): VerdictBeat {
  return { verdict, startedAt: now, durationMs: VERDICT_BEAT_MS };
}

export function verdictBeatProgress(beat: VerdictBeat | null, now: number): number {
  if (!beat) {
    return 0;
  }
  const p = (now - beat.startedAt) / beat.durationMs;
  if (p <= 0) {
    return 0;
  }
  if (p >= 1) {
    return 1;
  }
  return p;
}

/** 0 → 1 → 0. Reduce Motion callers should skip this and hold a still tint. */
export function verdictBeatEnvelope(progress: number): number {
  'worklet';
  if (progress <= 0 || progress >= 1) {
    return 0;
  }
  return Math.sin(progress * Math.PI);
}
