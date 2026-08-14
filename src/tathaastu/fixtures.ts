import type { CalendarMonth, Festival, FestivalExplain, RankedDate } from './types';

/** Fixture window around the PRODUCT oracle Friday (14 Aug 2026). Not live astronomy. */
export const FIXTURE_CITY = { nameEn: 'Delhi', nameHi: 'दिल्ली', lat: 28.6139, lon: 77.209 };

export const FIXTURE_MUHURAT: Record<string, RankedDate[]> = {
  marriage: [
    {
      date: '2026-08-21',
      score: 88,
      rating: 'EXCELLENT',
      reason: 'Abhijit muhurat after sunrise; no Bhadra.',
      supporting: ['Abhijit Muhurat available', 'Sarvartha Siddhi Yoga'],
      blocking: [],
    },
    {
      date: '2026-09-04',
      score: 81,
      rating: 'EXCELLENT',
      reason: 'Shukla paksha; supporting nakshatra.',
      supporting: ['Shukla paksha'],
      blocking: [],
    },
    {
      date: '2026-08-28',
      score: 72,
      rating: 'GOOD',
      reason: 'Good window after Gulika.',
      supporting: ['No Panchak'],
      blocking: [],
    },
  ],
  griha_pravesh: [
    {
      date: '2026-08-23',
      score: 86,
      rating: 'EXCELLENT',
      reason: 'Stable tithi; Abhijit available near noon.',
      supporting: ['Abhijit Muhurat available 11:52–12:40'],
      blocking: [],
    },
    {
      date: '2026-09-06',
      score: 74,
      rating: 'GOOD',
      reason: 'No Bhadra; supportive yoga.',
      supporting: ['No Bhadra'],
      blocking: [],
    },
  ],
  vehicle_purchase: [
    {
      date: '2026-08-20',
      score: 83,
      rating: 'EXCELLENT',
      reason: 'Labh hora after sunrise; no Yamaganda overlap for the window.',
      supporting: ['Labh Choghadiya'],
      blocking: [],
    },
    {
      date: '2026-09-02',
      score: 70,
      rating: 'GOOD',
      reason: 'Neutral tithi with supporting factors.',
      supporting: ['No Panchak'],
      blocking: [],
    },
  ],
  business_start: [
    {
      date: '2026-08-24',
      score: 84,
      rating: 'EXCELLENT',
      reason: 'Jupiter hora; no eclipse or Ekadashi block.',
      supporting: ['Jupiter hora', 'No Ekadashi'],
      blocking: [],
    },
    {
      date: '2026-09-07',
      score: 71,
      rating: 'GOOD',
      reason: 'Good score after Rahu Kaal.',
      supporting: ['No Bhadra'],
      blocking: [],
    },
  ],
  naming: [
    {
      date: '2026-08-22',
      score: 80,
      rating: 'EXCELLENT',
      reason: 'Naming mapped to a clear mundan / namkaran window.',
      supporting: ['Shukla paksha'],
      blocking: [],
    },
    {
      date: '2026-09-05',
      score: 69,
      rating: 'GOOD',
      reason: 'Supportive nakshatra; avoid evening Bhadra if listed.',
      supporting: ['No Panchak'],
      blocking: [],
    },
  ],
};

export const FIXTURE_FESTIVALS: Festival[] = [
  {
    date: '2026-08-16',
    key: 'FESTIVAL_EKADASHI',
    name: 'Ekadashi',
    type: 'VRAT',
    tags: ['FASTING', 'VAISHNAVA'],
  },
  {
    date: '2026-08-28',
    key: 'FESTIVAL_JANMASHTAMI',
    name: 'Janmashtami',
    type: 'FESTIVAL',
    tags: ['VAISHNAVA'],
  },
  {
    date: '2026-09-14',
    key: 'FESTIVAL_GANESH_CHATURTHI',
    name: 'Ganesh Chaturthi',
    type: 'FESTIVAL',
    tags: ['REGIONAL'],
  },
  {
    date: '2026-10-17',
    key: 'FESTIVAL_DUSSEHRA',
    name: 'Dussehra',
    type: 'FESTIVAL',
    tags: [],
  },
  {
    date: '2026-10-21',
    key: 'FESTIVAL_DIWALI',
    name: 'Diwali',
    type: 'FESTIVAL',
    tags: [],
  },
];

export const FIXTURE_EXPLAIN: Record<string, FestivalExplain> = {
  FESTIVAL_JANMASHTAMI: {
    festival: 'FESTIVAL_JANMASHTAMI',
    date: '2026-08-28',
    matched: true,
    ruleCode: 'JANMASHTAMI',
    humanReadable:
      "This festival was derived because the conditions in rule 'JANMASHTAMI' matched the Panchang facts for 2026-08-28.",
    conditions: [
      { field: 'paksha', expected: 'KRISHNA', actual: 'KRISHNA', matched: true },
      { field: 'tithi_num', expected: '8', actual: '8', matched: true },
    ],
  },
  FESTIVAL_EKADASHI: {
    festival: 'FESTIVAL_EKADASHI',
    date: '2026-08-16',
    matched: true,
    ruleCode: 'EKADASHI',
    humanReadable:
      "This festival was derived because the conditions in rule 'EKADASHI' matched the Panchang facts for 2026-08-16.",
    conditions: [
      { field: 'tithi_num', expected: '11', actual: '11', matched: true },
    ],
  },
};

export function fixtureExplain(festival: string, date: string): FestivalExplain {
  const pinned = FIXTURE_EXPLAIN[festival];
  if (pinned) return { ...pinned, date, festival };
  return {
    festival,
    date,
    matched: true,
    ruleCode: festival.replace(/^FESTIVAL_/, ''),
    humanReadable: `This festival was derived because the conditions in rule '${festival}' matched the Panchang facts for ${date}.`,
    conditions: [{ field: 'date', expected: date, actual: date, matched: true }],
  };
}

export function fixtureCalendarMonth(year: number, month: number): CalendarMonth {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const tithis = [
    'Pratipada',
    'Dwitiya',
    'Tritiya',
    'Chaturthi',
    'Panchami',
    'Shashthi',
    'Saptami',
    'Ashtami',
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima',
  ];
  const days = Array.from({ length: last }, (_, i) => {
    const day = i + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const fests = FIXTURE_FESTIVALS.filter((f) => f.date === date).map((f) => f.name);
    return {
      date,
      vara: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        new Date(Date.UTC(year, month - 1, day)).getUTCDay()
      ],
      tithi: tithis[i % tithis.length],
      nakshatra: 'Anuradha',
      yoga: 'Vyaghata',
      karana: 'Garija',
      festivals: fests,
    };
  });
  return { year, month, days };
}

export function fixtureMuhurat(event: string): RankedDate[] {
  return FIXTURE_MUHURAT[event] ?? FIXTURE_MUHURAT.marriage;
}
