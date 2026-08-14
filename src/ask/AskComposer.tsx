import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Language } from '../engine';
import { color } from '../theme/tokens';

type Phase = 'idle' | 'recording' | 'sending';

export function AskComposer({
  language,
  phase,
  text,
  onChangeText,
  onMic,
  onSendText,
  disabled,
  hint,
  micLabel,
}: {
  language: Language;
  phase: Phase;
  text: string;
  onChangeText: (value: string) => void;
  onMic: () => void;
  onSendText: () => void;
  disabled?: boolean;
  hint?: string;
  micLabel?: string;
}) {
  const hi = language === 'hi';
  const ask = micLabel ?? (hi ? 'पूछो' : 'Ask');
  const recording = phase === 'recording';
  const sending = phase === 'sending';
  return (
    <View style={styles.dock}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder={hi ? 'या लिखें…' : 'Or write…'}
        placeholderTextColor="rgba(244, 238, 224, 0.32)"
        style={styles.field}
        editable={!disabled && !recording && !sending}
        returnKeyType="send"
        onSubmitEditing={onSendText}
        accessibilityLabel={hi ? 'पूछो' : 'Ask'}
      />
      <View style={styles.row}>
        <Pressable
          onPress={onMic}
          disabled={disabled || sending}
          style={[styles.mic, recording && styles.micLive, sending && styles.micBusy]}
          accessibilityRole="button"
          accessibilityLabel={hi ? 'पूछो' : 'Ask'}
        >
          <Text style={styles.micText}>
            {recording ? (hi ? 'सुन रहे हैं…' : 'Listening…') : sending ? (hi ? 'आकाश…' : 'Sky…') : ask}
          </Text>
        </Pressable>
        {text.trim() && !recording ? (
          <Pressable
            onPress={onSendText}
            disabled={disabled || sending}
            style={styles.send}
            accessibilityRole="button"
            accessibilityLabel={ask}
          >
            <Text style={styles.sendText}>{ask}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    gap: 10,
    paddingTop: 8,
  },
  hint: {
    color: 'rgba(232, 197, 120, 0.88)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  field: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.goldLine,
    backgroundColor: 'rgba(8, 10, 20, 0.72)',
    color: color.ivory,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mic: {
    flex: 1,
    backgroundColor: color.gold,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  micLive: { backgroundColor: '#C44B3A' },
  micBusy: { backgroundColor: '#5A4A32' },
  micText: { color: color.ink, fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  send: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.gold,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sendText: { color: color.gold, fontSize: 16, fontWeight: '800' },
});
