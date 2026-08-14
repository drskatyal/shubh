import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, searchCities, type City } from '../location/cities';

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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{copy.citySearch}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={copy.citySearchPlaceholder}
          placeholderTextColor="rgba(244, 238, 224, 0.35)"
          autoFocus
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: '#0B1020',
    paddingTop: 64,
    paddingHorizontal: 20,
  },
  title: {
    color: '#F4EEE0',
    fontSize: 22,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.3)',
    borderRadius: 12,
    color: '#F4EEE0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  locationBtn: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#E8C578',
    fontSize: 15,
  },
  denied: {
    color: 'rgba(244, 238, 224, 0.6)',
    marginBottom: 8,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 238, 224, 0.12)',
  },
  city: {
    color: '#F4EEE0',
    fontSize: 17,
  },
  country: {
    color: 'rgba(244, 238, 224, 0.5)',
    marginTop: 2,
  },
});
