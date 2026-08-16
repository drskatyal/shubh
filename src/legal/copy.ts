import type { Language } from '../engine';

export type LegalPage = 'privacy' | 'terms' | 'support';

export function legalTitle(page: LegalPage, language: Language): string {
  if (language === 'hi') {
    if (page === 'privacy') return 'गोपनीयता';
    if (page === 'terms') return 'नियम';
    return 'सहायता';
  }
  if (page === 'privacy') return 'Privacy';
  if (page === 'terms') return 'Terms';
  return 'Support';
}

export function legalBody(page: LegalPage, language: Language): string {
  if (page === 'privacy') return privacyBody(language);
  if (page === 'terms') return termsBody(language);
  return supportBody(language);
}

function privacyBody(language: Language): string {
  return language === 'hi'
    ? [
        'शुभ एक रोज़ का पंचांग है। झलक के लिए खाता नहीं चाहिए।',
        'लोकेशन केवल स्थानीय सूर्योदय और आज की खिड़कियों के लिए है। हम उसे ट्रैकिंग के लिए नहीं जोड़ते।',
        'माइक एक बार सुनता है — मिलान या पूछ के लिए — फिर आवाज़ हट जाती है। रिकॉर्डिंग सेव नहीं होती।',
        'जन्म की बात (नाम, जन्म तिथि, समय, शहर) फ़ोन पर रहती है। हम उसे किसी सर्वर तालिका में नहीं लिखते।',
        'हम डेटा नहीं बेचते। विज्ञापन ट्रैकिंग नहीं है।',
        'फ़ोन OTP बाद में खरीद वापस लाने, पूछ के बटुए, और दूसरे उपकरण के लिए हो सकता है। तब तक ईमेल या नाम नहीं माँगते।',
      ].join('\n\n')
    : [
        'Shubh is a daily panchang. The glance does not need an account.',
        'Location is used only to compute local sunrise and today’s sky windows. It is not linked for tracking.',
        'The microphone is used once — for matching or an ask — then the audio is discarded. We do not keep a recording.',
        'Birth details (name, date, time, place) stay on this device. We do not write those fields to any server table.',
        'We do not sell data. There is no advertising tracking.',
        'Phone OTP may come later for restore, the Ask wallet, and another device. Until then we do not collect email or name.',
      ].join('\n\n');
}

function termsBody(language: Language): string {
  return language === 'hi'
    ? [
        'शुभ एक पंचांग है, पुजारी नहीं। मुहूर्त और गुण मिलान परिवार की बात के लिए हैं — गारंटी नहीं।',
        'आज का पंचांग मुफ़्त रहता है। मासिक शुभ ₹199–299, वार्षिक ₹1,999–2,499, पूछ पैक ₹799 / 100 पूछ। कीमत स्टोर पर दिखेगी।',
        'खरीद Play या App Store से वापस लाएँ। शुभ खाता झलक के लिए ज़रूरी नहीं।',
        'पूछ की मात्रा बटुए से घटती है। बची हुई पूछ पैक पर रहती है; मासिक अवधि बदलने पर मासिक पूछ नए सिरे से मिलती है।',
        'जन्म की बात फ़ोन पर रहती है। आवाज़ सेव नहीं होती।',
      ].join('\n\n')
    : [
        'Shubh is an almanac, not a priest. Muhurat and guna milan are for a family talk — not a guarantee.',
        'The daily glance stays free. Monthly Shubh is ₹199–299, yearly ₹1,999–2,499, Ask pack ₹799 / 100 asks. The store shows the live price.',
        'Restore purchases from Play or the App Store. A Shubh account is not required for the glance.',
        'Asks decrement from the wallet. Pack asks stay; monthly asks reset when the period changes.',
        'Birth stays on the device. Audio is not stored.',
      ].join('\n\n');
}

function supportBody(language: Language): string {
  return language === 'hi'
    ? [
        'शुभ रोज़ का हिंदू नाउ-ऑर-वेट है। खोलते ही आज का पंचांग। मिलान एक रिकॉर्ड से। मुहूर्त — विवाह, घर, वाहन, व्यवसाय, संपत्ति।',
        'खरीद वापस: शुभ खोलो → खरीद वापस लाओ। Play / App Store वही खरीद पहचानता है। खाता नहीं चाहिए।',
        'शहर बदलें: होम पर शहर के नाम पर टैप करें, या “इसी जगह से” चुनें।',
        'झलक चाबियों के बिना भी चलती है। लाइव पंचांग बाद में जुड़ता है।',
        'और बात: होम पर ⋯ → गोपनीयता या नियम।',
      ].join('\n\n')
    : [
        'Shubh is the daily Hindu now-or-wait. Open it for today’s panchang. Matching is one take. Muhurat covers marriage, house, vehicle, business, and property.',
        'Restore: Open Shubh → Restore purchases. Play / the App Store know the buy. No account needed.',
        'Change city: tap the city name on Home, or choose “Use this place.”',
        'The glance boots with empty keys. Live panchang connects later.',
        'More: Home ⋯ → Privacy or Terms.',
      ].join('\n\n');
}
