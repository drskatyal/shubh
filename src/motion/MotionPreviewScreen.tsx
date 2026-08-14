import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { SkyBackdrop } from './SkyBackdrop';
import { WINDOW_KINDS, type MotionLocale, type Verdict, type WindowKind } from './types';
import { useReduceMotion } from './useReduceMotion';
import { useVerdictBeat } from './useVerdictBeat';

const WINDOW_MARK: Record<MotionLocale, Record<WindowKind, string>> = {
  hi: {
    rahu: 'राहु',
    yamaganda: 'यमगंड',
    gulika: 'गुलिक',
    abhijit: 'अभिजित',
    labh: 'लाभ',
    amrit: 'अमृत',
    shubh: 'शुभ',
    other: '·',
  },
  en: {
    rahu: 'Rahu',
    yamaganda: 'Yamaganda',
    gulika: 'Gulika',
    abhijit: 'Abhijit',
    labh: 'Labh',
    amrit: 'Amrit',
    shubh: 'Shubh',
    other: '·',
  },
};

/**
 * Dev preview until Home lands. Overlay copy is bilingual; the canvas is not.
 */
export function MotionPreviewScreen() {
  const [windowKind, setWindowKind] = useState<WindowKind>('abhijit');
  const [locale, setLocale] = useState<MotionLocale>('hi');
  const [forceReduce, setForceReduce] = useState<boolean | undefined>(undefined);
  const reduceMotion = useReduceMotion(forceReduce);
  const { intensity, activeVerdict, playVerdict } = useVerdictBeat(reduceMotion);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SkyBackdrop
        windowKind={windowKind}
        locale={locale}
        reduceMotion={forceReduce}
        beatIntensity={intensity}
        beatVerdict={activeVerdict}
      />
      <View style={styles.glance} pointerEvents="none">
        <Text style={styles.mark}>{WINDOW_MARK[locale][windowKind]}</Text>
      </View>
      <View style={styles.dock}>
        <View style={styles.row}>
          {WINDOW_KINDS.map((kind) => (
            <Pressable
              key={kind}
              onPress={() => setWindowKind(kind)}
              style={[styles.chip, windowKind === kind && styles.chipOn]}
            >
              <Text style={styles.chipText}>{WINDOW_MARK[locale][kind]}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          {(['now', 'wait', 'after'] as Verdict[]).map((verdict) => (
            <Pressable
              key={verdict}
              onPress={() => playVerdict(verdict)}
              style={[styles.chip, activeVerdict === verdict && styles.chipOn]}
            >
              <Text style={styles.chipText}>
                {verdict === 'now' ? 'अब now' : verdict === 'wait' ? 'रुकें wait' : 'बाद after'}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setForceReduce((value) => (value ? undefined : true))}
            style={[styles.chip, forceReduce && styles.chipOn]}
          >
            <Text style={styles.chipText}>{reduceMotion ? 'स्थिर still' : 'गति motion'}</Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale((value) => (value === 'hi' ? 'en' : 'hi'))}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{locale}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#06070E',
  },
  glance: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mark: {
    color: 'rgba(244,232,200,0.88)',
    fontSize: 44,
    fontWeight: '300',
    letterSpacing: 4,
  },
  dock: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 28,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8,8,16,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,220,184,0.28)',
  },
  chipOn: {
    backgroundColor: 'rgba(232,180,80,0.22)',
    borderColor: 'rgba(232,180,80,0.55)',
  },
  chipText: {
    color: 'rgba(244,232,200,0.9)',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
