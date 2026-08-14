import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Fill,
  Group,
  Oval,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import {
  EARTH_PERIOD_MS,
  EARTH_PHASE,
  ECLIPTIC_TILT,
  MOON_PERIOD_MS,
  MOON_PHASE,
  STARS,
  SUN_PERIOD_MS,
  SUN_PHASE,
  clockMs,
  orbitalPosition,
} from './orbit';
import { resolvePalette } from './palette';
import type { SkyStageProps, Verdict } from './types';
import { useReduceMotion } from './useReduceMotion';

export type SkyStageViewProps = SkyStageProps & {
  style?: StyleProp<ViewStyle>;
  beatIntensity?: SharedValue<number>;
  beatVerdict?: Verdict | null;
};

function useSkyClock(reduceMotion: boolean): SharedValue<number> {
  const elapsed = useSharedValue(0);
  const frame = useFrameCallback((info) => {
    elapsed.value += info.timeSincePreviousFrame ?? 16.67;
  }, !reduceMotion);

  useEffect(() => {
    frame.setActive(!reduceMotion);
    if (reduceMotion) {
      cancelAnimation(elapsed);
      elapsed.value = 0;
    }
  }, [elapsed, frame, reduceMotion]);

  return elapsed;
}

export function SkyStage({
  windowKind,
  verdict = null,
  locale: _locale,
  reduceMotion: reduceMotionProp,
  style,
  beatIntensity,
  beatVerdict = null,
}: SkyStageViewProps) {
  const reduceMotion = useReduceMotion(reduceMotionProp);
  const { width, height } = useWindowDimensions();
  const elapsed = useSkyClock(reduceMotion);
  const palette = resolvePalette(windowKind, verdict);
  const idleBeat = useSharedValue(0);
  const intensity = beatIntensity ?? idleBeat;

  const cx = width * 0.5;
  const cy = height * 0.58;
  const rx = Math.min(width, height) * 0.34;
  const ry = rx * 0.42;
  const innerRx = rx * 0.62;
  const innerRy = ry * 0.62;

  const t = useDerivedValue(() => clockMs(elapsed.value, reduceMotion));

  const sunX = useDerivedValue(() => {
    return cx + orbitalPosition(t.value, SUN_PERIOD_MS, rx, ry, SUN_PHASE).x;
  });
  const sunY = useDerivedValue(() => {
    return cy + orbitalPosition(t.value, SUN_PERIOD_MS, rx, ry, SUN_PHASE).y;
  });
  const sunCenter = useDerivedValue(() => ({ x: sunX.value, y: sunY.value }));
  const moonX = useDerivedValue(() => {
    return cx + orbitalPosition(t.value, MOON_PERIOD_MS, rx * 1.08, ry * 1.12, MOON_PHASE).x;
  });
  const moonY = useDerivedValue(() => {
    return cy + orbitalPosition(t.value, MOON_PERIOD_MS, rx * 1.08, ry * 1.12, MOON_PHASE).y;
  });
  const moonCenter = useDerivedValue(() => ({ x: moonX.value, y: moonY.value }));
  const earthX = useDerivedValue(() => {
    return cx + orbitalPosition(t.value, EARTH_PERIOD_MS, innerRx, innerRy, EARTH_PHASE).x;
  });
  const earthY = useDerivedValue(() => {
    return cy + orbitalPosition(t.value, EARTH_PERIOD_MS, innerRx, innerRy, EARTH_PHASE).y;
  });

  const nowGlow = useDerivedValue(() =>
    beatVerdict === 'now' ? 0.22 + intensity.value * 0.55 : 0.22,
  );
  const waitGlow = useDerivedValue(() =>
    beatVerdict === 'wait' ? 0.16 + intensity.value * 0.5 : 0.16,
  );
  const afterPath = useDerivedValue(() =>
    beatVerdict === 'after' || verdict === 'after' ? 0.55 + intensity.value * 0.4 : 0.42,
  );
  const sunR = useDerivedValue(() =>
    beatVerdict === 'now' ? 15 + intensity.value * 6 : 15,
  );
  const moonR = useDerivedValue(() =>
    beatVerdict === 'wait' ? 8.5 + intensity.value * 4 : 8.5,
  );

  return (
    <Canvas
      style={[styles.fill, style]}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Fill color={palette.skyDeep} />
      <Circle cx={cx} cy={cy} r={Math.max(width, height) * 0.62}>
        <RadialGradient
          c={vec(cx, cy * 0.72)}
          r={Math.max(width, height) * 0.7}
          colors={[palette.skyMid, palette.skyDeep]}
        />
      </Circle>
      <Circle cx={cx} cy={cy} r={rx * 1.15} opacity={0.35}>
        <RadialGradient
          c={vec(cx, cy)}
          r={rx * 1.15}
          colors={[palette.glow, 'transparent']}
        />
      </Circle>

      {STARS.map((star, i) => (
        <Circle
          key={i}
          cx={star.x * width}
          cy={star.y * height * 0.72}
          r={star.r}
          color={palette.star}
          opacity={star.a}
        />
      ))}

      <Group origin={vec(cx, cy)} transform={[{ rotate: ECLIPTIC_TILT }]}>
        <Group opacity={afterPath}>
          <Oval
            x={cx - rx}
            y={cy - ry}
            width={rx * 2}
            height={ry * 2}
            color={palette.orbit}
            style="stroke"
            strokeWidth={1.15}
          />
        </Group>
        <Oval
          x={cx - innerRx}
          y={cy - innerRy}
          width={innerRx * 2}
          height={innerRy * 2}
          color={palette.orbit}
          style="stroke"
          strokeWidth={0.7}
          opacity={0.28}
        />
        <Circle cx={earthX} cy={earthY} r={3.2} color={palette.earth} opacity={0.85} />
      </Group>

      <Circle cx={sunX} cy={sunY} r={42} opacity={nowGlow}>
        <RadialGradient
          c={sunCenter}
          r={42}
          colors={[palette.glow, 'transparent']}
        />
        <BlurMask blur={18} style="solid" />
      </Circle>
      <Circle cx={sunX} cy={sunY} r={sunR} color={palette.sunCore}>
        <BlurMask blur={2} style="solid" />
      </Circle>
      <Circle cx={sunX} cy={sunY} r={11} color={palette.sun} />

      <Circle cx={moonX} cy={moonY} r={22} opacity={waitGlow}>
        <RadialGradient
          c={moonCenter}
          r={22}
          colors={[palette.moon, 'transparent']}
        />
      </Circle>
      <Circle cx={moonX} cy={moonY} r={moonR} color={palette.moon} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
