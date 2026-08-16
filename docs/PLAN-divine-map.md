# Divine Vedic Prakash — endpoint map

Sources (read 2026-08-14, not guessed):

- https://developers.divineapi.com/
- https://divineapi.com/indian-astrology/vedic-astrology-api
- https://developers.divineapi.com/indian-api/daily-panchang-api/find-panchang
- https://developers.divineapi.com/indian-api/daily-panchang-api/find-auspicious-timings
- https://developers.divineapi.com/indian-api/kundli-api/basic-astrological-details
- https://developers.divineapi.com/indian-api/kundli-api/horoscope-charts
- https://developers.divineapi.com/indian-api/match-making-api/ashtakoot-milan
- https://developers.divineapi.com/indian-api/match-making-api/dashakoot-milan
- https://developers.divineapi.com/indian-api/match-making-api/matching-vimshottari-dasha

Auth on every call: `Authorization: Bearer {token}` **and** `api_key` in the body. The app never holds the key. `server/divine-proxy.mjs` injects both. Hosts differ: astroapi-1 (panchang), astroapi-2 (choghadiya), astroapi-3 (everything else below).

`lan` (docs table): `en` `hi` `bn` `ma` (Marathi) `tm` (Tamil) `tl` (Telugu) `ml` `kn`. Launch **en + hi**. Other codes stay pluggable in `toDivineLan`.

## Shared request shapes

**Place-date** (panchang / timings / choghadiya / hora / date festivals):

`api_key, day, month, year, lat, lon, tzone` · optional `place`, `lan` · panchang also optional `sign_lan` (0 English / 1 Sanskrit; we send `0`)

**Month** (muhurat finder, English calendar festivals, find-festival):

`api_key, month, year, lat, lon, tzone` · optional `place`, `lan` · find-festival also `festival`

**Birth** (kundli):

`api_key, full_name, day, month, year, hour, min, sec, gender, place, lat, lon, tzone` · optional `lan`  
vimshottari also `dasha_type` (`antar-dasha` in v1)  
chart also path `/:chart_id` (`D1`, `D9` in v1)

**Birth pair** (matching):

`p1_*` and `p2_*` of the birth fields · optional `lan`

## Cache

| Payload | Key | TTL |
|---|---|---|
| Daily panchang (merged day) | city + date + `lan` | 6 hours |
| Kundli | birth tuple (name, date, time, lat, lon, `lan`) | none |
| Matching | two birth tuples + `lan` | none |
| Ask | not cached | — |

On-device Drik (`getSkyState`) is the glance fallback only. Never fixture-first home. Never invent a chart.

## v1 — we call these

| Endpoint | Host | Level / screen | Fields | Notes |
|---|---|---|---|---|
| `POST /indian-api/v2/find-panchang` | astroapi-1 | Home glance · Ask prompt | place-date | tithi, nakshatra, yoga, karana, sunrise/sunset |
| `POST /indian-api/v1/auspicious-timings` | astroapi-3 | Home glance | place-date | Abhijit, Brahma |
| `POST /indian-api/v1/inauspicious-timings` | astroapi-3 | Home glance | place-date | Rahu, Yamaganda, Gulika (`gulkai_kaal` typo in API) |
| `POST /indian-api/v1/find-choghadiya` | astroapi-2 | Home glance | place-date | current slot; on-device if “now” omitted |
| `POST /indian-api/v1/muhurat/hora` | astroapi-3 | Home glance | place-date | hora limbs |
| `POST /indian-api/v1/muhurat/marriage` | astroapi-3 | Muhurat · naming chip | month | Divine has no namkaran route |
| `POST /indian-api/v1/muhurat/house-entering` | astroapi-3 | Muhurat | month | griha pravesh |
| `POST /indian-api/v1/muhurat/vehicle-purchase` | astroapi-3 | Muhurat | month | |
| `POST /indian-api/v1/muhurat/business-start` | astroapi-3 | Muhurat | month | |
| `POST /indian-api/v1/muhurat/property-purchase` | astroapi-3 | Muhurat | month | |
| `POST /indian-api/v1/english-calendar-festivals` | astroapi-3 | Festivals · calendar | month | list / dots |
| `POST /indian-api/v1/date-specific-festivals` | astroapi-3 | Calendar day · why-this-date | place-date | |
| `POST /indian-api/v1/find-festival` | astroapi-3 | Festival explain | month + `festival` | |
| `POST /indian-api/v3/basic-astro-details` | astroapi-3 | Kundli | birth | lagna, moon, teaser |
| `POST /indian-api/v2/planetary-positions` | astroapi-3 | Kundli | birth | planets |
| `POST /indian-api/v1/vimshottari-dasha` | astroapi-3 | Kundli | birth + `dasha_type=antar-dasha` | |
| `POST /indian-api/v1/horoscope-chart/D1` | astroapi-3 | Kundli | birth | Lagna chart |
| `POST /indian-api/v1/horoscope-chart/D9` | astroapi-3 | Kundli | birth | Navamsha |
| `POST /indian-api/v2/ashtakoot-milan` | astroapi-3 | Matching · Ask match card | birth pair | 36 guna + Manglik in the same payload |
| `POST /indian-api/v2/dashakoot-milan` | astroapi-3 | Matching (one extra call) | birth pair | 10 koot; Manglik also present |

Ask does **not** call Divine by itself. It reuses the already-loaded home day (and last kundli / last match if present) inside the Gemini prompt. Gemini is backend-only (`POST {proxy}/ask`).

## Later — documented, do not call in this PR

Do not invent paths. These exist on the Vedic catalogue / docs; ship after v1.

**Panchang extras:** standalone find-tithi, ritu/ayana, nivas/shool, other calendars, grah gochar, chandrabalam/tarabalam, foundation-laying muhurat, do-ghati, jain pachakkhan, gowri, nalla neram, sankranti / regional festival lists.

**Kundli extras:** `POST /indian-api/v1/horoscope-chart/{D2,D3,D4,D7,D10,D12,D16,D20,D24,D27,D30,D40,D45,D60,chalit,SUN,MOON,cuspal}` · yogini dasha · kaal sarp · standalone manglik · shadbal · ashtakavarga · KP / Jaimini · varshphal · Lal Kitab · PDF reports.

**Matching extras** (docs):

- `POST /indian-api/v1/matching/manglik-dosha` — pair Manglik (v1 already reads Manglik from Ashtakoot)
- `POST /indian-api/v1/matching/vimshottari-dasha` — pair dashas
- Matching basic astro / planetary / divisional overlays

## We do NOT call

Western natal / synastry / transits. Tarot. Numerology. Sun-sign daily/weekly/monthly horoscope (`astroapi-5` `/api/v5/daily-horoscope`). Love calculators. MCP “astrology chatbot”. Ads. Live pundit marketplace.

## Levels (sky is one stage)

```
SkyStage (mounted once)
  ├─ Home glance
  ├─ Almanac: muhurat / festivals / calendar
  ├─ Kundli / matching
  └─ Ask page (cards, not chat)
```

Waiting for any v1 Divine call or an Ask: intensify the same sky (`DivineWait`). Never a spinner. Never remount the canvas.
