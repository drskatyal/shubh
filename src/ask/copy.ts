import type { Language } from '../engine';

export function privacyLine(language: Language): string {
  return language === 'hi'
    ? 'आपकी आवाज़ इस सवाल के लिए Gemini को भेजी जाती है, फिर हटा दी जाती है। हम रिकॉर्डिंग नहीं रखते।'
    : 'Your audio is sent to Gemini for this ask, then discarded. We do not keep a recording.';
}

export function setupCopy(language: Language): string {
  return language === 'hi'
    ? 'Gemini सेट नहीं है। GEMINI_API_KEY env या EAS secret में डालें, फिर ऐप दोबारा बनाएँ। कुंजी कभी commit नहीं होती।'
    : 'Gemini is not configured. Set GEMINI_API_KEY in your env or as an EAS secret, then rebuild. The key is never committed.';
}

export function remainingLabel(language: Language, remaining: number): string {
  if (!Number.isFinite(remaining)) {
    return language === 'hi' ? 'डेव · अनलिमिटेड' : 'Dev · unlimited';
  }
  return language === 'hi' ? `${remaining} पूछ बाकी` : `${remaining} asks left`;
}
