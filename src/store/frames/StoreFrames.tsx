import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ShareCard } from '../../home/ShareCard';
import { STRINGS } from '../../i18n/strings';
import { ScoreCard } from '../../kundli/ScoreCard';
import { color } from '../../theme/tokens';
import { STORE_SCREENSHOTS } from '../aso';
import { FRAME_MATCH, FRAME_MUHURAT, FRAME_PANCHANG } from './fixtures';

function Phone({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <View style={styles.phone}>
      <Text style={styles.brand}>SHUBH</Text>
      <Text style={styles.kicker}>{kicker}</Text>
      <View style={styles.stage}>{children}</View>
    </View>
  );
}

function FeatureGraphic() {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureBrand}>SHUBH</Text>
      <Text style={styles.featureLine}>कुंडली मिलान · आज का पंचांग · मुहूर्त</Text>
      <View style={styles.featureRow}>
        <View style={styles.featureTile}>
          <Text style={styles.featureTileKicker}>Milan</Text>
          <Text style={styles.featureTileValue}>28 / 36</Text>
        </View>
        <View style={styles.featureTile}>
          <Text style={styles.featureTileKicker}>Aaj ka panchang</Text>
          <Text style={styles.featureTileValue}>Rahukaal</Text>
        </View>
        <View style={styles.featureTile}>
          <Text style={styles.featureTileKicker}>Muhurat</Text>
          <Text style={styles.featureTileValue}>60 days</Text>
        </View>
      </View>
    </View>
  );
}

function MilanShot() {
  return (
    <Phone kicker="Guna milan">
      <ScoreCard match={FRAME_MATCH} copy={STRINGS.en} />
    </Phone>
  );
}

function PanchangShot() {
  return (
    <Phone kicker="Today’s panchang">
      <ShareCard card={FRAME_PANCHANG} />
    </Phone>
  );
}

function MuhuratShot() {
  return (
    <Phone kicker="Marriage muhurat">
      <View style={styles.muhurat}>
        <Text style={styles.muhuratTitle}>Next 60 days</Text>
        {FRAME_MUHURAT.map((row, index) => (
          <View key={row.date} style={[styles.dateRow, index === 0 && styles.dateHero]}>
            <Text style={styles.date}>{row.date}</Text>
            <Text style={styles.score}>{row.score}</Text>
            <Text style={styles.why}>{row.reason}</Text>
          </View>
        ))}
      </View>
    </Phone>
  );
}

/** Feature graphic + first three store shots: milan, panchang, muhurat. Never a chat UI. */
export function StoreShot({ id }: { id: (typeof STORE_SCREENSHOTS)[number]['id'] }) {
  if (id === 'feature-graphic') return <FeatureGraphic />;
  if (id === '01-milan') return <MilanShot />;
  if (id === '02-panchang') return <PanchangShot />;
  return <MuhuratShot />;
}

export function StoreFramesStrip() {
  return (
    <View style={styles.strip}>
      {STORE_SCREENSHOTS.map((shot) => (
        <StoreShot key={shot.id} id={shot.id} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { gap: 24, padding: 16, backgroundColor: color.night },
  feature: {
    width: 1024,
    height: 500,
    borderRadius: 0,
    backgroundColor: color.night,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 56,
    paddingVertical: 48,
    justifyContent: 'center',
    gap: 28,
  },
  featureBrand: {
    color: color.gold,
    letterSpacing: 8,
    fontSize: 18,
    fontWeight: '800',
  },
  featureLine: {
    color: color.ivory,
    fontSize: 36,
    fontWeight: '700',
  },
  featureRow: { flexDirection: 'row', gap: 20 },
  featureTile: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 20,
    gap: 8,
  },
  featureTileKicker: { color: color.ivoryMuted, fontSize: 16 },
  featureTileValue: { color: color.gold, fontSize: 28, fontWeight: '600' },
  phone: {
    width: 390,
    minHeight: 720,
    borderRadius: 36,
    backgroundColor: color.night,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 22,
    gap: 16,
  },
  brand: {
    color: color.gold,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  kicker: {
    color: color.ivory,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  stage: { flex: 1, justifyContent: 'center' },
  muhurat: { gap: 12 },
  muhuratTitle: { color: color.gold, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  dateRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 14,
    gap: 4,
  },
  dateHero: { backgroundColor: 'rgba(232, 197, 120, 0.08)' },
  date: { color: color.ivory, fontSize: 18, fontWeight: '700' },
  score: { color: color.gold, fontSize: 28, fontWeight: '300' },
  why: { color: color.ivoryMuted, fontSize: 14 },
});
