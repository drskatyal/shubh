import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { isShotMode, readShotId } from '../preview/shot';
import { loadCity, saveCity } from '../storage/preferences';
import { CITIES, nearestCity, type City } from './cities';

export type PlaceState = {
  city: City | null;
  ready: boolean;
  locating: boolean;
  denied: boolean;
  setCity: (city: City) => void;
  requestLocation: () => Promise<void>;
};

async function cityFromDevice(): Promise<City | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = position.coords;
  try {
    const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const name = geo?.city || geo?.subregion || geo?.district;
    if (name) {
      const known = CITIES.find(
        (item) => item.nameEn.toLowerCase() === name.toLowerCase(),
      );
      if (known) {
        return known;
      }
      return {
        id: `gps:${latitude.toFixed(3)},${longitude.toFixed(3)}`,
        nameEn: name,
        nameHi: name,
        countryEn: geo.country ?? '',
        countryHi: geo.country ?? '',
        lat: latitude,
        lon: longitude,
      };
    }
  } catch {
    // Reverse geocode is optional; nearest curated city still works.
  }
  const near = nearestCity(latitude, longitude);
  return { ...near, lat: latitude, lon: longitude };
}

export function usePlace(): PlaceState {
  const [city, setCityState] = useState<City | null>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const setCity = useCallback((next: City) => {
    setCityState(next);
    setDenied(false);
    void saveCity(next);
  }, []);

  const requestLocation = useCallback(async () => {
    setLocating(true);
    try {
      const found = await cityFromDevice();
      if (found) {
        setCity(found);
      } else {
        setDenied(true);
      }
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  }, [setCity]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isShotMode()) {
        if (!cancelled) {
          setCityState(readShotId() === 'firstopen' ? null : (CITIES[0] ?? null));
          setReady(true);
        }
        return;
      }
      const stored = await loadCity();
      if (cancelled) {
        return;
      }
      if (stored) {
        setCityState(stored);
        setReady(true);
        return;
      }
      setReady(true);
      await requestLocation();
    })();
    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  return { city, ready, locating, denied, setCity, requestLocation };
}
