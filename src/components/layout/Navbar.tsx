/**
 * components/layout/Navbar.tsx
 * Top navigation bar with search, dark mode toggle, and auth.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Moon, Sun, User, LogOut, Crown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth }  from '@/hooks/useAuth';

export function Navbar() {
  const { darkMode, toggleDarkMode } = useStore();
  const { user, signInWithGoogle, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xl">⛽</span>
          <span className="font-semibold text-gray-900 dark:text-white text-base leading-none">
            Fuel<span className="text-brand-500">TH</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="ค้นหาสถานี..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl bg-gray-100 dark:bg-gray-800
              text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none
              focus:ring-2 focus:ring-brand-400 transition-all"
          />
        </div>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {darkMode
            ? <Sun  size={18} className="text-yellow-400" />
            : <Moon size={18} className="text-gray-500" />
          }
        </button>

        {/* Auth / Profile */}
        {user ? (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
                  {user.displayName?.charAt(0) ?? 'U'}
                </div>
              )}
              {user.isPremium && (
                <Crown size={11} className="text-yellow-500 absolute -top-1 -right-1" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-card-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-400">คะแนน {user.trustScore}/100</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <User size={14} /> โปรไฟล์
                </Link>
                {!user.isPremium && (
                  <Link
                    href="/premium"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 font-medium hover:bg-brand-50 dark:hover:bg-orange-900/20"
                  >
                    <Crown size={14} className="text-yellow-500" /> อัปเกรด Premium
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={14} /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex-shrink-0 bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-brand-600 active:bg-brand-700 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </header>
  );
}
