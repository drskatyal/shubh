import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCredits } from '../billing';
import { getSkyState, type Language, type SkyState } from '../engine';
import { MOCK_SKY } from '../fixtures/mockSky';
import { SkyBackdrop, useReduceMotion, useVerdictBeat } from '../motion';
import { AskFAB } from './AskFAB';
import { AskSheet } from './AskSheet';
import { windowKindFromSky } from './windowKind';

/**
 * Ask on the motion shell. Home can replace this and still pass sky + playVerdict.
 */
export function AskOnSkyScreen() {
  const credits = useCredits();
  const reduceMotion = useReduceMotion();
  const { intensity, activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);
  const [language, setLanguage] = useState<Language>('en');
  const [open, setOpen] = useState(false);
  const [sky, setSky] = useState<SkyState>(MOCK_SKY);
  const [usingMockSky, setUsingMockSky] = useState(true);

  useEffect(() => {
    // Home passes live getSkyState(lat, lon, date). This preview has no city.
    try {
      const live = getSkyState();
      setSky(live);
      setUsingMockSky(false);
    } catch {
      setSky(MOCK_SKY);
      setUsingMockSky(true);
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SkyBackdrop
        windowKind={windowKindFromSky(sky)}
        locale={language}
        verdict={activeVerdict}
        beatIntensity={intensity}
        beatVerdict={activeVerdict}
      />

      <View style={styles.glance} pointerEvents="none">
        <Text style={styles.brand}>Shubh</Text>
        <Text style={styles.sub}>
          {language === 'hi' ? 'क्या अब ठीक है?' : 'Is now good for this?'}
        </Text>
        {usingMockSky ? (
          <Text style={styles.note}>
            {language === 'hi'
              ? 'डेमो आकाश — इंजन PR लाइव getSkyState देगा।'
              : 'Demo sky — the engine PR will supply live getSkyState.'}
          </Text>
        ) : null}
      </View>

      <View style={styles.dock}>
        <View style={styles.langs}>
          <Pressable onPress={() => setLanguage('en')} style={styles.lang}>
            <Text style={[styles.langText, language === 'en' && styles.langOn]}>EN</Text>
          </Pressable>
          <Pressable onPress={() => setLanguage('hi')} style={styles.lang}>
            <Text style={[styles.langText, language === 'hi' && styles.langOn]}>हिन्दी</Text>
          </Pressable>
        </View>
        <AskFAB
          remaining={credits.remaining}
          language={language}
          onPress={() => setOpen(true)}
        />
      </View>

      <AskSheet
        visible={open}
        onClose={() => setOpen(false)}
        sky={sky}
        language={language}
        wallet={credits.wallet}
        onRemainingChange={credits.refresh}
        onBuyMonthly={credits.buyMonthly}
        onBuyPack={credits.buyPack}
        onRestore={credits.restore}
        onVerdict={(verdict) => playVerdict(verdict)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#06070E',
  },
  glance: {
    position: 'absolute',
    top: '18%',
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    color: 'rgba(244,232,200,0.88)',
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 4,
  },
  sub: { color: 'rgba(244,232,200,0.7)', fontSize: 16 },
  note: { color: 'rgba(232,220,184,0.45)', fontSize: 13, textAlign: 'center' },
  dock: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 36,
    alignItems: 'center',
    gap: 12,
  },
  langs: { flexDirection: 'row', gap: 16 },
  lang: { padding: 8 },
  langText: { color: 'rgba(232,220,184,0.45)', fontSize: 16 },
  langOn: { color: 'rgba(232,180,80,0.95)', fontWeight: '700' },
});
