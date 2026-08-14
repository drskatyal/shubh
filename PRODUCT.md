# Shubh — Divine Vedic Prakash plan (approved)

Build this. DivineAPI Vedic Prakash is the live backbone. On-device `getSkyState` (`src/engine`) is the offline fallback for the daily glance only. TathaAstuAPI is dead — do not call it. VedAstro is not in scope. Keep the existing sky motion, Hindi/English, voice ask, and credits.

Docs: https://developers.divineapi.com/
Vedic overview: https://divineapi.com/indian-astrology/vedic-astrology-api
Auth: `Authorization: Bearer {token}` **and** `api_key` in the body. One env var is enough: `DIVINE_API_KEY` is used as both unless `DIVINE_API_TOKEN` is set. Never put the key in the app binary. The client talks to `server/divine-proxy.mjs` via `DIVINE_PROXY_URL` / `EXPO_PUBLIC_DIVINE_PROXY_URL`.

Missing key, 401/402/429/5xx → on-device glance for Home. Kundli, matching, and festivals show a calm “connect API” empty state. Never ship a fake panchang, sample Arjun/Priya chart, or mock festival as the happy path.

`lan` on Divine: `en`, `hi`, `bn`, `ma` (Marathi), `tm` (Tamil), `tl` (Telugu), `ml`, `kn`. Launch hi + en. Keep the mapping pluggable for the rest.

## Phase 1 — ship this (viral loop)

### Daily panchang home
- `POST /indian-api/v2/find-panchang` (astroapi-1) — tithi, nakshatra, yoga, karana, sunrise/sunset.
- `POST /indian-api/v1/auspicious-timings` — Abhijit, Brahma.
- `POST /indian-api/v1/inauspicious-timings` — Rahu, Yamaganda, Gulika.
- `POST /indian-api/v1/find-choghadiya` (astroapi-2).
- `POST /indian-api/v1/muhurat/hora`.
- Show: city, tithi, nakshatra, yoga, karana, Good/Avoid, Rahu / Yamaganda / Gulika / Abhijit / Brahma, current Choghadiya (on-device if Divine omits “now”).
- SkyBackdrop behind the glance. Reduce Motion respected.
- Cache panchang per city+date for 6 hours.
- One-tap share card. Widget: last cached tithi + now/wait + city.

### Muhurat finder
- `POST /indian-api/v1/muhurat/marriage`
- `POST /indian-api/v1/muhurat/house-entering` (griha pravesh)
- `POST /indian-api/v1/muhurat/vehicle-purchase`
- `POST /indian-api/v1/muhurat/business-start`
- `POST /indian-api/v1/muhurat/property-purchase`
- Naming chip stays; Divine has no namkaran route, so it uses the marriage calendar.
- Ranked dates + share card.

### Festivals + calendar
- `POST /indian-api/v1/english-calendar-festivals` — month list / calendar dots.
- `POST /indian-api/v1/date-specific-festivals` — why this date / day sheet.
- `POST /indian-api/v1/find-festival` — named festival explain.
- Upcoming list + local notification for the next festival.

### Kundli + matching
- `POST /indian-api/v3/basic-astro-details`
- `POST /indian-api/v2/planetary-positions`
- `POST /indian-api/v1/vimshottari-dasha` (`dasha_type=antar-dasha`)
- `POST /indian-api/v1/horoscope-chart/D1` and `/D9`
- `POST /indian-api/v2/ashtakoot-milan` (includes Manglik)
- `POST /indian-api/v2/dashakoot-milan` (one extra call)
- Cache kundli/matching indefinitely, keyed on the birth tuple.
- Birth data stays on device. No user account.

### Voice ask (already in repo)
- Keep Gemini 3.7 Flash mic. Stuff live day limbs (plus on-device fallback sky) into the prompt. Credits unchanged. TTS still later.

## Phase 2 (structure, don’t block Phase 1)
Personalized daily insight, family profiles, more share cards, streaks, Amanta/Purnimanta toggle.

## Phase 3 (later)
More regional languages, community, PDF reports, premium muhurat unlock if the Divine plan requires it.

## Client rules
- `src/divine/client.ts` — typed POST wrappers. Read official docs. Do not invent paths.
- App-level types stay in `src/tathaastu/types.ts` so Home/Muhurat/Festivals/Kundli/Matching do not get a rewrite.
- Cache day payload 6h. Kundli/matching: birth-tuple key, no TTL.
- On 401/402/429/5xx or missing key: `getSkyState` for the glance; connect-API empty state for kundli/matching/festivals.
- Never scrape Drik. Never commit keys.
- No ads. No prayer lock. No sun-sign horoscope.

## Done when (Phase 1)
- Home shows a real Divine day for the city, with motion + image share card. On-device glance if Divine is down.
- Muhurat finder returns ranked dates and a share card.
- Festival list + explain sheet.
- Kundli generate + matching score + share card.
- Widget + offline last-day cache.
- hi/en throughout.
- Mic still works, stuffed with the same day payload.
- One documented env var (`DIVINE_API_KEY`) is enough to go live.
