import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Paywall } from '../../billing/Paywall';
import type { CreditWallet } from '../../billing/credits';
import { askBackendKey, askBackendReady } from '../backend';
import type { Language, SkyState } from '../../engine';
import type { City } from '../../location/cities';
import { DivineWait, useOptionalSkyLayer } from '../../motion';
import { findMuhuratDates } from '../../muhurat/findMuhurat';
import { shareCard, type CaptureHandle } from '../../share/captureCard';
import { matchPeople } from '../../tathaastu/client';
import type { NormalizedDay, NormalizedMatch, RankedDate } from '../../tathaastu/types';
import { color } from '../../theme/tokens';
import { tapHaptic } from '../../ui/haptics';
import { formatScoreCardText } from '../../kundli/formatScoreCard';
import { ScoreCard } from '../../kundli/ScoreCard';
import { loadLastMatch, saveLastMatch, saveMatchForms } from '../../kundli/storage';
import type { Copy } from '../../i18n/strings';
import { createExpoRecorder, type Recorder } from '../record';
import {
  milanCta,
  muhuratFollowLabel,
  RECORD_PROMPT,
  recordPromptLine,
  typeInsteadLabel,
} from './copy';
import { ConfirmBirthCards } from './ConfirmBirthCards';
import { personToBirth } from './geo';
import { emptyExtract, missingFields } from './parse';
import { RecordDock } from './RecordDock';
import { runExtract } from './runExtract';
import { askedShaadiNow } from './shaadiNow';
import type { MarriageExtract } from './types';

type Phase = 'idle' | 'recording' | 'sending' | 'matching';

