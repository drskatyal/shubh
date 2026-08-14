# PLAN: paid ask + credits

Lane: mic → `gemini-3.1-flash-lite` (audio in, text out) → structured verdict. Credits via RevenueCat. Clock/home/motion stay in parallel PRs.

## Contract with the engine

`src/engine` on this branch is a typed `SkyState` only. No sunrise math, no Rahu tables.

`AskSheet` takes `sky: SkyState`. After merge, home calls `getSkyState(...)` and passes the result. If `src/engine` later exports `getSkyState`, ask/billing import it; they do not compute windows.

Every clock in a verdict must already appear in that JSON. Client drops any `nextTime` that does not.

## Ask (`src/ask`)

1. Mic records a short clip (`expo-av`).
2. Prompt = system rules + this-minute sky JSON + `hi|en`.
3. POST audio + prompt to `gemini-3.1-flash-lite`. Text only.
4. Parse `{ verdict: now|wait|after, nextTime, reason, displayText }`.
5. `speakVerdict()` is an empty hook. No TTS.
6. Missing `GEMINI_API_KEY` → setup copy, no crash.
7. Privacy line: audio goes to Gemini for that ask, then discarded.

Exports: `AskFAB`, `AskSheet`, `AskOnSkyScreen`. Sits on the motion shell (`src/motion`). After a verdict the host calls `useVerdictBeat().playVerdict(now|wait|after)`. No TTS.

## Credits (`src/billing`)

| Product | Kind | Asks |
|---|---|---|
| `shubh_monthly_100` | subscription | 100 / period |
| `shubh_credits_100` | consumable | +100 |

- One free sample on first install.
- Show remaining. Mic at 0 opens paywall, not the recorder.
- Restore purchases. `EXPO_PUBLIC_SHUBH_DEV_UNLOCK=1` skips the gate.
- Consume after a successful parse only.

## Out of scope

TTS, kundli, horoscope, panchang rewrite, solar-system motion, ads, accounts.

## Done

A spoken “Can I leave the house now?” with mocked (or live) sky JSON returns now/wait/after in hi or en, and credits decrement.
