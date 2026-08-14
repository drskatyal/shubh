import { ScrollView, StyleSheet, Text } from 'react-native';

import { MarriageFlow } from '../ask/marriage/MarriageFlow';
import type { CreditWallet } from '../billing/credits';
import type { SkyState } from '../engine';
import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import type { NormalizedDay, NormalizedMatch } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
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
  onBuyPack,
  onRestore,
  onMatch,
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
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onMatch?: (match: NormalizedMatch) => void;
}) {
  if (!visible) return null;

  return (
    <Sheet visible={visible} title={copy.matchingTitle} onClose={onClose} closeLabel={copy.close}>
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
          onBuyPack={onBuyPack}
          onRestore={onRestore}
          onMatch={onMatch}
        />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48, gap: 8 },
  privacy: { color: color.ivoryDim, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
