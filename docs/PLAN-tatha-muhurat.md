# Muhurat finder + festival calendar

> Superseded. TathaAstuAPI is dead. Live vendor is Divine Vedic Prakash — see [PRODUCT.md](../PRODUCT.md) and `src/divine/`.

This PR owns Phase 1 **muhurat**, **festivals**, and the **month grid**. Home panchang motion, Gemini ask, credits, and kundli stay in other PRs.

Read [PRODUCT.md](../PRODUCT.md) first. Docs: https://www.tathaastuapi.com/docs.html · OpenAPI: https://api.tathaastuapi.com/openapi.json · Base: `https://api.tathaastuapi.com/v1`.

Do not invent paths. Every HTTP call below is in that OpenAPI (and named in PRODUCT). Response bodies are untyped in the spec (`schema: {}`); we normalize defensively and ship fixtures that match the documented examples.

## Out of scope

- Do not rewrite `SkyBackdrop`, `SkyStage`, or verdict motion.
- Do not rewrite Gemini / `src/ask` / credits.
- Do not build kundli or matching UI.
- No ads. No prayer lock. No sun-sign horoscope. No Drik scrape.

## Client contract (`src/tathaastu/client.ts`)

Home may land the same module. If it already exists, reuse it. Otherwise this PR creates it.

```
src/tathaastu/client.ts     typed GET wrappers + X-API-Key
src/tathaastu/types.ts      normalized app types
src/tathaastu/fixtures.ts   missing-key payloads
src/tathaastu/events.ts     finder event → API event candidates
```

Auth: `X-API-Key`. Key from `TATHAASTU_API_KEY` (EAS extra / server). Never `EXPO_PUBLIC_`. Optional `TATHAASTU_PROXY_URL` replaces the public base so the binary does not need the key.

Missing key → fixtures + a calm setup line. No crash.

`tathaGet(path, params)` is the only network helper. Wrappers:

| Wrapper | Path | When we call it |
|---|---|---|
| `findMuhurat` | `GET /v1/muhurat/find` | primary finder |
| `findEventDates` | `GET /v1/events/find-dates` | 402 fallback (OpenAPI: alias of find) |
| `getEventSuitability` | `GET /v1/events/suitability` | 402 fallback, one civil day |
| `getFestivals` | `GET /v1/festivals` | one date |
| `getFestivalsMonth` | `GET /v1/festivals/month` | upcoming list + month dots |
| `explainFestival` | `GET /v1/festivals/explain` | Why-this-date sheet |
| `getCalendarMonth` | `GET /v1/calendar/month` | month grid |
| `getCalendarDay` | `GET /v1/calendar/day` | tap-a-day summary if the month cell is thin |
| `getDayContext` | `GET /v1/day-context` | shared contract for the home PR |
| `getPanchang` | `GET /v1/panchang` | shared contract |
| `getPanchangToday` | `GET /v1/panchang/today` | shared contract |
| `getPanchangLite` | `GET /v1/panchang/lite` | shared contract |
| `getTimings` | `GET /v1/timings` | shared contract |

No kundli wrappers in this PR (`POST /v1/birth-chart`, compatibility). Home/kundli PRs add those on the same `tathaGet` / `tathaPost`.

On **401 / 402 / 429**: return the status. Finder walks the fallback chain. UI shows “live panchang needs a key / plan”. On-device `getSkyState` is not a muhurat oracle — we do not fake ranked dates from Rahu tables.

## Params we actually send (docs.html vs OpenAPI)

The HTML docs and PRODUCT disagree with the live OpenAPI on query names. We send **both** aliases so either server revision works. We do not add undocumented paths.

### `GET /v1/muhurat/find` (Pro)

PRODUCT / docs.html: `event`, `start_date`, `end_date`, `lat`, `lon`, `min_score` (0–100, default 60). Range max 90 days.

OpenAPI `muhurat_find`: `event`, `start`, `end`, `location_id`, `min_rating` (`EXCELLENT` \| `GOOD` \| `NEUTRAL`, default `GOOD`). Event examples: `MARRIAGE`, `GRIHA_PRAVESH`, `NAMKARAN`, `TRAVEL`, `BUSINESS`, `VEHICLE_PURCHASE`, `PROPERTY_PURCHASE`, `EDUCATION`.

This PR sends: `event`, `start_date` + `start`, `end_date` + `end`, `lat`, `lon`, `min_score`, `min_rating` (derived: ≥80 EXCELLENT, ≥60 GOOD, else NEUTRAL).

### `GET /v1/events/find-dates` (Pro)

OpenAPI: same query names as find (`event`, `start`, `end`, `location_id`, `min_rating`). Description: “Alias for /v1/muhurat/find.” Same alias bundle as above.

