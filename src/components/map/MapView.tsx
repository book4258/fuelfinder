/**
 * components/map/MapView.tsx
 * Google Maps integration. Lazy-loaded (ssr: false).
 * Falls back to a static SVG placeholder if no API key is set.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useStore } from '@/lib/store';
import { brandColor, availableCount } from '@/lib/utils';
import type { Station } from '@/types';

// ── Custom SVG map pin ────────────────────────────────────────────────────────
function stationPin(station: Station, selected: boolean): string {
  const avail  = availableCount(station);
  const total  = Object.keys(station.fuels).length;
  const color  = avail === total ? '#10B981' : avail > 0 ? '#F59E0B' : '#EF4444';
  const bColor = brandColor(station.brand);
  const scale  = selected ? 1.3 : 1;
  const w      = Math.round(40 * scale);
  const h      = Math.round(48 * scale);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 40 48">
    <path d="M20 2C10 2 3 9 3 18c0 10 17 28 17 28s17-18 17-28c0-9-7-16-17-16z" fill="${bColor}"/>
    <circle cx="20" cy="18" r="10" fill="white"/>
    <circle cx="20" cy="18" r="6" fill="${color}"/>
    ${station.featured ? `<circle cx="30" cy="8" r="6" fill="#f97316"/><text x="30" y="12" text-anchor="middle" font-size="8" fill="white">★</text>` : ''}
  </svg>`;
}

// ── No-key fallback component ─────────────────────────────────────────────────
function MapFallback() {
  const { stations, setSelectedStation } = useStore();

  return (
    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex flex-col items-center justify-center gap-3">
      <div className="text-center px-6">
        <p className="text-4xl mb-2">🗺️</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">แผนที่ (Demo Mode)</p>
        <p className="text-xs text-gray-400 mt-1">เพิ่ม Google Maps API Key ใน .env.local เพื่อเปิดแผนที่จริง</p>
      </div>
      <div className="w-full max-w-xs space-y-2 px-4">
        {stations.slice(0, 3).map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedStation(s)}
            className="w-full text-left bg-white dark:bg-gray-700 rounded-xl px-3 py-2 shadow-sm text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            📍 {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main MapView ──────────────────────────────────────────────────────────────
export function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  // If no real API key, render fallback
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_KEY') {
    return <MapFallback />;
  }

  return <GoogleMapView apiKey={apiKey} />;
}

function GoogleMapView({ apiKey }: { apiKey: string }) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers     = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

  const { stations, selectedStation, userLocation, setSelectedStation } = useStore();

  const loader = useRef(new Loader({
    apiKey,
    version:   'weekly',
    libraries: ['places', 'marker'],
  }));

  // Initialise map
  useEffect(() => {
    if (!mapRef.current) return;
    loader.current.load().then(async () => {
      const { Map: GMap } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
      mapInstance.current = new GMap(mapRef.current!, {
        center:           userLocation ?? { lat: 13.736717, lng: 100.523186 },
        zoom:             11,
        mapId:            process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? 'DEMO_MAP_ID',
        disableDefaultUI: true,
        gestureHandling:  'greedy',
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to user location
  useEffect(() => {
    if (userLocation && mapInstance.current) {
      mapInstance.current.panTo(userLocation);
      mapInstance.current.setZoom(13);
    }
  }, [userLocation]);

  // Render markers
  const renderMarkers = useCallback(async () => {
    if (!mapInstance.current) return;
    const { AdvancedMarkerElement } =
      await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    const currentIds = new Set(stations.map(s => s.id));
    markers.current.forEach((m, id) => {
      if (!currentIds.has(id)) { m.map = null; markers.current.delete(id); }
    });

    stations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const el = document.createElement('div');
      el.innerHTML = stationPin(station, isSelected);
      el.style.cursor = 'pointer';

      if (markers.current.has(station.id)) {
        markers.current.get(station.id)!.content = el;
        return;
      }

      const marker = new AdvancedMarkerElement({
        map:      mapInstance.current!,
        position: { lat: station.lat, lng: station.lng },
        content:  el,
        title:    station.name,
      });

      marker.addListener('click', () => {
        setSelectedStation(station);
        mapInstance.current?.panTo({ lat: station.lat, lng: station.lng });
      });

      markers.current.set(station.id, marker);
    });
  }, [stations, selectedStation, setSelectedStation]);

  useEffect(() => {
    if (mapInstance.current) renderMarkers();
    else loader.current.load().then(renderMarkers);
  }, [renderMarkers]);

  // User location blue dot
  useEffect(() => {
    if (!userLocation || !mapInstance.current) return;
    loader.current.load().then(async () => {
      const { AdvancedMarkerElement } =
        await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      const el = document.createElement('div');
      el.innerHTML = `<div style="position:relative;width:20px;height:20px">
        <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;opacity:.25"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:#3B82F6;border:2px solid white"></div>
      </div>`;
      new AdvancedMarkerElement({
        map:      mapInstance.current!,
        position: userLocation,
        content:  el,
        title:    'ตำแหน่งของคุณ',
        zIndex:   999,
      });
    });
  }, [userLocation]);

  return <div ref={mapRef} className="h-full w-full" />;
}
