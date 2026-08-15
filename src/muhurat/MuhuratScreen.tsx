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
import { FREE_MUHURAT_DAYS } from '../billing/products';
import { findMuhuratDates } from './findMuhurat';

function ratingTone(rating: string): string {
  const key = rating.toUpperCase();
  if (key === 'EXCELLENT' || key === 'GOOD') return color.now;
  if (key === 'AVOID') return color.danger;
  return color.wait;
}

function DateRow({ row, copy, hero }: { row: RankedDate; copy: Copy; hero?: boolean }) {
  return (
    <View style={[styles.row, hero && styles.heroRow]}>
      <View style={styles.rowTop}>
        <Text style={[styles.date, hero && styles.heroDate]}>{row.date}</Text>
        <Text style={[styles.rating, { color: ratingTone(String(row.rating)) }]}>{row.rating}</Text>
      </View>
      <Text style={[styles.score, hero && styles.heroScore]}>
        {row.score}
        <Text style={styles.scoreMeta}>  {copy.almanac.score}</Text>
      </Text>
      <Text style={styles.reason}>{row.reason}</Text>
    </View>
  );
}

export function MuhuratScreen({
  visible,
  onClose,
  city,
  language,
  copy,
  days,
  previewDates,
  onUnlock,
  embedded,
}: {
  visible: boolean;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
  days?: number;
  previewDates?: RankedDate[];
  onUnlock?: () => Promise<void>;
  embedded?: boolean;
}) {
  const [event, setEvent] = useState<FinderEvent>('marriage');
  const [rows, setRows] = useState<RankedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const range = days ?? FREE_MUHURAT_DAYS;
  const lockedExtra = range < 60;

  useEffect(() => {
    if (!visible || !city) return;
    if (previewDates?.length) {
      setRows(previewDates);
      setSetup(false);
      setFailed(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void findMuhuratDates({
      event,
      lat: city.lat,
      lon: city.lon,
      days: range,
    }).then((result) => {
      if (cancelled) return;
      setRows(result.dates);
      setSetup(Boolean(result.setup));
      setFailed(!result.ok && !result.setup);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, event, city, tick, previewDates, range]);

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
    <Sheet visible={visible} title={almanac.muhurat} onClose={onClose} closeLabel={almanac.close} embedded={embedded}>
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
      {lockedExtra ? (
        <Pressable
          onPress={() => {
            tapHaptic();
            void onUnlock?.();
          }}
          style={styles.unlock}
        >
          <Text style={styles.unlockText}>
            {language === 'hi' ? 'साठ दिन का मुहूर्त खोलो' : 'Open the sixty-day window'}
          </Text>
        </Pressable>
      ) : null}
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
          <>
            <DateRow row={best} copy={copy} hero />
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
          </>
        ) : null}
        {rows.slice(1).map((row) => (
          <DateRow key={row.date} row={row} copy={copy} />
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  unlock: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  unlockText: { color: color.gold, fontSize: 13, fontWeight: '700' },
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.12)',
    backgroundColor: color.card,
    padding: 16,
    gap: 6,
  },
  heroRow: {
    borderColor: color.goldLine,
    paddingVertical: 22,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  date: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  heroDate: { fontSize: 22 },
  rating: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  score: { color: color.gold, fontSize: 22, fontWeight: '700' },
  heroScore: { color: color.ivory, fontSize: 56, fontWeight: '300', lineHeight: 62 },
  scoreMeta: { color: color.ivoryDim, fontSize: 14, fontWeight: '600' },
  reason: { color: color.ivoryMuted, fontSize: 14, lineHeight: 20 },
});
