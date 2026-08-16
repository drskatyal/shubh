import type { Language } from '../../engine';
import type { MissingField, PersonField, PersonSide } from './types';

/** Hindi-first, never “AI”. Shown on Matching and Ask-about-marriage. */
export const RECORD_PROMPT =
  'Yeh sab record kar dijiye, mic on karke ek baar mein: dono ke naam, janam tithi, janam samay, aur shehar.';

export function recordPromptLine(language: Language): string {
  return language === 'en'
    ? 'One take: both names, birth dates, birth times, and cities.'
    : RECORD_PROMPT;
}

export function understoodLabel(language: Language): string {
  return language === 'hi' ? 'हमने यह समझा' : 'Humne yeh samjha';
}

export function recordLabel(language: Language): string {
  return language === 'hi' ? 'रिकॉर्ड' : 'Record';
}

export function typeInsteadLabel(language: Language): string {
  return language === 'hi' ? 'लिखना है?' : 'Type instead';
}

export function milanCta(language: Language): string {
  return language === 'hi' ? 'मिलान देखें' : 'See the milan';
}

export function muhuratFollowLabel(language: Language): string {
  return language === 'hi' ? 'शादी का मुहूर्त — अगले 60 दिन' : 'Marriage muhurat — next 60 days';
}

export function personTitle(language: Language, side: PersonSide): string {
  if (language === 'hi') return side === 'a' ? 'लड़का' : 'लड़की';
  return side === 'a' ? 'Ladka' : 'Ladki';
}

export function fieldLabel(language: Language, field: PersonField): string {
  const hi = language === 'hi';
  if (field === 'name') return hi ? 'नाम' : 'Name';
  if (field === 'date') return hi ? 'जन्म तिथि' : 'Janam tithi';
  if (field === 'time') return hi ? 'जन्म समय' : 'Janam samay';
  return hi ? 'शहर' : 'Shehar';
}

export function missingHint(missing: MissingField): string {
  return missing.hint;
}

export function hintFor(side: PersonSide, field: PersonField, name?: string | null): string {
  const who = name?.trim()
    ? name.trim()
    : side === 'a'
      ? 'ladke'
      : 'ladki';
  if (field === 'name') return side === 'a' ? 'ladke ka naam?' : 'ladki ka naam?';
  if (field === 'date') return `${who} ki janam tithi?`;
  if (field === 'time') return `${who} ka samay?`;
  return `${who} ka shehar?`;
}

export function listeningLabel(language: Language): string {
  return language === 'hi' ? 'सुन रहे हैं…' : 'Listening…';
}

export function skyWaitLabel(language: Language): string {
  return language === 'hi' ? 'आकाश…' : 'Sky…';
}
