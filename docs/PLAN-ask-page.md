# Ask page — temple of cards, not a chat

> Backend stays: one Gemini Flash Lite HTTP call, credits, Divine panchang (and chart if present) in the prompt. The user never sees a model name.

**Goal:** A full-screen Ask that feels like Shubh — dark void, gold, grahas, sky-motion wait — not iMessage / WhatsApp / ChatGPT.

## Anatomy (top → bottom)

```
┌─────────────────────────────────────┐
│  SkyBackdrop (always)               │
│  DivineWait overlay while in flight │
│                                     │
│  Close · Ask / पूछो · N asks left   │
│                                     │
│  Temple scroll (history)            │
│    [question seal]                  │
│    [card] [card] [card]             │
│    …                                │
│                                     │
│  Composer dock                      │
│    optional text · mic · Ask / पूछो │
└─────────────────────────────────────┘
```

- **Route:** full-screen modal (`AskPage`). Not a bottom sheet. `AskSheet` becomes a thin alias.
- **Empty state:** the sky. No “send a message”, no composer-on-a-white-sheet.
- **Wait:** `DivineWait` (orbits, gold dust). Previous cards dim to ~0.28. No typing dots, no “thinking…”.
- **History:** a vertical temple/scroll of cards. A turn is a gold question seal + 2–6 cards, never stacked gray bubbles.
- **Composer:** mic + optional text. Label is only **Ask / पूछो**. Never chat, AI, Gemini, assistant.
- **Share:** every card has a gold share affordance that reuses `src/share`.

## Eight card types

| Kind | What it is | When it appears |
|---|---|---|
| `verdict` | Huge NOW / WAIT / AFTER stamp, clock, Rahu or current-window chip | Every successful ask |
| `panchang` | Three-leaf strip: tithi · nakshatra · yoga | Live Divine day is present |
| `timeline` | Vertical gold thread of today’s windows; one node marked **now** | Always, from `SkyState` |
| `verse` | Short centered explanation (hi or en). Not a paragraph blob | `displayText` / `reason` |
| `goodAvoid` | Two columns — शुभ / टालें — from today’s limbs | Day has good or avoid lines |
| `festival` | Date as hero + “why this date” | Day has a festival, or festival context |
| `match` | Score ring (e.g. 28 / 36) + Manglik line | Last stored match, or matching context |
| `window` | Single Rahu / muhurat seal if it is not already on the verdict | Inauspicious window is on, or next good is soon |

Cards are **elements**, not one text dump. A leave-the-house ask typically lands: verdict + timeline + verse + panchang.

## Visual rules

- Night `#06070E`, gold `#E8C578`, ivory, void. No white sheet. No gray bubble.
- Cards: hairline gold, deep night fill, generous padding, rounded like a yantra plate — not a chat bubble.
- Question seal: centered gold whisper (`· leave the house ·`), not a left-aligned user bubble.
- Reduce Motion: sky stills; cards still settle. Wait is presence, not a spinner.
- Banned in any user-visible string (screens, paywall, share, a11y, empty, store copy): Gemini, GPT, OpenAI, Grok, LLM, ChatGPT, AI, A.I., artificial intelligence, AI astrologer, powered by, ask the AI, chatbot.

## Backend (unchanged contract)

1. Mic and/or typed text → one `generateContent` call (`gemini-3.1-flash-lite`).
2. Prompt stuffed with this-minute sky + Divine day limbs + chart summary if they already generated one.
3. Credits decrement only after a successful parse.
4. `GEMINI_API_KEY` lives on the proxy / server env. Not in Expo `extra`. App posts to `{DIVINE_PROXY_URL}/ask`.
5. User-facing errors: “Ask is not connected” / “No asks left” — never a provider name.

## Files

| Path | Role |
|---|---|
| `src/ask/AskPage.tsx` | Full-screen page |
| `src/ask/AskComposer.tsx` | Mic + optional text |
| `src/ask/cards/*` | Types, composer, eight views, share text |
| `src/motion/DivineWait.tsx` | Shared wait for Ask **and** Divine loads |
| `server/divine-proxy.mjs` | `POST /ask` → Flash Lite (key stays here) |
| `src/ask/AskSheet.tsx` | Alias that mounts `AskPage` |

## Marriage voice capture (first-class market)

Matching is not a side form. The growth loop is **voice milan → shareable score card → optional 60-day marriage muhurat**. Home can stay daily panchang.

### Capture (Matching + Ask-about-marriage)

Do not make people type two birth forms if they can talk.

Hindi-first prompt, never “AI”:

> Yeh sab record kar dijiye, mic on karke ek baar mein: dono ke naam, janam tithi, janam samay, aur shehar.

1. One audio take. One backend call. Audio → Flash Lite (audio in) with a structured-extract prompt.
2. JSON only, no chat:

```
{
  "person_a": { "name": "", "day": 0, "month": 0, "year": 0, "hour": 0, "min": 0, "place": "" },
  "person_b": { "name": "", "day": 0, "month": 0, "year": 0, "hour": 0, "min": 0, "place": "" },
  "intent": "match" | "muhurat_marriage" | "other",
  "question": "short restated ask in same language"
}
```

3. Geocode each `place` → lat / lon / tzone (curated cities, then Divine-ready offset).
4. Divine Ashtakoot + Manglik. Dashakoot if we already call it.
5. Birth stays on device after extract. Audio is not stored.

### Confirm without a form

After extract, two birth cards: **Humne yeh samjha**. Tap one field to fix it. Never dump a 12-box form.

If a field is missing, sky wait ends on that card. Mic hint says only what is missing (`ladke ka samay?`). One more short take patches the gap — not a restart.

Quiet fallback: **Likhna hai?** / Type instead — same two cards, tap-to-fill. The Record button has no text field beside it. Matching is a full-screen page, not a side sheet. The home dock fills the Match chip so milan is the market, not a leftover tab.

### After the match

- Score-ring card, koot chips, Manglik chip.
- Share (WhatsApp family) via the existing share pipeline. No model name on the card.
- Optional follow-up: marriage muhurat for the next 60 days (`POST /indian-api/v1/muhurat/marriage`). Still no “AI” copy.

### Prompt rules (backend only)

- Extract birth facts. Do not preach. Do not invent a missing time — leave null.
- Stuff today’s panchang only if they also asked “ab shaadi kar sakte hain?” (or the restated question is that). Otherwise ignore any day JSON.
- Credits: first successful extract consumes one ask. A missing-field patch does not. Divine milan does not.
- Labels: **पूछो / Record**. Never Gemini / AI / LLM in UI, paywall, or share cards.

### Files

| Path | Role |
|---|---|
| `src/ask/marriage/*` | Extract prompt, parse, geocode, confirm cards, flow |
| `src/kundli/MatchingScreen.tsx` | Voice-first milan (manual cards as fallback) |
| `src/ask/AskPage.tsx` | Same capture when the ask is about marriage |

## Done when

- Home mic opens this page, not a generic sheet.
- Empty = sky. Wait = DivineWait. Answers = mixed cards with share.
- Matching + Ask-about-marriage record two births in one take, confirm on cards, then Divine milan.
- No banned strings in user-facing copy. Tests do not need a live key.
