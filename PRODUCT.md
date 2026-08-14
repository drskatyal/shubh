# Shubh

One question: is now good for this?

Not a Hindu calendar. Not a prayer lock. Not a horoscope.

## The job

Hindus already check Rahu Kaal and muhurat the way other people check the weather. Drik Panchang is the encyclopedia. Shubh answers one question for one action, then gets out of the way.

Open the app (or glance at the widget). It already knows the city. You tap what you are about to do. It says:

- **Now** — start
- **Wait 23 min** — next good window
- **After 2:14** — this window is bad, here is the next one

That is the whole product.

## Daily habit

This is not a once-a-year kundli. People check before they leave the house, before a meeting, before they send money, before a haircut, before they start something new. Morning, and again in the day. Like weather.

## Unique mechanic (not a costume)

- Not Prayer Lock with a Sanskrit skin. Unlock-by-reciting is already cloned for Christians, Muslims, and Hindus.
- Not Co-Star with a Ganesha icon. No sun-sign horoscope in v1.
- Not Drik with a nicer theme. Drik shows a table. We answer one action.
- Not a time the user picks. Windows come from local sunrise in their city and the weekday. A competitor cannot match this by changing a default time, a skin, or an onboarding label.

## v1 scope (ship this, nothing else)

Expo / React Native. iOS + Android. No backend. On-device calculation.

### Must have

1. **Location → local sunrise/sunset.** Use device location (with a city search fallback). All windows are local. Wrong city = wrong product.
2. **Inauspicious windows, computed, not hardcoded IST.**
   - Rahu Kaal
   - Yamaganda
   - Gulika
   These are the 8-part daytime split from local sunrise. Weekday picks which part. Do not use a fixed 7:30–9:00 IST table.
3. **One good window:** Abhijit muhurat (midday, local).
4. **Choghadiya** for the current slot and the next one (Labh / Amrit / Shubh / Udveg / Chal / Rog / Kaal / Laabh). Show the name and the countdown. Do not dump all 16 in a grid as the home screen.
5. **Actions the user is about to take.** Saved chips, not a blog:
   - Start something new
   - Meeting / call
   - Money / sign / pay
   - Travel / leave the house
   - Haircut / personal
   - Everyday (already in progress — always OK)
6. **Verdict engine.** Simple, documented rules in code:
   - Starting something new, money, haircut: never during Rahu / Yamaganda / Gulika. Prefer Labh / Amrit / Shubh / Abhijit.
   - Travel / leave: same inauspicious block, plus a short note if the weekday is traditionally weak for travel.
   - Meeting / call: block only Rahu Kaal (strict) and warn on Yamaganda/Gulika.
   - Everyday: always Now. Routine work already started is allowed.
   - If now is bad, show the next good start time for that action, with a countdown.
7. **Home screen is the verdict.** Big Now / Wait / After. Current window name. Next window. Action chips. Nothing else above the fold.
8. **Widget** (iOS + Android): Now / Wait + minutes + current window name. This is how daily use actually happens.
9. **Paywall.** Weekly + yearly IAP via RevenueCat. Free: today’s verdict for one action, no widget, no saved actions. Paid: widget, all actions, next-window countdown, no ads. Never put ads in a faith app.
10. **Onboarding in under 60 seconds.** City (or allow location) → pick 2–3 usual actions → today’s first verdict. No kundli form. No birth time. No religion quiz.

### Must not have in v1

- Full panchang table (tithi, nakshatra, yoga, karana as a reference page)
- Kundli / birth chart / matching
- Daily rashifal / sun-sign horoscope
- Aarti, chalisa, mantra audio library
- Temple booking, pandit chat, seva
- Prayer lock / app blocking / Screen Time
- Multi-faith tracks (Muslim / Christian)
- Social, streaks-as-the-product, journal
- Backend, accounts, or AI copy

Tithi/nakshatra can come later if the verdict needs them. They are not the home screen.

## Calculation notes (do not fake)

- Get sunrise/sunset for the lat/lon and date (astronomy-engine or equivalent). Test London, Leicester, Mumbai, Chennai, New Jersey.
- Split sunrise→sunset into 8 equal parts.
- Rahu Kaal part by weekday (Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3), 1-indexed from sunrise.
- Yamaganda and Gulika have their own weekday parts. Implement from a cited table in code comments (standard panchang), not from memory.
- Abhijit is the middle 48 minutes of the day (center of sunrise→sunset), with the usual Sunday caveat documented.
- Choghadiya: 8 day slots sunrise→sunset, 8 night slots sunset→next sunrise, weekday sequence from standard Choghadiya. Cite the sequence in comments.
- Unit tests for a known city+date against Drik Panchang (London and Mumbai, a weekday and a Sunday). If we disagree with Drik by more than 2 minutes on sunrise, fix ours.
- All times in the user’s local timezone. Label the city on screen so a wrong location is obvious.

## Monetization

- Product IDs: `shubh_weekly`, `shubh_yearly`
- Price like a daily utility, not a $2.49/year ad-remove. Weekly impulse, yearly for people who already check this every morning.
- Restore purchases. Dev unlock via env for TestFlight.

## Store position

- Name: Shubh
- Subtitle: Is now good for this?
- Category: Lifestyle
- Keywords: rahu kaal, muhurat, panchang, choghadiya, hindu calendar, abhijit, shubh muhurat
- Privacy: location for sunrise only, on-device, no account

## Done when

- Fresh install → city → tap “Leave the house” → a real Now/Wait/After for that city today
- Widget shows the same verdict
- London and Mumbai unit tests pass against published Rahu Kaal for a pinned date
- Paywall actually gates the widget and extra actions
- No panchang encyclopedia, no horoscope, no lock screen prayer
