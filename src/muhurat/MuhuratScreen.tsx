import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, type City } from '../location/cities';
import { muhuratShareText } from '../share/cardText';
import { ShareImageCard } from '../share/ShareImageCard';
import { FINDER_EVENTS, type FinderEvent, type RankedDate } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { findMuhuratDates } from './findMuhurat';

export function MuhuratScreen({
  visible,
  onClose,
  city,
  language,
  copy,
}: {
  visible: boolean;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
}) {
  const [event, setEvent] = useState<FinderEvent>('marriage');
  const [rows, setRows] = useState<RankedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || !city) return;
    let cancelled = false;
    setLoading(true);
    void findMuhuratDates({ event, lat: city.lat, lon: city.lon }).then((result) => {
      if (cancelled) return;
      setRows(result.dates);
      setSetup(Boolean(result.setup));
      setFailed(!result.ok && !result.setup);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, event, city, tick]);

  const almanac = copy.almanac;
  const eventLabel = almanac.events[event];
  const best = rows[0];
  const share =
    best && city
      ? muhuratShareText({
          language,
          eventLabel,
          date: best.date,
          score: best.score,
          reason: best.reason,
          city: cityLabel(city, language),
        })
      : '';

  return (
    <Sheet visible={visible} title={almanac.muhurat} onClose={onClose} closeLabel={almanac.close}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FINDER_EVENTS.map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              tapHaptic();
              setEvent(item);
            }}
            style={[styles.chip, event === item && styles.chipOn]}
          >
            <Text style={[styles.chipText, event === item && styles.chipTextOn]}>
              {almanac.events[item]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.body}>
        <StatusBlock
          copy={copy}
          loading={loading}
          setup={setup}
          failed={failed}
          empty={!loading && !setup && !failed && !best}
          emptyText={almanac.noDates}
          onRetry={() => setTick((n) => n + 1)}
        />
        {best ? (
          <ShareImageCard
            kicker={
              language === 'hi' ? `${eventLabel} के लिए सबसे अच्छी तारीख` : `Best date for ${eventLabel}`
            }
            title={best.date}
            lines={[`${almanac.score} ${best.score}`, best.reason, city ? cityLabel(city, language) : '']}
            shareLabel={almanac.shareImage}
            language={language}
            payload={share}
          />
        ) : null}
        {rows.slice(1).map((row) => (
          <View key={row.date} style={styles.row}>
            <Text style={styles.date}>{row.date}</Text>
            <Text style={styles.score}>
              {almanac.score} {row.score}
            </Text>
            <Text style={styles.reason}>{row.reason}</Text>
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 8, paddingVertical: 16, flexDirection: 'row' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: color.gold },
  chipText: { color: color.ivory, fontSize: 14 },
  chipTextOn: { color: color.ink, fontWeight: '700' },
  body: { gap: 12, paddingBottom: 48 },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.12)',
    padding: 16,
    gap: 4,
  },
  date: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  score: { color: color.gold, fontSize: 14 },
  reason: { color: color.ivoryMuted, fontSize: 14, lineHeight: 20 },
});
