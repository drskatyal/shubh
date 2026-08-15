import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type View as ViewType,
} from 'react-native';

import { AlmanacDock, type AlmanacTab } from '../almanac/AlmanacDock';
import { AlmanacHost } from '../almanac/AlmanacHost';
import { AskFAB, AskPage } from '../ask';
import { Paywall, useCredits } from '../billing';
import { PREVIEW_ASK_TURN } from '../preview/fixtures';
import { readShotId } from '../preview/shot';
import { getSkyState, type SkyState } from '../engine';
import { useLanguage } from '../i18n/language';
import { choghadiyaLabel, pakshaLabel, windowLabel } from '../i18n/strings';
import { loadLastChart, loadLastMatch } from '../kundli/storage';
import { cityLabel } from '../location/cities';
import { usePlace } from '../location/usePlace';
import { useReduceMotion, useSkyLayer, useVerdictBeat } from '../motion';
import { readCachedDay, writeCachedDay } from '../panchang/cacheDay';
import { loadLiveDay } from '../panchang/loadDay';
import { todayIso } from '../tathaastu/dates';
import type { ChartAskSummary, NormalizedDay, NormalizedMatch } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { syncGlance } from '../widget/syncGlance';
import { CitySearch } from './CitySearch';
import { toMotionVerdict, toMotionWindow } from './motionWindow';
import { ShareCard } from './ShareCard';
import { buildShareCard } from './shareDay';
import { captureViewPng, sharePanchang } from './sharePanchang';

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

function isClock(value?: string | null): value is string {
  return Boolean(value && /^\d{1,2}:\d{2}/.test(value));
}

function LimbCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.limb}>
      <Text style={styles.limbLabel}>{label}</Text>
      <Text style={styles.limbValue}>{value}</Text>
    </View>
  );
}

function TimingChip({
  name,
  start,
  end,
  hot,
}: {
  name: string;
  start: string;
  end: string;
  hot?: boolean;
}) {
  return (
    <View style={[styles.chip, hot && styles.chipHot]}>
      <Text style={[styles.chipName, hot && styles.chipNameHot]}>{name}</Text>
      <Text style={styles.chipClock}>
        {start}–{end}
      </Text>
    </View>
  );
}

