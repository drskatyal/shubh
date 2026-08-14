import type { StartSomethingState, WindowKind } from '../engine';
import type { FinderEvent } from '../tathaastu/types';

export type Language = 'hi' | 'en';

export type AlmanacCopy = {
  muhurat: string;
  festivals: string;
  calendar: string;
  close: string;
  share: string;
  score: string;
  reason: string;
  upcoming: string;
  whyThisDate: string;
  usingFixtures: string;
  liveNeedsKey: string;
  noDates: string;
  daySummary: string;
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
  motionSlot: string;
  micSlot: string;
  privacyLocation: string;
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
    almanac: {
      muhurat: 'Muhurat',
      festivals: 'Festivals',
      calendar: 'Calendar',
      close: 'Close',
      share: 'Share',
      score: 'Score',
      reason: 'Why',
      upcoming: 'Upcoming',
      whyThisDate: 'Why this date?',
      usingFixtures: 'Live panchang needs a key. Showing fixtures.',
      liveNeedsKey: 'Live panchang needs a key / plan.',
      noDates: 'No ranked dates in this range.',
      daySummary: 'This day',
      events: {
        marriage: 'Marriage',
        griha_pravesh: 'Housewarming',
        vehicle_purchase: 'Vehicle',
        business_start: 'Business',
        naming: 'Naming',
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
    almanac: {
      muhurat: 'मुहूर्त',
      festivals: 'त्योहार',
      calendar: 'पंचांग',
      close: 'बंद',
      share: 'शेयर',
      score: 'अंक',
      reason: 'कारण',
      upcoming: 'आने वाले',
      whyThisDate: 'यह तारीख क्यों?',
      usingFixtures: 'लाइव पंचांग के लिए कुंजी चाहिए। नमूना दिख रहा है।',
      liveNeedsKey: 'लाइव पंचांग के लिए कुंजी / प्लान चाहिए।',
      noDates: 'इस अवधि में कोई अच्छी तारीख नहीं मिली।',
      daySummary: 'यह दिन',
      events: {
        marriage: 'विवाह',
        griha_pravesh: 'गृह प्रवेश',
        vehicle_purchase: 'वाहन',
        business_start: 'व्यवसाय',
        naming: 'नामकरण',
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
