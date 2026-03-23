/**
 * app/page.tsx
 * Home page: map + filter chips + nearby stations panel.
 */

'use client';

import { useEffect, useState }  from 'react';
import dynamic                  from 'next/dynamic';
import { LocateFixed, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore }             from '@/lib/store';
import { getStations }          from '@/lib/firestore';
import { FilterBar }            from '@/components/ui/FilterBar';
import { StationCard }          from '@/components/ui/StationCard';
import { AdBanner }             from '@/components/ui/AdBanner';
import { Navbar }               from '@/components/layout/Navbar';
import { useNearby }            from '@/hooks/useNearby';
import { cn }                   from '@/lib/utils';

// Lazy-load map and bottom-sheet — they need browser APIs
const MapView = dynamic(
  () => import('@/components/map/MapView').then(m => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
        <p className="text-gray-400 text-sm">กำลังโหลดแผนที่...</p>
      </div>
    ),
  },
);
const BottomSheet = dynamic(
  () => import('@/components/map/BottomSheet').then(m => m.BottomSheet),
  { ssr: false },
);

export default function HomePage() {
  const { setStations, setSelectedStation, filters, stations } = useStore();
  const { nearby, loading: locLoading, requestLocation } = useNearby();
  const [listOpen,    setListOpen]    = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    setDataLoading(true);
    getStations(filters)
      .then(setStations)
      .finally(() => setDataLoading(false));
  }, [filters, setStations]);

  // Show all stations in list if no geolocation yet
  const displayList = nearby.length > 0
    ? nearby
    : stations.slice(0, 10).map(s => ({ ...s, distanceKm: 0 }));

  return (
    <div className="flex flex-col h-[100svh] max-w-md mx-auto overflow-hidden relative">
      <Navbar />

      {/* Filter bar overlay */}
      <div className="absolute top-14 left-0 right-0 z-20 px-4 py-2 max-w-md mx-auto pointer-events-none">
        <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm rounded-2xl shadow-card px-3 py-2 pointer-events-auto">
          <FilterBar />
        </div>
      </div>

      {/* Map fills remaining space */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapView />

        {/* Locate me */}
        <button
          onClick={requestLocation}
          disabled={locLoading}
          aria-label="ระบุตำแหน่งของฉัน"
          className={cn(
            'absolute bottom-20 right-4 z-10',
            'bg-white dark:bg-gray-800 rounded-2xl shadow-card p-3',
            'active:scale-95 transition-transform',
            locLoading && 'opacity-60 cursor-wait',
          )}
        >
          <LocateFixed
            size={22}
            className={locLoading ? 'text-brand-400 animate-spin' : 'text-brand-500'}
          />
        </button>

        {/* Nearby panel toggle */}
        <button
          onClick={() => setListOpen(o => !o)}
          className="absolute bottom-20 left-4 z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-card px-4 py-2.5 flex items-center gap-2 active:scale-95 transition-transform"
        >
          {listOpen
            ? <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
            : <ChevronUp   size={16} className="text-gray-600 dark:text-gray-300" />
          }
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {displayList.length > 0 ? `${displayList.length} ปั๊มใกล้คุณ` : 'สถานีใกล้เคียง'}
          </span>
        </button>

        {/* Nearby stations slide-up panel */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-20',
            'bg-white dark:bg-gray-900 rounded-t-3xl shadow-card-lg',
            'transition-transform duration-300 ease-out',
            listOpen ? 'translate-y-0' : 'translate-y-full',
          )}
          style={{ maxHeight: '58vh' }}
        >
          <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: '58vh' }}>
            <div className="p-4">
              {/* Drag handle */}
              <div className="mx-auto h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />

              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                🛵 ปั๊มใกล้คุณ
              </h2>

              {!nearby.length && (
                <button
                  onClick={requestLocation}
                  className="w-full py-3 rounded-2xl bg-brand-50 dark:bg-orange-900/20 text-brand-600 text-sm font-medium mb-3"
                >
                  📍 อนุญาตใช้ตำแหน่งเพื่อค้นหาปั๊มใกล้คุณ
                </button>
              )}

              <AdBanner />

              <div className="space-y-2">
                {dataLoading
                  ? [1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))
                  : displayList.map(s => (
                      <StationCard
                        key={s.id}
                        station={s}
                        distance={s.distanceKm > 0 ? s.distanceKm : undefined}
                        compact
                        onClick={() => {
                          setSelectedStation(s);
                          setListOpen(false);
                        }}
                      />
                    ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomSheet />
    </div>
  );
}
