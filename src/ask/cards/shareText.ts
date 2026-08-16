import type { Language } from '../../engine';
import type { AskCard } from './types';

export function askCardShareText(card: AskCard, language: Language): string {
  const hi = language === 'hi';
  const brand = hi ? 'शुभ' : 'Shubh';
  switch (card.kind) {
    case 'verdict':
      return [card.startLabel, card.nextTime, card.windowName, card.rahu, brand].filter(Boolean).join('\n');
    case 'panchang':
      return [
        hi ? 'आज का पंचांग' : 'Today’s panchang',
        `${hi ? 'तिथि' : 'Tithi'} ${card.tithi}`,
        `${hi ? 'नक्षत्र' : 'Nakshatra'} ${card.nakshatra}`,
        `${hi ? 'योग' : 'Yoga'} ${card.yoga}`,
        brand,
      ].join('\n');
    case 'timeline':
      return [
        hi ? 'आज की खिड़कियाँ' : 'Today’s windows',
        ...card.slots.map((slot) => `${slot.now ? '● ' : '○ '}${slot.name} ${slot.start}–${slot.end}`),
        brand,
      ].join('\n');
    case 'verse':
      return [card.text, brand].join('\n');
    case 'goodAvoid':
      return [
        hi ? 'शुभ' : 'Good',
        ...card.good,
        hi ? 'टालें' : 'Avoid',
        ...card.avoid,
        brand,
      ].join('\n');
    case 'festival':
      return [card.name, card.date, card.reason, brand].filter(Boolean).join('\n');
    case 'match':
      return [
        hi ? 'शुभ · गुण मिलान' : 'Shubh · Guna milan',
        `${card.personA} × ${card.personB}`,
        `${card.total} / ${card.max}`,
        card.verdict,
        card.manglik,
        ...(card.kutas ?? []).map((kuta) => `${kuta.label} ${kuta.score}/${kuta.max}`),
        brand,
      ]
        .filter(Boolean)
        .join('\n');
    case 'window':
      return [card.name, `${card.start}–${card.end}`, brand].join('\n');
  }
}
