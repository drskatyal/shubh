import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/tokens';
import { useOptionalSkyLayer } from './SkyLayer';
import { SkyBackdrop } from './SkyBackdrop';
import type { MotionLocale, Verdict, WindowKind } from './types';

type Props = {
  visible?: boolean;
  compact?: boolean;
  locale?: MotionLocale;
  windowKind?: WindowKind;
  verdict?: Verdict | null;
  label?: string;
};

/**
 * Intensifies the shared SkyStage when a layer exists.
 * Compact fallback mounts a local sky only in tests / isolated hosts.
 */
export function DivineWait({
  visible = true,
  compact = false,
  locale = 'en',
  windowKind = 'shubh',
  verdict = 'wait',
  label,
}: Props) {
  const layer = useOptionalSkyLayer();
  const line = label ?? (locale === 'hi' ? 'आकाश पढ़ रहे हैं' : 'Reading the sky');

  useEffect(() => {
    if (!layer) return;
    layer.setSky({ waiting: visible, locale, windowKind, verdict: visible ? 'wait' : verdict });
    return () => layer.setSky({ waiting: false });
  }, [layer, visible, locale, windowKind, verdict]);

  if (!visible) return null;
  if (layer) {
    return compact ? (
      <View style={styles.compactLabel} accessibilityRole="progressbar" accessibilityLabel={line}>
        <Text style={styles.line}>{line}</Text>
      </View>
    ) : null;
  }

  return (
    <View
      style={[styles.host, compact ? styles.compact : styles.fill]}
      pointerEvents="none"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={line}
    >
      <SkyBackdrop windowKind={windowKind} verdict={verdict} locale={locale} />
      <View style={styles.veil} />
      <Text style={styles.line}>{line}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  compact: {
    height: 168,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.goldLine,
    marginVertical: 8,
  },
  compactLabel: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 7, 14, 0.28)',
  },
  line: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 8,
    zIndex: 1,
  },
});
