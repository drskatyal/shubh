import { getSkyState, type Language, type SkyState } from '../engine';
import { civilDateInZone, timezoneFor } from '../engine/time';
import {
  asyncStorageStore,
  dayCacheKey,
  readCache,
  readLast,
  writeCache,
  type CacheStore,
} from './cache';
import {
  getChoghadiya,
  getDayContext,
  getPanchang,
  getPanchangLite,
  getPanchangToday,
  getTimings,
  resolveTransport,
  type TathaRequestOptions,
} from './client';
import { TATHA_INCLUDE } from './paths';
import {
  currentChoghadiya,
  hasLimbs,
  parseChoghadiyaList,
  parseLimbs,
  parseTimings,
  type ParsedTimings,
} from './parse';
import type {
  DayChoghadiya,
  DayContextView,
  DayLimb,
  DayRequest,
  DaySource,
  DayWindow,
  StartSomething,
} from './types';

export type LoadDayOptions = TathaRequestOptions & {
  store?: CacheStore;
  now?: number;
  sky?: SkyState;
};

export function civilYmd(lat: number, lon: number, at = new Date()): string {
  const civil = civilDateInZone(at, timezoneFor(lat, lon));
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${civil.year}-${pad(civil.month)}-${pad(civil.day)}`;
}

function windowFromSky(
  name: string,
  slot: { start: { clock: string }; end: { clock: string } } | null,
): DayWindow | null {
  if (!slot) return null;
  return { name, startClock: slot.start.clock, endClock: slot.end.clock };
}

function choghadiyaFromSky(sky: SkyState): DayChoghadiya {
  const current = sky.choghadiya.current;
  return {
    name: current.name,
    startClock: current.startClock.clock,
    endClock: current.endClock.clock,
    period: current.period,
  };
}

function startSomethingOf(sky: SkyState): StartSomething {
  return sky.startingSomethingNew === 'now' ? 'good' : 'avoid';
}

function liveSky(req: DayRequest): SkyState {
  return getSkyState(req.lat, req.lon, req.at ?? new Date(), {
    city: req.city,
    language: req.lang,
  });
}

function mergeTimings(into: ParsedTimings, extra: ParsedTimings): ParsedTimings {
  return {
    rahu: into.rahu ?? extra.rahu,
    yamaganda: into.yamaganda ?? extra.yamaganda,
    gulika: into.gulika ?? extra.gulika,
    abhijit: into.abhijit ?? extra.abhijit,
    brahma: into.brahma ?? extra.brahma,
    sunrise: into.sunrise ?? extra.sunrise,
    sunset: into.sunset ?? extra.sunset,
  };
}

function optionalLimb(limb: DayLimb, fallback: string): DayLimb | null {
  if (!limb.name || limb.name === fallback) return null;
  return limb;
}

function compose(
  req: DayRequest,
  sky: SkyState,
  raw: unknown | null,
  timings: ParsedTimings,
  choghadiya: DayChoghadiya,
  source: DaySource,
): DayContextView {
  const limbs = raw ? parseLimbs(raw) : null;
  const tithi = limbs ? optionalLimb(limbs.tithi, 'Tithi') : null;
  const nakshatra = limbs ? optionalLimb(limbs.nakshatra, 'Nakshatra') : null;
  const yoga = limbs ? optionalLimb(limbs.yoga, 'Yoga') : null;
  const karana = limbs ? optionalLimb(limbs.karana, 'Karana') : null;
  const rahu = timings.rahu ?? windowFromSky('Rahu Kaal', sky.rahu)!;
  const yamaganda = timings.yamaganda ?? windowFromSky('Yamaganda', sky.yamaganda)!;
  const gulika = timings.gulika ?? windowFromSky('Gulika', sky.gulika)!;
  const abhijit = timings.abhijit ?? windowFromSky('Abhijit', sky.abhijit);
  return {
    source,
    date: req.date,
    city: req.city,
    language: req.lang,
    tithi,
    nakshatra,
    yoga,
    karana,
    startSomething: startSomethingOf(sky),
    rahu,
    yamaganda,
    gulika,
    abhijit,
    brahma: timings.brahma,
    choghadiya,
    sky,
    promptPayload: {
      date: req.date,
      city: req.city,
      source,
      tithi,
      nakshatra,
      yoga,
      karana,
      rahu,
      yamaganda,
      gulika,
      abhijit,
      brahma: timings.brahma,
      choghadiya,
      startSomething: startSomethingOf(sky),
      sky,
    },
  };
}

function fromSky(req: DayRequest, sky: SkyState): DayContextView {
  return compose(req, sky, null, parseTimings({}), choghadiyaFromSky(sky), 'sky');
}

async function overlayChoghadiya(
  req: DayRequest,
  sky: SkyState,
  already: unknown,
  options: TathaRequestOptions,
): Promise<DayChoghadiya> {
  const fromPayload = currentChoghadiya(parseChoghadiyaList(already), sky.asOf.clock);
  if (fromPayload) return fromPayload;
  const result = await getChoghadiya({ date: req.date, lat: req.lat, lon: req.lon }, options);
  if (result.ok) {
    const slot = currentChoghadiya(parseChoghadiyaList(result.data), sky.asOf.clock);
    if (slot) return slot;
  }
  return choghadiyaFromSky(sky);
}

/**
 * Live TathaAstu day for home. On-device sky is used only when the live
 * call fails at runtime — never a designed fixture mode.
 */
export async function loadDay(
  req: DayRequest,
  options: LoadDayOptions = {},
): Promise<DayContextView> {
  const store = options.store ?? asyncStorageStore();
  const now = options.now ?? Date.now();
  const sky = options.sky ?? liveSky(req);
  const cacheKey = dayCacheKey(req.date, req.lat, req.lon, req.lang);

  const cached = await readCache<DayContextView>(store, cacheKey, now);
  if (cached && cached.source !== 'sky') {
    return {
      ...cached,
      sky,
      startSomething: startSomethingOf(sky),
      choghadiya: choghadiyaFromSky(sky),
      source: 'cache',
    };
  }

  const transport =
    options.transport !== undefined
      ? options.transport
      : resolveTransport({ proxyUrl: options.proxyUrl, apiKey: options.apiKey });
  if (!transport) {
    const last = await readLast<DayContextView>(store);
    if (last?.tithi && last.date === req.date && last.language === req.lang) {
      return { ...last, sky, startSomething: startSomethingOf(sky), source: 'cache' };
    }
    return fromSky(req, sky);
  }

  let raw: unknown = null;
  let source: DaySource = 'live';
  let timings: ParsedTimings = parseTimings({});
  const liveOpts: TathaRequestOptions = { ...options, transport };

  const dayContext = await getDayContext(
    { date: req.date, lat: req.lat, lon: req.lon, lang: req.lang },
    liveOpts,
  );

  if (dayContext.ok && hasLimbs(dayContext.data)) {
    raw = dayContext.data;
    timings = mergeTimings(timings, parseTimings(dayContext.data));
  } else {
    const today = await getPanchangToday(
      { lat: req.lat, lon: req.lon, lang: req.lang, include: TATHA_INCLUDE },
      liveOpts,
    );
    if (today.ok && hasLimbs(today.data)) {
      raw = today.data;
      timings = mergeTimings(timings, parseTimings(today.data));
    } else {
      const dated = await getPanchang(
        {
          date: req.date,
          lat: req.lat,
          lon: req.lon,
          lang: req.lang,
          include: TATHA_INCLUDE,
        },
        liveOpts,
      );
      if (dated.ok && hasLimbs(dated.data)) {
        raw = dated.data;
        timings = mergeTimings(timings, parseTimings(dated.data));
      }
    }
  }

  if (!timings.rahu && !timings.yamaganda && !timings.gulika) {
    const timingRes = await getTimings({ date: req.date, lat: req.lat, lon: req.lon }, liveOpts);
    if (timingRes.ok) {
      timings = mergeTimings(timings, parseTimings(timingRes.data));
    }
  }

  const choghadiya = raw
    ? await overlayChoghadiya(req, sky, raw, liveOpts)
    : choghadiyaFromSky(sky);

  if (!raw) {
    const last = await readLast<DayContextView>(store);
    if (last?.tithi) {
      return { ...last, sky, startSomething: startSomethingOf(sky), source: 'cache' };
    }
    return fromSky(req, sky);
  }

  const view = compose(req, sky, raw, timings, choghadiya, source);
  await writeCache(store, cacheKey, view, now);
  return view;
}

export async function loadLiteGlance(
  req: DayRequest,
  options: LoadDayOptions = {},
): Promise<{ city: string; tithi: string; state: 'now' | 'wait'; language: Language }> {
  const sky = options.sky ?? liveSky(req);
  const state = sky.startingSomethingNew;
  const lite = await getPanchangLite(
    { date: req.date, lat: req.lat, lon: req.lon, lang: req.lang },
    options,
  );
  if (lite.ok) {
    const limbs = parseLimbs(lite.data);
    if (limbs.tithi.name && limbs.tithi.name !== 'Tithi') {
      return { city: req.city, tithi: limbs.tithi.name, state, language: req.lang };
    }
  }
  const day = await loadDay(req, { ...options, sky });
  return {
    city: req.city,
    tithi: day.tithi?.name ?? sky.currentSlot.name,
    state,
    language: req.lang,
  };
}

export function withLiveSky(day: DayContextView, sky: SkyState): DayContextView {
  return {
    ...day,
    sky,
    startSomething: startSomethingOf(sky),
    choghadiya: choghadiyaFromSky(sky),
  };
}

