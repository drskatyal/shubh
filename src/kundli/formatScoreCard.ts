import type { Language } from '../i18n/strings';
import type { NormalizedMatch } from '../tathaastu/types';

export function formatScoreCardText(match: NormalizedMatch, language: Language): string {
  const title = language === 'hi' ? 'शुभ · गुण मिलान' : 'Shubh · Guna Milan';
  const of = language === 'hi' ? 'में से' : 'of';
  const kutaLines = match.kutas.map((k) => `${k.label} ${k.score}/${k.max}`).join('\n');
  return [
    title,
    `${match.personA} × ${match.personB}`,
    `${match.total} ${of} ${match.max}`,
    match.verdict,
    kutaLines,
  ]
    .filter(Boolean)
    .join('\n');
}
