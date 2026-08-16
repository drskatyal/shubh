# Backend — Supabase (placeholders)

Shubh’s backend is **Supabase**. This branch ships the decision, the schema as SQL files, and a client that **boots with empty keys**. There is no live project URL or anon key in the repo. Do not invent one.

Glance stays anonymous. Birth data never leaves the device.

## What needs an account

Auth is **phone OTP for India** (`+91`). Sign-in is required only for:

- Paid restore (RevenueCat app user id on `profiles`)
- Ask credit wallet (ledger sync, cross-device remaining)
- Cross-device reminder prefs

Home glance, on-device Drik, and browsing muhurat / festivals / kundli **do not** ask for a number.

## What never goes to Supabase

Janam fields stay on device. Do not add columns, payloads, or logs for:

- naam / name
- janam tithi / birth date
- samay / birth time
- shehar of birth / birth place

`profiles.city` and `reminder_prefs.city` are the **current city for glance / festival push**, not a birth place.

## Schema (SQL in repo)

Apply later against a real project. Files live in `supabase/migrations/`. This PR does not run them on a hosted database.

### `profiles`

| Column | Notes |
| --- | --- |
| `id` | `auth.uid()` |
| `phone` | E.164 from phone OTP |
| `city` | Current city, optional |
| `language` | `hi` / `en` |
| `revenuecat_app_user_id` | Restore / alias |
| `created_at` | |

### `credit_ledger`

Append-only. Remaining asks are **derived** by folding rows. There is no `remaining` column.

| Column | Notes |
| --- | --- |
| `id` | |
| `user_id` | `auth.uid()` |
| `kind` | `ask_consume` \| `pack_grant` \| `monthly_grant` \| `monthly_reset` |
| `amount` | Negative for consume, positive for grants |
| `period_id` | Subscription period, optional |
| `store_txn_id` | Pack purchase id, optional |
| `created_at` | |

### `reminder_prefs`

| Column | Notes |
| --- | --- |
| `user_id` | PK, `auth.uid()` |
| `festival_push` | |
| `city` | Current city for the reminder |

## RLS

Every public table has RLS on. A signed-in user can read/write **only their own** `profiles` and `reminder_prefs` rows.

`credit_ledger`: the user can **SELECT** their own rows. They cannot INSERT / UPDATE / DELETE from the client. Decrement and grants go through **server functions** in the private schema (`consume_ask_credit`, `grant_pack_credits`, `grant_monthly_credits`, `reset_monthly_credits`). Public wrappers call those. The app never patches a remaining-count column.

## App client

`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are the only Supabase values in the binary. Both empty → no network, local `CreditWallet` only.

When both are set **and** the user has verified a phone OTP, `SupabaseCreditStore` loads the ledger, folds it with the same credit math as local, and after each wallet save appends ledger rows via the server functions.

Anonymous glance keeps using the on-device store.

Never put the service role key in Expo extra, EAS public env, or the app.

## Divine + Ask cutover

Today the binary calls `server/divine-proxy.mjs` through `EXPO_PUBLIC_DIVINE_PROXY_URL` and `EXPO_PUBLIC_ASK_PROXY_URL`. That Node process stays the working path until Edge Functions exist.

Planned functions (not in this PR, no live project required):

1. `divine` — same official Vedic Prakash POST map as the Node proxy. Key stays a function secret.
2. `ask` — same Ask contract as `POST {proxy}/ask`. Provider name stays off the client.

Keep the Node proxy running until both functions are deployed and the two `EXPO_PUBLIC_*_PROXY_URL` extras point at them. Empty extras must still boot (calm “connect later”). Then stop the Node process.

Do not point the app at a made-up function URL.
