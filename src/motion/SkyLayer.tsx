import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/tokens';
import { SkyBackdrop } from './SkyBackdrop';
import type { MotionLocale, Verdict, WindowKind } from './types';

type SkyPatch = {
  windowKind?: WindowKind;
  verdict?: Verdict | null;
  locale?: MotionLocale;
  waiting?: boolean;
};

type SkyLayerValue = {
  windowKind: WindowKind;
  verdict: Verdict | null;
  locale: MotionLocale;
  waiting: boolean;
  setSky: (patch: SkyPatch) => void;
};

const SkyLayerContext = createContext<SkyLayerValue | null>(null);

export function useSkyLayer(): SkyLayerValue {
  const ctx = useContext(SkyLayerContext);
  if (!ctx) {
    throw new Error('useSkyLayer must sit under SkyLayerProvider');
  }
  return ctx;
}

export function useOptionalSkyLayer(): SkyLayerValue | null {
  return useContext(SkyLayerContext);
}

/**
 * One living sky for every level. Children are overlays — they must not mount
 * another SkyStage. Waiting intensifies this canvas; it does not remount it.
 */
export function SkyLayerProvider({ children }: { children: ReactNode }) {
  const [windowKind, setWindowKind] = useState<WindowKind>('shubh');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [locale, setLocale] = useState<MotionLocale>('en');
  const [waiting, setWaiting] = useState(false);

  const value = useMemo<SkyLayerValue>(
    () => ({
      windowKind,
      verdict,
      locale,
      waiting,
      setSky: (patch) => {
        if (patch.windowKind !== undefined) setWindowKind(patch.windowKind);
        if (patch.verdict !== undefined) setVerdict(patch.verdict);
        if (patch.locale !== undefined) setLocale(patch.locale);
        if (patch.waiting !== undefined) setWaiting(patch.waiting);
      },
    }),
    [windowKind, verdict, locale, waiting],
  );

  const line = locale === 'hi' ? 'आकाश पढ़ रहे हैं' : 'Reading the sky';

  return (
    <SkyLayerContext.Provider value={value}>
      <View style={styles.root}>
        <SkyBackdrop
          windowKind={windowKind}
          verdict={waiting ? 'wait' : verdict}
          locale={locale}
        />
        {waiting ? (
          <View style={[styles.wait, { pointerEvents: 'none' }]} accessibilityRole="progressbar" accessibilityLabel={line}>
            <Text style={styles.waitLine}>{line}</Text>
          </View>
        ) : null}
        <View style={styles.levels}>{children}</View>
      </View>
    </SkyLayerContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.night },
  levels: { flex: 1, zIndex: 1 },
  wait: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 7, 14, 0.18)',
  },
  waitLine: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 28,
  },
});
