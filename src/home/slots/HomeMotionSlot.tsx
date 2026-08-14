import { StyleSheet, Text, View } from 'react-native';

import type { SkyState } from '../../engine';

/**
 * Motion PR: replace this body.
 * Light the active window from `sky.currentWindow`.
 * Skia or Reanimated. No WebView. Honour `reduceMotion`.
 */
export function HomeMotionSlot({
  sky: _sky,
  reduceMotion: _reduceMotion,
  label,
}: {
  sky: SkyState;
  reduceMotion: boolean;
  label: string;
}) {
  return (
    <View style={styles.slot} accessibilityRole="image" accessibilityLabel={label}>
      <View style={styles.orbit} />
      <View style={styles.sun} />
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.25)',
  },
  sun: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E8C578',
  },
  caption: {
    marginTop: 28,
    color: 'rgba(244, 238, 224, 0.45)',
    fontSize: 13,
  },
});
