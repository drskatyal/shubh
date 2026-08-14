import { useCallback, useState } from 'react';
import {
  Easing,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { Verdict } from './types';
import { VERDICT_BEAT_MS } from './verdictBeat';

export type VerdictBeatHandle = {
  intensity: SharedValue<number>;
  activeVerdict: Verdict | null;
  playVerdict: (verdict: Verdict) => void;
};

/**
 * Short result beat when an ask lands. Home can ignore this and pass a
 * sustained `verdict` into `SkyStage` instead.
 */
export function useVerdictBeat(reduceMotion = false): VerdictBeatHandle {
  const intensity = useSharedValue(0);
  const [activeVerdict, setActiveVerdict] = useState<Verdict | null>(null);

  const playVerdict = useCallback(
    (verdict: Verdict) => {
      setActiveVerdict(verdict);
      if (reduceMotion) {
        intensity.value = 0;
        return;
      }
      intensity.value = 0;
      intensity.value = withSequence(
        withTiming(1, {
          duration: VERDICT_BEAT_MS / 2,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, {
          duration: VERDICT_BEAT_MS / 2,
          easing: Easing.in(Easing.cubic),
        }),
      );
    },
    [intensity, reduceMotion],
  );

  return { intensity, activeVerdict, playVerdict };
}
