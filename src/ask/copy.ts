import type { Language } from '../engine';

export function privacyLine(language: Language): string {
  return language === 'hi'
    ? 'आपकी आवाज़ इसी पूछ के लिए जाती है, फिर हट जाती है। हम रिकॉर्डिंग नहीं रखते।'
    : 'Your voice is used for this ask, then discarded. We do not keep a recording.';
}

export function setupCopy(language: Language): string {
  return language === 'hi'
    ? 'पूछ अभी जुड़ा नहीं है। ऐप को प्रॉक्सी से जोड़ें, फिर दोबारा बनाएँ।'
    : 'Ask is not connected. Point the app at the proxy, then rebuild.';
}

export function remainingLabel(language: Language, remaining: number): string {
  if (!Number.isFinite(remaining)) {
    return language === 'hi' ? 'डेव · अनलिमिटेड' : 'Dev · unlimited';
  }
  return language === 'hi' ? `${remaining} पूछ बाकी` : `${remaining} asks left`;
}
