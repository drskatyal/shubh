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
    privacyLocation: 'Location is used only to compute local sunrise.',
    kundli: 'Kundli',
    matching: 'Match',
    kundliTitle: 'Birth chart',
    matchingTitle: 'Guna milan',
    birthName: 'Name',
    birthNamePlaceholder: 'Arjun',
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
    privacyLocation: 'लोकेशन केवल स्थानीय सूर्योदय के लिए है।',
    kundli: 'कुंडली',
    matching: 'मिलान',
    kundliTitle: 'जन्म कुंडली',
    matchingTitle: 'गुण मिलान',
    birthName: 'नाम',
    birthNamePlaceholder: 'अर्जुन',
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
  },
};

export function windowLabel(language: Language, name: WindowKind): string {
  return STRINGS[language].windows[name];
}

export function stateLabel(language: Language, state: StartSomethingState): string {
  return state === 'now' ? STRINGS[language].now : STRINGS[language].wait;
}
