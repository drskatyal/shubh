/**
 * Store ASO — Play is the volume store and the primary listing surface.
 * Apple is the same binary, second.
 *
 * Play title is locked to 30 (same as Apple) even though Play allows 50.
 * Short description is a Hindi-first search line, not a slogan.
 * Full description is Hindi first, then English, in natural sentences.
 * Hindi (hi-IN) is its own listing, not a translation footnote.
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
  whatsNew: string;
};

export const APPLE_TITLE_MAX = 30;
export const APPLE_SUBTITLE_MAX = 30;
export const APPLE_KEYWORDS_MAX = 100;
export const APPLE_PROMO_MAX = 170;
export const PLAY_TITLE_MAX = 30;
export const PLAY_SHORT_MAX = 80;

export const PLAY_SHORT_NEEDLES = [
  'aaj ka panchang',
  'rahukaal',
  'guna milan',
  'muhurat',
] as const;

export const PLAY_FULL_NEEDLES = [
  'kundali milan',
  'vivah',
  'janam kundli',
  'choghadiya',
  'shaadi muhurat',
  'festival',
  'rahukaal',
] as const;

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

/** Default Play Console language. Hindi-first search line, ≤80. */
export const playHi: PlayLocale = {
  locale: 'hi-IN',
  title: 'शुभ: पंचांग और कुंडली',
  shortDescription: 'आज का पंचांग, rahukaal, guna milan, muhurat',
  fullDescription: [
    'शुभ रोज़ का हिंदू नाउ-ऑर-वेट ऐप है। Play पर भारत में पहले यहीं दिखता है।',
    'खोलते ही आज का पंचांग — तिथि, नक्षत्र, योग, करण, सूर्योदय। राहुकाल उसी कार्ड पर है, ताकि इंतज़ार साफ़ हो। चौघड़िया भी साथ है।',
    'कुंडली मिलान इसलिए डाउनलोड होता है। एक रिकॉर्ड में दोनों नाम, जन्म तिथि, जन्म समय, और शहर बोलिए। दो कार्ड देखिए, गलती हो तो टैप करके ठीक कीजिए। गुण मिलान की रिंग वही है जो विवाह की बात से पहले परिवार को भेजते हैं।',
    'जन्म कुंडली और दशा उसी मिलान के पीछे खुलती हैं। साठ दिन का शादी मुहूर्त वैकल्पिक है। त्योहार साल वाले पेज पर रहते हैं।',
    'जन्म की बात फ़ोन पर रहती है। आवाज़ सेव नहीं होती। मुफ़्त नज़र कभी लॉक नहीं होती।',
    'Shubh is the daily Hindu now-or-wait app.',
    'Open it for aaj ka panchang: tithi, nakshatra, yoga, karana, sunrise. Rahukaal sits on the same card. Choghadiya is there too.',
    'Kundali milan is why people install. Record both names, janam tithi, janam samay, and shehar in one take. Confirm two cards. The guna milan ring is what you send before a vivah talk.',
    'Janam kundli and dasha open from the same match. A 60-day shaadi muhurat window is optional. Festival dates stay on the year page.',
    'Birth stays on the device. Audio is not stored. The free glance is never locked.',
  ].join('\n\n'),
  whatsNew:
    'आवाज़ से कुंडली मिलान: एक रिकॉर्ड, दो कार्ड, गुण रिंग। आज का पंचांग, राहुकाल, और शादी मुहूर्त एक नज़र में।',
};

