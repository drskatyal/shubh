import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Language } from '../engine';
import { privacyLine, remainingLabel } from '../ask/copy';
import { MONTHLY_PRICE_INR, PACK_PRICE_INR, PRODUCTS } from './products';

type Props = {
  language: Language;
  remaining: number;
  onBuyMonthly: () => Promise<void>;
  onBuyPack: () => Promise<void>;
  onRestore: () => Promise<void>;
};

export function Paywall({
  language,
  remaining,
  onBuyMonthly,
  onBuyPack,
  onRestore,
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
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{hi ? 'पूछ खत्म' : 'No asks left'}</Text>
      <Text style={styles.remaining}>{remainingLabel(language, remaining)}</Text>
      <Text style={styles.lead}>
        {hi
          ? 'और पूछ, गहरी कुंडली / गुण मिलान, और आगे के मुहूर्त। घर की झलक मुफ़्त रहती है।'
          : 'Extra asks, deeper kundli / guna milan, and further muhurat ranges. The home glance stays free.'}
      </Text>

      <Pressable
        style={styles.primary}
        disabled={Boolean(busy)}
        onPress={() => run('monthly', onBuyMonthly)}
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>
          {hi
            ? `महीना · ₹${MONTHLY_PRICE_INR.min}–${MONTHLY_PRICE_INR.max} · 100 पूछ`
            : `Monthly · ₹${MONTHLY_PRICE_INR.min}–${MONTHLY_PRICE_INR.max} · 100 asks`}
        </Text>
        <Text style={styles.sku}>{PRODUCTS.monthly}</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        disabled={Boolean(busy)}
        onPress={() => run('pack', onBuyPack)}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>
          {hi ? `पैक · ₹${PACK_PRICE_INR} · 100 पूछ` : `Pack · ₹${PACK_PRICE_INR} · 100 asks`}
        </Text>
        <Text style={styles.sku}>{PRODUCTS.pack}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12 },
  title: { color: '#F6EDE0', fontSize: 22, fontWeight: '700' },
  remaining: { color: '#E8A838', fontSize: 15 },
  lead: { color: '#C9BBA8', fontSize: 15, lineHeight: 22 },
  primary: {
    backgroundColor: '#E8A838',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  primaryText: { color: '#1A1208', fontSize: 16, fontWeight: '700' },
  secondary: {
    borderColor: '#E8A838',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  secondaryText: { color: '#F6EDE0', fontSize: 16, fontWeight: '700' },
  sku: { color: '#8A7B68', fontSize: 12, marginTop: 4 },
  link: { paddingVertical: 8 },
  linkText: { color: '#E8A838', fontSize: 15 },
  error: { color: '#E07070', fontSize: 14 },
  privacy: { color: '#8A7B68', fontSize: 12, lineHeight: 18 },
});
