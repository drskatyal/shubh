import { StyleSheet, Text, View } from 'react-native';

import type { Language } from '../engine';
import { color } from '../theme/tokens';

export function connectLaterLine(language: Language, surface: 'ask' | 'live' | 'store'): string {
  if (language === 'hi') {
    if (surface === 'ask') return 'पूछ बाद में जुड़ेगी। चाबी कल। आज की नज़र फ़ोन पर है।';
    if (surface === 'store') return 'स्टोर बाद में जुड़ेगा। चाबी कल।';
    return 'लाइव आकाश बाद में जुड़ेगा। आज की नज़र फ़ोन पर है।';
  }
  if (surface === 'ask') return 'Ask connects later. Keys come tomorrow. Today’s glance is already on the phone.';
  if (surface === 'store') return 'Store connects later. Keys come tomorrow.';
  return 'Live sky connects later. Today’s glance is already on the phone.';
}

export function ConnectLater({
  language,
  surface = 'live',
}: {
  language: Language;
  surface?: 'ask' | 'live' | 'store';
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.kicker}>{language === 'hi' ? 'शुभ' : 'SHUBH'}</Text>
      <Text style={styles.lead}>{connectLaterLine(language, surface)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  kicker: {
    color: color.gold,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '800',
  },
  lead: {
    color: color.ivoryMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
