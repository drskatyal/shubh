import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { remainingLabel } from '../ask/copy';
import { MarriageFlow } from '../ask/marriage/MarriageFlow';
import type { CreditWallet } from '../billing/credits';
import type { SkyState } from '../engine';
import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import type { NormalizedDay, NormalizedMatch } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { birthPrivacy } from './copy';

export function MatchingScreen({
  visible,
  onClose,
  copy,
  language,
  defaultCity,
  wallet,
  sky,
  dayContext,
  onRemainingChange,
  onBuyMonthly,
  onBuyAnnual,
  onBuyPack,
  onRestore,
  onMatch,
  initialExtract,
  initialMatch,
}: {
  visible: boolean;
  onClose: () => void;
  copy: Copy;
  language: Language;
  defaultCity: City | null;
  wallet?: CreditWallet | null;
  sky?: SkyState | null;
  dayContext?: NormalizedDay | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyAnnual?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onMatch?: (match: NormalizedMatch) => void;
  initialExtract?: import('../ask/marriage/types').MarriageExtract | null;
  initialMatch?: NormalizedMatch | null;
}) {
  if (!visible) return null;
  const hi = language === 'hi';
  const remaining = wallet?.remaining() ?? 0;

  return (
    <View style={styles.root} pointerEvents="auto">
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Text style={styles.close}>{copy.close}</Text>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>{hi ? 'गुण मिलान' : 'Guna milan'}</Text>
            <Text style={styles.title}>{copy.matchingTitle}</Text>
          </View>
          <Text style={styles.remaining}>{remainingLabel(language, remaining)}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.privacy}>{birthPrivacy(language)}</Text>
          <MarriageFlow
            language={language}
            copy={copy}
            wallet={wallet ?? null}
            sky={sky}
            dayContext={dayContext}
            defaultCity={defaultCity}
            onRemainingChange={onRemainingChange}
            onBuyMonthly={onBuyMonthly}
            onBuyAnnual={onBuyAnnual}
            onBuyPack={onBuyPack}
            onRestore={onRestore}
            onMatch={onMatch}
            initialExtract={initialExtract}
            initialMatch={initialMatch}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 12,
    backgroundColor: 'rgba(6, 7, 14, 0.18)',
  },
  safe: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 12,
  },
  close: { color: color.gold, fontSize: 16, fontWeight: '600', paddingTop: 6 },
  titleBlock: { flex: 1, alignItems: 'center' },
  kicker: {
    color: color.gold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: { color: color.ivory, fontSize: 34, fontWeight: '700', letterSpacing: 1 },
  remaining: { color: color.ivoryDim, fontSize: 13, paddingTop: 8, maxWidth: 88, textAlign: 'right' },
  scroll: { paddingBottom: 48, gap: 8, flexGrow: 1 },
  privacy: { color: color.ivoryDim, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
