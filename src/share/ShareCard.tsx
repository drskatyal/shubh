import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../i18n/strings';

export function ShareCard({
  kicker,
  title,
  lines,
  shareLabel,
  language,
  payload,
}: {
  kicker: string;
  title: string;
  lines: string[];
  shareLabel: string;
  language: Language;
  payload: string;
}) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      {lines.filter(Boolean).map((line) => (
        <Text key={line} style={styles.line}>
          {line}
        </Text>
      ))}
      <Text style={styles.brand}>{language === 'hi' ? 'शुभ' : 'Shubh'}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void Share.share({ message: payload });
        }}
        style={styles.share}
      >
        <Text style={styles.shareText}>{shareLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
    backgroundColor: '#12141F',
    padding: 20,
    gap: 8,
  },
  kicker: {
    color: 'rgba(232, 197, 120, 0.85)',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F4EEE0',
    fontSize: 24,
    fontWeight: '700',
  },
  line: {
    color: 'rgba(244, 238, 224, 0.75)',
    fontSize: 15,
  },
  brand: {
    marginTop: 8,
    color: '#E8C578',
    fontSize: 14,
    fontWeight: '600',
  },
  share: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.45)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shareText: {
    color: '#E8C578',
    fontSize: 15,
  },
});
