import type { ReactNode } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/tokens';

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
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.top}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Text style={styles.close}>{closeLabel}</Text>
            </Pressable>
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.night },
  safe: { flex: 1, paddingHorizontal: 22 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    gap: 16,
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
