import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Language } from '../engine';
import { remainingLabel } from './copy';

type Props = {
  remaining: number;
  language: Language;
  onPress: () => void;
};

export function AskFAB({ remaining, language, onPress }: Props) {
  const gated = remaining <= 0;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          gated
            ? language === 'hi'
              ? 'पूछ बंद। खरीद खोलो।'
              : 'Ask locked. Open paywall.'
            : language === 'hi'
              ? 'माइक से पूछो'
              : 'Ask with the mic'
        }
        style={[styles.fab, gated && styles.gated]}
      >
        <Text style={styles.mic}>●</Text>
      </Pressable>
      <Text style={styles.caption}>{remainingLabel(language, remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8A838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gated: { backgroundColor: '#5A4A32', opacity: 0.85 },
  mic: { color: '#1A1208', fontSize: 28 },
  caption: { color: '#C9BBA8', fontSize: 13 },
});
