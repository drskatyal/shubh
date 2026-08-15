# Submit Shubh — owner checklist

Play first. Then Apple. The binary is this branch. You paste keys and listing copy. Do not invent store field names that mention a model.

Public legal URLs (same app, hash routes):

- `https://<host>/#/privacy`
- `https://<host>/#/terms`
- `https://<host>/#/support`

`<host>` is the Expo web deploy or GitHub Pages later. Routes already work on `npm run web`.

---

## Already done on this branch

- [x] Store-shaped Android + iOS + web app. Bundle id `ai.flowrad.shubh`
- [x] Empty-key boot. Glance never locks. On-device Drik when Divine is empty
- [x] First-open: city (“इसी जगह से”) + हिन्दी / English. No account wall
- [x] Matching, muhurat (marriage / house / vehicle / business / property), festivals, kundli, Ask cards, paywall
- [x] Play listing copy in `store/play/hi-IN.json` then `store/play/en-IN.json`
- [x] Apple copy in `src/store/aso.ts` (`appleHi`, `appleEn`) and `docs/STORE-ASO.md`
- [x] Feature graphic + screenshots in `store/play/` and `store/ios/`
- [x] Privacy / terms / support in-app and `docs/PRIVACY.md`
- [x] Production EAS profile forces `EXPO_PUBLIC_SHUBH_DEV_UNLOCK=0`
- [x] Supabase placeholders only. No live project

## You must paste tomorrow

- [ ] Real `DIVINE_API_KEY` (and optional `DIVINE_API_TOKEN`) as EAS secrets — see `docs/KEYS.md`
- [ ] Ask server key as EAS secret (server only, never `EXPO_PUBLIC_`)
- [ ] `EXPO_PUBLIC_DIVINE_PROXY_URL` / `EXPO_PUBLIC_ASK_PROXY_URL` after the proxy is up
- [ ] `EXPO_PUBLIC_REVENUECAT_API_KEY`
- [ ] Real EAS `projectId` in `app.config.ts` extra.eas (today it is the zero UUID)
- [ ] Play + Apple listing paste from the files below
- [ ] Optional later: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (app boots empty)

Never put a service role key in the app.

---

## Play (volume store)

1. Play Console → default language **Hindi (India)**.
2. Paste `store/play/hi-IN.json` (title, short, full, what’s new).
3. Add locale **English (India)** from `store/play/en-IN.json`. Do not make it the default.
4. **Closed testing in India before production.** The listing will not index from a draft.
5. Upload graphics from `store/play/`:

| Order | File | Size |
| --- | --- | --- |
| Feature graphic | `feature-graphic.png` | 1024×500 |
| Phone 1 | `01-milan-score-ring.png` | milan ring |
| Phone 2 | `02-today-panchang.png` | aaj ka panchang |
| Phone 3 | `03-marriage-muhurat.png` | muhurat |
| Optional 4 | `04-festivals.png` | |
| Optional 5 | `05-kundli.png` | |
| Optional 6 | `06-paywall.png` | |

Do not put Ask in the first three. Do not put a chat shot anywhere on the listing.

6. App icon: `assets/icon.png` (1024). Adaptive: `assets/android-icon-*.png` on `#0B1020`.
7. Content rating: **Everyone**. No UGC (voice discarded after one take).
8. Privacy nutrition / Data safety (answers):

| Data | Collected? | Linked? | Tracking? | Why |
| --- | --- | --- | --- | --- |
| Precise location | Yes (optional) | No | No | App functionality — sunrise / local windows |
| Microphone | Used, not stored | No | No | One matching / Ask take, then discarded |
| Name / email | No (until they later turn on phone OTP) | — | — | — |
| Birth / janam fields | On device only | No | No | Never written to a server table |

Data sold: **No**. Ads: **No**.

9. Privacy policy URL: `https://<host>/#/privacy`
10. IAP (RevenueCat placeholders — create in Play + RC):

| Product | Play / RC id | Role |
| --- | --- | --- |
| Monthly | `shubh_monthly_100` | ₹199–299 / month, 100 asks |
| Yearly | `shubh_annual_1200` | ₹1,999–2,499 / year |
| Ask pack | `shubh_credits_100` | ₹799 / 100 asks |

Entitlements: `shubh_pro`, `monthly_asks`, `annual_asks`.

---

## Apple (same binary, second)

1. Name / subtitle / keywords / promo / description from `docs/STORE-ASO.md` (English first on App Store, Hindi as second locale).
2. Screenshots from `store/ios/`:

| Size | Folder | Lead shots |
| --- | --- | --- |
| 6.7" (1320×2868) | `store/ios/6.7/` | 01 milan, 02 panchang, 03 muhurat |
| 6.5" (1290×2796) | `store/ios/6.5/` | same three |
| iPad 13" (2064×2752) | `store/ios/ipad13/` | same three (tablet claimed) |

3. Age rating **4+**. No UGC.
4. Privacy nutrition: same table as Play.
5. Support URL: `https://<host>/#/support`
6. Privacy URL: `https://<host>/#/privacy`

---

## EAS build

```bash
eas secret:create --name DIVINE_API_KEY --type string
# …other names in docs/KEYS.md
eas build --platform android --profile production
eas build --platform ios --profile production
```

`eas.json` production already sets `EXPO_PUBLIC_SHUBH_DEV_UNLOCK=0`.

Paste the real EAS project id in `app.config.ts` → `extra.eas.projectId` before the first store build.

---

## Do not

- Mention a model name in any store field, screenshot caption, or review reply
- Lock the glance
- Write janam fields to Supabase
- Ship `SHUBH_DEV_UNLOCK=1` on a store build
