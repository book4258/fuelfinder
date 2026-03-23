/**
 * components/ui/AdBanner.tsx
 * Non-intrusive ad banner for free users.
 * Replace the placeholder div with a real <ins class="adsbygoogle"> in production.
 */

'use client';

import { useState } from 'react';
import { X }        from 'lucide-react';
import { useStore } from '@/lib/store';

export function AdBanner() {
  const { user }          = useStore();
  const [hidden, setHidden] = useState(false);

  // Premium users and dismissed banners: render nothing
  if (user?.isPremium || hidden) return null;

  return (
    <div className="relative mx-0 my-2 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700">
      <span className="absolute top-1.5 left-2.5 text-[10px] text-gray-400 font-medium select-none">
        โฆษณา
      </span>

      {/*
        PRODUCTION: replace this div with your AdSense tag, e.g.:
        <ins className="adsbygoogle" style={{display:'block'}}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto" />
      */}
      <div className="flex items-center justify-center h-12 px-8">
        <p className="text-xs text-gray-400 text-center">
          พื้นที่โฆษณา ·{' '}
          <a href="/premium" className="text-brand-500 underline underline-offset-2">
            อัปเกรด Premium
          </a>{' '}
          เพื่อซ่อนโฆษณา
        </p>
      </div>

      <button
        onClick={() => setHidden(true)}
        aria-label="ปิดโฆษณา"
        className="absolute top-1.5 right-1.5 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
