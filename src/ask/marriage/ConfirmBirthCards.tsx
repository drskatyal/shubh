import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Language } from '../../engine';
import { color } from '../../theme/tokens';
import { fieldLabel, personTitle, understoodLabel } from './copy';
import { applyField, formatDate, formatTime, missingFields } from './parse';
import type { MarriageExtract, PersonField, PersonSide } from './types';

function displayValue(extract: MarriageExtract, side: PersonSide, field: PersonField): string {
  const person = side === 'a' ? extract.person_a : extract.person_b;
  if (field === 'name') return person.name ?? '';
  if (field === 'date') return formatDate(person);
  if (field === 'time') return formatTime(person);
  return person.place ?? '';
}

function Row({
  language,
  extract,
  side,
  field,
  missing,
  editing,
  onEdit,
  onChange,
}: {
  language: Language;
  extract: MarriageExtract;
  side: PersonSide;
  field: PersonField;
  missing: boolean;
  editing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
}) {
  const value = displayValue(extract, side, field);
  const placeholder =
    field === 'date' ? '1990-05-15' : field === 'time' ? '06:30' : field === 'place' ? 'Delhi' : 'Naam';
  return (
    <View style={styles.row}>
      <Text style={styles.field}>{fieldLabel(language, field)}</Text>
      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={color.ivoryDim}
          style={[styles.input, missing && styles.inputMiss]}
          autoFocus
          keyboardType={field === 'date' || field === 'time' ? 'numbers-and-punctuation' : 'default'}
        />
      ) : (
        <Pressable onPress={onEdit} style={[styles.valueTap, missing && styles.valueMiss]} accessibilityRole="button">
          <Text style={[styles.value, !value && styles.valueEmpty]}>{value || '—'}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ConfirmBirthCards({
  language,
  extract,
  onChange,
}: {
  language: Language;
  extract: MarriageExtract;
  onChange: (next: MarriageExtract) => void;
}) {
  const [editing, setEditing] = useState<{ side: PersonSide; field: PersonField } | null>(null);
  const missing = missingFields(extract);
  const miss = (side: PersonSide, field: PersonField) =>
    missing.some((row) => row.side === side && row.field === field);

  const card = (side: PersonSide) => (
    <View style={styles.card}>
      <Text style={styles.who}>{personTitle(language, side)}</Text>
      {(['name', 'date', 'time', 'place'] as PersonField[]).map((field) => (
        <Row
          key={`${side}:${field}`}
          language={language}
          extract={extract}
          side={side}
          field={field}
          missing={miss(side, field)}
          editing={editing?.side === side && editing.field === field}
          onEdit={() => setEditing({ side, field })}
          onChange={(value) => onChange(applyField(extract, side, field, value))}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{understoodLabel(language)}</Text>
      {card('a')}
      {card('b')}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  kicker: {
    color: color.gold,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.32)',
    backgroundColor: 'rgba(8, 10, 20, 0.78)',
    padding: 18,
    gap: 10,
  },
  who: { color: color.goldSoft, fontSize: 16, fontWeight: '700' },
  row: { gap: 4 },
  field: { color: color.ivoryDim, fontSize: 12, letterSpacing: 0.8 },
  valueTap: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  valueMiss: {
    borderBottomWidth: 1,
    borderBottomColor: color.gold,
  },
  value: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  valueEmpty: { color: color.ivoryDim, fontWeight: '400' },
  input: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 12,
    color: color.ivory,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
  },
  inputMiss: { borderColor: color.gold },
});
