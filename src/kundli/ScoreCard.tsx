import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import { color } from '../theme/tokens';
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
        <Text style={styles.of}> / {match.max}</Text>
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.goldLine,
    backgroundColor: color.cardSolid,
    padding: 24,
    gap: 8,
    alignItems: 'center',
  },
  brand: { color: color.gold, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  names: { color: color.ivory, fontSize: 20, fontWeight: '600', textAlign: 'center' },
  score: { color: color.ivory, fontSize: 72, fontWeight: '300', textAlign: 'center' },
  of: { fontSize: 22, color: color.ivoryDim, fontWeight: '500' },
  verdict: { color: color.now, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  kutas: { marginTop: 12, width: '100%', gap: 8 },
  kutaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  kutaName: { color: color.ivoryMuted, fontSize: 14, flexShrink: 1 },
  kutaScore: { color: color.ivory, fontSize: 14, fontWeight: '600' },
});
