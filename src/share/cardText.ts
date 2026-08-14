import type { Language } from '../i18n/strings';
import type { NormalizedDay } from '../tathaastu/types';

export function muhuratShareText(input: {
  language: Language;
  eventLabel: string;
  date: string;
  score: number;
  reason: string;
  city: string;
}): string {
  if (input.language === 'hi') {
    return [
      `${input.eventLabel} के लिए सबसे अच्छी तारीख`,
      input.date,
      `अंक ${input.score}`,
      input.reason,
      input.city,
      'शुभ',
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [`Best date for ${input.eventLabel}`, input.date, `Score ${input.score}`, input.reason, input.city, 'Shubh']
    .filter(Boolean)
    .join('\n');
}

export function festivalShareText(input: {
  language: Language;
  name: string;
  date: string;
  reason: string;
  city: string;
}): string {
  if (input.language === 'hi') {
    return [input.name, input.date, input.reason, input.city, 'शुभ'].filter(Boolean).join('\n');
  }
  return [input.name, input.date, input.reason, input.city, 'Shubh'].filter(Boolean).join('\n');
}

export function panchangShareText(input: {
  language: Language;
  city: string;
  day: NormalizedDay;
  goodAvoid: string;
}): string {
  const hi = input.language === 'hi';
  return [
    hi ? `आज · ${input.city}` : `Today · ${input.city}`,
    input.day.tithi ? `${hi ? 'तिथि' : 'Tithi'} ${input.day.tithi.name}` : '',
    input.day.nakshatra ? `${hi ? 'नक्षत्र' : 'Nakshatra'} ${input.day.nakshatra.name}` : '',
    input.goodAvoid,
    hi ? 'शुभ' : 'Shubh',
  ]
    .filter(Boolean)
    .join('\n');
}