export function MarriageFlow({
  language,
  copy,
  wallet,
  sky,
  dayContext,
  defaultCity,
  recorder,
  onRemainingChange,
  onBuyMonthly,
  onBuyPack,
  onRestore,
  onMatch,
  seedText,
}: {
  language: Language;
  copy: Copy;
  wallet: CreditWallet | null;
  sky?: SkyState | null;
  dayContext?: NormalizedDay | null;
  defaultCity?: City | null;
  recorder?: Recorder;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onMatch?: (match: NormalizedMatch) => void;
  seedText?: string;
}) {
  const hi = language === 'hi';
  const remaining = wallet?.remaining() ?? 0;
  const connected = askBackendReady();
  const showPaywall = Boolean(wallet) && remaining <= 0;
  const [phase, setPhase] = useState<Phase>('idle');
  const [text, setText] = useState(seedText ?? '');
  const [error, setError] = useState<string | null>(null);
  const [extract, setExtract] = useState<MarriageExtract | null>(null);
  const [typedFallback, setTypedFallback] = useState(false);
  const [match, setMatch] = useState<NormalizedMatch | null>(null);
  const [muhurat, setMuhurat] = useState<RankedDate[] | null>(null);
  const [muhuratBusy, setMuhuratBusy] = useState(false);
  const recRef = useRef<Recorder>(recorder ?? createExpoRecorder());
  const cardRef = useRef<CaptureHandle>(null);
  const skyLayer = useOptionalSkyLayer();
  const waiting = phase === 'sending' || phase === 'matching';
  const missing = extract ? missingFields(extract) : [];
  const hint = missing[0]?.hint ?? RECORD_PROMPT;

  useEffect(() => {
    if (recorder) recRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    void loadLastMatch().then((stored) => {
      if (stored && !match) setMatch(stored);
    });
  }, []);

  useEffect(() => {
    if (seedText?.trim() && wallet && connected && !extract) {
      void submitExtract(undefined, seedText.trim());
    }
    // First mount only — a typed marriage ask from पूछो.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    skyLayer?.setSky({ waiting });
    return () => skyLayer?.setSky({ waiting: false });
  }, [waiting, skyLayer]);

  const birthsFrom = (next: MarriageExtract) => {
    const a = personToBirth(next.person_a, defaultCity);
    const b = personToBirth(next.person_b, defaultCity);
    return a && b ? { a, b } : null;
  };

  const runMilan = async (next: MarriageExtract) => {
    const pair = birthsFrom(next);
    if (!pair) return;
    setPhase('matching');
    setError(null);
    try {
      await saveMatchForms({ personA: pair.a, personB: pair.b });
      const loaded = await matchPeople(pair.a, pair.b);
      if (!loaded.ok) {
        setError(loaded.setup ? copy.almanac.liveNeedsKey : copy.almanac.liveFailed);
        setPhase('idle');
        return;
      }
      setMatch(loaded.data);
      await saveLastMatch(loaded.data);
      onMatch?.(loaded.data);
      setPhase('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : hi ? 'मिलान नहीं हुआ' : 'Milan failed');
      setPhase('idle');
    }
  };

  const submitExtract = async (
    audio: { base64: string; mimeType: string } | undefined,
    typed: string | undefined,
  ) => {
    if (!wallet || showPaywall || !connected) return;
    setPhase('sending');
    setError(null);
    try {
      const result = await runExtract({
        audio,
        text: typed,
        language,
        wallet,
        apiKey: askBackendKey(),
        previous: extract,
        dayContext,
        consumeCredit: !extract,
      });
      if (!result.ok) {
        setError(result.message);
        setPhase('idle');
        return;
      }
      setExtract(result.extract);
      setText('');
      setPhase('idle');
      onRemainingChange?.(result.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : hi ? 'सुन नहीं सके' : 'Could not hear');
      setPhase('idle');
    }
  };

  const onMic = async () => {
    if (!wallet || showPaywall || !connected) return;
    if (phase === 'recording') {
      try {
        const audio = await recRef.current.stop();
        await submitExtract(audio, text.trim() || undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : hi ? 'माइक नहीं चला' : 'Mic failed');
        setPhase('idle');
      }
      return;
    }
    try {
      await recRef.current.start();
      setPhase('recording');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : hi ? 'माइक नहीं चला' : 'Mic failed');
    }
  };

  const loadMuhurat = async () => {
    const pair = extract ? birthsFrom(extract) : null;
    const lat = pair?.a.latitude ?? defaultCity?.lat ?? sky?.lat;
    const lon = pair?.a.longitude ?? defaultCity?.lon ?? sky?.lon;
    if (lat == null || lon == null) return;
    setMuhuratBusy(true);
    try {
      const result = await findMuhuratDates({ event: 'marriage', lat, lon });
      setMuhurat(result.ok ? result.dates.slice(0, 5) : []);
    } finally {
      setMuhuratBusy(false);
    }
  };

  const wantMuhurat =
    extract &&
    (extract.intent === 'muhurat_marriage' || askedShaadiNow(extract.question) || askedShaadiNow(text));

  return (
    <View style={styles.root}>
      {!extract && !typedFallback ? (
        <View style={styles.promptBlock}>
          <Text style={styles.prompt}>{RECORD_PROMPT}</Text>
          {language === 'en' ? <Text style={styles.promptEn}>{recordPromptLine('en')}</Text> : null}
        </View>
      ) : null}

      {extract || typedFallback ? (
        <ConfirmBirthCards
          language={language}
          extract={extract ?? emptyExtract()}
          onChange={(next) => {
            setExtract(next);
            setMatch(null);
            setMuhurat(null);
          }}
        />
      ) : null}

      {match ? (
        <View style={styles.result}>
          <View ref={cardRef as never} collapsable={false}>
            <ScoreCard match={match} copy={copy} />
          </View>
          <Pressable
            onPress={() => {
              tapHaptic();
              void shareCard({
                title: copy.scoreCardTitle,
                message: formatScoreCardText(match, language),
                viewRef: cardRef,
              });
            }}
            style={styles.share}
            accessibilityRole="button"
          >
            <Text style={styles.shareText}>{copy.shareScore}</Text>
          </Pressable>
          <Pressable
            onPress={() => void loadMuhurat()}
            style={styles.follow}
            accessibilityRole="button"
          >
            <Text style={styles.followText}>
              {muhuratBusy ? (hi ? 'आकाश…' : 'Sky…') : muhuratFollowLabel(language)}
            </Text>
          </Pressable>
          {muhurat?.length ? (
            <View style={styles.dates}>
              {muhurat.map((row) => (
                <View key={row.date} style={styles.dateChip}>
                  <Text style={styles.dateDay}>{row.date}</Text>
                  {row.reason ? <Text style={styles.dateWhy}>{row.reason}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
          {wantMuhurat && !muhurat && !muhuratBusy ? (
            <Text style={styles.hint}>{hi ? 'अगले 60 दिन का विवाह मुहूर्त देखें।' : 'See marriage windows in the next 60 days.'}</Text>
          ) : null}
        </View>
      ) : null}

      {waiting ? <DivineWait locale={language} label={hi ? 'आकाश पढ़ रहे हैं' : 'Reading the sky'} /> : null}

      {showPaywall && !typedFallback && !extract ? (
        <Paywall
          language={language}
          remaining={remaining}
          onBuyMonthly={onBuyMonthly ?? (async () => undefined)}
          onBuyPack={onBuyPack ?? (async () => undefined)}
          onRestore={onRestore ?? (async () => undefined)}
        />
      ) : (
        <RecordDock
          language={language}
          phase={phase}
          hint={extract ? hint : undefined}
          onMic={() => void onMic()}
          disabled={waiting || !connected || !wallet}
        />
      )}

      {!typedFallback ? (
        <Pressable
          onPress={() => {
            setTypedFallback(true);
            setExtract((prev) => prev ?? emptyExtract());
          }}
          style={styles.quiet}
        >
          <Text style={styles.quietText}>{typeInsteadLabel(language)}</Text>
        </Pressable>
      ) : null}

      {extract && !match && missing.length === 0 ? (
        <Pressable
          onPress={() => void runMilan(extract)}
          disabled={waiting}
          style={[styles.cta, waiting && styles.ctaOff]}
        >
          <Text style={styles.ctaText}>{waiting ? copy.matchingInProgress : milanCta(language)}</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 16 },
  promptBlock: { gap: 8, paddingVertical: 12 },
  prompt: {
    color: color.ivory,
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  promptEn: { color: color.ivoryDim, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  hint: { color: color.goldSoft, fontSize: 14, textAlign: 'center' },
  result: { gap: 14, alignItems: 'center' },
  share: {
    backgroundColor: color.gold,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shareText: { color: color.ink, fontSize: 15, fontWeight: '700' },
  follow: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  followText: { color: color.gold, fontSize: 14, fontWeight: '700' },
  dates: { width: '100%', gap: 8 },
  dateChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 12,
    gap: 4,
  },
  dateDay: { color: color.ivory, fontSize: 16, fontWeight: '700' },
  dateWhy: { color: color.ivoryMuted, fontSize: 13 },
  quiet: { alignSelf: 'center', paddingVertical: 6 },
  quietText: { color: color.ivoryDim, fontSize: 13, textDecorationLine: 'underline' },
  cta: {
    backgroundColor: color.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: color.ink, fontSize: 16, fontWeight: '700' },
  error: { color: color.danger, fontSize: 14, textAlign: 'center' },
});
