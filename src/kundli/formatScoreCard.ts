import type { Language } from '../i18n/strings';
import type { NormalizedMatch } from '../tathaastu/types';

export function formatScoreCardText(match: NormalizedMatch, language: Language): string {
  const title = language === 'hi' ? 'शुभ · गुण मिलान' : 'Shubh · Guna Milan';
  const of = language === 'hi' ? 'में से' : 'of';
  const kutaLines = match.kutas.map((k) => `${k.label} ${k.score}/${k.max}`).join('\n');
  const manglik = [
    match.manglik.a === true ? `${match.personA} Manglik` : null,
    match.manglik.b === true ? `${match.personB} Manglik` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return [
    title,
    `${match.personA} × ${match.personB}`,
    `${match.total} ${of} ${match.max}`,
    match.verdict,
    manglik,
    kutaLines,
  ]
    .filter(Boolean)
    .join('\n');
}
