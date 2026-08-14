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
import { festivalShareText } from '../share/cardText';
import { ShareCard } from '../share/ShareCard';
import { todayIso } from '../tathaastu/dates';
import type { Festival, FestivalExplain } from '../tathaastu/types';
import { loadFestivalExplain, loadUpcomingFestivals } from './loadFestivals';
import { scheduleNextFestival } from './notifyNext';

export function FestivalsScreen({
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
  const [rows, setRows] = useState<Festival[]>([]);
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Festival | null>(null);
  const [explain, setExplain] = useState<FestivalExplain | null>(null);

  useEffect(() => {
    if (!visible || !city) return;
    let cancelled = false;
    setLoading(true);
    void loadUpcomingFestivals({ lat: city.lat, lon: city.lon, lang: language }).then((result) => {
      if (cancelled) return;
      setRows(result.festivals);
      setSetup(Boolean(result.setup || result.planNeeded));
      setLoading(false);
      void scheduleNextFestival(result.festivals, {
        lat: city.lat,
        lon: city.lon,
        language,
        todayIso: todayIso(city.lat, city.lon),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [visible, city, language]);

  useEffect(() => {
    if (!open) {
      setExplain(null);
      return;
    }
    let cancelled = false;
    void loadFestivalExplain({ festival: open.key, date: open.date }).then((result) => {
      if (!cancelled) setExplain(result.explain);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const almanac = copy.almanac;
  const cityName = city ? cityLabel(city, language) : '';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.top}>
          <Text style={styles.title}>{almanac.festivals}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>{almanac.close}</Text>
          </Pressable>
        </View>
        <Text style={styles.lead}>{almanac.upcoming}</Text>
        {setup ? <Text style={styles.banner}>{almanac.usingFixtures}</Text> : null}
        {loading ? <ActivityIndicator color="#E8C578" style={styles.spin} /> : null}
        <ScrollView contentContainerStyle={styles.body}>
          {rows.map((fest) => (
            <Pressable key={`${fest.date}:${fest.key}`} onPress={() => setOpen(fest)} style={styles.row}>
              <Text style={styles.date}>{fest.date}</Text>
              <Text style={styles.name}>{fest.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Modal visible={Boolean(open)} animationType="fade" transparent onRequestClose={() => setOpen(null)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(null)}>
            <Pressable style={styles.why} onPress={() => undefined}>
              <Text style={styles.whyTitle}>{almanac.whyThisDate}</Text>
              {open ? (
                <ShareCard
                  kicker={open.date}
                  title={open.name}
                  lines={[explain?.humanReadable ?? '', cityName]}
                  shareLabel={almanac.share}
                  language={language}
                  payload={festivalShareText({
                    language,
                    name: open.name,
                    date: open.date,
                    reason: explain?.humanReadable ?? '',
                    city: cityName,
                  })}
                />
              ) : null}
              {explain?.conditions.map((condition) => (
                <Text key={`${condition.field}:${condition.actual}`} style={styles.cond}>
                  {condition.matched ? '✓' : '✗'} {condition.field}: {condition.actual}
                </Text>
              ))}
              <Pressable onPress={() => setOpen(null)} style={styles.done}>
                <Text style={styles.close}>{almanac.close}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#06070E', paddingTop: 56, paddingHorizontal: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#F4EEE0', fontSize: 28, fontWeight: '700' },
  close: { color: '#E8C578', fontSize: 16 },
  lead: { color: 'rgba(244, 238, 224, 0.6)', marginTop: 8, marginBottom: 12, fontSize: 15 },
  banner: { color: 'rgba(232, 197, 120, 0.85)', fontSize: 13, marginBottom: 8 },
  spin: { marginVertical: 16 },
  body: { gap: 10, paddingBottom: 40 },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.12)',
    padding: 14,
    gap: 4,
  },
  date: { color: '#E8C578', fontSize: 13 },
  name: { color: '#F4EEE0', fontSize: 18, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  why: {
    backgroundColor: '#0C0E18',
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  whyTitle: { color: '#F4EEE0', fontSize: 20, fontWeight: '700' },
  cond: { color: 'rgba(244, 238, 224, 0.7)', fontSize: 13 },
  done: { alignSelf: 'flex-end', padding: 8 },
});
