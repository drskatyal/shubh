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
