export type City = {
  id: string;
  nameEn: string;
  nameHi: string;
  countryEn: string;
  countryHi: string;
  lat: number;
  lon: number;
};

export const CITIES: City[] = [
  { id: 'mumbai', nameEn: 'Mumbai', nameHi: 'मुंबई', countryEn: 'India', countryHi: 'भारत', lat: 19.076, lon: 72.8777 },
  { id: 'delhi', nameEn: 'Delhi', nameHi: 'दिल्ली', countryEn: 'India', countryHi: 'भारत', lat: 28.6139, lon: 77.209 },
  { id: 'bengaluru', nameEn: 'Bengaluru', nameHi: 'बेंगलुरु', countryEn: 'India', countryHi: 'भारत', lat: 12.9716, lon: 77.5946 },
  { id: 'chennai', nameEn: 'Chennai', nameHi: 'चेन्नई', countryEn: 'India', countryHi: 'भारत', lat: 13.0827, lon: 80.2707 },
  { id: 'kolkata', nameEn: 'Kolkata', nameHi: 'कोलकाता', countryEn: 'India', countryHi: 'भारत', lat: 22.5726, lon: 88.3639 },
  { id: 'hyderabad', nameEn: 'Hyderabad', nameHi: 'हैदराबाद', countryEn: 'India', countryHi: 'भारत', lat: 17.385, lon: 78.4867 },
  { id: 'pune', nameEn: 'Pune', nameHi: 'पुणे', countryEn: 'India', countryHi: 'भारत', lat: 18.5204, lon: 73.8567 },
  { id: 'ahmedabad', nameEn: 'Ahmedabad', nameHi: 'अहमदाबाद', countryEn: 'India', countryHi: 'भारत', lat: 23.0225, lon: 72.5714 },
  { id: 'jaipur', nameEn: 'Jaipur', nameHi: 'जयपुर', countryEn: 'India', countryHi: 'भारत', lat: 26.9124, lon: 75.7873 },
  { id: 'lucknow', nameEn: 'Lucknow', nameHi: 'लखनऊ', countryEn: 'India', countryHi: 'भारत', lat: 26.8467, lon: 80.9462 },
  { id: 'london', nameEn: 'London', nameHi: 'लंदन', countryEn: 'United Kingdom', countryHi: 'यूनाइटेड किंगडम', lat: 51.5074, lon: -0.1278 },
  { id: 'leicester', nameEn: 'Leicester', nameHi: 'लेस्टर', countryEn: 'United Kingdom', countryHi: 'यूनाइटेड किंगडम', lat: 52.6369, lon: -1.1398 },
  { id: 'birmingham', nameEn: 'Birmingham', nameHi: 'बर्मिंघम', countryEn: 'United Kingdom', countryHi: 'यूनाइटेड किंगडम', lat: 52.4862, lon: -1.8904 },
  { id: 'manchester', nameEn: 'Manchester', nameHi: 'मैनचेस्टर', countryEn: 'United Kingdom', countryHi: 'यूनाइटेड किंगडम', lat: 53.4808, lon: -2.2426 },
  { id: 'edison', nameEn: 'Edison', nameHi: 'एडिसन', countryEn: 'New Jersey, USA', countryHi: 'न्यू जर्सी, अमेरिका', lat: 40.4862, lon: -74.4518 },
  { id: 'jersey-city', nameEn: 'Jersey City', nameHi: 'जर्सी सिटी', countryEn: 'New Jersey, USA', countryHi: 'न्यू जर्सी, अमेरिका', lat: 40.7178, lon: -74.0431 },
  { id: 'newark-nj', nameEn: 'Newark', nameHi: 'न्यूअर्क', countryEn: 'New Jersey, USA', countryHi: 'न्यू जर्सी, अमेरिका', lat: 40.7357, lon: -74.1724 },
  { id: 'new-york', nameEn: 'New York', nameHi: 'न्यूयॉर्क', countryEn: 'USA', countryHi: 'अमेरिका', lat: 40.7128, lon: -74.006 },
  { id: 'toronto', nameEn: 'Toronto', nameHi: 'टोरंटो', countryEn: 'Canada', countryHi: 'कनाडा', lat: 43.6532, lon: -79.3832 },
  { id: 'vancouver', nameEn: 'Vancouver', nameHi: 'वैंकूवर', countryEn: 'Canada', countryHi: 'कनाडा', lat: 49.2827, lon: -123.1207 },
  { id: 'sydney', nameEn: 'Sydney', nameHi: 'सिडनी', countryEn: 'Australia', countryHi: 'ऑस्ट्रेलिया', lat: -33.8688, lon: 151.2093 },
  { id: 'dubai', nameEn: 'Dubai', nameHi: 'दुबई', countryEn: 'UAE', countryHi: 'यूएई', lat: 25.2048, lon: 55.2708 },
  { id: 'singapore', nameEn: 'Singapore', nameHi: 'सिंगापुर', countryEn: 'Singapore', countryHi: 'सिंगापुर', lat: 1.3521, lon: 103.8198 },
];

export function cityLabel(city: City, language: 'hi' | 'en'): string {
  return language === 'hi' ? city.nameHi : city.nameEn;
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return CITIES;
  }
  return CITIES.filter((city) =>
    [city.nameEn, city.nameHi, city.countryEn, city.countryHi, city.id].some((field) =>
      field.toLowerCase().includes(q),
    ),
  );
}

export function nearestCity(lat: number, lon: number): City {
  let best = CITIES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const city of CITIES) {
    const dlat = city.lat - lat;
    const dlon = city.lon - lon;
    const dist = dlat * dlat + dlon * dlon;
    if (dist < bestDist) {
      best = city;
      bestDist = dist;
    }
  }
  return best;
}
