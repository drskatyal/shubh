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

import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import { matchPeople } from '../tathaastu/client';
import type { BirthData, NormalizedMatch, TathaLoad } from '../tathaastu/types';
import { BirthForm, birthFormValid, emptyBirth } from './BirthForm';
import { ScoreCard } from './ScoreCard';
import { birthPrivacy, fixtureMatchBanner } from './copy';
import { shareScoreCard } from './shareScore';
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
    setBusy(true);
    try {
      await saveMatchForms({ personA, personB });
      const loaded = await matchPeople(personA, personB, { language });
      setResult(loaded);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>{copy.close}</Text>
          </Pressable>
          <Text style={styles.heading}>{copy.matchingTitle}</Text>
          <Text style={styles.privacy}>{birthPrivacy(language)}</Text>

          <BirthForm
            value={personA}
            onChange={setPersonA}
            copy={copy}
            language={language}
            title={copy.personA}
          />
          <BirthForm
            value={personB}
            onChange={setPersonB}
            copy={copy}
            language={language}
            title={copy.personB}
          />

          <Pressable
            onPress={() => void onMatch()}
            disabled={busy || !ready}
            style={[styles.cta, (busy || !ready) && styles.ctaOff]}
          >
            <Text style={styles.ctaText}>{busy ? copy.matchingInProgress : copy.matchScore}</Text>
          </Pressable>

          {busy ? <ActivityIndicator color="#E8C578" style={styles.spin} /> : null}

          {result ? (
            <View style={styles.result}>
              {result.setup ? (
                <Text style={styles.banner}>{fixtureMatchBanner(language, result.setup)}</Text>
              ) : null}
              <ScoreCard match={result.data} copy={copy} />
              <Pressable
                onPress={() => void shareScoreCard(result.data, language)}
                style={styles.share}
                accessibilityRole="button"
              >
                <Text style={styles.shareText}>{copy.shareScore}</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
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
  share: {
    backgroundColor: '#E8C578',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareText: { color: '#1A1208', fontSize: 16, fontWeight: '700' },
});
