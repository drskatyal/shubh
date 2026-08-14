# Clock spine — architecture

This PR owns the free glance: Expo scaffold, on-device sky, home, language, widget. It does **not** own Gemini, credits, TTS, or the solar-system animation.

Read [PRODUCT.md](../PRODUCT.md) first. This file only says how the repo is cut so the other two PRs can land without rewriting the clock.

## Folders

```
App.tsx                   Boots HomeScreen (ask PR can add a route later)
src/engine/               On-device sky. The contract the ask PR imports.
src/engine/RULES.md       Now/wait for "starting something new" — rules only
src/home/                 Glance UI
src/home/slots/           Empty hooks the other PRs fill
src/i18n/                 Hindi | English copy + persisted preference
src/location/             GPS + curated city search fallback
src/storage/              Language + last city
src/widget/               Shared glance payload (city + window + now/wait)
modules/shubh-glance/     Native write + widget reload (EAS prebuild)
targets/ShubhWidget/      iOS WidgetKit
widget/android/           Android App Widget
plugins/                  Expo config plugins (privacy + widget)
```

## Libs (this PR)

| Lib | Why |
| --- | --- |
| `expo` + `expo-router` + RN TypeScript | iOS + Android scaffold |
| `astronomy-engine` | Local sunrise / sunset for lat/lon/date. Never a fixed IST table. |
| `tz-lookup` | IANA zone from lat/lon so `getSkyState` stays `(lat, lon, date)` |
| `expo-location` | Device location; reverse-geocode the city label |
| `@react-native-async-storage/async-storage` | Language + last city |
| `vitest` | Engine unit tests (no device) |

Do not add Gemini, RevenueCat, Skia, Reanimated, or TTS here.

## Public engine contract

The ask PR stuffs this JSON into the Gemini prompt. It must not invent times.

```ts
import { getSkyState } from '../engine';
// getSkyState(lat, lon, date) → SkyState
```

`src/engine/index.ts` re-exports:

- `getSkyState`
- `SkyState`, `SkyInterval`, `ChoghadiyaName`, `StartSomethingState`
- `evaluateStartSomethingNew` (same RULES the home glance uses)

`SkyState` always includes: timezone, sunrise, sunset, nextSunrise, Rahu / Yamaganda / Gulika / Abhijit, current + next Choghadiya, current window, countdown bounds, `startingSomethingNew: 'now' | 'wait'`, next good window. All instants are ISO-8601 in UTC; display in the zone on the state.

Panchang day starts at local sunrise, not midnight.

## What the other two PRs should import

### Motion PR

- Replace the body of `src/home/slots/HomeMotionSlot.tsx`.
- Props already passed: `sky: SkyState`, `reduceMotion: boolean`.
- Do not change `getSkyState`. Light the active window from `sky.currentWindow`.
- Skia or Reanimated. No WebView. Respect Reduce Motion (prop is already wired).

### Ask / Gemini PR

- Import `getSkyState` and `SkyState` from `src/engine`.
- Replace the body of `src/home/slots/HomeMicSlot.tsx`. Props: `sky`, `language`, `onAsk`.
- Read language from `src/i18n` (`useLanguage`). Do not fork copy tables.
- Credits / RevenueCat / paywall live in that PR. This PR only leaves the mic slot.
- Leave TTS as a later hook on the ask result screen — not on home.

## Home (this PR)

City label, current window name, countdown, now/wait for "starting something new" from `src/engine/RULES.md`. Language toggle Hindi | English. No action-chip encyclopedia, no full panchang table, no Gemini.

## Widget

`src/widget/buildGlance.ts` → `{ city, windowName, state: 'now' | 'wait' }` in the active language. iOS WidgetKit + Android App Widget read that payload. No tokens.

## Tests

`src/engine/__tests__/sky.test.ts` — London + Mumbai, weekday + Sunday, pinned civil date, Rahu within 2 minutes of published Drik-method times. Leicester / Chennai / New Jersey sunrise sanity (local hour, not IST-copied).
