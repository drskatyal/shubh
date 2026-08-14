import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import type { NormalizedChart } from '../tathaastu/types';

export function ChartView({ chart, copy }: { chart: NormalizedChart; copy: Copy }) {
  const dasha = chart.dasha
    ? [chart.dasha.mahadasha, chart.dasha.antardasha].filter(Boolean).join(' – ')
    : copy.dashaUnknown;

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{chart.name}</Text>
      {chart.placeName ? <Text style={styles.place}>{chart.placeName}</Text> : null}

      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillKicker}>{copy.lagna}</Text>
          <Text style={styles.pillValue}>{chart.lagna.sign}</Text>
          {chart.lagna.nakshatra ? <Text style={styles.pillSub}>{chart.lagna.nakshatra}</Text> : null}
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillKicker}>{copy.moon}</Text>
          <Text style={styles.pillValue}>{chart.moon.sign}</Text>
          {chart.moon.nakshatra ? <Text style={styles.pillSub}>{chart.moon.nakshatra}</Text> : null}
        </View>
      </View>

      <Text style={styles.section}>{copy.dasha}</Text>
      <Text style={styles.dasha}>{dasha}</Text>
      {chart.dasha?.from || chart.dasha?.to ? (
        <Text style={styles.pillSub}>
          {[chart.dasha.from, chart.dasha.to].filter(Boolean).join(' → ')}
        </Text>
      ) : null}

      <Text style={styles.section}>{copy.planets}</Text>
      {chart.planets.map((planet) => (
        <View key={planet.name} style={styles.planet}>
          <Text style={styles.planetName}>{planet.name}</Text>
          <Text style={styles.planetSign}>
            {planet.sign}
            {planet.house != null ? ` · ${copy.house} ${planet.house}` : ''}
          </Text>
        </View>
      ))}

      {chart.insights.map((line) => (
        <Text key={line} style={styles.insight}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  name: { color: '#F4EEE0', fontSize: 26, fontWeight: '700' },
  place: { color: 'rgba(244, 238, 224, 0.6)', fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(232, 197, 120, 0.12)',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  pillKicker: { color: '#E8C578', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  pillValue: { color: '#F4EEE0', fontSize: 20, fontWeight: '600' },
  pillSub: { color: 'rgba(244, 238, 224, 0.55)', fontSize: 13 },
  section: {
    color: '#E8C578',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  dasha: { color: '#F4EEE0', fontSize: 18, fontWeight: '600' },
  planet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 238, 224, 0.1)',
  },
  planetName: { color: '#F4EEE0', fontSize: 15 },
  planetSign: { color: 'rgba(244, 238, 224, 0.7)', fontSize: 15 },
  insight: { color: 'rgba(244, 238, 224, 0.7)', fontSize: 14, lineHeight: 20 },
});
