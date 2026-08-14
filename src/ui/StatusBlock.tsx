import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import { DivineWait } from '../motion/DivineWait';
import { color } from '../theme/tokens';

export function StatusBlock({
  copy,
  loading,
  setup,
  failed,
  empty,
  emptyText,
  onRetry,
  locale,
}: {
  copy: Copy;
  loading?: boolean;
  setup?: boolean;
  failed?: boolean;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  locale?: 'en' | 'hi';
}) {
  if (loading) {
    return (
      <DivineWait
        compact
        locale={locale ?? (copy.appName === 'शुभ' ? 'hi' : 'en')}
        label={locale === 'hi' || copy.appName === 'शुभ' ? 'आकाश पढ़ रहे हैं' : 'Reading the sky'}
      />
    );
  }
  if (setup) {
    return (
      <View style={styles.block}>
        <Text style={styles.lead}>{copy.almanac.liveNeedsKey}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>{copy.almanac.retry}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (failed) {
    return (
      <View style={styles.block}>
        <Text style={styles.lead}>{copy.almanac.liveFailed}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>{copy.almanac.retry}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.block}>
        <Text style={styles.lead}>{emptyText ?? copy.almanac.noDates}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  lead: {
    color: color.ivoryMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  retry: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: color.gold,
    fontSize: 15,
    fontWeight: '600',
  },
});
