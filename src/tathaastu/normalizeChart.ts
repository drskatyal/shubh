import type {
  ChartAskSummary,
  DashaTeaser,
  KutaKey,
  KutaScore,
  NormalizedChart,
  NormalizedMatch,
  PlanetName,
  PlanetRow,
  SignPoint,
} from './types';

const PLANETS: PlanetName[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

const PLANET_ALIASES: Record<string, PlanetName> = {
  sun: 'Sun',
  surya: 'Sun',
  moon: 'Moon',
  chandra: 'Moon',
  mars: 'Mars',
  mangal: 'Mars',
  mercury: 'Mercury',
  budh: 'Mercury',
  jupiter: 'Jupiter',
  guru: 'Jupiter',
  venus: 'Venus',
  shukra: 'Venus',
  saturn: 'Saturn',
  shani: 'Saturn',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

const KUTA_MAX: Record<KutaKey, number> = {
  varna: 1,
  vashya: 2,
  tara: 3,
  yoni: 4,
  graha_maitri: 5,
  gana: 6,
  bhakoot: 7,
  nadi: 8,
};

const KUTA_LABEL: Record<KutaKey, string> = {
  varna: 'Varna',
  vashya: 'Vashya',
  tara: 'Tara',
  yoni: 'Yoni',
  graha_maitri: 'Graha Maitri',
  gana: 'Gana',
  bhakoot: 'Bhakoot',
  nadi: 'Nadi',
};

  const KUTA_ALIASES: Record<string, KutaKey> = {
  varna: 'varna',
  vashya: 'vashya',
  tara: 'tara',
  yoni: 'yoni',
  graha_maitri: 'graha_maitri',
  grahamaitri: 'graha_maitri',
  graha_maitri_kuta: 'graha_maitri',
  gana: 'gana',
  bhakoot: 'bhakoot',
  bhakoota: 'bhakoot',
  bhakut: 'bhakoot',
  nadi: 'nadi',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function asBool(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (v === 'true' || v === 'yes' || v === 'manglik') return true;
    if (v === 'false' || v === 'no' || v === 'non-manglik') return false;
  }
  return null;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in obj && obj[key] != null) return obj[key];
  }
  return undefined;
}

function signPoint(value: unknown, fallback = '—'): SignPoint {
  if (typeof value === 'string' && value.trim()) {
    return { sign: value.trim(), nakshatra: null };
  }
  if (isRecord(value)) {
    const sign =
      asString(pick(value, ['sign', 'rashi', 'rasi', 'name', 'lagna', 'ascendant'])) ?? fallback;
    const nakshatra = asString(pick(value, ['nakshatra', 'nakshatra_name', 'star']));
    return { sign, nakshatra };
  }
  return { sign: fallback, nakshatra: null };
}

function planetName(raw: string): PlanetName | null {
  return PLANET_ALIASES[raw.trim().toLowerCase()] ?? null;
}

function planetRow(name: PlanetName, value: unknown): PlanetRow {
  if (typeof value === 'string') {
    return { name, sign: value, house: null, nakshatra: null };
  }
  if (!isRecord(value)) {
    return { name, sign: '—', house: null, nakshatra: null };
  }
  const sign =
    asString(pick(value, ['sign', 'rashi', 'rasi', 'zodiac', 'rashi_name'])) ?? '—';
  const house = asNumber(pick(value, ['house', 'bhava', 'house_number']));
  const nakshatra = asString(pick(value, ['nakshatra', 'nakshatra_name', 'star']));
  return { name, sign, house, nakshatra };
}

function collectPlanets(raw: unknown): PlanetRow[] {
  const found = new Map<PlanetName, PlanetRow>();

  const add = (name: PlanetName, value: unknown) => {
    if (!found.has(name)) found.set(name, planetRow(name, value));
  };

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!isRecord(item)) continue;
      const label = asString(pick(item, ['name', 'planet', 'graha', 'key']));
      if (!label) continue;
      const name = planetName(label);
      if (name) add(name, item);
    }
  } else if (isRecord(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      const name = planetName(key);
      if (name) add(name, value);
    }
  }

  return PLANETS.map((name) => found.get(name) ?? { name, sign: '—', house: null, nakshatra: null });
}

