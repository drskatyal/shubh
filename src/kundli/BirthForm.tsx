import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, searchCities } from '../location/cities';
import type { BirthData } from '../tathaastu/types';

export { birthFormValid, emptyBirth } from './birth';

export function BirthForm({
  value,
  onChange,
  copy,
  language,
  title,
}: {
  value: BirthData;
  onChange: (next: BirthData) => void;
  copy: Copy;
  language: Language;
  title?: string;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCities(query).slice(0, 6), [query]);

  return (
    <View style={styles.block}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.label}>{copy.birthName}</Text>
      <TextInput
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        placeholder={copy.birthNamePlaceholder}
        placeholderTextColor="rgba(244, 238, 224, 0.35)"
        style={styles.input}
      />
      <Text style={styles.label}>{copy.dateOfBirth}</Text>
      <TextInput
        value={value.date_of_birth}
        onChangeText={(date_of_birth) => onChange({ ...value, date_of_birth })}
        placeholder="1990-05-15"
        placeholderTextColor="rgba(244, 238, 224, 0.35)"
        keyboardType="numbers-and-punctuation"
        style={styles.input}
      />
      <Text style={styles.label}>{copy.timeOfBirth}</Text>
      <TextInput
        value={value.time_of_birth}
        onChangeText={(time_of_birth) => onChange({ ...value, time_of_birth })}
        placeholder="06:30"
        placeholderTextColor="rgba(244, 238, 224, 0.35)"
        keyboardType="numbers-and-punctuation"
        style={styles.input}
      />
      <Text style={styles.label}>{copy.birthPlace}</Text>
      <TextInput
        value={query || value.place_name || ''}
        onChangeText={setQuery}
        placeholder={copy.citySearchPlaceholder}
        placeholderTextColor="rgba(244, 238, 224, 0.35)"
        style={styles.input}
      />
      {query
        ? results.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => {
                onChange({
                  ...value,
                  latitude: city.lat,
                  longitude: city.lon,
                  place_name: cityLabel(city, language),
                });
                setQuery('');
              }}
              style={styles.cityRow}
            >
              <Text style={styles.cityName}>{cityLabel(city, language)}</Text>
            </Pressable>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8, marginBottom: 16 },
  title: { color: '#E8C578', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  label: { color: 'rgba(244, 238, 224, 0.65)', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.3)',
    borderRadius: 12,
    color: '#F4EEE0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  cityRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 238, 224, 0.12)',
  },
  cityName: { color: '#F4EEE0', fontSize: 15 },
});
