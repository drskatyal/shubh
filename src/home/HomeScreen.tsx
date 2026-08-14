import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlmanacDock, type AlmanacTab } from '../almanac/AlmanacDock';
import { AlmanacHost } from '../almanac/AlmanacHost';
import { AskFAB, AskSheet } from '../ask';
import { useCredits } from '../billing';
import { getSkyState, type SkyState } from '../engine';
import { useLanguage } from '../i18n/language';
import { stateLabel, windowLabel } from '../i18n/strings';
import { cityLabel } from '../location/cities';
import { usePlace } from '../location/usePlace';
import { SkyBackdrop, useReduceMotion, useVerdictBeat } from '../motion';
import { readCachedDay, writeCachedDay } from '../panchang/cacheDay';
import { loadLiveDay } from '../panchang/loadDay';
import { panchangShareText } from '../share/cardText';
import { ShareImageCard } from '../share/ShareImageCard';
import { todayIso } from '../tathaastu/dates';
import type { NormalizedDay } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { syncGlance } from '../widget/syncGlance';
import { CitySearch } from './CitySearch';
import { toMotionVerdict, toMotionWindow } from './motionWindow';
import { PanchangCard } from './PanchangCard';

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function HomeScreen() {
  const { language, copy, setLanguage } = useLanguage();
  const place = usePlace();
  const credits = useCredits();
  const reduceMotion = useReduceMotion();
  const { intensity, activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);
  const [now, setNow] = useState(() => new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [almanac, setAlmanac] = useState<AlmanacTab | null>(null);
  const [day, setDay] = useState<NormalizedDay | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [daySetup, setDaySetup] = useState(false);
  const [dayFailed, setDayFailed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!place.city && place.ready && !place.locating) {
      setSearchOpen(true);
    }
  }, [place.city, place.ready, place.locating]);

  const sky: SkyState | null = useMemo(() => {
    if (!place.city) return null;
    return getSkyState(place.city.lat, place.city.lon, now, {
      city: cityLabel(place.city, language),
      language,
    });
  }, [place.city, now, language]);

  useEffect(() => {
    if (!place.city) return;
    const date = todayIso(place.city.lat, place.city.lon);
    let cancelled = false;
    setDayLoading(true);
    void (async () => {
      const cached = await readCachedDay({
        lat: place.city!.lat,
        lon: place.city!.lon,
        lang: language,
        date,
      });
      if (cached && !cancelled) setDay(cached);
      const live = await loadLiveDay({
        lat: place.city!.lat,
        lon: place.city!.lon,
        lang: language,
        date,
      });
      if (cancelled) return;
      setDaySetup(Boolean(live.setup));
      setDayFailed(!live.ok && !live.setup);
      if (live.ok && live.day) {
        setDay(live.day);
        await writeCachedDay({
          lat: place.city!.lat,
          lon: place.city!.lon,
          lang: language,
          date,
          day: live.day,
        });
      } else if (!cached) {
        setDay(null);
      }
      setDayLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [place.city, language, reload]);

  useEffect(() => {
    if (place.city && sky) {
      void syncGlance({
        city: cityLabel(place.city, language),
        windowName: windowLabel(language, sky.currentWindow.name),
        state: sky.startingSomethingNew,
        language,
        tithi: day?.tithi?.name,
      });
    }
  }, [place.city, sky, language, day]);

  const remaining = sky ? new Date(sky.currentWindow.end).getTime() - now.getTime() : 0;
  const cityName = place.city ? cityLabel(place.city, language) : '';
  const goodAvoid = day
    ? [day.good[0] ? `${copy.good}: ${day.good[0]}` : '', day.avoid[0] ? `${copy.avoid}: ${day.avoid[0]}` : '']
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <View style={styles.root}>
      {sky ? (
        <SkyBackdrop
          windowKind={toMotionWindow(sky.currentWindow.name)}
          verdict={activeVerdict ?? toMotionVerdict(sky.startingSomethingNew)}
          locale={language}
          beatIntensity={intensity}
          beatVerdict={activeVerdict}
        />
      ) : null}
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable onPress={() => setSearchOpen(true)} hitSlop={8}>
            <Text style={styles.city}>{place.city ? cityName : copy.citySearch}</Text>
            <Text style={styles.change}>{copy.changeCity}</Text>
          </Pressable>
          <View style={styles.langRow}>
            <Pressable onPress={() => setLanguage('hi')} style={styles.langBtn}>
              <Text style={[styles.lang, language === 'hi' && styles.langOn]}>{copy.hindi}</Text>
            </Pressable>
            <Text style={styles.langDivider}>|</Text>
            <Pressable onPress={() => setLanguage('en')} style={styles.langBtn}>
              <Text style={[styles.lang, language === 'en' && styles.langOn]}>{copy.english}</Text>
            </Pressable>
          </View>
        </View>

        {sky ? (
          <>
            <ScrollView contentContainerStyle={styles.glance} showsVerticalScrollIndicator={false}>
              <Text style={styles.window}>{windowLabel(language, sky.currentWindow.name)}</Text>
              <Text style={styles.countdown}>
                {copy.endsIn} {formatCountdown(remaining)}
              </Text>
              <Text style={[styles.state, sky.startingSomethingNew === 'now' ? styles.now : styles.wait]}>
                {stateLabel(language, sky.startingSomethingNew)}
              </Text>
              <Text style={styles.rule}>{copy.startingSomethingNew}</Text>

              {day ? <PanchangCard day={day} copy={copy} /> : null}
              <StatusBlock
                copy={copy}
                loading={dayLoading && !day}
                setup={daySetup && !day}
                failed={dayFailed && !day}
                onRetry={() => setReload((n) => n + 1)}
              />

              {day ? (
                <Pressable
                  onPress={() => {
                    tapHaptic();
                    setShareOpen((open) => !open);
                  }}
                  style={styles.shareToday}
                >
                  <Text style={styles.shareTodayText}>{copy.shareToday}</Text>
                </Pressable>
              ) : null}
              {shareOpen && day ? (
                <ShareImageCard
                  kicker={cityName}
                  title={day.tithi?.name ?? copy.appName}
                  lines={[
                    day.nakshatra ? `${copy.nakshatra} ${day.nakshatra.name}` : '',
                    goodAvoid,
                    windowLabel(language, sky.currentWindow.name),
                  ]}
                  shareLabel={copy.almanac.shareImage}
                  language={language}
                  payload={panchangShareText({ language, city: cityName, day, goodAvoid })}
                />
              ) : null}
            </ScrollView>
            <View style={styles.dock}>
              <AlmanacDock copy={copy} onOpen={setAlmanac} />
              <AskFAB
                remaining={credits.remaining}
                language={language}
                onPress={() => setAskOpen(true)}
              />
            </View>
            <AskSheet
              visible={askOpen}
              onClose={() => setAskOpen(false)}
              sky={sky}
              language={language}
              wallet={credits.wallet}
              onRemainingChange={credits.refresh}
              onBuyMonthly={credits.buyMonthly}
              onBuyPack={credits.buyPack}
              onRestore={credits.restore}
              onVerdict={(verdict) => playVerdict(verdict)}
              dayContext={day}
            />
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{place.locating ? copy.locating : copy.citySearch}</Text>
          </View>
        )}

        <Text style={styles.privacy}>{copy.privacyLocation}</Text>

        <AlmanacHost
          tab={almanac}
          onClose={() => setAlmanac(null)}
          city={place.city}
          language={language}
          copy={copy}
          wallet={credits.wallet}
          onRemainingChange={credits.refresh}
          onBuyMonthly={credits.buyMonthly}
          onBuyPack={credits.buyPack}
          onRestore={credits.restore}
        />

        <CitySearch
          visible={searchOpen}
          copy={copy}
          language={language}
          locating={place.locating}
          denied={place.denied}
          onClose={() => setSearchOpen(false)}
          onSelect={(city) => {
            place.setCity(city);
            setSearchOpen(false);
          }}
          onUseLocation={() => {
            void place.requestLocation();
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.night },
  safe: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 24 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    gap: 12,
  },
  city: { color: color.ivory, fontSize: 22, fontWeight: '600' },
  change: { color: color.goldSoft, marginTop: 4, fontSize: 13 },
  langRow: { flexDirection: 'row', alignItems: 'center' },
  langBtn: { padding: 4 },
  lang: { color: 'rgba(244, 238, 224, 0.4)', fontSize: 15 },
  langOn: { color: color.gold },
  langDivider: { color: 'rgba(244, 238, 224, 0.3)', marginHorizontal: 4 },
  glance: { alignItems: 'center', paddingTop: 28, paddingBottom: 20, gap: 10 },
  window: { color: color.ivory, fontSize: 36, fontWeight: '600', textAlign: 'center', lineHeight: 42 },
  countdown: { color: color.ivoryMuted, fontSize: 18 },
  state: { marginTop: 8, fontSize: 28, fontWeight: '700', letterSpacing: 1 },
  now: { color: color.now },
  wait: { color: color.wait },
  rule: { color: color.ivoryDim, fontSize: 15, marginBottom: 8 },
  shareToday: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shareTodayText: { color: color.gold, fontSize: 15, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: color.ivoryMuted, fontSize: 16 },
  dock: { alignItems: 'center', paddingBottom: 16, gap: 14 },
  privacy: {
    textAlign: 'center',
    color: 'rgba(244, 238, 224, 0.35)',
    fontSize: 12,
    marginBottom: 8,
  },
});
