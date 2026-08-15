import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AskPage } from '../ask';
import type { CreditWallet } from '../billing/credits';
import { getSkyState } from '../engine';
import type { Copy, Language } from '../i18n/strings';
import { cityLabel, type City } from '../location/cities';
import { loadBirthChart } from '../tathaastu/client';
import { toChartAskSummary } from '../tathaastu/normalize';
import type { BirthData, NormalizedChart, TathaLoad } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { BirthForm, birthFormValid, emptyBirth } from './BirthForm';
import { ChartView } from './ChartView';
import { birthPrivacy } from './copy';
import { loadKundliForm, saveKundliForm, saveLastChart } from './storage';
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
  onBuyAnnual,
  onBuyPack,
  onRestore,
  previewChart,
}: {
  visible: boolean;
  onClose: () => void;
  copy: Copy;
  language: Language;
  defaultCity: City | null;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyAnnual?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  previewChart?: import('../tathaastu/types').NormalizedChart;
}) {
  const [form, setForm] = useState<BirthData>(() => emptyBirth({ city: defaultCity }));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TathaLoad<NormalizedChart> | null>(
    previewChart ? { ok: true, data: previewChart, source: 'fallback', status: 200 } : null,
  );
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
    tapHaptic();
    setBusy(true);
    try {
      await saveKundliForm(form);
      const next = await loadBirthChart(form, { language });
      setResult(next);
      if (next.ok) await saveLastChart(toChartAskSummary(next.data));
    } finally {
      setBusy(false);
    }
  };

  const summary = result?.ok ? toChartAskSummary(result.data) : null;

  return (
    <Sheet visible={visible} title={copy.kundliTitle} onClose={onClose} closeLabel={copy.close}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {previewChart ? null : (
          <>
            <Text style={styles.privacy}>{birthPrivacy(language)}</Text>
            <BirthForm value={form} onChange={setForm} copy={copy} language={language} city={defaultCity} />
            <Pressable
              onPress={() => void onGenerate()}
              disabled={busy || !birthFormValid(form)}
              style={[styles.cta, (busy || !birthFormValid(form)) && styles.ctaOff]}
            >
              <Text style={styles.ctaText}>{busy ? copy.generating : copy.generateKundli}</Text>
            </Pressable>
          </>
        )}

        {busy ? <StatusBlock copy={copy} loading /> : null}
        {result && !result.ok ? (
          <StatusBlock
            copy={copy}
            setup={result.setup}
            failed={!result.setup}
            onRetry={() => void onGenerate()}
          />
        ) : null}

        {result?.ok ? (
          <View style={styles.result}>
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

      {defaultCity ? (
        <AskPage
          visible={chartAsk.visible}
          onClose={chartAsk.close}
          sky={getSkyState(defaultCity.lat, defaultCity.lon, new Date(), {
            city: cityLabel(defaultCity, language),
            language,
          })}
          language={language}
          wallet={wallet}
          onRemainingChange={onRemainingChange}
          onBuyMonthly={onBuyMonthly}
          onBuyAnnual={onBuyAnnual}
          onBuyPack={onBuyPack}
          onRestore={onRestore}
          dayContext={null}
          chartContext={summary}
          copy={copy}
          defaultCity={defaultCity}
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48, gap: 8 },
  privacy: { color: color.ivoryDim, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  cta: {
    backgroundColor: color.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: color.ink, fontSize: 16, fontWeight: '700' },
  result: { marginTop: 20, gap: 16 },
  ask: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  askText: { color: color.gold, fontSize: 16, fontWeight: '600' },
});
