import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { SkyStage } from './SkyStage';
import type { SkyStageProps, Verdict } from './types';

type Props = SkyStageProps & {
  style?: StyleProp<ViewStyle>;
  beatIntensity?: SharedValue<number>;
  beatVerdict?: Verdict | null;
};

/** Absolute fill behind a glance. Pointers pass through to the UI on top. */
export function SkyBackdrop({ style, ...stage }: Props) {
  return (
    <View
      style={[StyleSheet.absoluteFillObject, styles.host, { pointerEvents: 'none' }, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <SkyStage {...stage} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    zIndex: 0,
  },
});
