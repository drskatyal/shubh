# App Store Connect — paste pack

English first (`en-US`), then Hindi (`hi`). Machine files: `store/ios/en-US.json`, `store/ios/hi.json`. Limits already match `src/store/aso.ts`.

Public legal URLs (GitHub Pages, this repo):

- Privacy: https://drskatyal.github.io/shubh/privacy.html
- Support: https://drskatyal.github.io/shubh/support.html
- Terms: https://drskatyal.github.io/shubh/terms.html
- Marketing (optional): https://drskatyal.github.io/shubh/

If the pages 404, turn on **GitHub Pages → Source = GitHub Actions**. Workflow: `.github/workflows/pages.yml` (publishes `legal/` from this branch).

---

## App Information

| ASC box | File field | Value |
| --- | --- | --- |
| Name | `name` | from locale JSON (≤30) |
| Subtitle | `subtitle` | from locale JSON (≤30) |
| Privacy Policy URL | `privacyUrl` | https://drskatyal.github.io/shubh/privacy.html |
| Category (primary) | `primaryCategory` | Lifestyle |
| Category (secondary) | `secondaryCategory` | Reference |
| Copyright | `copyright` | 2026 Sanyam Katyal |

## Version / locale

| ASC box | File field |
| --- | --- |
| Promotional Text | `promotionalText` (≤170) |
| Description | `description` |
| Keywords | `keywords` (≤100) |
| What’s New | `whatsNew` |
| Support URL | `supportUrl` |
| Marketing URL | `marketingUrl` (optional) |

Add locale **Hindi** from `hi.json`. Do not make it the primary.

## Age rating

**4+ / 4+.** Questionnaire from `en-US.json` → `ageRatingQuestionnaire`:

- Unrestricted Web Access: **No**
- User Generated Content: **No** (voice discarded after one take)
- Violence (cartoon / realistic): **None**
- Sexual content / nudity: **None**
- Profanity: **None**
- Alcohol / tobacco / drugs: **None**
- Horror: **None**
- Medical / treatment information: **None** (almanac, not a priest; terms say no-guarantee)
- Gambling / contests: **None**
- Made for Kids: **No**

## App Privacy

Same as Play. Precise location: collected (optional), not linked, not used for tracking, app functionality (sunrise / local windows). Microphone used, not stored. No email / name until a later phone OTP. Birth / janam fields on device only. Data sold: No. Tracking: No. ATT: do not add.

## Export compliance

Encryption: **No.** `ITSAppUsesNonExemptEncryption` is `false` in `app.config.ts` (HTTPS only, no custom crypto).

## Sign-in / review

Demo account: **No login.**

Paste `reviewNotes` from `en-US.json` into **Notes for Review**. Do not add a model name.

## IAP

Create in App Store Connect + RevenueCat (placeholders):

| Product | Id |
| --- | --- |
| Monthly | `shubh_monthly_100` |
| Yearly | `shubh_annual_1200` |
| Ask pack | `shubh_credits_100` |

Restore is on the paywall. Entitlements: `shubh_pro`, `monthly_asks`, `annual_asks`.

## Screenshots (upload order)

Folders: `store/ios/6.7/` (1320×2868), `store/ios/6.5/` (1290×2796), `store/ios/ipad13/` (2064×2752).

1. `01-milan-score-ring.png`
2. `02-today-panchang.png`
3. `03-marriage-muhurat.png`
4. `04-first-open.png`
5. `05-festivals.png`
6. `06-kundli.png`
7. `07-paywall.png`

Never upload an Ask / chat shot.