export function HomeScreen() {
  const { language, copy, setLanguage } = useLanguage();
  const place = usePlace();
  const credits = useCredits();
  const reduceMotion = useReduceMotion();
  const { activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);
  const skyLayer = useSkyLayer();
  const [now, setNow] = useState(() => new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const shot = readShotId();
  const [askOpen, setAskOpen] = useState(() => shot === 'ask');
  const [almanac, setAlmanac] = useState<AlmanacTab | null>(() => {
    if (shot === 'match' || shot === 'confirm' || shot === 'milan') return 'match';
    if (shot === 'muhurat') return 'muhurat';
    if (shot === 'festivals') return 'festivals';
    if (shot === 'kundli') return 'kundli';
    return null;
  });
  const [paywallOpen, setPaywallOpen] = useState(() => shot === 'paywall');
  const [day, setDay] = useState<NormalizedDay | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [daySetup, setDaySetup] = useState(false);
  const [dayFailed, setDayFailed] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reload, setReload] = useState(0);
  const [chartContext, setChartContext] = useState<ChartAskSummary | null>(null);
  const [matchContext, setMatchContext] = useState<NormalizedMatch | null>(null);
  const cardRef = useRef<ViewType>(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!place.city && place.ready && !place.locating && !shot) {
      setSearchOpen(true);
    }
  }, [place.city, place.ready, place.locating, shot]);

  useEffect(() => {
    if (!shot) return;
    if (shot === 'match' || shot === 'confirm' || shot === 'milan') setAlmanac('match');
    if (shot === 'muhurat') setAlmanac('muhurat');
    if (shot === 'festivals') setAlmanac('festivals');
    if (shot === 'kundli') setAlmanac('kundli');
    if (shot === 'ask') setAskOpen(true);
    if (shot === 'paywall') setPaywallOpen(true);
  }, [shot]);

  useEffect(() => {
    void loadLastChart().then(setChartContext);
    void loadLastMatch().then(setMatchContext);
  }, [askOpen]);

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
    if (!sky) {
      skyLayer.setSky({ locale: language, waiting: dayLoading && !day });
      return;
    }
    skyLayer.setSky({
      windowKind: toMotionWindow(sky.currentWindow.name),
      verdict: activeVerdict ?? toMotionVerdict(sky.startingSomethingNew),
      locale: language,
      waiting: dayLoading && !day,
    });
  }, [sky, language, dayLoading, day, askOpen, activeVerdict, skyLayer]);

  useEffect(() => {
    if (!place.city || !sky || !day?.tithi?.name) return;
    void syncGlance({
      city: cityLabel(place.city, language),
      windowName: windowLabel(language, sky.currentWindow.name),
      tithi: day.tithi.name,
      state: sky.startingSomethingNew,
      language,
    });
  }, [place.city, sky, language, day]);

  const overlayOpen = Boolean(almanac || askOpen || paywallOpen);
  const remaining = sky ? new Date(sky.currentWindow.end).getTime() - now.getTime() : 0;
  const cityName = place.city ? cityLabel(place.city, language) : '';
  const heroName = day?.tithi?.name ?? (sky ? windowLabel(language, sky.currentWindow.name) : '');
  const paksha = day ? pakshaLabel(language, day.tithi?.paksha) : null;
  const startGood = sky?.startingSomethingNew === 'now';
  const choghadiya = day?.choghadiya
    ? choghadiyaLabel(language, day.choghadiya)
    : sky
      ? choghadiyaLabel(language, sky.choghadiya.current.name)
      : null;
  const card =
    day && sky && place.city
      ? buildShareCard({ day, sky, language, city: cityName })
      : null;

  const onShare = async () => {
    if (!card || sharing) return;
    tapHaptic();
    setSharing(true);
    try {
      await sharePanchang(copy.appName, () => captureViewPng(cardRef.current));
    } catch {
      // Capture can fail in Expo Go; the 1:1 card stays on screen.
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {!overlayOpen ? (
          <View style={styles.top}>
            <Pressable onPress={() => setSearchOpen(true)} hitSlop={8} style={styles.cityHit}>
              <Text style={styles.brand}>{copy.appName}</Text>
              <Text style={styles.city}>
                {place.city ? cityName : copy.citySearch} ▾
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPaywallOpen(true)}
              style={styles.payChip}
              accessibilityRole="button"
              accessibilityLabel={language === 'hi' ? 'शुभ खोलो' : 'Open Shubh'}
            >
              <Text style={styles.payChipText}>{language === 'hi' ? 'शुभ' : 'Shubh'}</Text>
            </Pressable>
            <View style={styles.seg}>
              <Pressable
                onPress={() => setLanguage('hi')}
                style={[styles.segBtn, language === 'hi' && styles.segOn]}
              >
                <Text style={[styles.segText, language === 'hi' && styles.segTextOn]}>{copy.hindi}</Text>
              </Pressable>
              <Pressable
                onPress={() => setLanguage('en')}
                style={[styles.segBtn, language === 'en' && styles.segOn]}
              >
                <Text style={[styles.segText, language === 'en' && styles.segTextOn]}>{copy.english}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {sky ? (
          <>
            {!overlayOpen ? (
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.hero}>
                <Text style={styles.heroName}>{heroName}</Text>
                {paksha ? <Text style={styles.paksha}>{paksha}</Text> : null}
                <Text style={[styles.verdict, startGood ? styles.good : styles.avoid]}>
                  {startGood ? copy.good : copy.avoid}
                </Text>
                <Text style={styles.rule}>{copy.startingSomethingNew}</Text>
                <Text style={styles.windowLine}>
                  {windowLabel(language, sky.currentWindow.name)} · {copy.endsIn}{' '}
                  {formatCountdown(remaining)}
                </Text>
              </View>

              <View style={styles.limbs}>
                {day?.nakshatra ? (
                  <LimbCard label={copy.nakshatra} value={day.nakshatra.name} />
                ) : null}
                {day?.yoga ? <LimbCard label={copy.yoga} value={day.yoga.name} /> : null}
                {day?.karana ? <LimbCard label={copy.karana} value={day.karana.name} /> : null}
                {choghadiya ? <LimbCard label={copy.choghadiya} value={choghadiya} /> : null}
              </View>

              {day?.good.length || day?.avoid.length ? (
                <View style={styles.split}>
                  {day.good.length ? (
                    <View style={styles.col}>
                      <Text style={styles.goodNote}>{copy.good}</Text>
                      {day.good.slice(0, 3).map((line) => (
                        <Text key={line} style={styles.note}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                  {day.avoid.length ? (
                    <View style={styles.col}>
                      <Text style={styles.avoidNote}>{copy.avoid}</Text>
                      {day.avoid.slice(0, 3).map((line) => (
                        <Text key={line} style={styles.note}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.chips}>
                <TimingChip
                  name={copy.windows.rahu}
                  start={sky.rahu.start.clock}
                  end={sky.rahu.end.clock}
                  hot={sky.currentWindow.name === 'rahu'}
                />
                <TimingChip
                  name={copy.windows.yamaganda}
                  start={sky.yamaganda.start.clock}
                  end={sky.yamaganda.end.clock}
                  hot={sky.currentWindow.name === 'yamaganda'}
                />
                <TimingChip
                  name={copy.windows.gulika}
                  start={sky.gulika.start.clock}
                  end={sky.gulika.end.clock}
                  hot={sky.currentWindow.name === 'gulika'}
                />
                {sky.abhijit ? (
                  <TimingChip
                    name={copy.windows.abhijit}
                    start={sky.abhijit.start.clock}
                    end={sky.abhijit.end.clock}
                    hot={sky.currentWindow.name === 'abhijit'}
                  />
                ) : null}
                {day?.brahma && (isClock(day.brahma.start) || isClock(day.brahma.end)) ? (
                  <TimingChip
                    name={copy.brahma}
                    start={isClock(day.brahma.start) ? day.brahma.start : '—'}
                    end={isClock(day.brahma.end) ? day.brahma.end : '—'}
                  />
                ) : null}
              </View>

              {!shot ? (
                <StatusBlock
                  copy={copy}
                  setup={daySetup && !day}
                  failed={dayFailed && !day}
                  onRetry={() => setReload((n) => n + 1)}
                  locale={language}
                />
              ) : null}

              {card ? (
                <>
                  <Pressable
                    onPress={() => {
                      void onShare();
                    }}
                    style={styles.shareCta}
                    accessibilityRole="button"
                    accessibilityLabel={copy.shareToday}
                  >
                    <Text style={styles.shareCtaText}>{sharing ? '…' : copy.shareToday}</Text>
                  </Pressable>
                  <View style={styles.cardWrap} ref={cardRef} collapsable={false}>
                    <ShareCard card={card} branded={!credits.wallet?.isPro()} />
                  </View>
                </>
              ) : null}
            </ScrollView>
            ) : null}
            {!overlayOpen ? (
            <View style={styles.dock}>
              <AlmanacDock copy={copy} onOpen={setAlmanac} />
              <AskFAB
                remaining={credits.remaining}
                language={language}
                onPress={() => setAskOpen(true)}
              />
            </View>
            ) : null}
            <AskPage
              visible={askOpen}
              onClose={() => setAskOpen(false)}
              sky={sky}
              language={language}
              wallet={credits.wallet}
              onRemainingChange={credits.refresh}
              onBuyMonthly={credits.buyMonthly}
              onBuyAnnual={credits.buyAnnual}
              onBuyPack={credits.buyPack}
              onRestore={credits.restore}
              onVerdict={(verdict) => playVerdict(verdict)}
              initialTurns={shot === 'ask' ? [PREVIEW_ASK_TURN] : undefined}
              dayContext={day}
              chartContext={chartContext}
              matchContext={matchContext}
              copy={copy}
              defaultCity={place.city}
              onMatch={setMatchContext}
            />
          </>
        ) : overlayOpen ? null : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{place.locating ? copy.locating : copy.citySearch}</Text>
          </View>
        )}

        {overlayOpen ? <View style={styles.overlayHold} /> : <Text style={styles.privacy}>{copy.privacyLocation}</Text>}

        <AlmanacHost
          tab={almanac}
          onClose={() => setAlmanac(null)}
          city={place.city}
          language={language}
          copy={copy}
          wallet={credits.wallet}
          onRemainingChange={credits.refresh}
          onBuyMonthly={credits.buyMonthly}
          onBuyAnnual={credits.buyAnnual}
          onBuyPack={credits.buyPack}
          onRestore={credits.restore}
          onOpenPaywall={() => setPaywallOpen(true)}
          shot={shot}
          sky={sky}
          dayContext={day}
          onMatch={setMatchContext}
        />

        {paywallOpen ? (
          <Paywall
            language={language}
            remaining={credits.remaining}
            onBuyMonthly={credits.buyMonthly}
            onBuyAnnual={credits.buyAnnual}
            onBuyPack={credits.buyPack}
            onRestore={credits.restore}
            onClose={() => setPaywallOpen(false)}
          />
        ) : null}

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
  root: { flex: 1, backgroundColor: 'transparent' },
  safe: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 20 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  cityHit: { flex: 1, paddingRight: 12 },
  brand: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  city: { color: color.ivory, fontSize: 26, fontWeight: '700', marginTop: 4 },
  payChip: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 4,
  },
  payChipText: { color: color.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  seg: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 12, 22, 0.55)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 3,
  },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  segOn: { backgroundColor: color.gold },
  segText: { color: color.ivoryDim, fontSize: 13, fontWeight: '600' },
  segTextOn: { color: color.ink },
  scroll: { paddingBottom: 12, gap: 16 },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 4 },
  heroName: {
    color: color.ivory,
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  paksha: { color: color.goldSoft, fontSize: 16, marginTop: 6 },
  verdict: {
    marginTop: 20,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  good: { color: color.now },
  avoid: { color: color.wait },
  rule: { color: color.ivoryMuted, fontSize: 15, marginTop: 4 },
  windowLine: { color: color.ivoryDim, fontSize: 14, marginTop: 14 },
  limbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  limb: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: color.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  limbLabel: {
    color: color.goldSoft,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  limbValue: { color: color.ivory, fontSize: 17, fontWeight: '600' },
  split: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 4 },
  goodNote: { color: color.now, fontSize: 13, fontWeight: '700' },
  avoidNote: { color: color.wait, fontSize: 13, fontWeight: '700' },
  note: { color: color.ivoryMuted, fontSize: 13, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: color.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 238, 224, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '47%',
    flexGrow: 1,
  },
  chipHot: {
    borderColor: 'rgba(232, 197, 120, 0.55)',
    backgroundColor: 'rgba(120, 70, 30, 0.22)',
  },
  chipName: { color: color.ivoryMuted, fontSize: 12 },
  chipNameHot: { color: color.gold, fontWeight: '700' },
  chipClock: { color: color.ivory, fontSize: 15, fontWeight: '600', marginTop: 2 },
  shareCta: {
    backgroundColor: color.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareCtaText: {
    color: color.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardWrap: { alignItems: 'center' },
  overlayHold: { flex: 1 },
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
