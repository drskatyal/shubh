import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { civilDateInZone, timezoneFor } from '../engine/time';
import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import type { CalendarDay, CalendarMonth } from '../tathaastu/types';
import { loadCalendarDay, loadCalendarMonth } from './loadMonth';

export function CalendarScreen({
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
  const now = useMemo(() => new Date(), [visible]);
  const seed = city
    ? civilDateInZone(now, timezoneFor(city.lat, city.lon))
    : { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const [year, setYear] = useState(seed.year);
  const [month, setMonth] = useState(seed.month);
  const [grid, setGrid] = useState<CalendarMonth | null>(null);
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<CalendarDay | null>(null);

  useEffect(() => {
    if (visible) {
      setYear(seed.year);
      setMonth(seed.month);
    }
  }, [visible, seed.year, seed.month]);

  useEffect(() => {
    if (!visible || !city) return;
    let cancelled = false;
    setLoading(true);
    void loadCalendarMonth({ year, month, lat: city.lat, lon: city.lon, lang: language }).then((result) => {
      if (cancelled) return;
      setGrid(result.month);
      setSetup(Boolean(result.setup || result.planNeeded));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, city, year, month, language]);

  const almanac = copy.almanac;
  const firstWeekday = grid?.days[0]
    ? new Date(`${grid.days[0].date}T00:00:00Z`).getUTCDay()
    : 0;
  const blanks = Array.from({ length: firstWeekday });

  const shift = (delta: number) => {
    const next = month + delta;
    if (next < 1) {
      setYear(year - 1);
      setMonth(12);
    } else if (next > 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(next);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.top}>
          <Text style={styles.title}>{almanac.calendar}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>{almanac.close}</Text>
          </Pressable>
        </View>
        <View style={styles.nav}>
          <Pressable onPress={() => shift(-1)} hitSlop={8}>
            <Text style={styles.close}>‹</Text>
          </Pressable>
          <Text style={styles.month}>
            {year}-{String(month).padStart(2, '0')}
          </Text>
          <Pressable onPress={() => shift(1)} hitSlop={8}>
            <Text style={styles.close}>›</Text>
          </Pressable>
        </View>
        {setup ? <Text style={styles.banner}>{almanac.usingFixtures}</Text> : null}
        {loading ? <ActivityIndicator color="#E8C578" /> : null}
        <View style={styles.week}>
          {almanac.weekdays.map((label, i) => (
            <Text key={`${label}-${i}`} style={styles.wd}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {blanks.map((_, i) => (
            <View key={`b${i}`} style={styles.cell} />
          ))}
          {grid?.days.map((day) => {
            const n = Number(day.date.slice(-2));
            return (
              <Pressable key={day.date} style={styles.cell} onPress={() => setOpen(day)}>
                <Text style={styles.num}>{n}</Text>
                {day.festivals.length || day.tithi ? <View style={styles.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Modal visible={Boolean(open)} animationType="fade" transparent onRequestClose={() => setOpen(null)}>
          <Pressable style={styles.overlay} onPress={() => setOpen(null)}>
            <Pressable style={styles.summary} onPress={() => undefined}>
              <Text style={styles.whyTitle}>{open?.date}</Text>
              <Text style={styles.line}>{open?.tithi}</Text>
              <Text style={styles.line}>{open?.nakshatra}</Text>
              <Text style={styles.line}>{open?.vara}</Text>
              {open?.festivals.map((name) => (
                <Text key={name} style={styles.fest}>
                  {name}
                </Text>
              ))}
              <Pressable
                onPress={() => {
                  if (open && city) {
                    void loadCalendarDay({
                      date: open.date,
                      lat: city.lat,
                      lon: city.lon,
                      lang: language,
                      fallback: open,
                    }).then((result) => setOpen(result.day));
                  }
                }}
              >
                <Text style={styles.close}>{almanac.daySummary}</Text>
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
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  month: { color: '#F4EEE0', fontSize: 20, fontWeight: '600' },
  banner: { color: 'rgba(232, 197, 120, 0.85)', fontSize: 13, marginBottom: 8 },
  week: { flexDirection: 'row' },
  wd: { flex: 1, textAlign: 'center', color: 'rgba(244, 238, 224, 0.45)', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cell: { width: '14.28%', height: 52, alignItems: 'center', justifyContent: 'center' },
  num: { color: '#F4EEE0', fontSize: 16 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#E8C578', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', padding: 16 },
  summary: { backgroundColor: '#0C0E18', borderRadius: 24, padding: 18, gap: 6 },
  whyTitle: { color: '#F4EEE0', fontSize: 20, fontWeight: '700' },
  line: { color: 'rgba(244, 238, 224, 0.75)', fontSize: 15 },
  fest: { color: '#E8C578', fontSize: 15 },
});
