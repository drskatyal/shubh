import { useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Paywall } from '../billing/Paywall';
import type { CreditWallet } from '../billing/credits';
import { getAskProxyUrl, getGeminiApiKey } from '../config/env';
import { ConnectLater } from '../ui/ConnectLater';
import type { Language, SkyState } from '../engine';
import { toMotionVerdict, toMotionWindow } from '../home/motionWindow';
import type { Copy } from '../i18n/strings';
import { STRINGS } from '../i18n/strings';
import type { City } from '../location/cities';
import { useOptionalSkyLayer, useReduceMotion, useVerdictBeat } from '../motion';
import type { ChartAskSummary, NormalizedDay, NormalizedMatch } from '../tathaastu/types';
import { color } from '../theme/tokens';
import { AskComposer } from './AskComposer';
import { AskCardView } from './cards/AskCardView';
import { composeAskCards } from './cards/composeCards';
import type { AskTurn } from './cards/types';
import { privacyLine, remainingLabel } from './copy';
import { MarriageFlow } from './marriage/MarriageFlow';
import { looksLikeMarriageAsk } from './marriage/shaadiNow';
import { createExpoRecorder, type Recorder } from './record';
import { runAsk } from './runAsk';
import type { VerdictKind } from './types';
import { windowKindFromSky } from './windowKind';

type Props = {
  visible: boolean;
  onClose: () => void;
  sky: SkyState;
  language: Language;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyAnnual?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onVerdict?: (verdict: VerdictKind) => void;
  recorder?: Recorder;
  dayContext?: NormalizedDay | null;
  chartContext?: ChartAskSummary | null;
  matchContext?: NormalizedMatch | null;
  copy?: Copy;
  defaultCity?: City | null;
  onMatch?: (match: NormalizedMatch) => void;
  initialMode?: 'ask' | 'marriage';
  initialTurns?: AskTurn[];
};

type Phase = 'idle' | 'recording' | 'sending';

