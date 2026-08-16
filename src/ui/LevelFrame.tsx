import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { color } from '../theme/tokens';

/** Phone: full-screen overlay on the sky. Desktop temple: in-flow sanctum panel. */
export function LevelFrame({
  visible,
  embedded,
  zIndex = 8,
  children,
}: {
  visible: boolean;
  embedded?: boolean;
  zIndex?: number;
  children: ReactNode;
}) {
  if (!visible) return null;
  return (
    <View
      style={embedded ? styles.embedded : [styles.overlay, { zIndex }]}
      pointerEvents="auto"
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 7, 14, 0.92)',
  },
  embedded: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 14, 0.78)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.goldLine,
    overflow: 'hidden',
  },
});
