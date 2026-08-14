/**
 * App Store / Play listing copy. Paste from docs/STORE-ASO.md at submit.
 * Never name a model. Binary home-screen name stays “Shubh” / “शुभ”.
 */

export const STORE_BANNED =
  /gemini|openai|chatgpt|grok|\bllm\b|artificial intelligence|powered by|ask the ai|chatbot|\ba\.i\.\b|\bai\b|gpt/i;

export type AppleLocale = {
  locale: 'en-US' | 'hi';
  title: string;
  subtitle: string;
  keywords: string;
  promotionalText: string;
  description: string;
  whatsNew: string;
};

export type PlayLocale = {
  locale: 'en-IN' | 'hi-IN';
  title: string;
  shortDescription: string;
  fullDescription: string;
};

export const APPLE_TITLE_MAX = 30;
export const APPLE_SUBTITLE_MAX = 30;
export const APPLE_KEYWORDS_MAX = 100;
export const APPLE_PROMO_MAX = 170;
export const PLAY_SHORT_MAX = 80;

export const appleEn: AppleLocale = {
  locale: 'en-US',
  title: 'Shubh: Panchang & Kundli',
  subtitle: 'Rahu, muhurat, festivals',
  keywords:
    'guna milan,kundali,vivah,rahukaal,choghadiya,shaadi,janampatri,ashtakoot,manglik,tithi,nakshatra',
  promotionalText:
    'Today’s panchang, guna milan, and marriage muhurat — share the card with family on WhatsApp.',
  description: [
    'Shubh is a daily Hindu panchang. Open it and see today’s tithi, nakshatra, Rahu Kaal, and whether now is good to start.',
    'Guna milan (Ashtakoot) and Manglik for two births — speak both names, janam tithi, samay, and shehar in one take, then share the score card with family.',
    'Find a marriage muhurat for the next 60 days. Festival calendar with why-this-date. Janam kundli on device. Hindi and English.',
    'The home glance stays free. Extra asks, deeper reports, and further muhurat ranges are optional.',
  ].join('\n\n'),
  whatsNew:
    'Voice guna milan, shareable score card, and marriage muhurat for the next 60 days. Daily panchang still on the home glance.',
};

export const appleHi: AppleLocale = {
  locale: 'hi',
  title: 'शुभ: पंचांग और कुंडली',
  subtitle: 'राहु, मुहूर्त, त्योहार',
  keywords: 'गुण मिलान,विवाह,राहुकाल,चौघड़िया,शादी,जन्मपत्री,अष्टकूट,मांगलिक,तिथि,नक्षत्र,मुहूर्त',
  promotionalText:
    'आज का पंचांग, गुण मिलान और विवाह मुहूर्त — कार्ड परिवार को WhatsApp पर भेजें।',
  description: [
    'शुभ रोज़ का हिन्दू पंचांग है। खोलते ही तिथि, नक्षत्र, राहु काल और यह दिखता है कि अभी शुरुआत ठीक है या नहीं।',
    'दो जन्म का गुण मिलान (अष्टकूट) और मांगलिक — एक बार में दोनों के नाम, जन्म तिथि, समय और शहर बोलें। अंक कार्ड परिवार के साथ बाँटें।',
    'अगले 60 दिन का विवाह मुहूर्त। त्योहार और “यह तारीख क्यों”। जन्म कुंडली इस डिवाइस पर रहती है। हिन्दी और अंग्रेज़ी।',
    'होम पर आज का पंचांग मुफ़्त रहता है।',
  ].join('\n\n'),
  whatsNew:
    'आवाज़ से गुण मिलान, शेयर करने वाला अंक कार्ड, और 60 दिन का विवाह मुहूर्त। रोज़ का पंचांग होम पर।',
};

export const playEn: PlayLocale = {
  locale: 'en-IN',
  title: 'Shubh: Panchang & Kundli',
  shortDescription: 'Panchang, guna milan, kundli, rahukaal, muhurat, festivals.',
  fullDescription: [
    'Shubh is the daily Hindu panchang for India. See today’s tithi, nakshatra, yoga, Rahu Kaal (rahukaal), choghadiya, and whether now is good.',
    'Guna milan and kundali matching: Ashtakoot + Manglik. Speak both janam kundli details — name, date, time, city — in one take. Share the milan score with family on WhatsApp.',
    'Vivah / shaadi muhurat for the next 60 days. Festival calendar. Janampatri / janam kundli stays on your phone.',
    'Search words this listing is built for: panchang, kundli, kundali, guna milan, rahukaal, muhurat, choghadiya, shaadi, vivah, tithi, nakshatra.',
    'Home glance is free. Hindi and English.',
  ].join('\n\n'),
};

export const playHi: PlayLocale = {
  locale: 'hi-IN',
  title: 'शुभ: पंचांग और कुंडली',
  shortDescription: 'पंचांग, गुण मिलान, कुंडली, राहुकाल, मुहूर्त, त्योहार, विवाह।',
  fullDescription: [
    'शुभ भारत के लिए रोज़ का हिन्दू पंचांग है। आज की तिथि, नक्षत्र, योग, राहु काल (राहुकाल), चौघड़िया, और यह कि अभी शुभ है या नहीं।',
    'गुण मिलान और कुंडली मिलान: अष्टकूट और मांगलिक। एक बार में दोनों की जन्म कुंडली बोलें — नाम, जन्म तिथि, समय, शहर। मिलान अंक परिवार को WhatsApp पर भेजें।',
    'विवाह / शादी का मुहूर्त अगले 60 दिन। त्योहार कैलेंडर। जन्मपत्री / जन्म कुंडली फ़ोन पर रहती है।',
    'खोज शब्द: पंचांग, कुंडली, कुंडली मिलान, गुण मिलान, राहुकाल, मुहूर्त, चौघड़िया, शादी, विवाह, तिथि, नक्षत्र, जन्म कुंडली।',
    'होम पर आज का पंचांग मुफ़्त। हिन्दी और अंग्रेज़ी।',
  ].join('\n\n'),
};

export const STORE_SCREENSHOTS = [
  {
    id: '01-milan',
    kind: 'milan' as const,
    file: '01-milan-score-ring.png',
    captionEn: 'Guna milan score — share with family',
    captionHi: 'गुण मिलान अंक — परिवार को भेजें',
  },
  {
    id: '02-panchang',
    kind: 'panchang' as const,
    file: '02-today-panchang.png',
    captionEn: 'Today’s panchang glance',
    captionHi: 'आज का पंचांग',
  },
  {
    id: '03-muhurat',
    kind: 'muhurat' as const,
    file: '03-marriage-muhurat.png',
    captionEn: 'Marriage muhurat — next 60 days',
    captionHi: 'विवाह मुहूर्त — अगले 60 दिन',
  },
] as const;

export function titleWords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z0-9\u0900-\u097f]+/)
    .filter((word) => word.length > 2 && word !== 'and' && word !== 'और');
}

export function keywordList(keywords: string): string[] {
  return keywords.split(',').map((part) => part.trim()).filter(Boolean);
}

export function keywordsOverlapTitle(title: string, keywords: string): string[] {
  const banned = new Set(titleWords(title));
  return keywordList(keywords).filter((kw) =>
    kw
      .toLowerCase()
      .split(/\s+/)
      .some((word) => banned.has(word)),
  );
}
