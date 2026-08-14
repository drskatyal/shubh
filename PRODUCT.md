# Shubh

Approved product. Build this. Do not invent a different app.

Free glance at today's sky. Paid voice ask for any task. Hindi or English. The sky moves. TTS later.

## The job

Hindus already check Rahu Kaal and muhurat the way other people check the weather. Home is that glance: city, current window, now/wait state. No model.

Any task is a spoken question. Gemini 3.1 Flash-Lite hears it. Today's computed sky is stuffed into the prompt. The model maps the task onto those windows and answers now / wait / after, in the user's language. It does not invent the clock.

## v1 shape

Expo / React Native. iOS + Android.

### Free, no LLM

- City (device location, city search fallback). Label the city on screen.
- Current window name and countdown (Choghadiya + Rahu / Yamaganda / Gulika / Abhijit).
- A simple now/wait state for "starting something new" from rules, not a model.
- Language: Hindi or English, user preference, persisted.
- Motion: solar system / astrology animation so the glance feels alive. Not a static card. Not a cheap spinner.
- Home screen widget with city + current window + now/wait. No tokens.

### Paid ask

- Mic button. User speaks the task. Audio in to `gemini-3.1-flash-lite`. Text out.
- Prompt always includes the computed sky for this city, this minute: sunrise, sunset, current slot, Rahu/Yamaganda/Gulika/Abhijit windows, next good window, language.
- Model is a classifier and explainer, not the priest. It must not invent times. If the sky JSON says Rahu until 14:12, the answer uses 14:12.
- Output language matches preference (Hindi or English).
- TTS is out of v1. Text on screen is enough. Leave a clear hook for TTS later.
- Credits: `shubh_monthly_100` (auto-renew, 100 asks / month) and `shubh_credits_100` (consumable top-up). RevenueCat. Free users get the glance only. One free sample ask on first install is OK.
- Show remaining credits. Block the mic at 0 with a paywall, not a broken recorder.

### Motion

- Home and the ask result should feel like astrology: slow orbital motion, sun/moon, the active window lighting up.
- 60fps on a mid Android. Skia or Reanimated. No WebView planet demo.
- Respect Reduce Motion.

## Calculation (do not fake)

On-device. Local sunrise/sunset for lat/lon/date (astronomy-engine or equivalent).

- 8 equal daytime parts from local sunrise → sunset.
- Rahu Kaal weekday parts (1-indexed from sunrise): Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3.
- Yamaganda and Gulika: standard panchang weekday tables, cited in code comments. Not from memory.
- Abhijit: middle ~48 minutes of the day. Document the Sunday caveat.
- Choghadiya: 8 day + 8 night slots, standard weekday sequence, cited.
- Never use a fixed IST 7:30–9:00 table.
- Unit tests: London and Mumbai, a weekday and a Sunday, pinned date, Rahu Kaal within 2 minutes of Drik Panchang. Also Leicester, Chennai, New Jersey sunrise sanity.
- All times in the user's timezone.

## Must not have in v1

- Kundli / birth time / matching
- Sun-sign rashifal
- Full panchang encyclopedia as the home screen
- Aarti / audio library
- Temple booking / human pandit chat
- Prayer lock / Screen Time
- TTS playback
- Ads
- Accounts / backend beyond the Gemini call and RevenueCat

## Privacy

- Location for sunrise only.
- Audio is sent to Gemini for that ask, then discarded. Say this in the paywall and a short privacy screen.
- No account.
- `GEMINI_API_KEY` from env / EAS secret. Never commit a key.

## Store

- Name: Shubh
- Subtitle: Is now good for this?
- Category: Lifestyle
- Keywords: rahu kaal, muhurat, panchang, choghadiya, hindu calendar, shubh muhurat

## Done when

- Fresh install → city → Hindi or English → home shows a live window for that city today, with motion
- Mic ask: "Can I leave the house now?" → now/wait/after in that language, times match the on-device sky
- Credits gate the mic
- London/Mumbai engine tests pass
- No kundli, no horoscope, no TTS, no prayer lock
