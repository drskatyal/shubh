import type { Language } from '../engine';

export function privacyLine(language: Language): string {
  return language === 'hi'
    ? 'आपकी आवाज़ इसी पूछ के लिए जाती है, फिर हट जाती है। हम रिकॉर्डिंग नहीं रखते।'
    : 'Your voice is used for this ask, then discarded. We do not keep a recording.';
}

export function setupCopy(language: Language): string {
  return language === 'hi'
    ? 'पूछ बाद में जुड़ेगी। चाबी कल। आज की नज़र फ़ोन पर है।'
    : 'Ask connects later. Keys come tomorrow. Today’s glance is already on the phone.';
}

export function remainingLabel(language: Language, remaining: number): string {
  if (!Number.isFinite(remaining)) {
    return language === 'hi' ? 'डेव · अनलिमिटेड' : 'Dev · unlimited';
  }
  return language === 'hi' ? `${remaining} पूछ बाकी` : `${remaining} asks left`;
}
