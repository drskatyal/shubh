import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { resolvePalette } from './palette';
import type { SkyStageProps, Verdict } from './types';

type Props = SkyStageProps & {
  style?: StyleProp<ViewStyle>;
  beatVerdict?: Verdict | null;
};

const STARS = Array.from({ length: 72 }, (_, i) => ({
  top: `${(7 + i * 17) % 96}%`,
  left: `${(3 + i * 23) % 97}%`,
  size: 1 + (i % 3),
  opacity: 0.2 + (i % 6) * 0.1,
}));

/** Web stand-in for the Skia galaxy. Native still uses SkyStage.tsx. */
export function SkyStage({ windowKind, verdict = null, style }: Props) {
  const palette = resolvePalette(windowKind, verdict);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const loop = () => {
      frame += 1;
      if (frame % 3 === 0) setTick((n) => (n + 1) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drift = Math.sin((tick * Math.PI) / 180);

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
      <View
        style={[
          styles.haze,
          {
            backgroundColor: palette.skyMid,
            transform: [{ translateX: drift * 18 }, { translateY: drift * -10 }],
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: palette.glow,
            transform: [{ translateX: drift * -22 }, { translateY: drift * 14 }],
          },
        ]}
      />
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
            opacity: star.opacity + (index % 8 === tick % 8 ? 0.25 : 0),
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
    width: 360,
    height: 360,
    borderRadius: 180,
    top: '22%',
    left: '10%',
    opacity: 0.3,
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
