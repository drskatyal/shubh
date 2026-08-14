import type { StartSomethingState, WindowKind } from '../engine';
import type { FinderEvent } from '../tathaastu/types';

export type Language = 'hi' | 'en';

export type AlmanacCopy = {
  muhurat: string;
  festivals: string;
  calendar: string;
  kundli: string;
  matching: string;
  close: string;
  share: string;
  shareImage: string;
  retry: string;
  score: string;
  reason: string;
  upcoming: string;
  whyThisDate: string;
  liveNeedsKey: string;
  liveFailed: string;
  noDates: string;
  noFestivals: string;
  daySummary: string;
  reminderSet: string;
  events: Record<FinderEvent, string>;
  weekdays: [string, string, string, string, string, string, string];
};

export type Copy = {
  appName: string;
  subtitle: string;
  pickLanguage: string;
  continue: string;
  hindi: string;
  english: string;
  citySearch: string;
  citySearchPlaceholder: string;
  useLocation: string;
  locating: string;
  locationDenied: string;
  changeCity: string;
  endsIn: string;
  now: string;
  wait: string;
  startingSomethingNew: string;
  good: string;
  avoid: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahu: string;
  brahma: string;
  choghadiya: string;
  shukla: string;
  krishna: string;
  paksha: string;
  loadingPanchang: string;
  shareToday: string;
  motionSlot: string;
  micSlot: string;
  privacyLocation: string;
  kundli: string;
  matching: string;
  kundliTitle: string;
  matchingTitle: string;
  birthName: string;
  birthNamePlaceholder: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  generateKundli: string;
  generating: string;
  lagna: string;
  moon: string;
  dasha: string;
  dashaUnknown: string;
  planets: string;
  house: string;
  askAboutChart: string;
  personA: string;
  personB: string;
  matchScore: string;
  matchingInProgress: string;
  shareScore: string;
  scoreCardTitle: string;
  close: string;
  windows: Record<WindowKind, string>;
  almanac: AlmanacCopy;
};

