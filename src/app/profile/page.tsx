/**
 * app/profile/page.tsx
 * User profile: trust score, report history, bookmarks.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import { Shield, BookmarkCheck, LogOut, Crown, ChevronRight } from 'lucide-react';
import { useStore }            from '@/lib/store';
import { useAuth }             from '@/hooks/useAuth';
import { StationCard }         from '@/components/ui/StationCard';
import { getStations }         from '@/lib/firestore';
import { confidenceColor }     from '@/lib/utils';
import type { Station }        from '@/types';
import Link                    from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useStore();
  const { signInWithGoogle, logout } = useAuth();
  const [bookmarkedStations, setBookmarkedStations] = useState<Station[]>([]);

  useEffect(() => {
    if (!user?.bookmarks.length) return;
    getStations().then(all =>
      setBookmarkedStations(all.filter(s => user.bookmarks.includes(s.id)))
    );
  }, [user]);

  /* ── Not logged in ─────────────────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 pt-24 pb-24 flex flex-col items-center text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">เข้าสู่ระบบ</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          เพื่อดูประวัติการรายงาน รายการโปรด และคะแนนความน่าเชื่อถือของคุณ
        </p>
        <button
          onClick={signInWithGoogle}
          className="mt-6 w-full bg-brand-500 text-white font-semibold py-3.5 rounded-2xl hover:bg-brand-600 active:bg-brand-700 transition-colors"
        >
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    );
  }

  const trustColor = confidenceColor(user.trustScore);
  const trustLabel =
    user.trustScore >= 80 ? 'ผู้รายงานที่น่าเชื่อถือ' :
    user.trustScore >= 60 ? 'ผู้รายงานทั่วไป' :
                            'ผู้ใช้ใหม่';

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Page header */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">โปรไฟล์</h1>
      </div>

      <div className="px-4 space-y-4 animate-slide-up">

        {/* User card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {user.displayName?.charAt(0) ?? 'U'}
                </div>
              )}
              {user.isPremium && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 rounded-full p-1">
                  <Crown size={10} className="text-white" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">{user.displayName}</h2>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {user.isPremium && (
                <span className="inline-flex items-center gap-1 mt-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Crown size={10} /> Premium
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trust score */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: trustColor }} />
              <span className="font-medium text-gray-900 dark:text-white text-sm">คะแนนความน่าเชื่อถือ</span>
            </div>
            <span className="text-2xl font-semibold" style={{ color: trustColor }}>
              {user.trustScore}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${user.trustScore}%`, backgroundColor: trustColor }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {trustLabel} · รายงานแล้ว {user.reportCount} ครั้ง
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card text-center">
            <p className="text-2xl font-semibold text-brand-500">{user.reportCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">รายงานทั้งหมด</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card text-center">
            <p className="text-2xl font-semibold text-emerald-500">{user.bookmarks.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">สถานีโปรด</p>
          </div>
        </div>

        {/* Premium upgrade banner */}
        {!user.isPremium && (
          <Link
            href="/premium"
            className="flex items-center gap-3 rounded-3xl p-4 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}
          >
            <Crown size={24} className="text-white flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">อัปเกรดเป็น Premium</p>
              <p className="text-white/80 text-xs mt-0.5">รับการแจ้งเตือน · ซ่อนโฆษณา · ฟีเจอร์พิเศษ</p>
            </div>
            <ChevronRight size={18} className="text-white flex-shrink-0" />
          </Link>
        )}

        {/* Bookmarked stations */}
        {bookmarkedStations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookmarkCheck size={16} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">สถานีโปรด</h3>
            </div>
            <div className="space-y-2">
              {bookmarkedStations.map(s => (
                <StationCard
                  key={s.id}
                  station={s}
                  compact
                  onClick={() => router.push(`/station/${s.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 dark:border-red-800 text-red-500 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
