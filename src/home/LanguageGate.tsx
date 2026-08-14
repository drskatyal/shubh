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
    backgroundColor: '#0B1020',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  brand: {
    color: '#E8C578',
    fontSize: 40,
    fontWeight: '700',
  },
  sub: {
    color: 'rgba(244, 238, 224, 0.7)',
    marginTop: 8,
    fontSize: 16,
  },
  prompt: {
    color: '#F4EEE0',
    marginTop: 48,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  choice: {
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  choiceText: {
    color: '#F4EEE0',
    fontSize: 18,
  },
});
