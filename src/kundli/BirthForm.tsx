import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { cityLabel, type City } from '../location/cities';
import { color } from '../theme/tokens';
import type { BirthData } from '../tathaastu/types';
import { DateTimeField } from '../ui/DateTimeField';
import { birthFormValid, emptyBirth } from './birth';

export { birthFormValid, emptyBirth };

export function BirthForm({
  value,
  onChange,
  copy,
  language,
  title,
  city,
}: {
  value: BirthData;
  onChange: (next: BirthData) => void;
  copy: Copy;
  language: Language;
  title?: string;
  city?: City | null;
}) {
  return (
    <View style={styles.form}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.label}>{copy.birthName}</Text>
      <TextInput
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        placeholder={copy.birthNamePlaceholder}
        placeholderTextColor={color.ivoryDim}
        style={styles.input}
      />
      <DateTimeField
        label={copy.dateOfBirth}
        value={value.date_of_birth}
        mode="date"
        placeholder="1990-05-15"
        onChange={(date_of_birth) => onChange({ ...value, date_of_birth })}
      />
      <DateTimeField
        label={copy.timeOfBirth}
        value={value.time_of_birth}
        mode="time"
        placeholder="06:30"
        onChange={(time_of_birth) => onChange({ ...value, time_of_birth })}
      />
      <Text style={styles.place}>
        {copy.birthPlace}: {value.place_name || (city ? cityLabel(city, language) : '—')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, marginBottom: 20 },
  title: { color: color.gold, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  label: { color: color.goldSoft, fontSize: 13 },
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
  place: { color: color.ivoryDim, fontSize: 14, lineHeight: 20 },
});
