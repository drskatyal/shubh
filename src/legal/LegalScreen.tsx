import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import type { Language } from '../engine';
import { color } from '../theme/tokens';
import { LevelFrame } from '../ui/LevelFrame';
import { legalBody, legalTitle, type LegalPage } from './copy';

export function LegalScreen({
  page,
  language,
  onClose,
  embedded,
}: {
  page: LegalPage;
  language: Language;
  onClose: () => void;
  embedded?: boolean;
}) {
  const hi = language === 'hi';
  return (
    <LevelFrame visible embedded={embedded} zIndex={22}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeHit} accessibilityRole="button">
          <Text style={styles.close}>{hi ? 'बंद' : 'Close'}</Text>
        </Pressable>
        <ScrollView contentContainerStyle={styles.box} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>{hi ? 'शुभ' : 'SHUBH'}</Text>
          <Text style={styles.title}>{legalTitle(page, language)}</Text>
          <Text style={styles.body}>{legalBody(page, language)}</Text>
        </ScrollView>
      </SafeAreaView>
    </LevelFrame>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 22 },
  closeHit: { alignSelf: 'flex-start', paddingTop: 8, paddingBottom: 4 },
  close: { color: color.gold, fontSize: 16, fontWeight: '600' },
  box: { gap: 16, paddingBottom: 40, paddingTop: 8 },
  kicker: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: '800',
  },
  title: { color: color.ivory, fontSize: 36, fontWeight: '700' },
  body: { color: color.ivoryMuted, fontSize: 16, lineHeight: 26 },
});
