/**
 * hooks/useNearby.ts
 * Gets user location via browser Geolocation API,
 * stores it in Zustand, and returns sorted nearby stations.
 */

'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { sortByDistance, distanceKm } from '@/lib/utils';
import type { Station } from '@/types';

export function useNearby() {
  const { stations, userLocation, setUserLocation } = useStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาต GPS');
        setLoading(false);
      },
      { timeout: 10_000 },
    );
  };

  const nearby: (Station & { distanceKm: number })[] = userLocation
    ? sortByDistance(stations, userLocation.lat, userLocation.lng)
        .slice(0, 10)
        .map(s => ({
          ...s,
          distanceKm: +distanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng).toFixed(1),
        }))
    : [];

  return { nearby, userLocation, loading, error, requestLocation };
}
