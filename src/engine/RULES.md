# RULES — starting something new

Home now/wait is this file only. No model. No action encyclopedia.

The panchang day starts at **local sunrise**.

## Wait

WAIT if any of these is true at `asOf`:

1. Inside **Rahu Kaal**
2. Inside **Yamaganda**
3. Inside **Gulika**
4. Current **Choghadiya** is Udveg, Kaal, or Rog

Rahu / Yamaganda / Gulika are daytime only (sunrise → sunset).

## Now

NOW if not waiting, and either:

1. Inside **Abhijit** and Abhijit is observed today, or
2. Current Choghadiya is Amrit, Shubh, Labh, or Chal

## Abhijit observed?

- **Sunday caveat** (PRODUCT): do not treat Sunday Abhijit as independently auspicious.
- **Wednesday**: classical Muhurta Chintamani / Drik — Abhijit is not used.

On those days `SkyState.abhijit` is `null` (Ask must not copy a Sunday/Wednesday Abhijit clock). The interval is still computed internally; it does not flip WAIT → NOW by itself.

## Night

After sunset, only Choghadiya applies until the next sunrise.
