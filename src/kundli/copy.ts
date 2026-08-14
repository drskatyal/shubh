import type { Language } from '../i18n/strings';

export function birthPrivacy(language: Language): string {
  return language === 'hi'
    ? 'जन्म विवरण इस डिवाइस पर रहता है। हम खाता नहीं बनाते।'
    : 'Birth details stay on this device. We do not create an account.';
}

export function chartAskPrivacy(language: Language): string {
  return language === 'hi'
    ? 'केवल गणना की हुई कुंडली का सारांश भेजा जाता है — जन्म तिथि, समय या स्थान नहीं। आपकी आवाज़ इस सवाल के लिए Gemini को जाती है, फिर हट जाती है। दस्तावेज़ नहीं भेजते।'
    : 'Only the computed chart summary is sent — not your birth date, time, or place. Your question audio goes to Gemini for this ask, then is discarded. No documents.';
}

export function fixtureBanner(language: Language, setup: string): string {
  return language === 'hi' ? `नमूना कुंडली। ${setup}` : `Sample chart. ${setup}`;
}

export function fixtureMatchBanner(language: Language, setup: string): string {
  return language === 'hi' ? `नमूना मिलान। ${setup}` : `Sample match. ${setup}`;
}
