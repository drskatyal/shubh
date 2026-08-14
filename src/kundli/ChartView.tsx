import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import { color } from '../theme/tokens';
import type { NormalizedChart } from '../tathaastu/types';

export function ChartView({ chart, copy }: { chart: NormalizedChart; copy: Copy }) {
  const dasha = chart.dasha
    ? [chart.dasha.mahadasha, chart.dasha.antardasha].filter(Boolean).join(' · ')
    : copy.dashaUnknown;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{chart.name}</Text>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.kicker}>{copy.lagna}</Text>
          <Text style={styles.value}>{chart.lagna.sign}</Text>
          {chart.lagna.nakshatra ? <Text style={styles.meta}>{chart.lagna.nakshatra}</Text> : null}
        </View>
        <View style={styles.cell}>
          <Text style={styles.kicker}>{copy.moon}</Text>
          <Text style={styles.value}>{chart.moon.sign}</Text>
          {chart.moon.nakshatra ? <Text style={styles.meta}>{chart.moon.nakshatra}</Text> : null}
        </View>
      </View>
      <Text style={styles.kicker}>{copy.dasha}</Text>
      <Text style={styles.value}>{dasha}</Text>
      <Text style={[styles.kicker, styles.gap]}>{copy.planets}</Text>
      {chart.planets.map((planet) => (
        <View key={planet.name} style={styles.planet}>
          <Text style={styles.planetName}>{planet.name}</Text>
          <Text style={styles.planetSign}>
            {planet.sign}
            {planet.house ? ` · ${copy.house} ${planet.house}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: color.goldLine,
    backgroundColor: color.card,
    padding: 22,
    gap: 8,
  },
  name: { color: color.ivory, fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 16, marginVertical: 8 },
  cell: { flex: 1, gap: 4 },
  kicker: { color: color.goldSoft, fontSize: 13, letterSpacing: 0.4 },
  value: { color: color.ivory, fontSize: 20, fontWeight: '600', lineHeight: 26 },
  meta: { color: color.ivoryMuted, fontSize: 14 },
  gap: { marginTop: 12 },
  planet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 238, 224, 0.12)',
  },
  planetName: { color: color.ivoryMuted, fontSize: 15 },
  planetSign: { color: color.ivory, fontSize: 15, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
