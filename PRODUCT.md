# Shubh — product lock

Shubh is a daily Hindu panchang app. DivineAPI Vedic Prakash is the live sky. On-device Drik (`getSkyState`) is the glance fallback only. TathaAstu is dead — do not call it. VedAstro is out of scope.

The app is layered, not a tab dump: home glance → almanac (muhurat / festivals / calendar) → kundli / matching → Ask. One `SkyStage` stays mounted behind every level. It does not remount when you move. Waiting for Divine or Ask intensifies that same sky (`DivineWait`). Never a spinner.

## What ships

- Home glance: city, tithi, nakshatra, yoga, karana, good/avoid, Rahu, current window. Motion stays.
- Muhurat finder, festival calendar, kundli.
- **Matching is a first-class market**, not a side screen. Full-screen voice capture (one take, Record — no text box) → confirm cards → Divine Ashtakoot + Manglik → WhatsApp-family milan card. Optional 60-day marriage muhurat. Quiet type-on-cards fallback. Birth stays on device; audio is not stored.
- Share cards: today’s panchang, match score, festival why-this-date. Image + text. WhatsApp-ready.
- Hindi + English via Divine `lan`. Other Indian codes pluggable.
- Ask: full-screen temple of cards (not a chat box). Mic + optional text, labeled **पूछो / Record**. Credits decrement per ask (and per first marriage extract).
- Play Store India first. iOS same binary second. Listing copy: [docs/STORE-ASO.md](docs/STORE-ASO.md). No model names in store text. Review prompt only after a successful share.

## Money

- RevenueCat stays.
- Subscription test price **₹199–299 / month**. Never default to ₹599.
- Credit pack: ~100 asks, about $10 / ₹799.
- Free glance never locked.
- Paywall sells extra asks, deeper kundli / guna milan, extra muhurat ranges, festival reminders, unbranded share cards — not “AI credits”.

## Ask backend (never shown)

- One HTTP call. Model id `gemini-3.1-flash-lite` lives on the server / `src/ask/prompt.ts`.
- Today’s Divine panchang (and last chart / last match if present) is stuffed into the prompt.
- `GEMINI_API_KEY` is server/env only. App posts to `{DIVINE_PROXY_URL}/ask`. Do not put the key or the provider name in Expo `extra`.
- User-facing copy never says Gemini, GPT, OpenAI, Grok, LLM, ChatGPT, AI, A.I., artificial intelligence, powered by, chatbot, or “ask the AI”.

## Do not build

Live pundit marketplace. Tarot. Numerology. Western. Sun-sign horoscope feed. Ads. Fixture-first home. Fake Arjun/Priya charts as the happy path.

## Divine

See [docs/PLAN-divine-map.md](docs/PLAN-divine-map.md). Official paths only. Key off device. Cache panchang per city+date (6h). Kundli / matching keyed on birth tuples, no TTL.

## Ask page

See [docs/PLAN-ask-page.md](docs/PLAN-ask-page.md). Cards, not bubbles. Empty state is the sky. Marriage asks use the same page: record both births, confirm (“Humne yeh samjha”), then milan — never a 12-box form.

## Done when

- Home shows a real Divine day (or on-device glance if Divine is down), on the shared sky.
- Muhurat, festivals, kundli, matching, Ask all sit on that sky.
- Ask answers arrive as mixed cards with share. Credits decrement. No provider name in the UI.
- Matching records both births in one take, confirms on cards, then Divine milan + optional 60-day marriage muhurat.
- Tests do not need a live key.