function dashaTeaser(raw: unknown): DashaTeaser | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    return { mahadasha: raw, antardasha: null, from: null, to: null };
  }
  if (!isRecord(raw)) return null;

  const current = isRecord(raw.current) ? raw.current : raw;
  const maha = isRecord(current.mahadasha) ? current.mahadasha : current;
  const antar = isRecord(current.antardasha)
    ? current.antardasha
    : isRecord(current.antar_dasha)
      ? current.antar_dasha
      : null;

  const mahadasha =
    asString(
      pick(isRecord(maha) ? maha : current, [
        'mahadasha',
        'maha_dasha',
        'current_mahadasha',
        'lord',
        'planet',
        'name',
      ]),
    ) ?? asString(pick(raw, ['mahadasha', 'current_mahadasha', 'vimshottari']));

  if (!mahadasha) return null;

  const antardasha = antar
    ? asString(pick(antar, ['lord', 'planet', 'name', 'antardasha']))
    : asString(pick(current, ['antardasha', 'antar_dasha', 'current_antardasha']));

  return {
    mahadasha,
    antardasha,
    from: asString(pick(isRecord(maha) ? maha : current, ['from', 'start', 'start_date'])),
    to: asString(pick(isRecord(maha) ? maha : current, ['to', 'end', 'end_date'])),
  };
}

function insightsFrom(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(asString).filter((line): line is string => Boolean(line)).slice(0, 4);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
}

export function normalizeChart(raw: unknown, fallbackName: string): NormalizedChart {
  const root = isRecord(raw) ? raw : {};
  const chart = isRecord(root.chart) ? root.chart : root;
  const planetsRaw = pick(chart, [
    'planets',
    'planetary_positions',
    'grahas',
    'positions',
    'planet_positions',
  ]);

  const lagna = signPoint(
    pick(chart, [
      'lagna',
      'ascendant',
      'lagna_rashi',
      'ascendant_sign',
      'udaya_lagna',
      'ascendant_sign_name',
    ]),
  );
  const moonDirect = pick(chart, ['moon', 'moon_sign', 'moonsign', 'chandra', 'janma_rashi']);
  const planets = collectPlanets(planetsRaw);
  const moonPlanet = planets.find((p) => p.name === 'Moon');
  const moon = moonDirect
    ? signPoint(moonDirect)
    : { sign: moonPlanet?.sign ?? '—', nakshatra: moonPlanet?.nakshatra ?? null };
  const lagnaFromPlanets = Array.isArray(planetsRaw)
    ? planetsRaw
        .map((item) => (isRecord(item) ? item : null))
        .find((item) => {
          const label = asString(pick(item ?? {}, ['name', 'planet', 'graha']));
          return label ? /ascendant|lagna/i.test(label) : false;
        })
    : null;
  const resolvedLagna =
    lagna.sign !== '—'
      ? lagna
      : lagnaFromPlanets
        ? signPoint(lagnaFromPlanets)
        : lagna;

  const dasha = dashaTeaser(
    pick(chart, ['dasha', 'dashas', 'vimshottari', 'vimshottari_dasha', 'current_dasha']),
  );

  return {
    name: asString(pick(chart, ['name', 'native', 'person_name'])) ?? fallbackName,
    placeName: asString(pick(chart, ['place_name', 'place', 'location', 'city'])),
    lagna: resolvedLagna,
    moon,
    planets,
    dasha,
    insights: insightsFrom(pick(chart, ['insights', 'key_insights', 'teaser', 'highlights'])),
  };
}

function kutaFromUnknown(key: KutaKey, value: unknown): KutaScore {
  if (typeof value === 'number') {
    return { key, label: KUTA_LABEL[key], score: value, max: KUTA_MAX[key] };
  }
  if (isRecord(value)) {
    const score =
      asNumber(pick(value, ['score', 'points', 'guna', 'obtained', 'value', 'points_obtained'])) ?? 0;
    const max =
      asNumber(pick(value, ['max', 'out_of', 'maximum', 'total', 'max_ponits', 'max_points'])) ??
      KUTA_MAX[key];
    return { key, label: KUTA_LABEL[key], score, max };
  }
  return { key, label: KUTA_LABEL[key], score: 0, max: KUTA_MAX[key] };
}

function collectKutas(raw: unknown): KutaScore[] {
  const found = new Map<KutaKey, KutaScore>();

  const add = (key: KutaKey, value: unknown) => {
    if (!found.has(key)) found.set(key, kutaFromUnknown(key, value));
  };

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!isRecord(item)) continue;
      const label = asString(pick(item, ['name', 'kuta', 'key', 'type']));
      if (!label) continue;
      const key = KUTA_ALIASES[label.toLowerCase().replace(/\s+/g, '_')];
      if (key) add(key, item);
    }
  } else if (isRecord(raw)) {
    for (const [label, value] of Object.entries(raw)) {
      const key = KUTA_ALIASES[label.toLowerCase().replace(/\s+/g, '_')];
      if (key) add(key, value);
    }
  }

  return (Object.keys(KUTA_MAX) as KutaKey[]).map(
    (key) => found.get(key) ?? { key, label: KUTA_LABEL[key], score: 0, max: KUTA_MAX[key] },
  );
}

