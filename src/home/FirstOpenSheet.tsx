import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Copy, Language } from '../i18n/strings';
import { CITIES, cityLabel, type City } from '../location/cities';
import { color } from '../theme/tokens';

const QUICK = ['mumbai', 'delhi', 'bengaluru', 'lucknow', 'varanasi'] as const;

export function FirstOpenSheet({
  copy,
  language,
  locating,
  denied,
  onLanguage,
  onUsePlace,
  onSelectCity,
}: {
  copy: Copy;
  language: Language;
  locating: boolean;
  denied: boolean;
  onLanguage: (language: Language) => void;
  onUsePlace: () => void;
  onSelectCity: (city: City) => void;
}) {
  const cities = QUICK.map((id) => CITIES.find((row) => row.id === id)).filter(Boolean) as City[];

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Text style={styles.kicker}>शुभ</Text>
      <Text style={styles.brand}>{copy.appName}</Text>
      <Text style={styles.sub}>{copy.subtitle}</Text>
      <Text style={styles.lead}>{copy.firstOpenLead}</Text>

      <Text style={styles.prompt}>{copy.pickLanguage}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.choice, language === 'hi' && styles.choiceOn]}
          onPress={() => onLanguage('hi')}
          accessibilityRole="button"
        >
          <Text style={[styles.choiceText, language === 'hi' && styles.choiceTextOn]}>
            {copy.hindi}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.choice, language === 'en' && styles.choiceOn]}
          onPress={() => onLanguage('en')}
          accessibilityRole="button"
        >
          <Text style={[styles.choiceText, language === 'en' && styles.choiceTextOn]}>
            {copy.english}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.place} onPress={onUsePlace} accessibilityRole="button">
        <Text style={styles.placeText}>{locating ? copy.locating : copy.useThisPlace}</Text>
      </Pressable>
      {denied ? <Text style={styles.denied}>{copy.locationDenied}</Text> : null}

      <View style={styles.cities}>
        {cities.map((city) => (
          <Pressable
            key={city.id}
            style={styles.cityChip}
            onPress={() => onSelectCity(city)}
            accessibilityRole="button"
          >
            <Text style={styles.cityChipText}>{cityLabel(city, language)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    zIndex: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    color: color.gold,
    fontSize: 14,
    letterSpacing: 8,
    fontWeight: '800',
    marginBottom: 8,
  },
  brand: {
    color: color.ivory,
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sub: {
    color: color.ivoryMuted,
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  lead: {
    color: color.goldSoft,
    marginTop: 18,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  prompt: {
    color: color.ivory,
    marginTop: 40,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  choice: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    backgroundColor: color.card,
  },
  choiceOn: { backgroundColor: color.gold, borderColor: color.gold },
  choiceText: { color: color.ivory, fontSize: 18, fontWeight: '600' },
  choiceTextOn: { color: color.ink },
  place: {
    marginTop: 28,
    backgroundColor: color.gold,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 16,
    minWidth: 240,
    alignItems: 'center',
  },
  placeText: { color: color.ink, fontSize: 16, fontWeight: '800' },
  denied: { color: color.ivoryMuted, marginTop: 10, textAlign: 'center', lineHeight: 20 },
  cities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  cityChip: {
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: color.card,
  },
  cityChipText: { color: color.ivory, fontSize: 14, fontWeight: '600' },
});