export function AskPage({
  visible,
  onClose,
  sky,
  language,
  wallet,
  onRemainingChange,
  onBuyMonthly,
  onBuyAnnual,
  onBuyPack,
  onRestore,
  onVerdict,
  recorder,
  dayContext,
  chartContext,
  matchContext,
  copy,
  defaultCity,
  onMatch,
  initialMode = 'ask',
  initialTurns,
}: Props) {
  const remaining = wallet?.remaining() ?? 0;
  const hi = language === 'hi';
  const reduceMotion = useReduceMotion();
  const { activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);
  const [phase, setPhase] = useState<Phase>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<AskTurn[]>(initialTurns ?? []);
  const [mode, setMode] = useState<'ask' | 'marriage'>(initialMode);
  const recRef = useRef<Recorder>(recorder ?? createExpoRecorder());
  const strings = copy ?? STRINGS[language];
  const scrollRef = useRef<ScrollView>(null);
  const skyLayer = useOptionalSkyLayer();

  useEffect(() => {
    if (recorder) recRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      setError(null);
      setText('');
      setMode(initialMode);
    }
  }, [visible, initialMode]);

  const connected = Boolean(getAskProxyUrl() || getGeminiApiKey());
  const showPaywall = Boolean(wallet) && remaining <= 0;
  const waiting = phase === 'sending';
  const windowKind = toMotionWindow(sky.currentWindow.name) ?? windowKindFromSky(sky);

  useEffect(() => {
    if (!visible) {
      skyLayer?.setSky({ waiting: false });
      return;
    }
    skyLayer?.setSky({
      windowKind,
      locale: language,
      verdict: activeVerdict ?? toMotionVerdict(sky.startingSomethingNew),
      waiting,
    });
  }, [visible, windowKind, language, waiting, activeVerdict, sky.startingSomethingNew, skyLayer]);

  const submit = async (audio: { base64: string; mimeType: string } | undefined, typed: string | undefined) => {
    if (!wallet || showPaywall || !connected) return;
    if (looksLikeMarriageAsk(typed)) {
      setMode('marriage');
      setText(typed ?? '');
      return;
    }
    setPhase('sending');
    setError(null);
    try {
      const result = await runAsk({
        audio,
        text: typed,
        sky,
        language,
        wallet,
        apiKey: getGeminiApiKey() ?? (getAskProxyUrl() ? 'proxy' : null),
        dayContext,
        chartContext,
      });
      if (!result.ok) {
        setError(result.message);
        setPhase('idle');
        return;
      }
      const cards = composeAskCards({
        verdict: result.verdict,
        sky,
        language,
        day: dayContext,
        match: matchContext,
        festival: dayContext?.festivals[0]
          ? { name: dayContext.festivals[0], date: dayContext.date, reason: '' }
          : null,
      });
      setTurns((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          askedAt: Date.now(),
          question: typed?.trim() || (hi ? 'आवाज़' : 'Voice'),
          cards,
        },
      ]);
      setText('');
      setPhase('idle');
      onRemainingChange?.(result.remaining);
      onVerdict?.(result.verdict.verdict);
      playVerdict(result.verdict.verdict);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : hi ? 'पूछ नहीं सके' : 'Ask failed');
      setPhase('idle');
    }
  };

  const onMic = async () => {
    if (!wallet || showPaywall || !connected) return;
    if (phase === 'recording') {
      try {
        const audio = await recRef.current.stop();
        await submit(audio, text.trim() || undefined);
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

  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="auto">
        <SafeAreaView style={styles.safe}>
          <View style={styles.top}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Text style={styles.close}>{hi ? 'बंद' : 'Close'}</Text>
            </Pressable>
            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>{sky.city}</Text>
              <Text style={styles.title}>{hi ? 'पूछो' : 'Ask'}</Text>
            </View>
            <Text style={styles.remaining}>{remainingLabel(language, remaining)}</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {mode === 'marriage' ? (
              <MarriageFlow
                language={language}
                copy={strings}
                wallet={wallet}
                sky={sky}
                dayContext={dayContext}
                defaultCity={defaultCity}
                recorder={recRef.current}
                onRemainingChange={onRemainingChange}
                onBuyMonthly={onBuyMonthly}
                onBuyAnnual={onBuyAnnual}
                onBuyPack={onBuyPack}
                onRestore={onRestore}
                onMatch={onMatch}
                seedText={text}
              />
            ) : turns.length === 0 && !waiting ? (
              <View style={styles.empty}>
                <Pressable onPress={() => setMode('marriage')} style={styles.milanChip} accessibilityRole="button">
                  <Text style={styles.milanText}>{hi ? 'मिलान · रिकॉर्ड' : 'Milan · Record'}</Text>
                </Pressable>
              </View>
            ) : (
              turns.map((turn) => (
                <View key={turn.id} style={[styles.turn, waiting && styles.dim]}>
                  {turn.question ? <Text style={styles.seal}>· {turn.question} ·</Text> : null}
                  {turn.cards.map((card, index) => (
                    <AskCardView key={`${turn.id}:${card.kind}:${index}`} card={card} language={language} />
                  ))}
                </View>
              ))
            )}
          </ScrollView>

          {!connected && turns.length === 0 && mode !== 'marriage' ? (
            <ConnectLater language={language} surface="ask" />
          ) : showPaywall && turns.length === 0 ? (
            <Paywall
              language={language}
              remaining={remaining}
              onBuyMonthly={onBuyMonthly ?? (async () => undefined)}
              onBuyAnnual={onBuyAnnual}
              onBuyPack={onBuyPack ?? (async () => undefined)}
              onRestore={onRestore ?? (async () => undefined)}
              onClose={onClose}
            />
          ) : mode === 'marriage' ? null : (
            <AskComposer
              language={language}
              phase={phase}
              text={text}
              onChangeText={setText}
              onMic={() => void onMic()}
              onSendText={() => void submit(undefined, text.trim())}
              disabled={waiting}
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.privacy}>{privacyLine(language)}</Text>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
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
  scroll: { flex: 1, marginTop: 12 },
  scrollInner: { gap: 28, paddingBottom: 24, flexGrow: 1 },
  empty: { flexGrow: 1, minHeight: 220, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 12 },
  milanChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  milanText: { color: color.gold, fontSize: 13, fontWeight: '700', letterSpacing: 0.8 },
  turn: { gap: 14 },
  dim: { opacity: 0.28 },
  seal: {
    color: color.goldSoft,
    fontSize: 13,
    letterSpacing: 1.2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  body: { color: color.ivory, fontSize: 16, lineHeight: 24, textAlign: 'center', paddingVertical: 16 },
  error: { color: color.danger, fontSize: 14, textAlign: 'center', marginTop: 8 },
  privacy: { color: 'rgba(244, 238, 224, 0.35)', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
