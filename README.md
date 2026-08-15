# Shubh

Is now good for this?

Daily Hindu now-or-wait. You name the action. It names the next window.

Read [PRODUCT.md](PRODUCT.md) before writing code. Clock architecture: [docs/PLAN-clock.md](docs/PLAN-clock.md). Phase 1: live Divine Vedic Prakash panchang, muhurat, festivals, kundli. On-device Drik (`src/engine`) is the glance fallback. The app never embeds `DIVINE_API_KEY` — point it at `DIVINE_PROXY_URL`.

Keys stay out of the binary. Copy [`.env.example`](.env.example) and read [docs/KEYS.md](docs/KEYS.md). Backend decision: [docs/BACKEND.md](docs/BACKEND.md). Store submit: [docs/SUBMIT.md](docs/SUBMIT.md). The app boots with every value empty.

```bash
npm install
npm test
# DIVINE_API_KEY=… GEMINI_API_KEY=… node server/divine-proxy.mjs
npx expo start
npm run web
```

`npm run web` is the same product in the browser — glance, muhurat, festivals, kundli, matching, Ask cards, paywall — not a marketing page. Hash routes: `#/muhurat`, `#/matching`, `#/ask`. Desktop (≥1100px) uses a wider temple layout. Share downloads a PNG and uses the Web Share API when the browser allows it. Matching accepts a mic take or an audio file.

Ask PR: `import { getSkyState } from './src/engine'`. Motion: Home mounts `SkyBackdrop` from `src/motion`.
