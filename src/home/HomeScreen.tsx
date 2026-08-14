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

import { AskFAB, AskSheet } from '../ask';
import { useCredits } from '../billing';
import { getSkyState, type SkyState } from '../engine';
import { useLanguage } from '../i18n/language';
import { choghadiyaLabel, pakshaLabel, windowLabel } from '../i18n/strings';
import { cityLabel } from '../location/cities';
import { usePlace } from '../location/usePlace';
import { SkyBackdrop, useReduceMotion, useVerdictBeat } from '../motion';
import { civilYmd, loadDay, withLiveSky, type DayContextView } from '../tathaastu';
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
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
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
  const { intensity, activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);
  const [now, setNow] = useState(() => new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [day, setDay] = useState<DayContextView | null>(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<ViewType>(null);

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
    if (!place.city) {
      setDay(null);
      return;
    }
    const city = place.city;
    let cancelled = false;
    const at = new Date();
    void loadDay({
      lat: city.lat,
      lon: city.lon,
      date: civilYmd(city.lat, city.lon, at),
      lang: language,
      city: cityLabel(city, language),
      at,
    }).then((next) => {
      if (!cancelled) setDay(next);
    });
    return () => {
      cancelled = true;
    };
  }, [place.city, language]);

  const liveDay = day && sky ? withLiveSky(day, sky) : day;
  const card = liveDay ? buildShareCard(liveDay) : null;
  const heroName = liveDay?.tithi?.name ?? (sky ? windowLabel(language, sky.currentWindow.name) : '');
  const paksha = liveDay ? pakshaLabel(language, liveDay.tithi?.paksha) : null;
  const startGood = liveDay?.startSomething === 'good' || sky?.startingSomethingNew === 'now';
  const startLabel = startGood ? copy.good : copy.avoid;
  const remaining = sky ? new Date(sky.currentWindow.end).getTime() - now.getTime() : 0;
  const inRahu = sky?.currentWindow.name === 'rahu';

  useEffect(() => {
    if (place.city && sky && liveDay) {
      void syncGlance({
        city: cityLabel(place.city, language),
        windowName: liveDay.tithi?.name ?? windowLabel(language, sky.currentWindow.name),
        tithi: liveDay.tithi?.name,
        state: sky.startingSomethingNew,
        language,
      });
    }
  }, [place.city, sky, liveDay, language]);

  const onShare = async () => {
    if (!liveDay || sharing) return;
    setSharing(true);
    try {
      await sharePanchang(liveDay, () => captureViewPng(cardRef.current));
    } catch {
      // Capture can fail in Expo Go; the card is still on screen.
    } finally {
      setSharing(false);
    }
  };

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
          <Pressable onPress={() => setSearchOpen(true)} hitSlop={8} style={styles.cityHit}>
            <Text style={styles.brand}>{copy.appName}</Text>
            <Text style={styles.city}>
              {place.city ? cityLabel(place.city, language) : copy.citySearch} ▾
            </Text>
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

        {sky ? (
          <>
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.hero}>
                <Text style={styles.heroName}>{heroName}</Text>
                {paksha ? <Text style={styles.paksha}>{paksha}</Text> : null}
                <Text style={[styles.verdict, startGood ? styles.good : styles.avoid]}>
                  {startLabel}
                </Text>
                <Text style={styles.rule}>{copy.startingSomethingNew}</Text>
                <Text style={styles.windowLine}>
                  {windowLabel(language, sky.currentWindow.name)} · {copy.endsIn}{' '}
                  {formatCountdown(remaining)}
                </Text>
              </View>

              {liveDay?.nakshatra || liveDay?.yoga || liveDay?.karana ? (
                <View style={styles.limbs}>
                  {liveDay.nakshatra ? (
                    <LimbCard label={copy.nakshatra} value={liveDay.nakshatra.name} />
                  ) : null}
                  {liveDay.yoga ? <LimbCard label={copy.yoga} value={liveDay.yoga.name} /> : null}
                  {liveDay.karana ? (
                    <LimbCard label={copy.karana} value={liveDay.karana.name} />
                  ) : null}
                  <LimbCard
                    label={copy.choghadiya}
                    value={choghadiyaLabel(language, liveDay.choghadiya.name)}
                  />
                </View>
              ) : (
                <View style={styles.limbs}>
                  <LimbCard
                    label={copy.choghadiya}
                    value={choghadiyaLabel(language, sky.choghadiya.current.name)}
                  />
                </View>
              )}

              {liveDay ? (
                <View style={styles.chips}>
                  <TimingChip
                    name={copy.windows.rahu}
                    start={liveDay.rahu.startClock}
                    end={liveDay.rahu.endClock}
                    hot={inRahu}
                  />
                  <TimingChip
                    name={copy.windows.yamaganda}
                    start={liveDay.yamaganda.startClock}
                    end={liveDay.yamaganda.endClock}
                    hot={sky.currentWindow.name === 'yamaganda'}
                  />
                  <TimingChip
                    name={copy.windows.gulika}
                    start={liveDay.gulika.startClock}
                    end={liveDay.gulika.endClock}
                    hot={sky.currentWindow.name === 'gulika'}
                  />
                  {liveDay.abhijit ? (
                    <TimingChip
                      name={copy.windows.abhijit}
                      start={liveDay.abhijit.startClock}
                      end={liveDay.abhijit.endClock}
                      hot={sky.currentWindow.name === 'abhijit'}
                    />
                  ) : null}
                  {liveDay.brahma ? (
                    <TimingChip
                      name={copy.brahma}
                      start={liveDay.brahma.startClock}
                      end={liveDay.brahma.endClock}
                    />
                  ) : null}
                </View>
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
                    <Text style={styles.shareCtaText}>
                      {sharing ? '…' : copy.shareToday}
                    </Text>
                  </Pressable>
                  <View style={styles.cardWrap} ref={cardRef} collapsable={false}>
                    <ShareCard card={card} />
                  </View>
                </>
              ) : null}
            </ScrollView>
            <View style={styles.dock}>
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
              dayContext={liveDay?.promptPayload}
              language={language}
              wallet={credits.wallet}
              onRemainingChange={credits.refresh}
              onBuyMonthly={credits.buyMonthly}
              onBuyPack={credits.buyPack}
              onRestore={credits.restore}
              onVerdict={(verdict) => playVerdict(verdict)}
            />
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{place.locating ? copy.locating : copy.citySearch}</Text>
          </View>
        )}

        <Text style={styles.privacy}>{copy.privacyLocation}</Text>

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
  root: {
    flex: 1,
    backgroundColor: '#06070E',
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  cityHit: {
    flex: 1,
    paddingRight: 12,
  },
  brand: {
    color: '#E8C578',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  city: {
    color: '#F4EEE0',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 12, 22, 0.55)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.22)',
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segOn: {
    backgroundColor: '#E8C578',
  },
  segText: {
    color: 'rgba(244, 238, 224, 0.55)',
    fontSize: 13,
    fontWeight: '600',
  },
  segTextOn: {
    color: '#1A1208',
  },
  scroll: {
    paddingBottom: 12,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
  },
  heroName: {
    color: '#F4EEE0',
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  paksha: {
    color: 'rgba(232, 197, 120, 0.9)',
    fontSize: 16,
    marginTop: 6,
  },
  verdict: {
    marginTop: 22,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  good: { color: '#C8E6C0' },
  avoid: { color: '#E8C578' },
  rule: {
    color: 'rgba(244, 238, 224, 0.55)',
    fontSize: 15,
    marginTop: 4,
  },
  windowLine: {
    color: 'rgba(244, 238, 224, 0.45)',
    fontSize: 14,
    marginTop: 14,
  },
  limbs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  limb: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: 'rgba(8, 10, 20, 0.45)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  limbLabel: {
    color: 'rgba(232, 197, 120, 0.7)',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  limbValue: {
    color: '#F4EEE0',
    fontSize: 17,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(8, 10, 20, 0.4)',
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
  chipName: {
    color: 'rgba(244, 238, 224, 0.6)',
    fontSize: 12,
  },
  chipNameHot: {
    color: '#E8C578',
    fontWeight: '700',
  },
  chipClock: {
    color: '#F4EEE0',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  shareCta: {
    backgroundColor: '#E8C578',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareCtaText: {
    color: '#1A1208',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardWrap: {
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(244, 238, 224, 0.6)',
    fontSize: 16,
  },
  dock: {
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 4,
  },
  privacy: {
    textAlign: 'center',
    color: 'rgba(244, 238, 224, 0.32)',
    fontSize: 11,
    marginBottom: 6,
  },
});
