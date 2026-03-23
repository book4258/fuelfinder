/**
 * components/layout/BottomNav.tsx
 * Mobile bottom tab bar — must be wrapped in <Suspense> by the parent
 * because usePathname() requires it in Next.js 14 App Router.
 */

'use client';

import Link         from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, List, PlusCircle, User, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/',        Icon: Map,        label: 'แผนที่'  },
  { href: '/list',    Icon: List,       label: 'รายการ'  },
  { href: '/report',  Icon: PlusCircle, label: 'รายงาน', accent: true },
  { href: '/profile', Icon: User,       label: 'โปรไฟล์' },
  { href: '/premium', Icon: Crown,      label: 'Premium' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="max-w-md mx-auto flex items-end h-[60px]">
        {TABS.map(({ href, Icon, label, accent = "text-blue-500" }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
                active && !accent ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500',
              )}
            >
              {accent ? (
                <div className={cn(
                  'rounded-2xl p-2.5 mb-3',
                  active ? 'bg-brand-600' : 'bg-brand-500',
                  'shadow-[0_0_0_4px_rgba(249,115,22,.2)]',
                )}>
                  <Icon size={18} className="text-white" />
                </div>
              ) : (
                <Icon size={20} className={cn(active ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500')} />
              )}
              <span className={cn(
                'text-[10px] font-medium',
                accent && 'absolute bottom-1',
                active && !accent ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500',
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
