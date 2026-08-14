import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AskFAB, AskSheet } from './src/ask';
import { useCredits } from './src/billing';
import { getSkyState, type Language, type SkyState } from './src/engine';
import { MOCK_SKY } from './src/fixtures/mockSky';

/**
 * Thin host for the ask lane. Clock/home should replace this screen
 * and pass live sky from getSkyState into AskSheet.
 */
export default function App() {
  const credits = useCredits();
  const [language, setLanguage] = useState<Language>('en');
  const [open, setOpen] = useState(false);
  const [sky, setSky] = useState<SkyState>(MOCK_SKY);
  const [usingMockSky, setUsingMockSky] = useState(true);

  useEffect(() => {
    getSkyState()
      .then((live) => {
        setSky(live);
        setUsingMockSky(false);
      })
      .catch(() => {
        setSky(MOCK_SKY);
        setUsingMockSky(true);
      });
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  brand: { color: '#F6EDE0', fontSize: 36, fontWeight: '700' },
  sub: { color: '#C9BBA8', fontSize: 16 },
  note: { color: '#8A7B68', fontSize: 13, textAlign: 'center' },
  langs: { flexDirection: 'row', gap: 16, marginVertical: 8 },
  lang: { padding: 8 },
  langText: { color: '#8A7B68', fontSize: 16 },
  langOn: { color: '#E8A838', fontWeight: '700' },
});
