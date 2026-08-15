import { StyleSheet, Text, View } from 'react-native';

import type { ShareCardModel } from './shareDay';

/** 1:1 WhatsApp / Instagram card. Gold on night. No ads. */
export function ShareCard({ card, branded = true }: { card: ShareCardModel; branded?: boolean }) {
  const good = card.startSomething === 'good';
  return (
    <View style={styles.square} testID="share-card" collapsable={false}>
      <View style={styles.inner} collapsable={false}>
        {branded ? <Text style={styles.app}>{card.app}</Text> : null}
        <Text style={styles.city}>{card.city}</Text>
        <Text style={styles.date}>{card.dateLabel}</Text>
        <View style={styles.rule} />
        <Text style={styles.tithi}>{card.tithi}</Text>
        {card.paksha ? <Text style={styles.paksha}>{card.paksha}</Text> : null}
        {card.nakshatra ? <Text style={styles.nakshatra}>{card.nakshatra}</Text> : null}
        <View style={[styles.stamp, good ? styles.stampGood : styles.stampAvoid]}>
          <Text style={[styles.verdict, good ? styles.good : styles.avoid]}>{card.startLabel}</Text>
        </View>
        <Text style={styles.ruleLine}>{card.rule}</Text>
        <Text style={styles.window}>{card.windowName}</Text>
        <Text style={styles.rahu}>{card.rahu}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: 360,
    height: 360,
    backgroundColor: '#07080F',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  app: {
    color: '#E8C578',
    fontSize: 13,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  city: {
    color: '#F4EEE0',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  date: {
    color: 'rgba(244, 238, 224, 0.5)',
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  rule: {
    width: 48,
    height: 1,
    backgroundColor: 'rgba(232, 197, 120, 0.45)',
    marginVertical: 14,
  },
  tithi: {
    color: '#F4EEE0',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  paksha: {
    color: 'rgba(232, 197, 120, 0.85)',
    fontSize: 14,
    marginTop: 4,
  },
  nakshatra: {
    color: 'rgba(244, 238, 224, 0.7)',
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  stamp: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  stampGood: {
    borderColor: 'rgba(200, 230, 192, 0.7)',
    backgroundColor: 'rgba(80, 140, 90, 0.18)',
  },
  stampAvoid: {
    borderColor: 'rgba(232, 197, 120, 0.7)',
    backgroundColor: 'rgba(180, 120, 40, 0.16)',
  },
  verdict: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  good: { color: '#C8E6C0' },
  avoid: { color: '#E8C578' },
  ruleLine: {
    color: 'rgba(244, 238, 224, 0.45)',
    fontSize: 13,
    marginTop: 8,
  },
  window: {
    color: 'rgba(244, 238, 224, 0.75)',
    fontSize: 15,
    marginTop: 14,
  },
  rahu: {
    color: 'rgba(244, 238, 224, 0.4)',
    fontSize: 12,
    marginTop: 4,
  },
});
