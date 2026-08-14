import type { SkyState } from '../engine';
import { pakshaLabel, STRINGS, windowLabel, type Language } from '../i18n/strings';
import type { NormalizedDay } from '../tathaastu/types';

export type ShareCardModel = {
  app: string;
  city: string;
  date: string;
  dateLabel: string;
  tithi: string;
  paksha: string | null;
  nakshatra: string;
  startSomething: 'good' | 'avoid';
  startLabel: string;
  rule: string;
  windowName: string;
  rahu: string;
};

export function formatDateLabel(date: string, language: Language): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(utc);
}

export function buildShareCard(input: {
  day: NormalizedDay;
  sky: SkyState;
  language: Language;
  city: string;
}): ShareCardModel {
  const copy = STRINGS[input.language];
  const good = input.sky.startingSomethingNew === 'now';
  return {
    app: copy.appName,
    city: input.city,
    date: input.day.date,
    dateLabel: formatDateLabel(input.day.date, input.language),
    tithi: input.day.tithi?.name ?? windowLabel(input.language, input.sky.currentWindow.name),
    paksha: pakshaLabel(input.language, input.day.tithi?.paksha),
    nakshatra: input.day.nakshatra?.name ?? '',
    startSomething: good ? 'good' : 'avoid',
    startLabel: good ? copy.good : copy.avoid,
    rule: copy.startingSomethingNew,
    windowName: windowLabel(input.language, input.sky.currentWindow.name),
    rahu: `${copy.windows.rahu} ${input.sky.rahu.start.clock}–${input.sky.rahu.end.clock}`,
  };
}