export const playEn: PlayLocale = {
  locale: 'en-IN',
  title: 'Shubh: Panchang & Kundli',
  shortDescription: 'Aaj ka panchang, rahukaal, guna milan, muhurat',
  fullDescription: [
    'Shubh is the daily Hindu now-or-wait app. Play is where India finds it first.',
    'Open it for aaj ka panchang: tithi, nakshatra, yoga, karana, sunrise. Rahukaal sits on the same card so you know when to wait. Choghadiya is there too.',
    'Kundali milan is why people install. Record both names, janam tithi, janam samay, and shehar in one take. Confirm two cards. The guna milan ring is what you send before a vivah talk.',
    'Janam kundli and dasha open from the same match. A 60-day shaadi muhurat window is optional. Festival dates stay on the year page.',
    'Birth stays on the device. Audio is not stored. The free glance is never locked.',
    'शुभ रोज़ का हिंदू नाउ-ऑर-वेट ऐप है।',
    'खोलते ही आज का पंचांग — तिथि, नक्षत्र, सूर्योदय, राहुकाल, चौघड़िया। कुंडली मिलान एक रिकॉर्ड से। गुण मिलान की रिंग विवाह से पहले भेजिए। जन्म कुंडली, शादी मुहूर्त, और त्योहार उसी ऐप में।',
  ].join('\n\n'),
  whatsNew:
    'Voice kundli milan: one take, two cards, the guna ring. Daily panchang, rahukaal, and shaadi muhurat on the same glance.',
};

/** Feature graphic first, then the three phone shots. No chat UI. */
export const STORE_SCREENSHOTS = [
  {
    id: 'feature-graphic',
    kind: 'feature' as const,
    file: 'feature-graphic.png',
    size: '1024x500',
    captionEn: 'Kundli milan · aaj ka panchang · muhurat',
    captionHi: 'कुंडली मिलान · आज का पंचांग · मुहूर्त',
  },
  {
    id: '01-milan',
    kind: 'milan' as const,
    file: '01-milan-score-ring.png',
    size: 'phone',
    captionEn: 'Kundli milan. The ring you send.',
    captionHi: 'कुंडली मिलान। रिंग जो भेजते हैं।',
  },
  {
    id: '02-panchang',
    kind: 'panchang' as const,
    file: '02-today-panchang.png',
    size: 'phone',
    captionEn: 'Aaj ka panchang. Rahukaal on the card.',
    captionHi: 'आज का पंचांग। राहुकाल कार्ड पर।',
  },
  {
    id: '03-muhurat',
    kind: 'muhurat' as const,
    file: '03-marriage-muhurat.png',
    size: 'phone',
    captionEn: 'Shaadi muhurat. Sixty days, one window.',
    captionHi: 'शादी मुहूर्त। साठ दिन, एक खिड़की।',
  },
] as const;

export const STORE_PHONE_SHOTS = STORE_SCREENSHOTS.filter((shot) => shot.kind !== 'feature');

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

export function assertStoreLimits(): void {
  const rows: [string, string, number][] = [
    ['appleEn.title', appleEn.title, APPLE_TITLE_MAX],
    ['appleEn.subtitle', appleEn.subtitle, APPLE_SUBTITLE_MAX],
    ['appleEn.keywords', appleEn.keywords, APPLE_KEYWORDS_MAX],
    ['appleEn.promotionalText', appleEn.promotionalText, APPLE_PROMO_MAX],
    ['appleHi.title', appleHi.title, APPLE_TITLE_MAX],
    ['appleHi.subtitle', appleHi.subtitle, APPLE_SUBTITLE_MAX],
    ['appleHi.keywords', appleHi.keywords, APPLE_KEYWORDS_MAX],
    ['appleHi.promotionalText', appleHi.promotionalText, APPLE_PROMO_MAX],
    ['playHi.title', playHi.title, PLAY_TITLE_MAX],
    ['playHi.shortDescription', playHi.shortDescription, PLAY_SHORT_MAX],
    ['playEn.title', playEn.title, PLAY_TITLE_MAX],
    ['playEn.shortDescription', playEn.shortDescription, PLAY_SHORT_MAX],
  ];
  for (const [label, value, max] of rows) {
    if (value.length > max) {
      throw new Error(`${label} is ${value.length} chars; max ${max}`);
    }
  }

  const shortHay = `${playHi.shortDescription} ${playEn.shortDescription}`.toLowerCase();
  for (const needle of PLAY_SHORT_NEEDLES) {
    if (!shortHay.includes(needle)) {
      throw new Error(`Play short description must include "${needle}"`);
    }
  }

  const fullHay = `${playHi.fullDescription} ${playEn.fullDescription}`.toLowerCase();
  for (const needle of PLAY_FULL_NEEDLES) {
    if (!fullHay.includes(needle)) {
      throw new Error(`Play full description must include "${needle}"`);
    }
  }
}
