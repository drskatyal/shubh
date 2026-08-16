import { useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Language } from '../../engine';
import { shareCard, type CaptureHandle } from '../../share/captureCard';
import { color } from '../../theme/tokens';
import { tapHaptic } from '../../ui/haptics';
import { askCardShareText } from './shareText';
import type { AskCard } from './types';

function ShareSeal({
  language,
  onPress,
}: {
  language: Language;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.share} accessibilityRole="button">
      <Text style={styles.shareText}>{language === 'hi' ? 'शेयर' : 'Share'}</Text>
    </Pressable>
  );
}

function Plate({ children }: { children: ReactNode }) {
  return <View style={styles.plate}>{children}</View>;
}

function VerdictBody({ card }: { card: Extract<AskCard, { kind: 'verdict' }> }) {
  const tone =
    card.verdict === 'now' ? styles.stampNow : card.verdict === 'wait' ? styles.stampWait : styles.stampAfter;
  return (
    <>
      <Text style={[styles.stamp, tone]}>{card.startLabel}</Text>
      {card.nextTime ? <Text style={styles.clock}>{card.nextTime}</Text> : null}
      <View style={styles.chip}>
        <Text style={styles.chipText}>{card.windowName}</Text>
      </View>
      <Text style={styles.meta}>{card.rahu}</Text>
    </>
  );
}

