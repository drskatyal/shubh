import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../../engine';
import { color } from '../../theme/tokens';
import { isWebRuntime } from '../../web/platform';
import { audioFromBlob, fileInsteadLabel, pickAudioFile } from '../webAudio';
import { listeningLabel, recordLabel, skyWaitLabel } from './copy';

type Phase = 'idle' | 'recording' | 'sending' | 'matching';

/** Big Record CTA. No text field — typing is the quiet fallback. */
export function RecordDock({
  language,
  phase,
  hint,
  onMic,
  onFile,
  disabled,
}: {
  language: Language;
  phase: Phase;
  hint?: string;
  onMic: () => void;
  onFile?: (audio: { base64: string; mimeType: string }) => void;
  disabled?: boolean;
}) {
  const recording = phase === 'recording';
  const sending = phase === 'sending' || phase === 'matching';
  const label = recording
    ? listeningLabel(language)
    : sending
      ? skyWaitLabel(language)
      : recordLabel(language);

  return (
    <View style={styles.dock}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <Pressable
        onPress={onMic}
        disabled={disabled || sending}
        style={[styles.mic, recording && styles.micLive, sending && styles.micBusy]}
        accessibilityRole="button"
        accessibilityLabel={recordLabel(language)}
      >
        <Text style={styles.micText}>{label}</Text>
      </Pressable>
      {isWebRuntime() && onFile ? (
        <Pressable
          onPress={() => {
            void pickAudioFile().then(async (file) => {
              if (!file) return;
              onFile(await audioFromBlob(file, file.type));
            });
          }}
          disabled={disabled || sending}
          style={styles.file}
          accessibilityRole="button"
        >
          <Text style={styles.fileText}>{fileInsteadLabel(language)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { gap: 12, paddingTop: 8 },
  hint: {
    color: 'rgba(232, 197, 120, 0.92)',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  mic: {
    backgroundColor: color.gold,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
  },
  micLive: { backgroundColor: '#C44B3A' },
  micBusy: { backgroundColor: '#5A4A32' },
  micText: { color: color.ink, fontSize: 20, fontWeight: '800', letterSpacing: 1.2 },
  file: { alignSelf: 'center', paddingVertical: 4 },
  fileText: { color: color.ivoryDim, fontSize: 13, textDecorationLine: 'underline' },
});
