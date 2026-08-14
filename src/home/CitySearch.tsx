import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, searchCities, type City } from '../location/cities';
import { color } from '../theme/tokens';

export function CitySearch({
  visible,
  copy,
  language,
  locating,
  denied,
  onClose,
  onSelect,
  onUseLocation,
}: {
  visible: boolean;
  copy: Copy;
  language: Language;
  locating: boolean;
  denied: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  onUseLocation: () => void;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCities(query), [query]);

  if (!visible) return null;

  return (
    <View style={styles.sheet} pointerEvents="auto">
        <SafeAreaView style={styles.safe}>
          <View style={styles.top}>
            <Text style={styles.title}>{copy.citySearch}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.close}>{copy.close}</Text>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={copy.citySearchPlaceholder}
            placeholderTextColor={color.ivoryDim}
            autoFocus
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable onPress={onUseLocation} style={styles.locationBtn}>
            <Text style={styles.locationText}>
              {locating ? copy.locating : copy.useLocation}
            </Text>
          </Pressable>
          {denied ? <Text style={styles.denied}>{copy.locationDenied}</Text> : null}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                }}
                style={styles.row}
              >
                <Text style={styles.city}>{cityLabel(item, language)}</Text>
                <Text style={styles.country}>
                  {language === 'hi' ? item.countryHi : item.countryEn}
                </Text>
              </Pressable>
            )}
          />
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 14,
    backgroundColor: 'rgba(6, 7, 14, 0.28)',
  },
  safe: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: color.ivory, fontSize: 28, fontWeight: '700' },
  close: { color: color.gold, fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 16,
    color: color.ivory,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    backgroundColor: color.card,
  },
  locationBtn: { marginTop: 14, marginBottom: 8, alignSelf: 'flex-start' },
  locationText: { color: color.gold, fontSize: 16, fontWeight: '600' },
  denied: { color: color.ivoryMuted, marginBottom: 8, lineHeight: 20 },
  row: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 238, 224, 0.12)',
  },
  city: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  country: { color: color.ivoryDim, marginTop: 3, fontSize: 14 },
});
