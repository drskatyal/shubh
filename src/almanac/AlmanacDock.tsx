import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Copy } from '../i18n/strings';
import { color } from '../theme/tokens';
import { tapHaptic } from '../ui/haptics';

export type AlmanacTab = 'muhurat' | 'festivals' | 'calendar' | 'kundli' | 'match';

export function AlmanacDock({
  copy,
  onOpen,
  vertical,
}: {
  copy: Copy;
  onOpen: (tab: AlmanacTab) => void;
  vertical?: boolean;
}) {
  const items: Array<{ tab: AlmanacTab; label: string }> = [
    { tab: 'muhurat', label: copy.almanac.muhurat },
    { tab: 'festivals', label: copy.almanac.festivals },
    { tab: 'calendar', label: copy.almanac.calendar },
    { tab: 'kundli', label: copy.kundli },
    { tab: 'match', label: copy.matching },
  ];
  return (
    <View style={vertical ? styles.col : styles.row}>
      {items.map((item) => (
        <Pressable
          key={item.tab}
          onPress={() => {
            tapHaptic();
            onOpen(item.tab);
          }}
          style={styles.chip}
        >
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  col: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    width: '100%',
  },
  chip: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: { color: color.gold, fontSize: 13, fontWeight: '600' },
});
