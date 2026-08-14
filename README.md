# Shubh

Is now good for this?

Daily Hindu now-or-wait. You name the action. It names the next window.

Read [PRODUCT.md](PRODUCT.md) before writing code. Clock architecture: [docs/PLAN-clock.md](docs/PLAN-clock.md). TathaAstu Phase 1: live panchang, muhurat, festivals, kundli. The app never embeds `TATHAASTU_API_KEY` — point it at `TATHAASTU_PROXY_URL`.

```bash
npm install
npm test
npx expo start
```

Ask PR: `import { getSkyState } from './src/engine'`. Motion: Home mounts `SkyBackdrop` from `src/motion`.
