import type { Language, SkyState } from '../../engine';
import { WINDOW_DISPLAY_NAME, type WindowKind } from '../../engine';
import { windowLabel } from '../../i18n/strings';
import type { NormalizedDay, NormalizedMatch } from '../../tathaastu/types';
import type { AskVerdict } from '../types';
import type { AskCard, TimelineSlot } from './types';

function displayWindow(language: Language, name: string): string {
  const key = name.toLowerCase() as WindowKind;
  if (key in WINDOW_DISPLAY_NAME) {
    try {
      return windowLabel(language, key);
    } catch {
      return WINDOW_DISPLAY_NAME[key];
    }
  }
  return name;
}

function manglikLine(match: NormalizedMatch, language: Language): string {
  const hi = language === 'hi';
  const side = (flag: boolean | null, who: string) => {
    if (flag === true) return hi ? `${who} मंगलिक` : `${who} Manglik`;
    if (flag === false) return hi ? `${who} मंगलिक नहीं` : `${who} not Manglik`;
    return null;
  };
  return [side(match.manglik.a, match.personA), side(match.manglik.b, match.personB)]
    .filter(Boolean)
    .join(' · ');
}

function timelineFromSky(sky: SkyState, language: Language): TimelineSlot[] {
  const current = sky.currentWindow.name;
  const rows: TimelineSlot[] = [
    {
      name: displayWindow(language, sky.rahu.name || 'rahu'),
      start: sky.rahu.start.clock,
      end: sky.rahu.end.clock,
      now: current === 'rahu',
    },
    {
      name: displayWindow(language, sky.yamaganda.name || 'yamaganda'),
      start: sky.yamaganda.start.clock,
      end: sky.yamaganda.end.clock,
      now: current === 'yamaganda',
    },
    {
      name: displayWindow(language, sky.gulika.name || 'gulika'),
      start: sky.gulika.start.clock,
      end: sky.gulika.end.clock,
      now: current === 'gulika',
    },
  ];
  if (sky.abhijit) {
    rows.push({
      name: displayWindow(language, sky.abhijit.name || 'abhijit'),
      start: sky.abhijit.start.clock,
      end: sky.abhijit.end.clock,
      now: current === 'abhijit',
    });
  }
  rows.push({
    name: displayWindow(language, sky.choghadiya.current.name),
    start: sky.choghadiya.current.startClock.clock,
    end: sky.choghadiya.current.endClock.clock,
    now: !rows.some((slot) => slot.now),
  });
  if (sky.nextGoodWindow) {
    rows.push({
      name: displayWindow(language, sky.nextGoodWindow.name),
      start: sky.nextGoodWindow.start.clock,
      end: sky.nextGoodWindow.end.clock,
      now: false,
    });
  }
  const seen = new Set<string>();
  return rows.filter((slot) => {
    const key = `${slot.name}:${slot.start}:${slot.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function composeAskCards(input: {
  verdict: AskVerdict;
  sky: SkyState;
  language: Language;
  day?: NormalizedDay | null;
  match?: NormalizedMatch | null;
  festival?: { name: string; date: string; reason: string } | null;
}): AskCard[] {
  const { verdict, sky, language, day, match } = input;
  const hi = language === 'hi';
  const startLabel =
    verdict.verdict === 'now' ? (hi ? 'अभी' : 'Now') : verdict.verdict === 'wait' ? (hi ? 'रुकें' : 'Wait') : hi ? 'बाद में' : 'After';
  const windowName = displayWindow(language, sky.currentWindow.name);
  const rahu = `${displayWindow(language, 'rahu')} ${sky.rahu.start.clock}–${sky.rahu.end.clock}`;

  const cards: AskCard[] = [
    {
      kind: 'verdict',
      verdict: verdict.verdict,
      nextTime: verdict.nextTime,
      windowName,
      rahu,
      startLabel,
    },
  ];

  const slots = timelineFromSky(sky, language);
  if (slots.length) {
    cards.push({ kind: 'timeline', slots });
  }

  const verse = verdict.displayText.trim() || verdict.reason.trim();
  if (verse) {
    cards.push({ kind: 'verse', text: verse });
  }

  if (day?.tithi?.name || day?.nakshatra?.name || day?.yoga?.name) {
    cards.push({
      kind: 'panchang',
      tithi: day.tithi?.name ?? '—',
      nakshatra: day.nakshatra?.name ?? '—',
      yoga: day.yoga?.name ?? '—',
    });
  }

  if (day && (day.good.length || day.avoid.length)) {
    cards.push({
      kind: 'goodAvoid',
      good: day.good.slice(0, 3),
      avoid: day.avoid.slice(0, 3),
    });
  }

  const festival =
    input.festival ??
    (day?.festivals[0]
      ? { name: day.festivals[0], date: day.date, reason: day.festivals.slice(1).join(' · ') }
      : null);
  if (festival?.name) {
    cards.push({
      kind: 'festival',
      name: festival.name,
      date: festival.date,
      reason: festival.reason,
    });
  }

  if (match) {
    cards.push({
      kind: 'match',
      personA: match.personA,
      personB: match.personB,
      total: match.total,
      max: match.max,
      verdict: match.verdict,
      manglik: manglikLine(match, language),
      kutas: match.kutas.map((kuta) => ({ label: kuta.label, score: kuta.score, max: kuta.max })),
    });
  }

  const inauspicious = sky.currentWindow.kind === 'inauspicious';
  if (inauspicious) {
    cards.push({
      kind: 'window',
      name: windowName,
      start: sky.rahu.start.clock,
      end: sky.currentWindow.name === 'rahu' ? sky.rahu.end.clock : sky.yamaganda.end.clock,
      hot: true,
    });
  }

  return cards;
}
