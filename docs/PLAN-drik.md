# Drik layer — on-device daily sky

This PR owns the daily job Hindus already check the way other people check the weather: **this city, this minute** — Rahu, Yamaganda, Gulika, Abhijit, day + night Choghadiya, and a rules-only now/wait for “starting something new.”

Drik Panchang is the **test oracle**, not a runtime dependency. The app never calls or scrapes drikpanchang.com.

Read [PRODUCT.md](../PRODUCT.md) first. Clock cut: [PLAN-clock.md](./PLAN-clock.md). Motion: [PLAN-motion.md](./PLAN-motion.md). Ask/credits stay in [PR #2](https://github.com/drskatyal/shubh/pull/2) — we pass live `SkyState` into `AskSheet` and do not rewrite Gemini or billing.

## The job (ship this, not an encyclopedia)

Home glance, widget, and the Ask prompt all read one on-device object:

```ts
getSkyState(lat, lon, date, { city, language }) → SkyState
```

That object is enough to answer “what window is it?” and to stuff clocks into Gemini. It is **not** a full panchang: no kundli, no rashifal, no tithi/nakshatra table on home. Tithi/nakshatra stay out unless a verdict rule needs them (none does today).

## On-device method

Panchang day starts at **local sunrise**, not midnight.

| Window | Method | Weekday table (1-indexed from sunrise) |
| --- | --- | --- |
| Sunrise / sunset | `astronomy-engine` `SearchRiseSet` for lat/lon. Never a fixed IST 07:30–09:00 table. | — |
| Timezone | `tz-lookup` → IANA zone | — |
| Rahu Kaal | Daylight ÷ 8 | Sun=8 Mon=2 Tue=7 Wed=5 Thu=6 Fri=4 Sat=3. Drik “About Rahu Kaal”. |
| Yamaganda | Same 8-part split | Sun=5 Mon=4 Tue=3 Wed=2 Thu=1 Fri=7 Sat=6. |
| Gulika | Same 8-part split | Sun=7 Mon=6 Tue=5 Wed=4 Thu=3 Fri=2 Sat=1. |
| Abhijit | 8th of 15 equal daytime muhurtas, centred on solar noon (midpoint of sunrise and sunset) | Not independently auspicious on Sunday (PRODUCT) or Wednesday (Muhurta Chintamani / Drik). `abhijit` is `null` those days for Ask; glance does not flip now/wait on it. |
| Day Choghadiya | Sunrise → sunset, 8 slots | First slot = weekday lord, then Venus → Mercury → Moon → Saturn → Jupiter → Mars; 8th repeats the 1st. Sun=Udveg, Venus=Chal, Mercury=Labh, Moon=Amrit, Saturn=Kaal, Jupiter=Shubh, Mars=Rog. Drik Choghadiya notes. |
| Night Choghadiya | Sunset → next sunrise, 8 slots | Drik + astroccult night table (cited in `src/engine/tables.ts`). |

Now/wait is [src/engine/RULES.md](../src/engine/RULES.md) only. No model.

## `SkyState` (one object, two consumers)

AskSheet (`sky: SkyState`) needs wall-clock strings the model can copy (`"14:12"`), not UTC-only ISO. Home needs the same live object plus glance extras.

```ts
type SkyClock = { iso: string; clock: string }; // iso has the zone offset; clock is HH:mm in that zone

type SkyState = {
  city: string;
  timezone: string;
  asOf: SkyClock;
  sunrise: SkyClock;
  sunset: SkyClock;
  currentSlot: SkyWindow & { kind: 'good' | 'inauspicious' | 'neutral' };
  rahu: SkyWindow;
  yamaganda: SkyWindow;
  gulika: SkyWindow;
  abhijit: SkyWindow | null;
  nextGoodWindow: SkyWindow | null;
  language?: 'hi' | 'en';
  // glance / widget extras
  lat: number;
  lon: number;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  nextSunrise: SkyClock;
  choghadiya: { current: ChoghadiyaSlot; next: ChoghadiyaSlot };
  currentWindow: CurrentWindow;
  startingSomethingNew: 'now' | 'wait';
};
```

`getSkyState` stays synchronous `(lat, lon, date, options?)`. Home calls it every tick. Ask’s old stub (`throw`) is gone.

## Home

1. `SkyBackdrop` behind the glance (motion PR #1 — do not fork the animation).
2. Live `getSkyState(city.lat, city.lon, now, { city, language })`.
3. `AskFAB` + `AskSheet` on top, `sky={live}` — copy `src/ask` and `src/billing` from PR #2, do not rewrite them.
4. Hindi | English toggle (already persisted).

Do not invent a second Gemini client. Do not mount `AskOnSkyScreen` as Home (that host used mock sky). After a verdict, call `useVerdictBeat().playVerdict`.

## Test oracle (pinned civil dates)

Oracle date: **Friday 14 Aug 2026** and **Sunday 16 Aug 2026**. Tolerance: **2 minutes** on sunrise and on Rahu (PRODUCT). Same tolerance for Yamaganda, Gulika, Abhijit, and Choghadiya slot bounds when a published Drik-method clock exists.

### Mumbai (19.076, 72.8777, Asia/Kolkata)

| Date | Window | Published (local) | Source |
| --- | --- | --- | --- |
| Fri 14 | Rahu | 11:07–12:43 | [rahukalam.com/mumbai…/14-08-2026](https://rahukalam.com/mumbai-maharashtra-india/14-08-2026) (same 8-part weekday method as [Drik Rahu Kaal](https://www.drikpanchang.com/panchang/rahu-kaal.html)) |
| Fri 14 | Yamaganda | 15:55–17:31 | same |
| Fri 14 | Gulika | 07:55–09:31 | same |
| Fri 14 | Sunrise / sunset | 06:19 / 19:06 | same |
| Sun 16 | Rahu | 17:31–19:07 | [rahukalam.com/mumbai…/16-08-2026](https://rahukalam.com/mumbai-maharashtra-india/16-08-2026) |
| Sun 16 | Yamaganda | 12:43–14:19 | same |
| Sun 16 | Gulika | 15:55–17:31 | same |
| Sun 16 | Day Choghadiya | Udveg, Chal, Labh, Amrit, Kaal, Shubh, Rog, Udveg | same (matches Drik weekday-lord sequence) |

**Do not pin Friday Mumbai Choghadiya names from rahukalam.com.** That page lists Monday’s sequence (Amrit, Kaal, Shubh…) on a Friday. Drik’s rule is weekday lord first: Friday = Chal → Labh → Amrit → Kaal → Shubh → Rog → Udveg → Chal. Confirmed on Drik’s own Saturday table (Kaal first) and on r-astro’s Friday London table (Char first).

### London (51.5074, −0.1278, Europe/London)

| Date | Window | Published (local) | Source |
| --- | --- | --- | --- |
| Fri 14 | Sunrise / sunset | 05:44 / 20:25 | [r-astro.com/london/2026-08-14](https://r-astro.com/london/2026-08-14) (same lat/lon) |
| Fri 14 | Rahu | 11:16–13:06 | same; also our existing Drik-method pin |
| Fri 14 | Yamaganda | 16:47–18:37 | same |
| Fri 14 | Gulika | 07:35–09:26 | same |
| Fri 14 | Abhijit | 12:37–13:36 | same (15-muhurta noon centre) |
| Fri 14 | Day Choghadiya | Char, Labh, Amrit, Kaal, Shubh, Rog, Udveg, Char | same — matches Drik Friday |
| Fri 14 | Night Choghadiya | Rog, Kaal, Labh, Udveg, Shubh, Amrit, Char, Rog | same — matches our night table |
| Sun 16 | Rahu | 18:32–20:21 | [Drik Rahu Kaal](https://www.drikpanchang.com/panchang/rahu-kaal.html?date=16%2F08%2F2026) (London). Not rahukaal.com’s 18:27–20:15. |

### Leicester, Chennai, Edison NJ

Sunrise must be a local morning hour and must not be copied from IST Mumbai. Rahu on the pinned Friday must be the 4th daylight eighth of **that** city’s sunrise/sunset, within 2 minutes of a Drik-method published clock when one exists; otherwise within 2 minutes of `daylightPart(sunrise, sunset, 4)` from our own local sunrise (the method Drik publishes).

## Known disagreements (document, don’t scrape)

| Source | Disagreement | What we do |
| --- | --- | --- |
| rahukalam.com Friday Mumbai Choghadiya | Wrong weekday sequence (Monday names on Friday) | Follow Drik weekday-lord rule. |
| rahukaal.com London Sunday Rahu | 18:27–20:15 vs Drik 18:32–20:21 | Follow Drik. |
| BhaktiBharat London | Different sunrise (05:38 / 05:41) → shifted Rahu | Follow Drik / r-astro local sunrise, then 8-part split. |
| r-astro London Friday Yamaganda 16:47 | Our geometric split is 16:44. Their Sun & Moon sunset is 20:25; their day Choghadiya ends 20:27. They minute-round rise/set, then divide — the 7th eighth accumulates ~3 min. Sunrise (05:44) and Rahu (11:14 vs 11:16) stay within 2 min. | Keep unrounded `SearchRiseSet`. Do not invent a later sunset to match a rounded table. |
| Hindu sunrise vs geometric sunrise | Drik sometimes uses a Hindu sunrise definition | We use astronomy-engine geometric rise (standard refraction). If a pin drifts >2 min, fix refraction/search, don’t copy IST. |

## Files

| Path | Role |
| --- | --- |
| `src/engine/tables.ts` | Cited weekday tables only |
| `src/engine/sun.ts` | Local rise/set |
| `src/engine/windows.ts` | Rahu / Yamaganda / Gulika / Abhijit |
| `src/engine/choghadiya.ts` | Day + night slots |
| `src/engine/rules.ts` + `RULES.md` | Glance window + now/wait |
| `src/engine/getSkyState.ts` | Public API |
| `src/engine/types.ts` | `SkyState` / `SkyClock` (Ask + glance) |
| `src/engine/__tests__/sky.test.ts` | London + Mumbai weekday/Sunday + other-city sunrise/Rahu |
| `src/ask/*`, `src/billing/*` | Copied from PR #2 — do not rewrite |
| `src/home/HomeScreen.tsx` | Backdrop + live sky + AskFAB/AskSheet + hi/en |

## Done when

- London and Mumbai Friday + Sunday Rahu match the Drik-method pins within 2 minutes.
- Yamaganda, Gulika, Abhijit, and Choghadiya are implemented, cited, and tested against the pins above.
- `getSkyState` returns real windows for a real city today. Home glance uses that, not a mock.
- AskSheet receives that live sky. No second Gemini client. No kundli on home.
