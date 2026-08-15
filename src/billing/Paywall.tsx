import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../engine';
import { privacyLine, remainingLabel } from '../ask/copy';
import { color } from '../theme/tokens';
import { ANNUAL_PRICE_INR, MONTHLY_PRICE_INR, PACK_PRICE_INR } from './products';
import { STORE_LATER } from './revenuecat';

type Props = {
  language: Language;
  remaining: number;
  onBuyMonthly: () => Promise<void>;
  onBuyAnnual?: () => Promise<void>;
  onBuyPack: () => Promise<void>;
  onRestore: () => Promise<void>;
  onClose?: () => void;
};

function benefitLines(hi: boolean): string[] {
  return hi
    ? [
        'घर की झलक हमेशा मुफ़्त',
        'अधिक मुहूर्त — साठ दिन',
        'गहरा गुण मिलान',
        'त्योहार की सुबह याद',
        'बिना नाम का शेयर कार्ड',
        'पूछ की मात्रा',
      ]
    : [
        'Daily glance stays free',
        'Extra muhurats — sixty days',
        'Deeper guna milan',
        'Festival morning reminders',
        'Unbranded share cards',
        'Ask quota',
      ];
}

export function Paywall({
  language,
  remaining,
  onBuyMonthly,
  onBuyAnnual,
  onBuyPack,
  onRestore,
  onClose,
}: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hi = language === 'hi';

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (err) {
      const raw = err instanceof Error ? err.message : STORE_LATER;
      setError(
        raw === STORE_LATER
          ? hi
            ? 'स्टोर बाद में जुड़ेगा। चाबी कल।'
            : 'Store connects later. Keys come tomorrow.'
          : raw,
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.root} pointerEvents="auto">
      <SafeAreaView style={styles.safe}>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeHit} accessibilityRole="button">
            <Text style={styles.close}>{hi ? 'बंद' : 'Close'}</Text>
          </Pressable>
        ) : null}
        <ScrollView contentContainerStyle={styles.box} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>{hi ? 'शुभ' : 'SHUBH'}</Text>
          <Text style={styles.title}>{hi ? 'शुभ खोलो' : 'Open Shubh'}</Text>
          <Text style={styles.remaining}>{remainingLabel(language, remaining)}</Text>
          <Text style={styles.lead}>
            {hi
              ? 'आज का पंचांग मुफ़्त रहता है। बाकी — मुहूर्त, मिलान, याद, शेयर, पूछ — यहीं खुलते हैं।'
              : 'The daily glance stays free. Extra muhurats, matching depth, reminders, unbranded share, and asks open here.'}
          </Text>

          <View style={styles.benefits}>
            {benefitLines(hi).map((line) => (
              <View key={line} style={styles.benefit}>
                <Text style={styles.dot}>✦</Text>
                <Text style={styles.benefitText}>{line}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.primary}
            disabled={Boolean(busy)}
            onPress={() => run('monthly', onBuyMonthly)}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText}>
              {hi
                ? `महीना · ₹${MONTHLY_PRICE_INR.min}–${MONTHLY_PRICE_INR.max}`
                : `Monthly · ₹${MONTHLY_PRICE_INR.min}–${MONTHLY_PRICE_INR.max}`}
            </Text>
            <Text style={styles.sku}>{hi ? '100 पूछ · टेस्ट कीमत' : '100 asks · test price'}</Text>
          </Pressable>

          <Pressable
            style={styles.secondary}
            disabled={Boolean(busy)}
            onPress={() => run('annual', onBuyAnnual ?? onBuyMonthly)}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>
              {hi
                ? `साल · ₹${ANNUAL_PRICE_INR.min}–${ANNUAL_PRICE_INR.max}`
                : `Year · ₹${ANNUAL_PRICE_INR.min}–${ANNUAL_PRICE_INR.max}`}
            </Text>
            <Text style={styles.sku}>{hi ? 'वही द्वार, एक बार' : 'Same door, once a year'}</Text>
          </Pressable>

          <Pressable
            style={styles.ghost}
            disabled={Boolean(busy)}
            onPress={() => run('pack', onBuyPack)}
            accessibilityRole="button"
          >
            <Text style={styles.ghostText}>
              {hi ? `पैक · ₹${PACK_PRICE_INR} · 100 पूछ` : `Pack · ₹${PACK_PRICE_INR} · 100 asks`}
            </Text>
          </Pressable>

          <Pressable
            style={styles.link}
            disabled={Boolean(busy)}
            onPress={() => run('restore', onRestore)}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>{hi ? 'खरीद वापस लाओ' : 'Restore purchases'}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.privacy}>{privacyLine(language)}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: 'rgba(6, 7, 14, 0.94)',
  },
  safe: { flex: 1, paddingHorizontal: 22 },
  closeHit: { alignSelf: 'flex-start', paddingTop: 8, paddingBottom: 4 },
  close: { color: color.gold, fontSize: 16, fontWeight: '600' },
  box: { gap: 14, paddingBottom: 36, paddingTop: 8 },
  kicker: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    color: color.ivory,
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  remaining: { color: color.goldSoft, fontSize: 15, textAlign: 'center' },
  lead: { color: color.ivoryMuted, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  benefits: { gap: 10, marginTop: 8 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { color: color.gold, fontSize: 14 },
  benefitText: { color: color.ivory, fontSize: 16, fontWeight: '500' },
  primary: {
    backgroundColor: color.gold,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  primaryText: { color: color.ink, fontSize: 18, fontWeight: '800' },
  secondary: {
    borderColor: color.gold,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  secondaryText: { color: color.ivory, fontSize: 17, fontWeight: '700' },
  sku: { color: color.ivoryDim, fontSize: 13, marginTop: 4 },
  ghost: {
    borderColor: color.goldLine,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  ghostText: { color: color.goldSoft, fontSize: 16, fontWeight: '600' },
  link: { paddingVertical: 8, alignItems: 'center' },
  linkText: { color: color.gold, fontSize: 15 },
  error: { color: color.danger, fontSize: 14, textAlign: 'center' },
  privacy: { color: color.ivoryDim, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
