import type { ReactNode } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/tokens';

/** Overlay on the shared sky — never a Modal that remounts SkyStage. */
export function Sheet({
  visible,
  title,
  onClose,
  closeLabel,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  if (!visible) return null;
  return (
    <View style={styles.root} pointerEvents="auto">
      <SafeAreaView style={styles.safe}>
        <View style={styles.handle} />
        <View style={styles.top}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Text style={styles.close}>{closeLabel}</Text>
          </Pressable>
        </View>
        <View style={styles.rule} />
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
    backgroundColor: 'rgba(6, 7, 14, 0.22)',
  },
  safe: { flex: 1, paddingHorizontal: 22 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 197, 120, 0.35)',
    marginTop: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    gap: 16,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.goldLine,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    color: color.ivory,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  close: { color: color.gold, fontSize: 16, fontWeight: '600' },
});
