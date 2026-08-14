import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../i18n/language';

export function LanguageGate({ children }: { children: ReactNode }) {
  const { ready, chosen, copy, setLanguage } = useLanguage();

  if (!ready) {
    return <View style={styles.screen} />;
  }

  if (!chosen) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>SHUBH</Text>
        <Text style={styles.brand}>{copy.appName}</Text>
        <Text style={styles.sub}>{copy.subtitle}</Text>
        <Text style={styles.prompt}>{copy.pickLanguage}</Text>
        <View style={styles.row}>
          <Pressable style={styles.choice} onPress={() => setLanguage('hi')}>
            <Text style={styles.choiceText}>{copy.hindi}</Text>
          </Pressable>
          <Pressable style={styles.choice} onPress={() => setLanguage('en')}>
            <Text style={styles.choiceText}>{copy.english}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#06070E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  kicker: {
    color: 'rgba(232, 197, 120, 0.55)',
    letterSpacing: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  brand: {
    color: '#E8C578',
    fontSize: 48,
    fontWeight: '700',
    marginTop: 8,
  },
  sub: {
    color: 'rgba(244, 238, 224, 0.7)',
    marginTop: 10,
    fontSize: 18,
  },
  prompt: {
    color: '#F4EEE0',
    marginTop: 56,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },
  choice: {
    backgroundColor: 'rgba(232, 197, 120, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.5)',
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    minWidth: 128,
    alignItems: 'center',
  },
  choiceText: {
    color: '#F4EEE0',
    fontSize: 18,
    fontWeight: '600',
  },
});
