# PLAN: Store-ready Divine Phase 1

TathaAstuAPI is dead. Live vendor is Divine Vedic Prakash. See [PRODUCT.md](../PRODUCT.md).

## Client

`src/divine/client.ts` is the only HTTP surface. Paths from official Divine docs only.

- App → `DIVINE_PROXY_URL` (`server/divine-proxy.mjs`).
- `DIVINE_API_KEY` is server / EAS / Node-test only. Never `EXPO_PUBLIC_`.
- Optional `DIVINE_API_TOKEN` if Bearer is separate; otherwise the key is both.
- Missing proxy/key or 401/402/429/5xx → on-device glance. Never Arjun/Priya charts or mock festivals.

## Screens

- Home: on-device sky motion + live Tithi / Nakshatra / Yoga / Karana / Good-Avoid / Rahu. Image share of today.
- Muhurat, festivals + why-this-date, month grid, kundli, Ashtakoota.
- Date/time pickers. Image cards via view-shot (text fallback if native capture is missing).
- hi / en. Widget gets optional tithi.

## Ask

Home Ask still one Gemini HTTP call. Optional live day limbs are stuffed into the prompt. Chart-ask stays cold until tap; Gemini gets the summary only.
