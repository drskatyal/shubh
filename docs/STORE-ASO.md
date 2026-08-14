# Store listing — paste at submit

Source of truth: `src/store/aso.ts` and `store.config.ts`. Home-screen icon name stays **Shubh** / **शुभ**. These longer titles are App Store Connect / Play Console only.

**Never** name a model or a lab in any field below.

Review prompt: only after a **successful share**, once per install. Never on first launch. See `src/store/reviewAfterShare.ts`.

Screenshot order (first three — not a chat UI):

1. `01-milan-score-ring.png` — guna milan score ring  
2. `02-today-panchang.png` — today’s panchang glance  
3. `03-marriage-muhurat.png` — marriage muhurat  

Frames: `src/store/frames/StoreFrames.tsx`.

---

## Apple App Store — English (en-US)

**Title** (≤30)

```
Shubh: Panchang & Kundli
```

**Subtitle** (≤30)

```
Rahu, muhurat, festivals
```

**Keywords** (≤100, comma-separated, no title words)

```
guna milan,kundali,vivah,rahukaal,choghadiya,shaadi,janampatri,ashtakoot,manglik,tithi,nakshatra
```

**Promotional text** (≤170)

```
Today’s panchang, guna milan, and marriage muhurat — share the card with family on WhatsApp.
```

**Description**

```
Shubh is a daily Hindu panchang. Open it and see today’s tithi, nakshatra, Rahu Kaal, and whether now is good to start.

Guna milan (Ashtakoot) and Manglik for two births — speak both names, janam tithi, samay, and shehar in one take, then share the score card with family.

Find a marriage muhurat for the next 60 days. Festival calendar with why-this-date. Janam kundli on device. Hindi and English.

The home glance stays free. Extra asks, deeper reports, and further muhurat ranges are optional.
```

**What’s New**

```
Voice guna milan, shareable score card, and marriage muhurat for the next 60 days. Daily panchang still on the home glance.
```

---

## Apple App Store — Hindi (hi)

**Title** (≤30)

```
शुभ: पंचांग और कुंडली
```

**Subtitle** (≤30)

```
राहु, मुहूर्त, त्योहार
```

**Keywords** (≤100)

```
गुण मिलान,विवाह,राहुकाल,चौघड़िया,शादी,जन्मपत्री,अष्टकूट,मांगलिक,तिथि,नक्षत्र,मुहूर्त
```

**Promotional text** (≤170)

```
आज का पंचांग, गुण मिलान और विवाह मुहूर्त — कार्ड परिवार को WhatsApp पर भेजें।
```

**Description**

```
शुभ रोज़ का हिन्दू पंचांग है। खोलते ही तिथि, नक्षत्र, राहु काल और यह दिखता है कि अभी शुरुआत ठीक है या नहीं।

दो जन्म का गुण मिलान (अष्टकूट) और मांगलिक — एक बार में दोनों के नाम, जन्म तिथि, समय और शहर बोलें। अंक कार्ड परिवार के साथ बाँटें।

अगले 60 दिन का विवाह मुहूर्त। त्योहार और “यह तारीख क्यों”। जन्म कुंडली इस डिवाइस पर रहती है। हिन्दी और अंग्रेज़ी।

होम पर आज का पंचांग मुफ़्त रहता है।
```

**What’s New**

```
आवाज़ से गुण मिलान, शेयर करने वाला अंक कार्ड, और 60 दिन का विवाह मुहूर्त। रोज़ का पंचांग होम पर।
```

---

## Google Play — Hindi (hi-IN) — ranks the description

**Title**

```
शुभ: पंचांग और कुंडली
```

**Short description** (≤80)

```
पंचांग, गुण मिलान, कुंडली, राहुकाल, मुहूर्त, त्योहार, विवाह।
```

**Full description**

```
शुभ भारत के लिए रोज़ का हिन्दू पंचांग है। आज की तिथि, नक्षत्र, योग, राहु काल (राहुकाल), चौघड़िया, और यह कि अभी शुभ है या नहीं।

गुण मिलान और कुंडली मिलान: अष्टकूट और मांगलिक। एक बार में दोनों की जन्म कुंडली बोलें — नाम, जन्म तिथि, समय, शहर। मिलान अंक परिवार को WhatsApp पर भेजें।

विवाह / शादी का मुहूर्त अगले 60 दिन। त्योहार कैलेंडर। जन्मपत्री / जन्म कुंडली फ़ोन पर रहती है।

खोज शब्द: पंचांग, कुंडली, कुंडली मिलान, गुण मिलान, राहुकाल, मुहूर्त, चौघड़िया, शादी, विवाह, तिथि, नक्षत्र, जन्म कुंडली।

होम पर आज का पंचांग मुफ़्त। हिन्दी और अंग्रेज़ी।
```

---

## Google Play — English (en-IN)

**Title**

```
Shubh: Panchang & Kundli
```

**Short description** (≤80)

```
Panchang, guna milan, kundli, rahukaal, muhurat, festivals.
```

**Full description**

```
Shubh is the daily Hindu panchang for India. See today’s tithi, nakshatra, yoga, Rahu Kaal (rahukaal), choghadiya, and whether now is good.

Guna milan and kundali matching: Ashtakoot + Manglik. Speak both janam kundli details — name, date, time, city — in one take. Share the milan score with family on WhatsApp.

Vivah / shaadi muhurat for the next 60 days. Festival calendar. Janampatri / janam kundli stays on your phone.

Search words this listing is built for: panchang, kundli, kundali, guna milan, rahukaal, muhurat, choghadiya, shaadi, vivah, tithi, nakshatra.

Home glance is free. Hindi and English.
```

---

## Binary / Expo

- `app.config.ts` — `locales.en` / `locales.hi` → `store/locales/*.json` (icon name + permission strings).
- `store.config.ts` — screenshot order + review policy.
- Icon label stays Shubh. Do not put the 30-character store title on the home-screen icon.
