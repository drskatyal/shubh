import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { resolvePalette } from './palette';
import type { SkyStageProps, Verdict } from './types';

type Props = SkyStageProps & {
  style?: StyleProp<ViewStyle>;
  beatVerdict?: Verdict | null;
};

const STARS = Array.from({ length: 56 }, (_, i) => ({
  top: `${(7 + i * 17) % 96}%`,
  left: `${(3 + i * 23) % 97}%`,
  size: 1 + (i % 3),
  opacity: 0.22 + (i % 6) * 0.1,
}));

/** Web stand-in for the Skia galaxy. Native still uses SkyStage.tsx. */
export function SkyStage({ windowKind, verdict = null, style }: Props) {
  const palette = resolvePalette(windowKind, verdict);
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: palette.skyDeep,
        },
        style,
      ]}
    >
      <View style={[styles.haze, { backgroundColor: palette.skyMid }]} />
      <View style={[styles.glow, { backgroundColor: palette.glow }]} />
      {STARS.map((star, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: star.size,
            backgroundColor: palette.star,
            opacity: star.opacity,
          }}
        />
      ))}
      <View style={[styles.sun, { backgroundColor: palette.sun }]} />
      <View style={[styles.sunCore, { backgroundColor: palette.sunCore }]} />
      <View style={[styles.moon, { backgroundColor: palette.moon }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  haze: {
    position: 'absolute',
    width: '140%',
    height: '70%',
    top: '-8%',
    left: '-20%',
    borderRadius: 400,
    opacity: 0.42,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: '24%',
    left: '12%',
    opacity: 0.28,
  },
  sun: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    top: '18%',
    right: '18%',
    opacity: 0.92,
  },
  sunCore: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: '19.4%',
    right: '20.2%',
    opacity: 0.95,
  },
  moon: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: '28%',
    left: '20%',
    opacity: 0.88,
  },
});
