# Shubh

Is now good for this?

Daily Hindu now-or-wait. You name the action. It names the next window.

Read [PRODUCT.md](PRODUCT.md) before writing code. Clock architecture: [docs/PLAN-clock.md](docs/PLAN-clock.md). Phase 1: live Divine Vedic Prakash panchang, muhurat, festivals, kundli. On-device Drik (`src/engine`) is the glance fallback. The app never embeds `DIVINE_API_KEY` — point it at `DIVINE_PROXY_URL`.

```bash
npm install
npm test
# DIVINE_API_KEY=… node server/divine-proxy.mjs
npx expo start
```

Ask PR: `import { getSkyState } from './src/engine'`. Motion: Home mounts `SkyBackdrop` from `src/motion`.
