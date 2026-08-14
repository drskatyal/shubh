# Motion layer

Reusable sky behind Home and the ask result. Not a second app. Clock and ask land in other PRs.

## Job

The glance must feel like astrology: slow sun / moon / path, the active window changing the light. Not a spinner, not a planetarium.

`SkyStage` is a backdrop. Glance copy, city, countdown, and mic sit on top. This package does not compute muhurat, call Gemini, or draw text on the canvas.

## Contract

```ts
windowKind: 'rahu' | 'yamaganda' | 'gulika' | 'abhijit' | 'labh' | 'amrit' | 'shubh' | 'other'
verdict?: 'now' | 'wait' | 'after' | null   // sustained glance tint
locale?: 'en' | 'hi'                        // reserved; canvas has no labels
playVerdict(verdict)                        // one-shot result beat
```

Home (when it exists):

```tsx
<View style={{ flex: 1 }}>
  <SkyBackdrop windowKind={slot} verdict={glance} />
  {/* glance UI */}
</View>
```

## Scene

- Night wash tinted by `windowKind` (inauspicious = heavier red/violet; Abhijit / Shubh / Amrit / Labh = gold, honey, pearl, green).
- One ecliptic oval, a fainter inner earth path, sun, moon, a small earth hint.
- Periods ~96s / 156s / 72s. UI-thread clock (Skia + Reanimated). No `setState` per frame.
- Reduce Motion: freeze at a composed still (`t = 0` + fixed phases). `playVerdict` becomes a static tint, no pulse.
- Verdict beat (~1.4s sine): now = sun warmth, wait = moon cool, after = path brightens.
- Hindi/English: no canvas type. Preview chrome may label windows; those names are the same in both languages.

## Budget

≤ ~24 Skia nodes. No WebView, no video, no 9-planet chart, no pinch-zoom. Target: 60fps on a mid Android.

## Files

| Path | Role |
| --- | --- |
| `src/motion/types.ts` | Window / verdict / props |
| `src/motion/palette.ts` | Window + verdict color |
| `src/motion/orbit.ts` | Periods, still clock, positions |
| `src/motion/verdictBeat.ts` | Beat envelope (pure) |
| `src/motion/useReduceMotion.ts` | `AccessibilityInfo` |
| `src/motion/useVerdictBeat.ts` | `playVerdict` |
| `src/motion/SkyStage.tsx` | Skia scene |
| `src/motion/SkyBackdrop.tsx` | Absolute fill, `pointerEvents="none"` |
| `src/motion/MotionPreviewScreen.tsx` | Dev preview only |
| `src/motion/index.ts` | Public exports |

App root mounts the preview until Home exists. Engine math, IAP, Gemini, TTS, kundli stay out.