export function normalizeMatch(
  raw: unknown,
  personA: string,
  personB: string,
): NormalizedMatch {
  const root = isRecord(raw) ? raw : {};
  const milan = isRecord(root.guna_milan)
    ? root.guna_milan
    : isRecord(root.ashtakoot_milan)
      ? root.ashtakoot_milan
      : isRecord(root.ashtakoot)
        ? root.ashtakoot
        : isRecord(root.ashtakoota)
          ? root.ashtakoota
          : isRecord(root.dashakoot_milan)
            ? root.dashakoot_milan
            : root;

  const resultBlock = isRecord(root.ashtakoot_milan_result)
    ? root.ashtakoot_milan_result
    : isRecord(root.dashakoot_milan_result)
      ? root.dashakoot_milan_result
      : milan;

  const total =
    asNumber(
      pick(resultBlock, ['total', 'total_score', 'score', 'guna', 'guna_score', 'obtained', 'points_obtained']) ??
        pick(milan, ['total', 'total_score', 'score', 'guna', 'guna_score', 'obtained', 'points_obtained']) ??
        pick(root, ['total', 'total_score', 'score', 'guna_score', 'points_obtained']),
    ) ?? 0;
  const max =
    asNumber(
      pick(resultBlock, ['max', 'out_of', 'maximum', 'max_score', 'max_ponits', 'max_points']) ??
        pick(milan, ['max', 'out_of', 'maximum', 'max_score', 'max_ponits']) ??
        pick(root, ['max', 'out_of', 'max_score']),
    ) ?? 36;
  const verdict =
    asString(pick(resultBlock, ['content', 'verdict', 'assessment'])) ??
    asString(pick(root, ['verdict', 'assessment', 'compatibility', 'result', 'summary', 'content'])) ??
    asString(pick(milan, ['verdict', 'assessment'])) ??
    (total >= 18 ? 'Compatible' : 'Needs care');

  const kutas = collectKutas(
    pick(root, ['kutas', 'kuta', 'ashtakoot', 'ashtakoota', 'ashtakoot_milan', 'guna_milan', 'scores']) ??
      pick(milan, ['kutas', 'kuta', 'scores', 'breakdown']),
  );

  const manglikRaw = pick(root, ['manglik', 'manglik_dosha', 'mangal_dosha']);
  let a: boolean | null = null;
  let b: boolean | null = null;
  if (isRecord(manglikRaw)) {
    a = asBool(pick(manglikRaw, ['person_a', 'person1', 'bride', 'a', 'p1']));
    b = asBool(pick(manglikRaw, ['person_b', 'person2', 'groom', 'b', 'p2']));
  }

  return {
    personA: asString(pick(root, ['person_a_name', 'bride_name'])) ?? personA,
    personB: asString(pick(root, ['person_b_name', 'groom_name'])) ?? personB,
    total,
    max,
    verdict,
    kutas,
    manglik: { a, b },
  };
}

export function mergeMatch(score: NormalizedMatch, full: NormalizedMatch): NormalizedMatch {
  const kutas = full.kutas.some((k) => k.score > 0) ? full.kutas : score.kutas;
  return {
    personA: full.personA || score.personA,
    personB: full.personB || score.personB,
    total: full.total || score.total,
    max: full.max || score.max,
    verdict: full.verdict || score.verdict,
    kutas,
    manglik: {
      a: full.manglik.a ?? score.manglik.a,
      b: full.manglik.b ?? score.manglik.b,
    },
  };
}

export function toChartAskSummary(chart: NormalizedChart): ChartAskSummary {
  return {
    name: chart.name,
    lagna: chart.lagna,
    moon: chart.moon,
    planets: chart.planets,
    dasha: chart.dasha,
    insights: chart.insights,
  };
}

const BIRTH_PII = [
  'date_of_birth',
  'time_of_birth',
  'latitude',
  'longitude',
  'timezone',
  'date',
  'time',
  'lat',
  'lon',
  'tz',
];

export function chartSummaryHasBirthPii(summary: ChartAskSummary): boolean {
  const blob = JSON.stringify(summary).toLowerCase();
  return BIRTH_PII.some((key) => blob.includes(`"${key}"`));
}
