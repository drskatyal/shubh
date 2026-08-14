import type { StartSomethingState, WindowKind } from '../engine';

export type Language = 'hi' | 'en';

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
  motionSlot: string;
  micSlot: string;
  privacyLocation: string;
  share: string;
  shareToday: string;
  good: string;
  avoid: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  brahma: string;
  choghadiya: string;
  today: string;
  shukla: string;
  krishna: string;
  paksha: string;
  windows: Record<WindowKind, string>;
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
    motionSlot: 'Sky motion lands here',
    micSlot: 'Ask',
    privacyLocation: 'Location is used only for local sunrise and today’s panchang.',
    share: 'Share',
    shareToday: 'Share today’s panchang',
    good: 'Good',
    avoid: 'Avoid',
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    brahma: 'Brahma',
    choghadiya: 'Choghadiya',
    today: 'Today',
    shukla: 'Shukla',
    krishna: 'Krishna',
    paksha: 'Paksha',
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
    motionSlot: 'आकाश की गति यहाँ आएगी',
    micSlot: 'पूछें',
    privacyLocation: 'लोकेशन केवल स्थानीय सूर्योदय और आज के पंचांग के लिए है।',
    share: 'शेयर',
    shareToday: 'आज का पंचांग शेयर करें',
    good: 'अच्छा',
    avoid: 'टालें',
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    brahma: 'ब्रह्म',
    choghadiya: 'चौघड़िया',
    today: 'आज',
    shukla: 'शुक्ल',
    krishna: 'कृष्ण',
    paksha: 'पक्ष',
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
  },
};

export function windowLabel(language: Language, name: WindowKind): string {
  return STRINGS[language].windows[name];
}

export function stateLabel(language: Language, state: StartSomethingState): string {
  return state === 'now' ? STRINGS[language].now : STRINGS[language].wait;
}

export function pakshaLabel(language: Language, paksha?: string): string | null {
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
