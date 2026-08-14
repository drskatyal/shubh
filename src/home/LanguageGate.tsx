import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../i18n/language';
import { color } from '../theme/tokens';

export function LanguageGate({ children }: { children: ReactNode }) {
  const { ready, chosen, copy, setLanguage } = useLanguage();

  if (!ready) {
    return <View style={styles.screen} />;
  }

  if (!chosen) {
    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>शुभ</Text>
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
    backgroundColor: color.night,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  kicker: {
    color: color.gold,
    fontSize: 16,
    letterSpacing: 6,
    marginBottom: 8,
  },
  brand: {
    color: color.ivory,
    fontSize: 52,
    fontWeight: '700',
  },
  sub: {
    color: color.ivoryMuted,
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  prompt: {
    color: color.ivory,
    marginTop: 56,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  choice: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    backgroundColor: color.card,
  },
  choiceText: {
    color: color.ivory,
    fontSize: 18,
    fontWeight: '600',
  },
});
