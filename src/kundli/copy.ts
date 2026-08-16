import type { Language } from '../i18n/strings';

export function birthPrivacy(language: Language): string {
  return language === 'hi'
    ? 'जन्म विवरण इस डिवाइस पर रहता है। आवाज़ रिकॉर्ड नहीं रखी जाती। हम खाता नहीं बनाते।'
    : 'Birth details stay on this device. We do not keep the recording. We do not create an account.';
}

export function chartAskPrivacy(language: Language): string {
  return language === 'hi'
    ? 'केवल गणना की हुई कुंडली का सारांश जाता है — जन्म तिथि, समय या स्थान नहीं। आपकी आवाज़ इसी पूछ के लिए है, फिर हट जाती है।'
    : 'Only the computed chart summary is sent — not your birth date, time, or place. Your voice is used for this ask, then discarded.';
}
