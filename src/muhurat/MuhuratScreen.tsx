import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, type City } from '../location/cities';
import { muhuratShareText } from '../share/cardText';
import { ShareCard } from '../share/ShareCard';
import { FINDER_EVENTS, type FinderEvent, type RankedDate } from '../tathaastu/types';
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
  const [planNeeded, setPlanNeeded] = useState(false);

  useEffect(() => {
    if (!visible || !city) return;
    let cancelled = false;
    setLoading(true);
    void findMuhuratDates({ event, lat: city.lat, lon: city.lon }).then((result) => {
      if (cancelled) return;
      setRows(result.dates);
      setSetup(Boolean(result.setup));
      setPlanNeeded(Boolean(result.planNeeded));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, event, city]);

  const almanac = copy.almanac;
  const eventLabel = almanac.events[event];
  const best = rows[0];
  const share = best && city
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.top}>
          <Text style={styles.title}>{almanac.muhurat}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>{almanac.close}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FINDER_EVENTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setEvent(item)}
              style={[styles.chip, event === item && styles.chipOn]}
            >
              <Text style={[styles.chipText, event === item && styles.chipTextOn]}>{almanac.events[item]}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {setup || planNeeded ? (
          <Text style={styles.banner}>{setup ? almanac.usingFixtures : almanac.liveNeedsKey}</Text>
        ) : null}
        {loading ? <ActivityIndicator color="#E8C578" style={styles.spin} /> : null}
        <ScrollView contentContainerStyle={styles.body}>
          {best ? (
            <ShareCard
              kicker={language === 'hi' ? `${eventLabel} के लिए सबसे अच्छी तारीख` : `Best date for ${eventLabel}`}
              title={best.date}
              lines={[`${almanac.score} ${best.score}`, best.reason, city ? cityLabel(city, language) : '']}
              shareLabel={almanac.share}
              language={language}
              payload={share}
            />
          ) : !loading ? (
            <Text style={styles.empty}>{almanac.noDates}</Text>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#06070E', paddingTop: 56, paddingHorizontal: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#F4EEE0', fontSize: 28, fontWeight: '700' },
  close: { color: '#E8C578', fontSize: 16 },
  chips: { gap: 8, paddingVertical: 16 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: '#E8C578' },
  chipText: { color: '#F4EEE0', fontSize: 14 },
  chipTextOn: { color: '#1A1208', fontWeight: '600' },
  banner: { color: 'rgba(232, 197, 120, 0.85)', fontSize: 13, marginBottom: 8 },
  spin: { marginVertical: 16 },
  body: { gap: 12, paddingBottom: 40 },
  empty: { color: 'rgba(244, 238, 224, 0.6)', fontSize: 16 },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.12)',
    padding: 14,
    gap: 4,
  },
  date: { color: '#F4EEE0', fontSize: 18, fontWeight: '600' },
  score: { color: '#E8C578', fontSize: 14 },
  reason: { color: 'rgba(244, 238, 224, 0.7)', fontSize: 14 },
});
