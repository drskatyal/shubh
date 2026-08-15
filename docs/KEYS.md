# Keys — placeholders only

Paste real values tomorrow. This branch ships empty. Never commit secrets.

## What the app reads

| Name | Where | Purpose |
| --- | --- | --- |
| `DIVINE_API_KEY` | Proxy / EAS secret | Divine Vedic Prakash `api_key` + default Bearer |
| `DIVINE_API_TOKEN` | Proxy / EAS secret | Optional separate Bearer |
| `GEMINI_API_KEY` | Proxy / EAS secret | Ask + voice extract. Server only |
| `EXPO_PUBLIC_DIVINE_PROXY_URL` | App extra | Thin forwarder the binary calls |
| `EXPO_PUBLIC_ASK_PROXY_URL` | App extra | Ask path; falls back to Divine proxy |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | App extra | RevenueCat. Paywall still renders without it |
| `EXPO_PUBLIC_SHUBH_DEV_UNLOCK` | App extra | `1` unlocks asks locally. Store builds stay `0` |

The binary never embeds `DIVINE_API_KEY` or `GEMINI_API_KEY`.

## EAS secret names

Create with empty-safe placeholders first, then replace:

```bash
eas secret:create --name DIVINE_API_KEY --type string
eas secret:create --name DIVINE_API_TOKEN --type string
eas secret:create --name GEMINI_API_KEY --type string
eas secret:create --name EXPO_PUBLIC_DIVINE_PROXY_URL --type string
eas secret:create --name EXPO_PUBLIC_ASK_PROXY_URL --type string
eas secret:create --name EXPO_PUBLIC_REVENUECAT_API_KEY --type string
eas secret:create --name EXPO_PUBLIC_SHUBH_DEV_UNLOCK --type string
```

`eas.json` maps the public names into preview/production builds. Production forces `EXPO_PUBLIC_SHUBH_DEV_UNLOCK=0`.

## Proxy env

```bash
DIVINE_API_KEY=… GEMINI_API_KEY=… node server/divine-proxy.mjs
```

Then point the app at `EXPO_PUBLIC_DIVINE_PROXY_URL=http://127.0.0.1:8787`.
`POST {proxy}/ask` uses `GEMINI_API_KEY` on the server. The UI never names the provider.

## Empty-key boot

- Home glance: on-device Drik (`getSkyState`). Live Divine is optional.
- Ask / matching extract: calm “connect later”. No crash.
- Muhurat / festivals / kundli live calls: same empty state.
- Paywall: Shubh screen. Purchases no-op with “store connects later” until RevenueCat is set.
