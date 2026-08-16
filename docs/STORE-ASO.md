# Store ASO — Play first

Play is the volume store. Treat this file as the Play listing, then copy the same binary to Apple.

Default Play Console language is **Hindi (India)**. `hi-IN` is its own listing, not a translation footnote. Paste `store/play/hi-IN.json` first. Then add `en-IN`.

Closed testing in India must go live **before** production. The listing does not index until a closed track exists in India.

No chat UI in the feature graphic or the first three screenshots. No model names on the listing.

---

## Play — Hindi (default, hi-IN)

Paste into Play Console → Store presence → Main store listing.
Default language: Hindi (India).

### Title (≤30)

```
शुभ: पंचांग और कुंडली
```

### Short description (≤80)

Hindi-first search line. Keep these words: aaj ka panchang, rahukaal, guna milan, muhurat.

```
आज का पंचांग, rahukaal, guna milan, muhurat
```

### Full description

Hindi first, then English. Natural sentences. Includes kundali milan, vivah, janam kundli, choghadiya, shaadi muhurat, festival, rahukaal. Not a keyword dump.

```
शुभ रोज़ का हिंदू नाउ-ऑर-वेट ऐप है। Play पर भारत में पहले यहीं दिखता है।

खोलते ही आज का पंचांग — तिथि, नक्षत्र, योग, करण, सूर्योदय। राहुकाल उसी कार्ड पर है, ताकि इंतज़ार साफ़ हो। चौघड़िया भी साथ है।

कुंडली मिलान इसलिए डाउनलोड होता है। एक रिकॉर्ड में दोनों नाम, जन्म तिथि, जन्म समय, और शहर बोलिए। दो कार्ड देखिए, गलती हो तो टैप करके ठीक कीजिए। गुण मिलान की रिंग वही है जो विवाह की बात से पहले परिवार को भेजते हैं।

जन्म कुंडली और दशा उसी मिलान के पीछे खुलती हैं। साठ दिन का शादी मुहूर्त वैकल्पिक है। त्योहार साल वाले पेज पर रहते हैं।

जन्म की बात फ़ोन पर रहती है। आवाज़ सेव नहीं होती। मुफ़्त नज़र कभी लॉक नहीं होती।

Shubh is the daily Hindu now-or-wait app.

Open it for aaj ka panchang: tithi, nakshatra, yoga, karana, sunrise. Rahukaal sits on the same card. Choghadiya is there too.

Kundali milan is why people install. Record both names, janam tithi, janam samay, and shehar in one take. Confirm two cards. The guna milan ring is what you send before a vivah talk.

Janam kundli and dasha open from the same match. A 60-day shaadi muhurat window is optional. Festival dates stay on the year page.

Birth stays on the device. Audio is not stored. The free glance is never locked.
```

### What's new

```
आवाज़ से कुंडली मिलान: एक रिकॉर्ड, दो कार्ड, गुण रिंग। आज का पंचांग, राहुकाल, और शादी मुहूर्त एक नज़र में।
```

Machine copy: `store/play/hi-IN.json`.

---

## Play — English (en-IN)

Add as a second locale. Do not make this the default.

### Title (≤30)

```
Shubh: Panchang & Kundli
```

### Short description (≤80)

```
Aaj ka panchang, rahukaal, guna milan, muhurat
```

### Full description

```
Shubh is the daily Hindu now-or-wait app. Play is where India finds it first.

Open it for aaj ka panchang: tithi, nakshatra, yoga, karana, sunrise. Rahukaal sits on the same card so you know when to wait. Choghadiya is there too.

Kundali milan is why people install. Record both names, janam tithi, janam samay, and shehar in one take. Confirm two cards. The guna milan ring is what you send before a vivah talk.

Janam kundli and dasha open from the same match. A 60-day shaadi muhurat window is optional. Festival dates stay on the year page.

Birth stays on the device. Audio is not stored. The free glance is never locked.

शुभ रोज़ का हिंदू नाउ-ऑर-वेट ऐप है।

खोलते ही आज का पंचांग — तिथि, नक्षत्र, सूर्योदय, राहुकाल, चौघड़िया। कुंडली मिलान एक रिकॉर्ड से। गुण मिलान की रिंग विवाह से पहले भेजिए। जन्म कुंडली, शादी मुहूर्त, और त्योहार उसी ऐप में।
```

### What's new

```
Voice kundli milan: one take, two cards, the guna ring. Daily panchang, rahukaal, and shaadi muhurat on the same glance.
```

Machine copy: `store/play/en-IN.json`.

---

## Feature graphic + first 3 screenshots

Export from `src/store/frames/StoreFrames.tsx`.

| Slot | File | What it shows |
| --- | --- | --- |
| Feature graphic 1024×500 | `feature-graphic` | Milan ring + aaj ka panchang + muhurat. No chat. |
| Phone 1 | `01-milan` | Guna milan ring, share-ready |
| Phone 2 | `02-panchang` | Today's panchang, rahukaal on the card |
| Phone 3 | `03-muhurat` | Shaadi muhurat, 60-day window |

No Ask page. No chat bubbles. No model names on the frames.

---

## Closed testing (required before production)

1. Create a closed testing track in Play Console.
2. Country: India.
3. Add testers. Publish the closed release.
4. Wait until the listing is indexed (search "शुभ पंचांग कुंडली" from an India account).
5. Only then promote to production.

The store listing does not index from a draft. Closed testing in India is the index step.

---

## Apple (same binary, second)

### English (en-US / en-IN)

**Name (≤30)**

```
Shubh: Panchang & Kundli
```

**Subtitle (≤30)**

```
Rahu, muhurat, festivals
```

**Keywords (≤100, comma-separated, no spaces after commas except inside a phrase)**

```
guna milan,kundali,vivah,rahukaal,choghadiya,shaadi,janampatri,ashtakoot,manglik,tithi,nakshatra
```

**Promotional text**

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

### Hindi (hi)

**Name (≤30)**

```
शुभ: पंचांग और कुंडली
```

**Subtitle (≤30)**

```
राहु, मुहूर्त, त्योहार
```

**Keywords (≤100)**

```
गुण मिलान,विवाह,राहुकाल,चौघड़िया,शादी,जन्मपत्री,अष्टकूट,मांगलिक,तिथि,नक्षत्र,मुहूर्त
```

**Promotional text**

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

---

## Review prompt (both stores)

Ask for a review only after a successful share of the milan ring or the daily panchang card. Once. Never on first launch. Never after a failed share.

---

## Source of truth

- `src/store/aso.ts` — limits and copy
- `store/play/hi-IN.json` — Play Hindi listing (default)
- `store/play/en-IN.json` — Play English listing
- `store.config.ts` — Expo / EAS
- `store/locales/en.json`, `store/locales/hi.json` — app name on device
- `src/store/frames/StoreFrames.tsx` — feature graphic + phone frames
