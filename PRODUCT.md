# Shubh — TathaAstu plan (approved)

Build this. TathaAstuAPI is the backbone. On-device `getSkyState` is the offline fallback only. Keep the existing sky motion, Hindi/English, voice ask, and credits.

Docs: https://www.tathaastuapi.com/docs.html
OpenAPI: https://api.tathaastuapi.com/openapi.json
Base: `https://api.tathaastuapi.com/v1`
Auth: `X-API-Key` header. Never put the key in the app binary. Client talks to a thin proxy (`TATHAASTU_API_KEY` on the server / EAS secret). Missing key or a failed call → calm retry / setup state. Never ship a fake panchang, sample Arjun/Priya chart, or mock festival as the happy path.

`lang` on TathaAstu is phonetic transliteration (hi, en, ta, te, mr, kn, bn, gu, ml…). Launch hi + en. Leave i18n keys for the rest.

## Phase 1 — ship this (viral loop)

### Daily panchang home
- Prefer `GET /v1/day-context` (or `/v1/panchang/today` + `/v1/timings` if day-context is 402).
- Also: `/v1/panchang` with `include=timings,hora,choghadiya,festivals`, `/v1/panchang/lite` for the widget.
- Show: city, tithi, nakshatra, yoga, karana, Good/Avoid for “start something new”, Rahu / Yamaganda / Gulika / Abhijit / Brahma, current Choghadiya.
- SkyBackdrop behind the glance. Reduce Motion respected.
- One-tap share card (WhatsApp / Instagram square): today’s panchang, city, Good/Avoid. No ads on the card.
- Widget: today’s tithi + now/wait + city. Cache last payload for offline.

### Muhurat finder (the share engine)
- `GET /v1/muhurat/find` — event, start_date, end_date, lat, lon, min_score.
- Fallback: `GET /v1/events/find-dates` or `GET /v1/events/suitability` if find is 402.
- Events: marriage, griha_pravesh, vehicle_purchase, business_start, naming (map naming → mundan or education_start if naming is missing).
- Ranked dates with score + reason. Share card: “Best date for housewarming”.

### Festivals
- `GET /v1/festivals`, `/v1/festivals/month`, `/v1/festivals/explain?festival=&date=`.
- Upcoming list + “Why this date?” sheet from explain.
- Shareable festival card. Local notifications for the next festival (no account).

### Calendar
- `GET /v1/calendar/month` for the month grid. Tap a day → that day’s panchang.

### Kundli + matching
- `POST /v1/birth-chart` — name, date, time, lat, lon.
- `GET /v1/compatibility/score` (lite) and `POST /v1/compatibility` (full Ashtakoota).
- One-tap share of the guna score card.
- Birth data stays on device. Do not invent a user account.

### Voice ask (already in repo)
- Keep Gemini 3.7 Flash mic. Stuff TathaAstu day-context (plus on-device fallback sky) into the prompt. Credits unchanged. TTS still later.

## Phase 2 (structure, don’t block Phase 1)
Personalized daily insight, family profiles, more share cards, streaks, Amanta/Purnimanta toggle.

## Phase 3 (later)
More regional languages, community, PDF reports, premium muhurat unlock if TathaAstu plan requires it.

## Client rules
- `src/tathaastu/client.ts` — typed wrappers. Read OpenAPI. Do not invent paths.
- Cache day-context for 6h on device (their server already caches 6h).
- On 401/402/429: fall back to on-device `getSkyState` for timings; show a calm “live panchang needs a key / plan” for kundli/muhurat.
- Never scrape Drik. Never commit keys.
- No ads. No prayer lock. No sun-sign horoscope.

## Done when (Phase 1)
- Home shows a real TathaAstu day for the city, with motion + image share card.
- Muhurat finder returns ranked dates and a share card.
- Festival list + explain sheet.
- Kundli generate + matching score + share card.
- Widget + offline last-day cache.
- hi/en throughout.
- Mic still works, stuffed with the same day payload.
