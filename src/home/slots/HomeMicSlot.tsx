import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../../i18n/language';
import type { SkyState } from '../../engine';

/**
 * Ask / Gemini PR: replace this body.
 * Import `getSkyState` from `src/engine` and stuff `sky` JSON into the prompt.
 * Credits and the recorder live in that PR. This is only the home hook.
 */
export function HomeMicSlot({
  sky: _sky,
  language: _language,
  label,
  onPress,
}: {
  sky: SkyState;
  language: Language;
  label: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, !onPress && styles.idle]}
      >
        <View style={styles.dot} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  button: {
    minWidth: 120,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  idle: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8C578',
  },
  label: {
    color: '#F4EEE0',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
