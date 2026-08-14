import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import type { NormalizedMatch } from '../tathaastu/types';

export function ScoreCard({ match, copy }: { match: NormalizedMatch; copy: Copy }) {
  return (
    <View style={styles.card}>
      <Text style={styles.brand}>{copy.scoreCardTitle}</Text>
      <Text style={styles.names}>
        {match.personA} × {match.personB}
      </Text>
      <Text style={styles.score}>
        {match.total}
        <Text style={styles.of}>
          {' '}
          / {match.max}
        </Text>
      </Text>
      <Text style={styles.verdict}>{match.verdict}</Text>
      <View style={styles.kutas}>
        {match.kutas.map((kuta) => (
          <View key={kuta.key} style={styles.kutaRow}>
            <Text style={styles.kutaName}>{kuta.label}</Text>
            <Text style={styles.kutaScore}>
              {kuta.score}/{kuta.max}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    backgroundColor: '#141018',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
    padding: 22,
    justifyContent: 'center',
    gap: 8,
  },
  brand: {
    color: '#E8C578',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  names: {
    color: '#F4EEE0',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  score: {
    color: '#F4EEE0',
    fontSize: 64,
    fontWeight: '700',
    textAlign: 'center',
  },
  of: { fontSize: 22, color: 'rgba(244, 238, 224, 0.55)', fontWeight: '500' },
  verdict: {
    color: '#C8E6C0',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  kutas: { marginTop: 8, gap: 4 },
  kutaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kutaName: { color: 'rgba(244, 238, 224, 0.7)', fontSize: 13 },
  kutaScore: { color: '#F4EEE0', fontSize: 13, fontWeight: '600' },
});
