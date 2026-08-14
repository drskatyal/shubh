import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';

export type AlmanacTab = 'muhurat' | 'festivals' | 'calendar';

export function AlmanacDock({ copy, onOpen }: { copy: Copy; onOpen: (tab: AlmanacTab) => void }) {
  const items: { tab: AlmanacTab; label: string }[] = [
    { tab: 'muhurat', label: copy.almanac.muhurat },
    { tab: 'festivals', label: copy.almanac.festivals },
    { tab: 'calendar', label: copy.almanac.calendar },
  ];
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Pressable key={item.tab} onPress={() => onOpen(item.tab)} style={styles.btn} accessibilityRole="button">
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  btn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: { color: 'rgba(244, 238, 224, 0.8)', fontSize: 13 },
});