export const STRINGS: Record<Language, Copy> = {
  en: {
    appName: 'Shubh',
    subtitle: 'Is now good for this?',
    pickLanguage: 'Hindi or English',
    continue: 'Continue',
    hindi: 'हिन्दी',
    english: 'English',
    citySearch: 'Find a city',
    citySearchPlaceholder: 'Mumbai, London, Edison…',
    useLocation: 'Use my location',
    locating: 'Finding your city…',
    locationDenied: 'Location is off. Search for a city.',
    changeCity: 'Change city',
    endsIn: 'ends in',
    now: 'Now',
    wait: 'Wait',
    startingSomethingNew: 'for starting something new',
    good: 'Good',
    avoid: 'Avoid',
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    rahu: 'Rahu',
    brahma: 'Brahma',
    choghadiya: 'Choghadiya',
    shukla: 'Shukla',
    krishna: 'Krishna',
    paksha: 'Paksha',
    loadingPanchang: 'Fetching today’s panchang…',
    shareToday: 'Share today’s panchang',
    motionSlot: 'Sky motion lands here',
    micSlot: 'Ask',
    privacyLocation: 'Location is used only to compute local sunrise.',
    kundli: 'Kundli',
    matching: 'Match',
    kundliTitle: 'Birth chart',
    matchingTitle: 'Guna milan',
    birthName: 'Name',
    birthNamePlaceholder: 'Your name',
    dateOfBirth: 'Date of birth',
    timeOfBirth: 'Time of birth',
    birthPlace: 'Place',
    generateKundli: 'Generate kundli',
    generating: 'Computing…',
    lagna: 'Lagna',
    moon: 'Moon',
    dasha: 'Current dasha',
    dashaUnknown: 'Dasha not in this payload',
    planets: 'Key planets',
    house: 'House',
    askAboutChart: 'Ask about this chart',
    personA: 'Person 1',
    personB: 'Person 2',
    matchScore: 'Get matching score',
    matchingInProgress: 'Matching…',
    shareScore: 'Share score card',
    scoreCardTitle: 'Shubh · Guna milan',
    close: 'Close',
    windows: {
      rahu: 'Rahu Kaal',
      yamaganda: 'Yamaganda',
      gulika: 'Gulika',
      abhijit: 'Abhijit',
      amrit: 'Amrit',
      shubh: 'Shubh',
      labh: 'Labh',
      chal: 'Chal',
      udveg: 'Udveg',
      kaal: 'Kaal',
      rog: 'Rog',
    },
    almanac: {
      muhurat: 'Muhurat',
      festivals: 'Festivals',
      calendar: 'Calendar',
      kundli: 'Kundli',
      matching: 'Match',
      close: 'Close',
      share: 'Share',
      shareImage: 'Share card',
      retry: 'Try again',
      score: 'Score',
      reason: 'Why',
      upcoming: 'Upcoming',
      whyThisDate: 'Why this date?',
      liveNeedsKey: 'Live panchang needs DIVINE_PROXY_URL. The key stays on the server.',
      liveFailed: 'Couldn’t reach live panchang.',
      noDates: 'No ranked dates in this range.',
      noFestivals: 'No upcoming festivals yet.',
      daySummary: 'This day',
      reminderSet: 'We’ll remind you the morning of the next festival.',
      events: {
        marriage: 'Marriage',
        griha_pravesh: 'Housewarming',
        vehicle_purchase: 'Vehicle',
        business_start: 'Business',
        naming: 'Naming',
        property_purchase: 'Property',
      },
      weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    },
  },
  hi: {
    appName: 'शुभ',
    subtitle: 'क्या अभी ठीक है?',
    pickLanguage: 'हिन्दी या अंग्रेज़ी',
    continue: 'आगे बढ़ें',
    hindi: 'हिन्दी',
    english: 'English',
    citySearch: 'शहर खोजें',
    citySearchPlaceholder: 'मुंबई, लंदन, एडिसन…',
    useLocation: 'मेरी लोकेशन',
    locating: 'शहर ढूँढ रहे हैं…',
    locationDenied: 'लोकेशन बंद है। शहर खोजें।',
    changeCity: 'शहर बदलें',
    endsIn: 'समाप्त होने में',
    now: 'अभी',
    wait: 'रुकें',
    startingSomethingNew: 'नई शुरुआत के लिए',
    good: 'शुभ',
    avoid: 'टालें',
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    rahu: 'राहु',
    brahma: 'ब्रह्म',
    choghadiya: 'चौघड़िया',
    shukla: 'शुक्ल',
    krishna: 'कृष्ण',
    paksha: 'पक्ष',
    loadingPanchang: 'आज का पंचांग आ रहा है…',
    shareToday: 'आज का पंचांग शेयर करें',
    motionSlot: 'आकाश की गति यहाँ आएगी',
    micSlot: 'पूछें',
    privacyLocation: 'लोकेशन केवल स्थानीय सूर्योदय के लिए है।',
    kundli: 'कुंडली',
    matching: 'मिलान',
    kundliTitle: 'जन्म कुंडली',
    matchingTitle: 'गुण मिलान',
    birthName: 'नाम',
    birthNamePlaceholder: 'आपका नाम',
    dateOfBirth: 'जन्म तिथि',
    timeOfBirth: 'जन्म समय',
    birthPlace: 'स्थान',
    generateKundli: 'कुंडली बनाएँ',
    generating: 'गणना हो रही है…',
    lagna: 'लग्न',
    moon: 'चंद्र',
    dasha: 'वर्तमान दशा',
    dashaUnknown: 'दशा इस उत्तर में नहीं है',
    planets: 'मुख्य ग्रह',
    house: 'भाव',
    askAboutChart: 'इस कुंडली के बारे में पूछें',
    personA: 'व्यक्ति 1',
    personB: 'व्यक्ति 2',
    matchScore: 'मिलान अंक देखें',
    matchingInProgress: 'मिलान हो रहा है…',
    shareScore: 'अंक कार्ड साझा करें',
    scoreCardTitle: 'शुभ · गुण मिलान',
    close: 'बंद',
    windows: {
      rahu: 'राहु काल',
      yamaganda: 'यमगंड',
      gulika: 'गुलिक',
      abhijit: 'अभिजित',
      amrit: 'अमृत',
      shubh: 'शुभ',
      labh: 'लाभ',
      chal: 'चल',
      udveg: 'उद्वेग',
      kaal: 'काल',
      rog: 'रोग',
    },
    almanac: {
      muhurat: 'मुहूर्त',
      festivals: 'त्योहार',
      calendar: 'पंचांग',
      kundli: 'कुंडली',
      matching: 'मिलान',
      close: 'बंद',
      share: 'शेयर',
      shareImage: 'कार्ड शेयर',
      retry: 'फिर कोशिश',
      score: 'अंक',
      reason: 'कारण',
      upcoming: 'आने वाले',
      whyThisDate: 'यह तारीख क्यों?',
      liveNeedsKey: 'लाइव पंचांग के लिए DIVINE_PROXY_URL चाहिए। कुंजी सर्वर पर रहती है।',
      liveFailed: 'लाइव पंचांग नहीं मिला।',
      noDates: 'इस अवधि में कोई अच्छी तारीख नहीं मिली।',
      noFestivals: 'अभी कोई आने वाला त्योहार नहीं।',
      daySummary: 'यह दिन',
      reminderSet: 'अगले त्योहार की सुबह याद दिलाएँगे।',
      events: {
        marriage: 'विवाह',
        griha_pravesh: 'गृह प्रवेश',
        vehicle_purchase: 'वाहन',
        business_start: 'व्यवसाय',
        naming: 'नामकरण',
        property_purchase: 'संपत्ति',
      },
      weekdays: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
    },
  },
};

export function windowLabel(language: Language, name: WindowKind): string {
  return STRINGS[language].windows[name];
}

export function stateLabel(language: Language, state: StartSomethingState): string {
  return state === 'now' ? STRINGS[language].now : STRINGS[language].wait;
}

export function pakshaLabel(language: Language, paksha?: string | null): string | null {
  if (!paksha) return null;
  const key = paksha.toUpperCase();
  const copy = STRINGS[language];
  if (key.includes('SHUKLA') || key.includes('शुक्ल')) return `${copy.shukla} ${copy.paksha}`;
  if (key.includes('KRISHNA') || key.includes('कृष्ण')) return `${copy.krishna} ${copy.paksha}`;
  return paksha;
}

export function choghadiyaLabel(language: Language, name: string): string {
  const key = name.toLowerCase() as WindowKind;
  return STRINGS[language].windows[key] ?? name;
}
