/**
 * app/list/page.tsx
 * Browse all stations as a scrollable card list with filters.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import { useStore }            from '@/lib/store';
import { getStations }         from '@/lib/firestore';
import { StationCard }         from '@/components/ui/StationCard';
import { FilterBar }           from '@/components/ui/FilterBar';
import { AdBanner }            from '@/components/ui/AdBanner';
import { useNearby }           from '@/hooks/useNearby';
import { distanceKm }          from '@/lib/utils';

export default function ListPage() {
  const router = useRouter();
  const { filters, setStations, stations } = useStore();
  const { userLocation } = useNearby();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStations(filters)
      .then(setStations)
      .finally(() => setLoading(false));
  }, [filters, setStations]);

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Sticky header with filters */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h1 className="font-semibold text-gray-900 dark:text-white mb-2">ปั๊มน้ำมันทั้งหมด</h1>
        <FilterBar />
      </div>

      <div className="px-4 py-4 space-y-3">
        <AdBanner />

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-3xl" />
          ))
        ) : stations.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ไม่พบสถานีที่ตรงกับตัวกรอง
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {stations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                distance={
                  userLocation
                    ? +distanceKm(
                        userLocation.lat, userLocation.lng,
                        station.lat,      station.lng,
                      ).toFixed(1)
                    : undefined
                }
                onClick={() => router.push(`/station/${station.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
