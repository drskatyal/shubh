import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import { todayIso } from '../tathaastu/dates';
import type { CalendarDay, CalendarMonth } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { loadCalendarDay, loadCalendarMonth } from './loadMonth';

function monthLabel(year: number, month: number, language: Language): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function CalendarScreen({
  visible,
  onClose,
  city,
  language,
  copy,
  embedded,
}: {
  visible: boolean;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
  embedded?: boolean;
}) {
  const now = city ? todayIso(city.lat, city.lon) : todayIso(28.6, 77.2);
  const [year, setYear] = useState(() => Number(now.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(now.slice(5, 7)));
  const [grid, setGrid] = useState<CalendarMonth | null>(null);
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || !city) return;
    let cancelled = false;
    setLoading(true);
    void loadCalendarMonth({ year, month, lat: city.lat, lon: city.lon, lang: language }).then((result) => {
      if (cancelled) return;
      setGrid(result.month ?? null);
      setSetup(Boolean(result.setup));
      setFailed(!result.ok && !result.setup);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, city, year, month, language, tick]);

  const offset = useMemo(() => {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return first;
  }, [year, month]);

  const onSelect = async (day: CalendarDay) => {
    if (!city) return;
    tapHaptic();
    const loaded = await loadCalendarDay({
      date: day.date,
      lat: city.lat,
      lon: city.lon,
      lang: language,
      fallback: day,
    });
    setSelected(loaded.day);
  };

  const shift = (delta: number) => {
    const next = month + delta;
    if (next < 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else if (next > 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth(next);
    }
  };

  return (
    <Sheet visible={visible} title={copy.almanac.calendar} onClose={onClose} closeLabel={copy.almanac.close} embedded={embedded}>
      <View style={styles.nav}>
        <Pressable onPress={() => shift(-1)} hitSlop={8}>
          <Text style={styles.navBtn}>‹</Text>
        </Pressable>
        <Text style={styles.month}>{monthLabel(year, month, language)}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={8}>
          <Text style={styles.navBtn}>›</Text>
        </Pressable>
      </View>
      <View style={styles.week}>
        {copy.almanac.weekdays.map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>
      <StatusBlock
        copy={copy}
        loading={loading}
        setup={setup}
        failed={failed}
        onRetry={() => setTick((n) => n + 1)}
      />
      {grid ? (
        <View style={styles.grid}>
          {Array.from({ length: offset }).map((_, index) => (
            <View key={`pad-${index}`} style={styles.cell} />
          ))}
          {grid.days.map((day) => {
            const n = Number(day.date.slice(8, 10));
            const on = selected?.date === day.date;
            return (
              <Pressable key={day.date} onPress={() => void onSelect(day)} style={[styles.cell, on && styles.cellOn]}>
                <Text style={[styles.dayNum, on && styles.dayOn]}>{n}</Text>
                {day.festivals.length ? <View style={styles.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.summary}>
        {selected ? (
          <View style={styles.card}>
            <Text style={styles.whyTitle}>{copy.almanac.daySummary}</Text>
            <Text style={styles.line}>{selected.date}</Text>
            {selected.tithi ? <Text style={styles.line}>{copy.tithi}: {selected.tithi}</Text> : null}
            {selected.nakshatra ? <Text style={styles.line}>{copy.nakshatra}: {selected.nakshatra}</Text> : null}
            {selected.festivals.map((name) => (
              <Text key={name} style={styles.fest}>
                {name}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navBtn: { color: color.gold, fontSize: 28, paddingHorizontal: 8 },
  month: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  week: { flexDirection: 'row', marginBottom: 8 },
  weekday: { flex: 1, textAlign: 'center', color: color.ivoryDim, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: {
    backgroundColor: 'rgba(232, 197, 120, 0.16)',
    borderRadius: 12,
  },
  dayNum: { color: color.ivory, fontSize: 15 },
  dayOn: { color: color.gold, fontWeight: '700' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.gold,
    marginTop: 3,
  },
  summary: { paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: color.card,
    borderRadius: 24,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: color.goldLine,
  },
  whyTitle: { color: color.ivory, fontSize: 20, fontWeight: '700' },
  line: { color: color.ivoryMuted, fontSize: 15, lineHeight: 22 },
  fest: { color: color.gold, fontSize: 15 },
});
