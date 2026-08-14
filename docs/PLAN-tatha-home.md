# PLAN: TathaAstu daily panchang home

Lane: live TathaAstu client → store-grade home glance + image share card + widget.

Read [PRODUCT.md](../PRODUCT.md). Docs: https://www.tathaastuapi.com/docs.html · OpenAPI: https://api.tathaastuapi.com/openapi.json · Base: `https://api.tathaastuapi.com/v1`.

Do not invent paths. Live TathaAstu is the only data path. On-device `getSkyState` is a **runtime fallback** when a live call fails — not a fixture product.

Sister PRs share this client: [#4 kundli](https://github.com/drskatyal/shubh/pull/4), [#5 muhurat](https://github.com/drskatyal/shubh/pull/5). One `resolveTransport` / `tathaFetch`. No second client.

## Auth

`X-API-Key` never in the JS bundle.

| Supply | Bundle |
| --- | --- |
| `server/tathaastu-proxy.mjs` + `TATHAASTU_API_KEY` on the server. App uses `TATHAASTU_PROXY_URL`. | None. Required for store builds. |
| `TATHAASTU_API_KEY` in Node / CI only | None, if Metro never inlines it. |
| `EXPO_PUBLIC_TATHAASTU_API_KEY` or `extra.TATHAASTU_API_KEY` | **Forbidden.** |

Missing key: UI still renders (sky glance). No sample tithi, no “using fixtures” banner.

## Endpoints (OpenAPI only)

| Path | Role |
| --- | --- |
| `GET /v1/day-context` | Primary. `date`, `lat`, `lon`, `lang`. Pro — 402 expected on free. |
| `GET /v1/panchang/today` | Fallback. `include=timings,hora,choghadiya,festivals`. |
| `GET /v1/panchang` | Dated fallback, same include. |
| `GET /v1/timings` | Rahu / Yamaganda / Gulika / Abhijit / Brahma. |
| `GET /v1/panchang/lite` | Widget. |
| `GET /v1/choghadiya` | Optional current slot. 402 → `getSkyState`. |

Good/Avoid is not on day-context. Home maps `getSkyState().startingSomethingNew` (`now` → Good, `wait` → Avoid) using live clocks when we have them.

## Fetch order

1. 6h cache of a **live** payload (their Redis TTL).
2. `GET /v1/day-context`.
3. On 402 / thin body: `GET /v1/panchang/today` then `GET /v1/panchang`.
4. If no Rahu block: `GET /v1/timings`.
5. Choghadiya from payload, else `/v1/choghadiya`, else sky.
6. Live HTTP failure (401/402/429/network): sky clocks only. Hide empty limbs. Never invent Dwitiya.

Widget: lite or last **live** cache. Line is tithi + now/wait + city (`windowName` = tithi so native widgets work without a rebuild).

## Home

SkyBackdrop, gold-on-night, large tithi, Good/Avoid stamp, limb glass cards, Rahu chips, one-thumb share, AskFAB. hi/en segmented control. Share card is a **1:1 image** (Skia `makeImageFromView` + `expo-sharing`). No ads.

Ask: `buildAskPrompt(sky, language, dayContext?)` — stuff live day-context when present.

Out of scope: kundli, matching, muhurat UI, festival list, ads, TTS, prayer lock. Paths stay in `hooks.ts`.