### `GET /v1/events/suitability` (Business)

OpenAPI + docs.html agree: `date`, `lat`, `lon`, optional `event`, optional `region`.

Documented events: `marriage`, `griha_pravesh`, `travel`, `mundan`, `vehicle_purchase`, `land_purchase`, `business_start`, `education_start`. Omit `event` for all ratings.

Documented body: `rating` (`AVOID` \| `NEUTRAL` \| `GOOD` \| `EXCELLENT`), `score`, `blocking_factors`, `supporting_factors`, `hierarchy_applied`, `disclaimer`.

### Festivals (Free)

`GET /v1/festivals` — docs.html: `date`, `region`, `lang`. OpenAPI also: `location_id`, `type`, `tags`, `festival_mode`, `pack`, `observatory`. We send `date`, `lat`, `lon`, `lang`, `region`.

`GET /v1/festivals/month` — `year`, `month`, `location_id`, `lang`. We also send `lat`, `lon` (docs.html calendar pattern; OpenAPI says location_id takes precedence over lat/lon).

`GET /v1/festivals/explain` — `date`, `festival` (key, e.g. `FESTIVAL_HOLI`), `location_id`. Documented body: `matched`, `rule_code`, `conditions[]` (`field`, `expected`, `actual`, `matched`), `human_readable`.

Not used (exist in OpenAPI, not in this Phase 1 cut): `/v1/festivals/range`, `/v1/festivals/date`, `/v1/festivals/search`, `/v1/festivals/year`, `/v1/festivals/world*`.

### Calendar (Free)

`GET /v1/calendar/month` — docs.html: `year`, `month`, optional `lat`, `lon`. OpenAPI: `year`, `month`, `location_id`, `lang`. We send all of those.

`GET /v1/calendar/day` — OpenAPI: `date`, `location_id`, `lang`. Used only when a tapped cell has no summary.

## Finder screen

Chips (PRODUCT): `marriage`, `griha_pravesh`, `vehicle_purchase`, `business_start`, `naming`.

API event candidates (first that the server accepts):

| Chip | Try in order |
|---|---|
| marriage | `marriage`, `MARRIAGE` |
| griha_pravesh | `griha_pravesh`, `GRIHA_PRAVESH` |
| vehicle_purchase | `vehicle_purchase`, `VEHICLE_PURCHASE` |
| business_start | `business_start`, `BUSINESS_START`, `BUSINESS` |
| naming | `naming`, `NAMKARAN`, `namkaran`, `mundan`, `education_start`, `EDUCATION` |

Default range: today → +60 days (under the 90-day cap). `min_score` 60.

Walk:

1. `GET /v1/muhurat/find`
2. HTTP 402 → `GET /v1/events/find-dates`
3. HTTP 402 → scan `GET /v1/events/suitability` per civil day (cap 31 days). Keep GOOD / EXCELLENT; if none, keep NEUTRAL. Sort by `score` desc.

422 on an event name → next candidate. 401 / 429 → setup / plan copy, fixtures if we have no live body.

Ranked rows: date, score, rating, reason (or joined `supporting_factors`). Share card: **“Best date for {event}”** / **“{event} के लिए सबसे अच्छी तारीख”**. No ads on the card. `Share.share` of the card text.

## Festivals

Upcoming = `GET /v1/festivals/month` for this month and next, filter `date >= today`, sort, take ~12.

Tap a row → `GET /v1/festivals/explain?festival=&date=` sheet (“Why this date?”). Shareable festival card (name, date, city, one-line reason). No ads.

Local notification for the **next** upcoming festival (no account). Identifier `shubh.next-festival`. 08:00 local on that date. Reschedule when the list refreshes. Missing notification permission → skip, do not crash.

## Month grid

`GET /v1/calendar/month`. Cells show civil day + a tithi / festival mark when the payload has one. Tap → that day’s summary (from the month row, else `GET /v1/calendar/day`).

## Home wiring

`HomeScreen` keeps `SkyBackdrop` + `AskFAB` / `AskSheet`. A thin dock above the mic opens Muhurat / Festivals / Calendar as modals. City + language come from the existing place / i18n context.

hi / en throughout. `lang` on TathaAstu is phonetic transliteration — we pass `hi` or `en`.

## Done when

- Finder returns ranked dates + a share card against fixtures (and live API if `TATHAASTU_API_KEY` is set).
- Festival list + explain sheet + festival share card.
- Next-festival local notification is scheduled from the upcoming list.
- Month grid + day summary.
- Missing key never crashes.
- Motion and Gemini files are untouched aside from the Home dock hook.
