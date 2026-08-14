import { choghadiyaLabel, pakshaLabel, STRINGS } from '../i18n/strings';
import type { DayContextView } from '../tathaastu';

export type ShareCardModel = {
  app: string;
  city: string;
  date: string;
  dateLabel: string;
  tithi: string;
  paksha: string | null;
  nakshatra: string;
  yoga: string;
  karana: string;
  startSomething: 'good' | 'avoid';
  startLabel: string;
  rule: string;
  windowName: string;
  choghadiya: string;
  rahu: string;
};

export function formatDateLabel(date: string, language: 'hi' | 'en'): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(utc);
}

export function buildShareCard(day: DayContextView): ShareCardModel {
  const copy = STRINGS[day.language];
  return {
    app: copy.appName,
    city: day.city,
    date: day.date,
    dateLabel: formatDateLabel(day.date, day.language),
    tithi: day.tithi?.name ?? day.sky.currentSlot.name,
    paksha: pakshaLabel(day.language, day.tithi?.paksha),
    nakshatra: day.nakshatra?.name ?? '',
    yoga: day.yoga?.name ?? '',
    karana: day.karana?.name ?? '',
    startSomething: day.startSomething,
    startLabel: day.startSomething === 'good' ? copy.good : copy.avoid,
    rule: copy.startingSomethingNew,
    windowName: day.sky.currentSlot.name,
    choghadiya: choghadiyaLabel(day.language, day.choghadiya.name),
    rahu: `${copy.windows.rahu} ${day.rahu.startClock}–${day.rahu.endClock}`,
  };
}
