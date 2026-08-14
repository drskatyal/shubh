# PLAN: Store-ready TathaAstu Phase 1

Unifies the kundli (#4) and muhurat/festivals (#5) lanes on one live client. No fixture-first product.

## Client

`src/tathaastu/client.ts` is the only HTTP surface. Paths from OpenAPI only.

- App → `TATHAASTU_PROXY_URL` (`server/tathaastu-proxy.mjs`).
- `TATHAASTU_API_KEY` is server / EAS / Node-test only. Never `EXPO_PUBLIC_`.
- Missing proxy/key or 401/402/429 → calm retry / setup. Never Arjun/Priya charts or mock festivals.

## Screens

- Home: on-device sky motion + live Tithi / Nakshatra / Yoga / Karana / Good-Avoid / Rahu. Image share of today.
- Muhurat, festivals + why-this-date, month grid, kundli, Ashtakoota.
- Date/time pickers. Image cards via view-shot (text fallback if native capture is missing).
- hi / en. Widget gets optional tithi.

## Ask

Home Ask still one Gemini HTTP call. Optional live day limbs are stuffed into the prompt. Chart-ask stays cold until tap; Gemini gets the summary only.
