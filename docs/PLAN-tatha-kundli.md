# PLAN: Kundli + Ashtakoota matching + share cards

Lane: TathaAstu birth chart and guna milan. Home glance, muhurat, festivals, ads, TTS, and accounts stay in other PRs.

Read [PRODUCT.md](../PRODUCT.md) first. OpenAPI is the request contract: https://api.tathaastuapi.com/openapi.json. Human docs: https://www.tathaastuapi.com/docs.html. Do not invent paths.

## Endpoints (only these)

Base: `https://api.tathaastuapi.com`. Auth: `X-API-Key`. The app binary never embeds the key. The client talks to a thin proxy (`TATHAASTU_PROXY_URL` / `EXPO_PUBLIC_TATHAASTU_PROXY_URL`). `TATHAASTU_API_KEY` lives on the server / EAS secret / Node tests only.

| Call | Path | When |
| --- | --- | --- |
| Kundli | `POST /v1/birth-chart?store=false` | Generate. `store=false` so TathaAstu does not keep a profile. |
| Score (lite first) | `GET /v1/compatibility/score` | Two people → total / 36 + verdict. Query: `bride_*` + `groom_*`. |
| Full 36-guna | `POST /v1/compatibility?store=false` | Eight kutas after a score. |
| 402 fallback only | `GET /v1/kundli/teaser` | Documented free preview (lagna, moon, two insights) if birth-chart is not on the plan. |

Not used: `/v1/kundli/premium-report`, `/v1/compatibility/report`, `/v1/birth-chart/{profile_id}`, `/v1/compatibility/{compat_id}`. Those store or return PDFs.

On 401 / 402 / 429 / missing proxy+key: return fixtures + calm setup copy. No crash.

## OpenAPI vs HTML docs

OpenAPI `BirthData` (what we POST):

`name`, `date_of_birth` (`YYYY-MM-DD`), `time_of_birth` (`HH:MM` or `HH:MM:SS`), `latitude`, `longitude`, optional `timezone`, `gender`, `place_name`.

`CompatibilityRequest`: `{ person_a, person_b }` each a `BirthData`.

HTML docs show aliases (`date` / `time` / `lat` / `lon` / `tz`, `person1` / `person2`). If OpenAPI names 422, retry once with those documented aliases. Do not invent a third shape.

`GET /v1/compatibility/score` query (OpenAPI): `bride_dob`, `bride_time`, `bride_lat`, `bride_lon`, `groom_dob`, `groom_time`, `groom_lat`, `groom_lon`, optional `mode` (`full` \| `lite`). UI says Person 1 / Person 2; bride/groom is only the query mapping.

Response schemas are empty in OpenAPI. Normalize defensively (lagna / moon / planets / dasha; guna total + eight kutas). Fixtures use the same normalized types.

`lang` is not on birth-chart or compatibility in OpenAPI. UI is hi/en. Do not add `lang` to those calls.

## Client (`src/tathaastu/client.ts`)

Typed wrappers only. Inject `fetch` in tests.

1. Resolve transport: proxy URL (no key in the app) → else `TATHAASTU_API_KEY` for server/tests against the production host → else fixture mode.
2. `createBirthChart(BirthData)` → `POST /v1/birth-chart?store=false&include_yogas=true`.
3. `getCompatibilityScore(a, b)` → `GET /v1/compatibility/score` with `mode=lite`.
4. `createCompatibility(a, b)` → `POST /v1/compatibility?store=false`.
5. `loadBirthChart` / `matchPeople` are the UI entry points: live, then fixture on missing key or 401/402/429.

Timezone: `timezoneFor(lat, lon)` from `src/engine/time.ts` (already in the repo). Default `Asia/Kolkata` only if lookup fails.

## Kundli form

Name, date (`YYYY-MM-DD`), time (`HH:MM`), place (city list → lat/lon). Birth payload stays in AsyncStorage on device. No account.

Show: lagna, moon, key planets (Sun through Ketu), current dasha teaser. Not a 60-page report.

## Matching + share card

Two people, same fields. Prefer score, then full POST for the eight kutas. Square-ish score card: names, `N / 36`, verdict. One-tap `Share` (React Native `Share`) — text card, no ads. WhatsApp can take the text.

## Ask about this chart

Hook `useAskAboutChart`. Closed by default. Generating a chart does **not** call Gemini and does **not** send birth data.

Only after the user taps “Ask about this chart”:

- Send the already-computed chart **summary** (name, lagna, moon, planet signs/houses, dasha teaser).
- Never send `date_of_birth`, `time_of_birth`, lat, lon, timezone, or a PDF / premium-report / document.
- Mic audio is the spoken question only (same Gemini + credits path as home ask). No document audio.

Home `AskSheet` / `buildAskPrompt` stay sky-only. Chart ask is a separate prompt in `src/kundli`.

## Out of scope

Panchang home rewrite, muhurat finder, festivals, calendar, widget, ads, TTS, accounts, sun-sign horoscope.

Home only gains two entry points (Kundli · Match) that open these screens.

## Files

| Path | Role |
| --- | --- |
| `src/tathaastu/client.ts` | Typed wrappers |
| `src/tathaastu/types.ts` | OpenAPI + normalized chart/match |
| `src/tathaastu/normalize.ts` | Defensive parse |
| `src/fixtures/mockBirthChart.ts` | Kundli fixture |
| `src/fixtures/mockCompatibility.ts` | 36-guna fixture |
| `src/kundli/*` | Forms, chart view, score card, share, chart-ask hook |
| `src/config/env.ts` | Proxy URL; key is never `EXPO_PUBLIC_` |
| `server/tathaastu-proxy.mjs` | Thin forwarder that adds `X-API-Key` |

## Done when

A user can generate a kundli (fixture or live), get a matching score (fixture or live), and share the score card. hi/en. Missing key is setup copy + fixtures, not a crash. Chart ask does not fire until tap, and then only the summary.
