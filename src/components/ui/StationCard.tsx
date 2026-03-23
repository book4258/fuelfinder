/**
 * components/ui/StationCard.tsx
 * Station card component — compact (list row) and full (detail card) variants.
 */

'use client';

import { Star, Clock, ChevronRight, MapPin, Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import { useStore }          from '@/lib/store';
import { timeAgo, brandColor, runOutProbability, cn } from '@/lib/utils';
import { FuelBadge }         from './FuelBadge';
import { ConfidenceMeter }   from './ConfidenceMeter';
import { toggleBookmark }    from '@/lib/firestore';
import type { Station, FuelType } from '@/types';
import toast                 from 'react-hot-toast';

interface Props {
  station:   Station;
  distance?: number;
  compact?:  boolean;
  onClick?:  () => void;
}

export function StationCard({ station, distance, compact, onClick }: Props) {
  const { user, setUser } = useStore();
  const isBookmarked      = !!user?.bookmarks.includes(station.id);
  const risk              = runOutProbability(station);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
    await toggleBookmark(user.uid, station.id, !isBookmarked);
    setUser({
      ...user,
      bookmarks: isBookmarked
        ? user.bookmarks.filter(id => id !== station.id)
        : [...user.bookmarks, station.id],
    });
    toast.success(isBookmarked ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรดแล้ว');
  };

  /* ── Compact variant (list row) ────────────────────────────────────────── */
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-card active:scale-[0.98] transition-transform text-left"
      >
        <div
          className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: brandColor(station.brand) }}
        >
          {station.brand.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{station.name}</p>
          <p className="text-xs text-gray-400 truncate">{station.address}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(Object.keys(station.fuels) as FuelType[]).slice(0, 4).map(f => (
              <FuelBadge key={f} fuel={f} available={!!station.fuels[f]?.available} compact />
            ))}
          </div>
        </div>
        {distance !== undefined && distance > 0 && (
          <span className="text-xs text-brand-500 font-semibold flex-shrink-0">{distance} กม.</span>
        )}
        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
      </button>
    );
  }

  /* ── Full card variant ─────────────────────────────────────────────────── */
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden cursor-pointer',
        'active:scale-[0.99] transition-all duration-150',
        station.featured && 'ring-2 ring-brand-400',
      )}
    >
      {/* Featured banner */}
      {station.featured && (
        <div className="bg-gradient-to-r from-brand-500 to-orange-400 px-4 py-1.5 flex items-center gap-1.5">
          <Star size={12} className="text-white fill-white" />
          <span className="text-xs font-semibold text-white">สถานีแนะนำ</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0"
              style={{ backgroundColor: brandColor(station.brand) }}
            >
              {station.brand.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
                {station.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-400 truncate">{station.province}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {isBookmarked
              ? <BookmarkCheck size={18} className="text-brand-500" />
              : <Bookmark      size={18} className="text-gray-400" />
            }
          </button>
        </div>

        {/* Fuels grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.entries(station.fuels) as [FuelType, { available: boolean; price?: number }][]).map(
            ([fuel, fs]) => (
              <FuelBadge key={fuel} fuel={fuel} available={fs.available} price={fs.price} />
            )
          )}
        </div>

        {/* Confidence */}
        <ConfidenceMeter score={station.confidence} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            <span>อัปเดต {timeAgo(station.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {risk > 60 && (
              <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                <Zap size={11} />
                เสี่ยงหมดเร็ว
              </span>
            )}
            {distance !== undefined && distance > 0 && (
              <span className="text-xs font-semibold text-brand-500 bg-brand-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                {distance} กม.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
