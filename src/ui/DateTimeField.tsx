import { useState, type ComponentType } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { color } from '../theme/tokens';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function isoDateFrom(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isoTimeFrom(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date(1990, 0, 1);
  return new Date(y, m - 1, d);
}

export function parseIsoTime(value: string): Date {
  const [h, min] = value.split(':').map(Number);
  const next = new Date();
  next.setHours(Number.isFinite(h) ? h : 6, Number.isFinite(min) ? min : 30, 0, 0);
  return next;
}

export function DateTimeField({
  label,
  value,
  mode,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  mode: 'date' | 'time';
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = mode === 'date' ? parseIsoDate(value) : parseIsoTime(value);

  const Picker = (() => {
    try {
      return require('@react-native-community/datetimepicker').default as ComponentType<{
        value: Date;
        mode: 'date' | 'time';
        display?: string;
        onChange: (event: { type?: string }, date?: Date) => void;
      }>;
    } catch {
      return null;
    }
  })();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
      </Pressable>
      {open && Picker ? (
        <Picker
          value={current}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS === 'android') setOpen(false);
            if (event.type === 'dismissed' || !date) {
              if (Platform.OS === 'ios' && event.type === 'dismissed') setOpen(false);
              return;
            }
            onChange(mode === 'date' ? isoDateFrom(date) : isoTimeFrom(date));
            if (Platform.OS === 'ios') setOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { color: color.goldSoft, fontSize: 13, letterSpacing: 0.4 },
  field: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: color.card,
  },
  value: { color: color.ivory, fontSize: 17 },
  placeholder: { color: color.ivoryDim },
});
