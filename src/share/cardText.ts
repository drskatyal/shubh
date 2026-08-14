import type { Language } from '../i18n/strings';

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
