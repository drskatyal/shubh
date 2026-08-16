import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import { color } from '../theme/tokens';
import type { NormalizedMatch } from '../tathaastu/types';

function manglikChip(flag: boolean | null, name: string, copy: Copy): string | null {
  if (flag === true) return `${name} · ${copy.appName === 'शुभ' ? 'मंगलिक' : 'Manglik'}`;
  if (flag === false) return `${name} · ${copy.appName === 'शुभ' ? 'मंगलिक नहीं' : 'not Manglik'}`;
  return null;
}

export function ScoreCard({ match, copy }: { match: NormalizedMatch; copy: Copy }) {
  const chips = [
    manglikChip(match.manglik.a, match.personA, copy),
    manglikChip(match.manglik.b, match.personB, copy),
  ].filter(Boolean) as string[];

  return (
    <View style={styles.card}>
      <Text style={styles.brand}>{copy.scoreCardTitle}</Text>
      <Text style={styles.names}>
        {match.personA} × {match.personB}
      </Text>
      <View style={styles.ring}>
        <Text style={styles.score}>{match.total}</Text>
        <Text style={styles.of}>/ {match.max}</Text>
      </View>
      <Text style={styles.verdict}>{match.verdict}</Text>
      {chips.length ? (
        <View style={styles.chips}>
          {chips.map((line) => (
            <View key={line} style={styles.chip}>
              <Text style={styles.chipText}>{line}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.kutas}>
        {match.kutas.map((kuta) => (
          <View key={kuta.key} style={styles.kutaChip}>
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
    gap: 10,
    alignItems: 'center',
  },
  brand: { color: color.gold, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  names: { color: color.ivory, fontSize: 20, fontWeight: '600', textAlign: 'center' },
  ring: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    borderColor: color.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 197, 120, 0.06)',
    marginVertical: 8,
  },
  score: { color: color.ivory, fontSize: 64, fontWeight: '300', lineHeight: 68 },
  of: { fontSize: 16, color: color.ivoryDim, fontWeight: '600' },
  verdict: { color: color.now, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: color.gold, fontSize: 12, fontWeight: '700' },
  kutas: { marginTop: 8, width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  kutaChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(232, 197, 120, 0.08)',
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  kutaName: { color: color.ivoryMuted, fontSize: 12 },
  kutaScore: { color: color.ivory, fontSize: 12, fontWeight: '700' },
});