function PanchangBody({
  card,
  language,
}: {
  card: Extract<AskCard, { kind: 'panchang' }>;
  language: Language;
}) {
  const hi = language === 'hi';
  const cells = [
    [hi ? 'तिथि' : 'Tithi', card.tithi],
    [hi ? 'नक्षत्र' : 'Nakshatra', card.nakshatra],
    [hi ? 'योग' : 'Yoga', card.yoga],
  ];
  return (
    <View style={styles.leaf}>
      {cells.map(([label, value]) => (
        <View key={label} style={styles.leafCell}>
          <Text style={styles.kicker}>{label}</Text>
          <Text style={styles.leafValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function TimelineBody({
  card,
  language,
}: {
  card: Extract<AskCard, { kind: 'timeline' }>;
  language: Language;
}) {
  return (
    <View style={styles.thread}>
      {card.slots.map((slot) => (
        <View key={`${slot.name}:${slot.start}`} style={styles.nodeRow}>
          <View style={[styles.node, slot.now && styles.nodeNow]} />
          <View style={styles.nodeCopy}>
            <Text style={[styles.nodeName, slot.now && styles.nodeNameNow]}>{slot.name}</Text>
            <Text style={styles.meta}>
              {slot.start}–{slot.end}
            </Text>
          </View>
          {slot.now ? <Text style={styles.nowMark}>{language === 'hi' ? 'अभी' : 'Now'}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function MatchBody({ card }: { card: Extract<AskCard, { kind: 'match' }> }) {
  return (
    <View style={styles.match}>
      <View style={styles.ring}>
        <Text style={styles.ringScore}>{card.total}</Text>
        <Text style={styles.ringMax}>/ {card.max}</Text>
      </View>
      <Text style={styles.names}>
        {card.personA} × {card.personB}
      </Text>
      <Text style={styles.verse}>{card.verdict}</Text>
      {card.manglik ? (
        <View style={styles.chip}>
          <Text style={styles.chipText}>{card.manglik}</Text>
        </View>
      ) : null}
      {card.kutas?.length ? (
        <View style={styles.kutaWrap}>
          {card.kutas.map((kuta) => (
            <View key={kuta.label} style={styles.kutaChip}>
              <Text style={styles.meta}>
                {kuta.label} {kuta.score}/{kuta.max}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function AskCardView({ card, language }: { card: AskCard; language: Language }) {
  const ref = useRef<CaptureHandle>(null);
  const onShare = () => {
    tapHaptic();
    void shareCard({
      title: language === 'hi' ? 'शुभ' : 'Shubh',
      message: askCardShareText(card, language),
      viewRef: ref,
    });
  };

  return (
    <View ref={ref as never} collapsable={false}>
      <Plate>
        {card.kind === 'verdict' ? <VerdictBody card={card} /> : null}
        {card.kind === 'panchang' ? <PanchangBody card={card} language={language} /> : null}
        {card.kind === 'timeline' ? <TimelineBody card={card} language={language} /> : null}
        {card.kind === 'verse' ? <Text style={styles.verse}>{card.text}</Text> : null}
        {card.kind === 'goodAvoid' ? (
          <View style={styles.split}>
            <View style={styles.col}>
              <Text style={styles.good}>{language === 'hi' ? 'शुभ' : 'Good'}</Text>
              {card.good.map((line) => (
                <Text key={line} style={styles.note}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.avoid}>{language === 'hi' ? 'टालें' : 'Avoid'}</Text>
              {card.avoid.map((line) => (
                <Text key={line} style={styles.note}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
        {card.kind === 'festival' ? (
          <>
            <Text style={styles.kicker}>{card.date}</Text>
            <Text style={styles.festName}>{card.name}</Text>
            {card.reason ? <Text style={styles.verse}>{card.reason}</Text> : null}
          </>
        ) : null}
        {card.kind === 'match' ? <MatchBody card={card} /> : null}
        {card.kind === 'window' ? (
          <>
            <View style={[styles.chip, card.hot && styles.chipHot]}>
              <Text style={styles.chipText}>{card.name}</Text>
            </View>
            <Text style={styles.clockSmall}>
              {card.start}–{card.end}
            </Text>
          </>
        ) : null}
        <ShareSeal language={language} onPress={onShare} />
      </Plate>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 120, 0.32)',
    backgroundColor: 'rgba(8, 10, 20, 0.78)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    gap: 12,
    alignItems: 'center',
  },
  stamp: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  stampNow: { color: color.now },
  stampWait: { color: color.gold },
  stampAfter: { color: color.ivoryMuted },
  clock: {
    color: color.ivory,
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 1,
  },
  clockSmall: { color: color.ivory, fontSize: 22, fontWeight: '600' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipHot: {
    backgroundColor: 'rgba(120, 40, 40, 0.28)',
    borderColor: 'rgba(232, 197, 120, 0.55)',
  },
  chipText: { color: color.gold, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  meta: { color: color.ivoryDim, fontSize: 13, textAlign: 'center' },
  kicker: {
    color: color.goldSoft,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  leaf: { flexDirection: 'row', width: '100%', gap: 8 },
  leafCell: { flex: 1, gap: 6, alignItems: 'center' },
  leafValue: { color: color.ivory, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  thread: { width: '100%', gap: 14, paddingLeft: 8 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  node: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(232, 197, 120, 0.28)',
    borderWidth: 1,
    borderColor: color.goldLine,
  },
  nodeNow: { backgroundColor: color.gold, width: 14, height: 14, borderRadius: 7 },
  nodeCopy: { flex: 1, gap: 2 },
  nodeName: { color: color.ivoryMuted, fontSize: 15 },
  nodeNameNow: { color: color.ivory, fontWeight: '700' },
  nowMark: { color: color.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  verse: {
    color: color.ivory,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  split: { flexDirection: 'row', width: '100%', gap: 16 },
  col: { flex: 1, gap: 6 },
  good: { color: color.now, fontSize: 13, fontWeight: '700' },
  avoid: { color: color.wait, fontSize: 13, fontWeight: '700' },
  note: { color: color.ivoryMuted, fontSize: 13, lineHeight: 18 },
  festName: { color: color.ivory, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  match: { alignItems: 'center', gap: 10 },
  ring: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 3,
    borderColor: color.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 197, 120, 0.06)',
  },
  ringScore: { color: color.ivory, fontSize: 52, fontWeight: '300', lineHeight: 56 },
  ringMax: { color: color.ivoryDim, fontSize: 14, fontWeight: '600' },
  names: { color: color.ivory, fontSize: 16, fontWeight: '600' },
  kutaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  kutaChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.goldLine,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  share: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: color.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shareText: { color: color.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
});
