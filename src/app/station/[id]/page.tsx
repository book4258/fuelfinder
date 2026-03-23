/**
 * app/station/[id]/page.tsx
 * Full station detail page with fuel statuses, reports, and confidence.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Navigation, Share2, Edit3,
  ThumbsUp, ThumbsDown, MapPin, Clock, Bookmark, BookmarkCheck, Star,
} from 'lucide-react';
import { subscribeToStation, getStationReports, voteReport, toggleBookmark } from '@/lib/firestore';
import { FuelBadge }       from '@/components/ui/FuelBadge';
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter';
import { AdBanner }        from '@/components/ui/AdBanner';
import { useStore }        from '@/lib/store';
import { timeAgo, brandColor, runOutProbability, cn } from '@/lib/utils';
import { FUEL_LABELS }     from '@/types';
import type { Station, Report, FuelType } from '@/types';
import toast from 'react-hot-toast';

export default function StationDetailPage() {
  const params   = useParams();
  const id       = typeof params.id === 'string' ? params.id : '';
  const router   = useRouter();
  const { user, setUser } = useStore();

  const [station,   setStation] = useState<Station | null>(null);
  const [reports,   setReports] = useState<Report[]>([]);
  const [loading,   setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToStation(id, s => {
      setStation(s);
      setLoading(false);
    });
    getStationReports(id).then(setReports);
    // Fallback if Firestore fails (demo mode)
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => { unsub(); clearTimeout(timer); };
  }, [id]);

  const handleVote = async (reportId: string, vote: 'up' | 'down') => {
    if (!user) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
    await voteReport(reportId, user.uid, vote);
    setReports(prev => prev.map(r =>
      r.id === reportId
        ? { ...r,
            upvotes:   vote === 'up'   ? r.upvotes   + 1 : r.upvotes,
            downvotes: vote === 'down' ? r.downvotes + 1 : r.downvotes }
        : r
    ));
    toast.success(vote === 'up' ? '👍 ขอบคุณที่ยืนยัน!' : '👎 รับทราบแล้ว');
  };

  const handleBookmark = async () => {
    if (!user || !station) { toast.error('กรุณาเข้าสู่ระบบก่อน'); return; }
    const isBookmarked = user.bookmarks.includes(station.id);
    await toggleBookmark(user.uid, station.id, !isBookmarked);
    setUser({
      ...user,
      bookmarks: isBookmarked
        ? user.bookmarks.filter(b => b !== station.id)
        : [...user.bookmarks, station.id],
    });
    toast.success(isBookmarked ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรดแล้ว');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 space-y-3 pb-24">
        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!station) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 text-center pb-24">
        <p className="text-gray-500">ไม่พบสถานีนี้</p>
        <Link href="/" className="text-brand-500 mt-2 block">กลับหน้าหลัก</Link>
      </div>
    );
  }

  const risk         = runOutProbability(station);
  const isBookmarked = user?.bookmarks.includes(station.id) ?? false;

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 font-semibold text-gray-900 dark:text-white truncate">{station.name}</h1>
        {station.featured && (
          <span className="flex items-center gap-1 bg-brand-50 text-brand-600 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
            <Star size={11} className="fill-brand-500" /> แนะนำ
          </span>
        )}
        <button onClick={handleBookmark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
          {isBookmarked
            ? <BookmarkCheck size={20} className="text-brand-500" />
            : <Bookmark      size={20} className="text-gray-400" />
          }
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 animate-slide-up">

        {/* Brand card */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
            style={{ backgroundColor: brandColor(station.brand) }}
          >
            {station.brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{station.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{station.address}</p>
            </div>
            {station.openHours && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={12} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400">{station.openHours}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Risk alert */}
        {risk > 60 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-3 flex items-start gap-2">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                เสี่ยงน้ำมันหมด ({risk}%)
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
                AI วิเคราะห์จากรายงานล่าสุด — แนะนำโทรยืนยันก่อนเดินทาง
              </p>
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ความน่าเชื่อถือ</p>
          <ConfidenceMeter score={station.confidence} />
          <p className="text-xs text-gray-400 mt-2">
            มีรายงาน {station.reportCount} ครั้ง · อัปเดต {timeAgo(station.updatedAt)}
          </p>
        </div>

        {/* Fuels */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">สถานะน้ำมัน</p>
          <div className="space-y-2">
            {(Object.entries(station.fuels) as [FuelType, { available: boolean; price?: number; updatedAt: number }][]).map(
              ([fuel, fuelStatus]) => (
                <div key={fuel}>
                  <FuelBadge
                    fuel={fuel}
                    available={fuelStatus.available}
                    price={fuelStatus.price}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5 pl-1">
                    อัปเดต {timeAgo(fuelStatus.updatedAt)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          {station.phone && (
            <a
              href={`tel:${station.phone}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-card active:scale-95 transition-transform"
            >
              <Phone size={20} className="text-brand-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">โทรหา</span>
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-card active:scale-95 transition-transform"
          >
            <Navigation size={20} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">นำทาง</span>
          </a>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({ title: station.name, url: window.location.href });
              }
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-card active:scale-95 transition-transform"
          >
            <Share2 size={20} className="text-green-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">แชร์</span>
          </button>
        </div>

        {/* Report CTA */}
        <Link
          href={`/report?stationId=${station.id}`}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl py-4 transition-colors active:scale-[0.99]"
        >
          <Edit3 size={18} />
          รายงานสถานะน้ำมัน
        </Link>

        <AdBanner />

        {/* Recent reports */}
        {reports.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">รายงานล่าสุด</h3>
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        r.status === 'available'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : r.status === 'running_low'  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        :                              'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                      )}>
                        {r.status === 'available' ? '✅ มี' : r.status === 'running_low' ? '⚠️ เหลือน้อย' : '❌ หมด'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {FUEL_LABELS[r.fuelType as FuelType]}
                      </span>
                      {r.price && (
                        <span className="text-xs text-gray-400">฿{r.price}/ล.</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(r.timestamp)}</p>
                    {r.note && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">"{r.note}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleVote(r.id, 'up')}
                      className="flex items-center gap-0.5 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"
                    >
                      <ThumbsUp size={13} />
                      <span className="text-xs">{r.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(r.id, 'down')}
                      className="flex items-center gap-0.5 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <ThumbsDown size={13} />
                      <span className="text-xs">{r.downvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
