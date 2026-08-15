import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, type City } from '../location/cities';
import { festivalShareText } from '../share/cardText';
import { ShareImageCard } from '../share/ShareImageCard';
import { formatDateLabel } from '../home/shareDay';
import { todayIso } from '../tathaastu/dates';
import type { Festival, FestivalExplain } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { loadFestivalExplain, loadUpcomingFestivals } from './loadFestivals';
import { scheduleNextFestival } from './notifyNext';

export function FestivalsScreen({
  visible,
  onClose,
  city,
  language,
  copy,
  canRemind,
  previewFestivals,
  onUnlock,
}: {
  visible: boolean;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
  canRemind?: boolean;
  previewFestivals?: Festival[];
  onUnlock?: () => Promise<void>;
}) {
  const [rows, setRows] = useState<Festival[]>([]);
  const [setup, setSetup] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Festival | null>(null);
  const [explain, setExplain] = useState<FestivalExplain | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || !city) return;
    if (previewFestivals?.length) {
      setRows(previewFestivals);
      setSetup(false);
      setFailed(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadUpcomingFestivals({ lat: city.lat, lon: city.lon, lang: language }).then((result) => {
      if (cancelled) return;
      setRows(result.festivals);
      setSetup(Boolean(result.setup));
      setFailed(!result.ok && !result.setup);
      setLoading(false);
      if (result.ok && canRemind) {
        void scheduleNextFestival(result.festivals, {
          lat: city.lat,
          lon: city.lon,
          language,
          todayIso: todayIso(city.lat, city.lon),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [visible, city, language, tick, canRemind, previewFestivals]);

  useEffect(() => {
    if (!open) {
      setExplain(null);
      return;
    }
    let cancelled = false;
    void loadFestivalExplain({ festival: open.key, date: open.date }).then((result) => {
      if (!cancelled && result.explain) setExplain(result.explain);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const almanac = copy.almanac;
  const cityName = city ? cityLabel(city, language) : '';

  return (
    <Sheet visible={visible} title={almanac.festivals} onClose={onClose} closeLabel={almanac.close}>
      <Text style={styles.lead}>{almanac.upcoming}</Text>
      <StatusBlock
        copy={copy}
        loading={loading}
        setup={setup}
        failed={failed}
        empty={!loading && !setup && !failed && rows.length === 0}
        emptyText={almanac.noFestivals}
        onRetry={() => setTick((n) => n + 1)}
      />
      <ScrollView contentContainerStyle={styles.body}>
        {rows.map((fest) => (
          <Pressable
            key={`${fest.date}:${fest.key}`}
            onPress={() => {
              tapHaptic();
              setOpen(fest);
            }}
            style={styles.row}
          >
            <Text style={styles.date}>{formatDateLabel(fest.date, language)}</Text>
            <Text style={styles.name}>{fest.name}</Text>
            {fest.type ? <Text style={styles.tag}>{fest.type}</Text> : null}
          </Pressable>
        ))}
        {rows.length && canRemind ? <Text style={styles.hint}>{almanac.reminderSet}</Text> : null}
        {rows.length && !canRemind ? (
          <Pressable
            onPress={() => {
              tapHaptic();
              void onUnlock?.();
            }}
          >
            <Text style={styles.hint}>
              {language === 'hi' ? 'त्योहार की सुबह याद — शुभ खोलो' : 'Festival morning reminder — open Shubh'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      {open ? (
        <Pressable style={styles.overlay} onPress={() => setOpen(null)}>
          <Pressable style={styles.why} onPress={() => undefined}>
            <Text style={styles.whyTitle}>{almanac.whyThisDate}</Text>
            {open ? (
              <ShareImageCard
                kicker={open.date}
                title={open.name}
                lines={[explain?.humanReadable ?? '', cityName]}
                shareLabel={almanac.shareImage}
                language={language}
                branded={!canRemind}
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
                {condition.matched ? '✓' : '·'} {condition.field}: {condition.actual}
              </Text>
            ))}
            <Pressable onPress={() => setOpen(null)} style={styles.done}>
              <Text style={styles.close}>{almanac.close}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lead: { color: color.ivoryMuted, fontSize: 16, marginBottom: 8 },
  body: { gap: 10, paddingBottom: 48 },
  row: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.12)',
    backgroundColor: color.card,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 6,
  },
  date: { color: color.gold, fontSize: 13, letterSpacing: 0.6, textTransform: 'capitalize' },
  name: { color: color.ivory, fontSize: 24, fontWeight: '600', lineHeight: 30 },
  tag: { color: color.ivoryDim, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  hint: { color: color.ivoryDim, fontSize: 13, lineHeight: 18, marginTop: 8 },
  overlay: {
    flex: 1,
    backgroundColor: color.overlay,
    justifyContent: 'flex-end',
    padding: 16,
  },
  why: {
    backgroundColor: color.nightLift,
    borderRadius: 28,
    padding: 22,
    gap: 12,
  },
  whyTitle: { color: color.ivory, fontSize: 22, fontWeight: '700' },
  cond: { color: color.ivoryMuted, fontSize: 14, lineHeight: 20 },
  done: { alignSelf: 'flex-end', paddingTop: 8 },
  close: { color: color.gold, fontSize: 16, fontWeight: '600' },
});
