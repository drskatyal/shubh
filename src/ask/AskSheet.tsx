import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Paywall } from '../billing/Paywall';
import type { CreditWallet } from '../billing/credits';
import { getGeminiApiKey } from '../config/env';
import type { Language, SkyState } from '../engine';
import type { NormalizedDay } from '../tathaastu/types';
import { privacyLine, remainingLabel, setupCopy } from './copy';
import { createExpoRecorder, type Recorder } from './record';
import { runAsk } from './runAsk';
import type { AskVerdict, VerdictKind } from './types';

type Props = {
  visible: boolean;
  onClose: () => void;
  sky: SkyState;
  language: Language;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onVerdict?: (verdict: VerdictKind) => void;
  recorder?: Recorder;
  dayContext?: NormalizedDay | null;
};

type Phase = 'idle' | 'recording' | 'sending' | 'result' | 'error';

export function AskSheet({
  visible,
  onClose,
  sky,
  language,
  wallet,
  onRemainingChange,
  onBuyMonthly,
  onBuyPack,
  onRestore,
  onVerdict,
  recorder,
  dayContext,
}: Props) {
  const apiKey = getGeminiApiKey();
  const remaining = wallet?.remaining() ?? 0;
  const hi = language === 'hi';
  const [phase, setPhase] = useState<Phase>('idle');
  const [verdict, setVerdict] = useState<AskVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recorder>(recorder ?? createExpoRecorder());

  useEffect(() => {
    if (recorder) recRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      setVerdict(null);
      setError(null);
    }
  }, [visible]);

  const showPaywall = Boolean(wallet) && remaining <= 0;
  const showSetup = !apiKey;

  const onMic = async () => {
    if (!wallet || showPaywall || showSetup) return;
    if (phase === 'recording') {
      setPhase('sending');
      try {
        const audio = await recRef.current.stop();
        const result = await runAsk({
          audio,
          sky,
          language,
          wallet,
          apiKey,
          dayContext,
        });
        if (!result.ok) {
          setError(result.message);
          setPhase('error');
          return;
        }
        setVerdict(result.verdict);
        setPhase('result');
        onRemainingChange?.(result.remaining);
        onVerdict?.(result.verdict.verdict);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ask failed');
        setPhase('error');
      }
      return;
    }

    try {
      await recRef.current.start();
      setPhase('recording');
      setError(null);
      setVerdict(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mic failed');
      setPhase('error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button">
            <Text style={styles.closeText}>{hi ? 'बंद' : 'Close'}</Text>
          </Pressable>

          <Text style={styles.kicker}>{sky.city}</Text>
          <Text style={styles.title}>{hi ? 'क्या पूछना है?' : 'What do you want to do?'}</Text>
          <Text style={styles.remaining}>{remainingLabel(language, remaining)}</Text>

          {showSetup ? (
            <Text style={styles.body}>{setupCopy(language)}</Text>
          ) : showPaywall ? (
            <Paywall
              language={language}
              remaining={remaining}
              onBuyMonthly={onBuyMonthly ?? (async () => undefined)}
              onBuyPack={onBuyPack ?? (async () => undefined)}
              onRestore={onRestore ?? (async () => undefined)}
            />
          ) : (
            <>
              <Pressable
                onPress={onMic}
                disabled={phase === 'sending'}
                style={[
                  styles.mic,
                  phase === 'recording' && styles.micLive,
                  phase === 'sending' && styles.micBusy,
                ]}
                accessibilityRole="button"
                accessibilityLabel={hi ? 'माइक' : 'Microphone'}
              >
                <Text style={styles.micText}>
                  {phase === 'recording'
                    ? hi
                      ? 'सुन रहा है… रोकने के लिए टैप'
                      : 'Listening… tap to stop'
                    : phase === 'sending'
                      ? hi
                        ? 'सोच रहा है…'
                        : 'Reading the sky…'
                      : hi
                        ? 'बोलो'
                        : 'Speak'}
                </Text>
              </Pressable>

              {verdict ? (
                <View style={styles.result}>
                  <Text style={styles.chip}>{verdict.verdict.toUpperCase()}</Text>
                  {verdict.nextTime ? (
                    <Text style={styles.clock}>{verdict.nextTime}</Text>
                  ) : null}
                  <Text style={styles.body}>{verdict.displayText}</Text>
                  <Text style={styles.reason}>{verdict.reason}</Text>
                </View>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.privacy}>{privacyLine(language)}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,16,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12182A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  close: { alignSelf: 'flex-end' },
  closeText: { color: '#C9BBA8', fontSize: 15 },
  kicker: { color: '#E8A838', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: '#F6EDE0', fontSize: 24, fontWeight: '700' },
  remaining: { color: '#C9BBA8', fontSize: 14 },
  body: { color: '#F6EDE0', fontSize: 16, lineHeight: 24 },
  reason: { color: '#C9BBA8', fontSize: 14, lineHeight: 20 },
  privacy: { color: '#8A7B68', fontSize: 12, lineHeight: 18, marginTop: 8 },
  error: { color: '#E07070', fontSize: 14 },
  mic: {
    backgroundColor: '#E8A838',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  micLive: { backgroundColor: '#C44B3A' },
  micBusy: { backgroundColor: '#5A4A32' },
  micText: { color: '#1A1208', fontSize: 16, fontWeight: '700' },
  result: { gap: 8, marginTop: 8 },
  chip: {
    alignSelf: 'flex-start',
    color: '#0B1020',
    backgroundColor: '#E8A838',
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '800',
    letterSpacing: 1,
  },
  clock: { color: '#F6EDE0', fontSize: 36, fontWeight: '700' },
});
