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

import type { CreditWallet } from '../billing/credits';
import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import { loadBirthChart } from '../tathaastu/client';
import { toChartAskSummary } from '../tathaastu/normalize';
import type { BirthData, NormalizedChart, TathaLoad } from '../tathaastu/types';
import { BirthForm, birthFormValid, emptyBirth } from './BirthForm';
import { ChartAskSheet } from './ChartAskSheet';
import { ChartView } from './ChartView';
import { birthPrivacy, fixtureBanner } from './copy';
import { loadKundliForm, saveKundliForm } from './storage';
import { useAskAboutChart } from './useAskAboutChart';

export function KundliScreen({
  visible,
  onClose,
  copy,
  language,
  defaultCity,
  wallet,
  onRemainingChange,
  onBuyMonthly,
  onBuyPack,
  onRestore,
}: {
  visible: boolean;
  onClose: () => void;
  copy: Copy;
  language: Language;
  defaultCity: City | null;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
}) {
  const [form, setForm] = useState<BirthData>(() => emptyBirth({ city: defaultCity }));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TathaLoad<NormalizedChart> | null>(null);
  const chartAsk = useAskAboutChart();

  useEffect(() => {
    if (!visible) return;
    void loadKundliForm().then((stored) => {
      if (stored) setForm(stored);
      else setForm(emptyBirth({ city: defaultCity }));
    });
  }, [visible, defaultCity]);

  const onGenerate = async () => {
    if (!birthFormValid(form)) return;
    setBusy(true);
    try {
      await saveKundliForm(form);
      const loaded = await loadBirthChart(form, { language });
      setResult(loaded);
    } finally {
      setBusy(false);
    }
  };

  const summary = result ? toChartAskSummary(result.data) : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>{copy.close}</Text>
          </Pressable>
          <Text style={styles.heading}>{copy.kundliTitle}</Text>
          <Text style={styles.privacy}>{birthPrivacy(language)}</Text>

          <BirthForm value={form} onChange={setForm} copy={copy} language={language} />

          <Pressable
            onPress={() => void onGenerate()}
            disabled={busy || !birthFormValid(form)}
            style={[styles.cta, (busy || !birthFormValid(form)) && styles.ctaOff]}
          >
            <Text style={styles.ctaText}>{busy ? copy.generating : copy.generateKundli}</Text>
          </Pressable>

          {busy ? <ActivityIndicator color="#E8C578" style={styles.spin} /> : null}

          {result ? (
            <View style={styles.result}>
              {result.setup ? (
                <Text style={styles.banner}>{fixtureBanner(language, result.setup)}</Text>
              ) : null}
              <ChartView chart={result.data} copy={copy} />
              <Pressable
                onPress={() => summary && chartAsk.openFromTap(summary)}
                style={styles.ask}
                accessibilityRole="button"
              >
                <Text style={styles.askText}>{copy.askAboutChart}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <ChartAskSheet
          visible={chartAsk.visible}
          armed={chartAsk.armed}
          onClose={chartAsk.close}
          summary={chartAsk.summary}
          language={language}
          wallet={wallet}
          onRemainingChange={onRemainingChange}
          onBuyMonthly={onBuyMonthly}
          onBuyPack={onBuyPack}
          onRestore={onRestore}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1020' },
  scroll: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  close: { alignSelf: 'flex-end', padding: 8 },
  closeText: { color: '#C9BBA8', fontSize: 15 },
  heading: { color: '#F4EEE0', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  privacy: { color: 'rgba(244, 238, 224, 0.45)', fontSize: 13, marginBottom: 16, lineHeight: 18 },
  cta: {
    backgroundColor: '#E8C578',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: '#1A1208', fontSize: 16, fontWeight: '700' },
  spin: { marginTop: 16 },
  result: { marginTop: 28, gap: 16 },
  banner: {
    color: '#E8C578',
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: 'rgba(232, 197, 120, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  ask: {
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.4)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  askText: { color: '#E8C578', fontSize: 16, fontWeight: '600' },
});
