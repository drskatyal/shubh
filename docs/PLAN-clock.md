# Clock spine — architecture

This PR owns the free glance: Expo scaffold, on-device sky, home, language, widget. It does **not** own Gemini, credits, or TTS. Motion lives in [PR #1](https://github.com/drskatyal/shubh/pull/1) (`src/motion`). Home mounts that backdrop; it does not draw a second sky.

The daily Drik-method engine (Rahu / Yamaganda / Gulika / Abhijit / Choghadiya, test oracle, `SkyState` clocks) is specified in [PLAN-drik.md](./PLAN-drik.md).

Read [PRODUCT.md](../PRODUCT.md) first. This file only says how the repo is cut so the other two PRs can land without rewriting the clock.

## Folders

```
App.tsx                   Boots HomeScreen (ask PR can add a route later)
src/engine/               On-device sky. The contract the ask PR imports.
src/engine/RULES.md       Now/wait for "starting something new" — rules only
src/home/                 Glance UI (mounts `SkyBackdrop` behind the copy)
src/home/slots/           Mic hook for the ask PR
src/motion/               Owned by the motion PR — do not fork the animation
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
| `@shopify/react-native-skia` `2.6.2` | Same pin as the motion PR |
| `react-native-reanimated` `4.5.1` | Same pin as the motion PR |
| `react-native-worklets` `0.10.1` | Reanimated 4 peer, same pin as the motion PR |
| `vitest` | Engine unit tests (no device) |

Do not add Gemini, RevenueCat, or TTS here. Do not invent a second animation.

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

### Motion PR (`src/motion`)

Home already mounts:

```tsx
<SkyBackdrop
  windowKind={toMotionWindow(sky.currentWindow.name)}
  verdict={sky.startingSomethingNew}
  locale={language}
/>
```

Keep changing the scene in `src/motion`. Do not add another canvas on Home. `chal` / `udveg` / `kaal` / `rog` map to `other`.

### Ask / Gemini PR

- Import `getSkyState` and `SkyState` from `src/engine`.
- Replace the body of `src/home/slots/HomeMicSlot.tsx`. Props: `sky`, `language`, `onAsk`.
- Read language from `src/i18n` (`useLanguage`). Do not fork copy tables.
- Credits / RevenueCat / paywall live in that PR. This PR only leaves the mic slot.
- Leave TTS as a later hook on the ask result screen — not on home.

## Home (this PR)

`SkyBackdrop` fills the screen. City, current window, countdown, and now/wait sit on top. Language toggle Hindi | English. No action-chip encyclopedia, no full panchang table, no Gemini.

## Widget

`src/widget/buildGlance.ts` → `{ city, windowName, state: 'now' | 'wait' }` in the active language. iOS WidgetKit + Android App Widget read that payload. No tokens.

## Tests

`src/engine/__tests__/sky.test.ts` — London + Mumbai, weekday + Sunday, pinned civil date, Rahu within 2 minutes of published Drik-method times. Leicester / Chennai / New Jersey sunrise sanity (local hour, not IST-copied).
