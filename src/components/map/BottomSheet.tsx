/**
 * components/map/BottomSheet.tsx
 * Station quick-view slide-up sheet.
 */

'use client';

import Link from 'next/link';
import { X, Phone, Navigation, Share2, Edit3, Clock, MapPin } from 'lucide-react';
import { useStore }        from '@/lib/store';
import { FuelBadge }       from '@/components/ui/FuelBadge';
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter';
import { timeAgo, brandColor } from '@/lib/utils';
import type { FuelType } from '@/types';
import { cn } from '@/lib/utils';

export function BottomSheet() {
  const { selectedStation, setSelectedStation, bottomSheetOpen, setBottomSheetOpen } = useStore();

  const close = () => {
    setBottomSheetOpen(false);
    setTimeout(() => setSelectedStation(null), 300);
  };

  if (!selectedStation) return null;
  const s = selectedStation;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          'fixed inset-0 bg-black/30 z-40 transition-opacity duration-300',
          bottomSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white dark:bg-gray-900 rounded-t-3xl shadow-card-lg',
          'transition-transform duration-300 ease-out',
          'max-h-[82vh] overflow-y-auto',
          bottomSheetOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 pt-3 pb-2 px-4 z-10 border-b border-gray-100 dark:border-gray-800">
          <div className="mx-auto h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-4">
              {s.name}
            </h2>
            <button
              onClick={close}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4 pt-3">
          {/* Brand row */}
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-semibold flex-shrink-0"
              style={{ backgroundColor: brandColor(s.brand) }}
            >
              {s.brand.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.address}</p>
              </div>
              {s.openHours && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-400">{s.openHours}</p>
                </div>
              )}
            </div>
          </div>

          {/* Confidence */}
          <ConfidenceMeter score={s.confidence} />

          {/* Fuels */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              ประเภทน้ำมัน
            </p>
            <div className="space-y-1.5">
              {(Object.entries(s.fuels) as [FuelType, { available: boolean; price?: number }][]).map(
                ([fuel, fuelStatus]) => (
                  <FuelBadge
                    key={fuel}
                    fuel={fuel}
                    available={fuelStatus.available}
                    price={fuelStatus.price}
                  />
                )
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 active:bg-gray-100"
              >
                <Phone size={18} className="text-brand-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">โทร</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 active:bg-gray-100"
            >
              <Navigation size={18} className="text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">นำทาง</span>
            </a>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({ title: s.name, url: `/station/${s.id}` });
                }
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 active:bg-gray-100"
            >
              <Share2 size={18} className="text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">แชร์</span>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            อัปเดตเมื่อ {timeAgo(s.updatedAt)} · {s.reportCount} รายงาน
          </p>

          {/* Report CTA */}
          <Link
            href={`/report?stationId=${s.id}`}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-2xl py-3.5 transition-colors"
          >
            <Edit3 size={16} />
            รายงานสถานะน้ำมัน
          </Link>

          {/* Full detail link */}
          <Link
            href={`/station/${s.id}`}
            className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-2xl py-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
          >
            ดูรายละเอียดทั้งหมด →
          </Link>
        </div>
      </div>
    </>
  );
}
