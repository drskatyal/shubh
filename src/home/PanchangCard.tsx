import { StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import type { NormalizedDay } from '../tathaastu/types';
import { color } from '../theme/tokens';

function windowLine(label: string, start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null;
  return `${label} ${[start, end].filter(Boolean).join('–')}`;
}

export function PanchangCard({ day, copy }: { day: NormalizedDay; copy: Copy }) {
  const limbs = [
    [copy.tithi, day.tithi?.name],
    [copy.nakshatra, day.nakshatra?.name],
    [copy.yoga, day.yoga?.name],
    [copy.karana, day.karana?.name],
  ].filter(([, value]) => Boolean(value));

  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {limbs.map(([label, value]) => (
          <View key={label} style={styles.cell}>
            <Text style={styles.kicker}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
      {day.good.length || day.avoid.length ? (
        <View style={styles.split}>
          {day.good.length ? (
            <View style={styles.col}>
              <Text style={styles.good}>{copy.good}</Text>
              {day.good.slice(0, 3).map((line) => (
                <Text key={line} style={styles.note}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
          {day.avoid.length ? (
            <View style={styles.col}>
              <Text style={styles.avoid}>{copy.avoid}</Text>
              {day.avoid.slice(0, 3).map((line) => (
                <Text key={line} style={styles.note}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      {windowLine(copy.rahu, day.rahu?.start, day.rahu?.end) ? (
        <Text style={styles.window}>{windowLine(copy.rahu, day.rahu?.start, day.rahu?.end)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: color.goldLine,
    backgroundColor: color.card,
    padding: 18,
    gap: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '46%', gap: 4 },
  kicker: { color: color.goldSoft, fontSize: 12, letterSpacing: 0.4 },
  value: { color: color.ivory, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  split: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 4 },
  good: { color: color.now, fontSize: 13, fontWeight: '700' },
  avoid: { color: color.wait, fontSize: 13, fontWeight: '700' },
  note: { color: color.ivoryMuted, fontSize: 13, lineHeight: 18 },
  window: { color: color.ivoryMuted, fontSize: 14 },
});
