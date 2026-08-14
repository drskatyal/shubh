import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import { shareCard, type CaptureHandle } from '../share/captureCard';
import { matchPeople } from '../tathaastu/client';
import type { BirthData, NormalizedMatch, TathaLoad } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { StatusBlock } from '../ui/StatusBlock';
import { tapHaptic } from '../ui/haptics';
import { BirthForm, birthFormValid, emptyBirth } from './BirthForm';
import { birthPrivacy } from './copy';
import { formatScoreCardText } from './formatScoreCard';
import { ScoreCard } from './ScoreCard';
import { loadMatchForms, saveMatchForms } from './storage';

export function MatchingScreen({
  visible,
  onClose,
  copy,
  language,
  defaultCity,
}: {
  visible: boolean;
  onClose: () => void;
  copy: Copy;
  language: Language;
  defaultCity: City | null;
}) {
  const [personA, setPersonA] = useState<BirthData>(() => emptyBirth({ city: defaultCity }));
  const [personB, setPersonB] = useState<BirthData>(() => emptyBirth({ city: defaultCity }));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TathaLoad<NormalizedMatch> | null>(null);
  const cardRef = useRef<CaptureHandle>(null);

  useEffect(() => {
    if (!visible) return;
    void loadMatchForms().then((stored) => {
      if (stored) {
        setPersonA(stored.personA);
        setPersonB(stored.personB);
      } else {
        setPersonA(emptyBirth({ city: defaultCity }));
        setPersonB(emptyBirth({ city: defaultCity }));
      }
    });
  }, [visible, defaultCity]);

  const ready = birthFormValid(personA) && birthFormValid(personB);

  const onMatch = async () => {
    if (!ready) return;
    tapHaptic();
    setBusy(true);
    try {
      await saveMatchForms({ personA, personB });
      setResult(await matchPeople(personA, personB));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} title={copy.matchingTitle} onClose={onClose} closeLabel={copy.close}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.privacy}>{birthPrivacy(language)}</Text>
        <BirthForm
          value={personA}
          onChange={setPersonA}
          copy={copy}
          language={language}
          title={copy.personA}
          city={defaultCity}
        />
        <BirthForm
          value={personB}
          onChange={setPersonB}
          copy={copy}
          language={language}
          title={copy.personB}
          city={defaultCity}
        />
        <Pressable
          onPress={() => void onMatch()}
          disabled={busy || !ready}
          style={[styles.cta, (busy || !ready) && styles.ctaOff]}
        >
          <Text style={styles.ctaText}>{busy ? copy.matchingInProgress : copy.matchScore}</Text>
        </Pressable>

        {busy ? <StatusBlock copy={copy} loading /> : null}
        {result && !result.ok ? (
          <StatusBlock copy={copy} setup={result.setup} failed={!result.setup} onRetry={() => void onMatch()} />
        ) : null}

        {result?.ok ? (
          <View style={styles.result}>
            <View ref={cardRef as never}>
              <ScoreCard match={result.data} copy={copy} />
            </View>
            <Pressable
              onPress={() => {
                tapHaptic();
                void shareCard({
                  title: copy.scoreCardTitle,
                  message: formatScoreCardText(result.data, language),
                  viewRef: cardRef,
                });
              }}
              style={styles.share}
              accessibilityRole="button"
            >
              <Text style={styles.shareText}>{copy.shareScore}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  privacy: { color: color.ivoryDim, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  cta: {
    backgroundColor: color.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: color.ink, fontSize: 16, fontWeight: '700' },
  result: { marginTop: 28, gap: 16 },
  share: {
    alignSelf: 'flex-start',
    backgroundColor: color.gold,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shareText: { color: color.ink, fontSize: 15, fontWeight: '700' },
});
