import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AskFAB, AskSheet } from '../ask';
import { useCredits } from '../billing';
import { getSkyState, type SkyState } from '../engine';
import { useLanguage } from '../i18n/language';
import { stateLabel, windowLabel } from '../i18n/strings';
import { KundliScreen, MatchingScreen } from '../kundli';
import { cityLabel } from '../location/cities';
import { usePlace } from '../location/usePlace';
import { SkyBackdrop, useReduceMotion, useVerdictBeat } from '../motion';
import { syncGlance } from '../widget/syncGlance';
import { CitySearch } from './CitySearch';
import { toMotionVerdict, toMotionWindow } from './motionWindow';

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
  const [kundliOpen, setKundliOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

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
    if (!place.city) {
      return null;
    }
    return getSkyState(place.city.lat, place.city.lon, now, {
      city: cityLabel(place.city, language),
      language,
    });
  }, [place.city, now, language]);

  useEffect(() => {
    if (place.city && sky) {
      void syncGlance({
        city: cityLabel(place.city, language),
        windowName: windowLabel(language, sky.currentWindow.name),
        state: sky.startingSomethingNew,
        language,
      });
    }
  }, [place.city, sky, language]);

  const remaining = sky
    ? new Date(sky.currentWindow.end).getTime() - now.getTime()
    : 0;

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
          <Text style={styles.city}>
            {place.city ? cityLabel(place.city, language) : copy.citySearch}
          </Text>
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
            <View style={styles.glance}>
              <Text style={styles.window}>{windowLabel(language, sky.currentWindow.name)}</Text>
              <Text style={styles.countdown}>
                {copy.endsIn} {formatCountdown(remaining)}
              </Text>
              <Text style={[styles.state, sky.startingSomethingNew === 'now' ? styles.now : styles.wait]}>
                {stateLabel(language, sky.startingSomethingNew)}
              </Text>
              <Text style={styles.rule}>{copy.startingSomethingNew}</Text>
            </View>
            <View style={styles.tools}>
              <Pressable onPress={() => setKundliOpen(true)} hitSlop={8}>
                <Text style={styles.tool}>{copy.kundli}</Text>
              </Pressable>
              <Text style={styles.toolDot}>·</Text>
              <Pressable onPress={() => setMatchOpen(true)} hitSlop={8}>
                <Text style={styles.tool}>{copy.matching}</Text>
              </Pressable>
            </View>
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
            <View style={styles.tools}>
              <Pressable onPress={() => setKundliOpen(true)} hitSlop={8}>
                <Text style={styles.tool}>{copy.kundli}</Text>
              </Pressable>
              <Text style={styles.toolDot}>·</Text>
              <Pressable onPress={() => setMatchOpen(true)} hitSlop={8}>
                <Text style={styles.tool}>{copy.matching}</Text>
              </Pressable>
            </View>
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
        <KundliScreen
          visible={kundliOpen}
          onClose={() => setKundliOpen(false)}
          copy={copy}
          language={language}
          defaultCity={place.city}
          wallet={credits.wallet}
          onRemainingChange={credits.refresh}
          onBuyMonthly={credits.buyMonthly}
          onBuyPack={credits.buyPack}
          onRestore={credits.restore}
        />
        <MatchingScreen
          visible={matchOpen}
          onClose={() => setMatchOpen(false)}
          copy={copy}
          language={language}
          defaultCity={place.city}
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
    paddingHorizontal: 24,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  city: {
    color: '#F4EEE0',
    fontSize: 20,
    fontWeight: '600',
  },
  change: {
    color: 'rgba(232, 197, 120, 0.8)',
    marginTop: 4,
    fontSize: 13,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    padding: 4,
  },
  lang: {
    color: 'rgba(244, 238, 224, 0.4)',
    fontSize: 15,
  },
  langOn: {
    color: '#E8C578',
  },
  langDivider: {
    color: 'rgba(244, 238, 224, 0.3)',
    marginHorizontal: 4,
  },
  glance: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  window: {
    color: '#F4EEE0',
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  countdown: {
    color: 'rgba(244, 238, 224, 0.7)',
    fontSize: 18,
  },
  state: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  now: {
    color: '#C8E6C0',
  },
  wait: {
    color: '#E8C578',
  },
  rule: {
    color: 'rgba(244, 238, 224, 0.55)',
    fontSize: 15,
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
  tools: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  tool: {
    color: '#E8C578',
    fontSize: 16,
    fontWeight: '600',
  },
  toolDot: {
    color: 'rgba(244, 238, 224, 0.35)',
    fontSize: 16,
  },
  dock: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  privacy: {
    textAlign: 'center',
    color: 'rgba(244, 238, 224, 0.35)',
    fontSize: 12,
    marginBottom: 8,
  },
});
