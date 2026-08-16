import { useRef, type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../i18n/strings';
import { color } from '../theme/tokens';
import { tapHaptic } from '../ui/haptics';
import { shareCard, type CaptureHandle } from './captureCard';

type ShotProps = {
  children: ReactNode;
  options?: { format: string; quality: number; result: string };
};

function maybeViewShot(): ForwardRefExoticComponent<
  ShotProps & RefAttributes<CaptureHandle>
> | null {
  try {
    return require('react-native-view-shot').default;
  } catch {
    return null;
  }
}

export function ShareImageCard({
  kicker,
  title,
  lines,
  shareLabel,
  language,
  payload,
  branded = true,
}: {
  kicker: string;
  title: string;
  lines: string[];
  shareLabel: string;
  language: Language;
  payload: string;
  branded?: boolean;
}) {
  const ref = useRef<CaptureHandle>(null);
  const ViewShot = maybeViewShot();
  const card = (
    <View style={styles.card} accessibilityRole="summary">
      {branded ? <Text style={styles.brandMark}>{language === 'hi' ? 'शुभ' : 'Shubh'}</Text> : null}
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      {lines.filter(Boolean).map((line) => (
        <Text key={line} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {ViewShot ? (
        <ViewShot ref={ref} options={{ format: 'png', quality: 1, result: 'tmpfile' }}>
          {card}
        </ViewShot>
      ) : (
        card
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          tapHaptic();
          void shareCard({
            title: language === 'hi' ? 'शुभ' : 'Shubh',
            message: payload,
            viewRef: ref,
          });
        }}
        style={styles.share}
      >
        <Text style={styles.shareText}>{shareLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.goldLine,
    backgroundColor: color.cardSolid,
    padding: 28,
    minHeight: 220,
    gap: 10,
  },
  brandMark: {
    color: color.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  kicker: {
    color: color.goldSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: color.ivory,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  line: {
    color: color.ivoryMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  share: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: color.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shareText: {
    color: color.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});
