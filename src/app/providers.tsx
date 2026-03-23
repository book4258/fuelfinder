/**
 * app/providers.tsx
 * Client-side providers wrapped in Suspense for usePathname/useSearchParams.
 */

'use client';

import { Suspense, useEffect } from 'react';
import { Toaster }             from 'react-hot-toast';
import { useStore }            from '@/lib/store';
import { useAuth }             from '@/hooks/useAuth';
import BottomNav from "@/components/layout/BottomNav";

function DarkModeSync() {
  const { darkMode } = useStore();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return null;
}

function AuthInit() {
  useAuth();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DarkModeSync />
      <AuthInit />
      {children}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            fontFamily:   'var(--font-body)',
            fontSize:     '14px',
            fontWeight:   '500',
          },
        }}
      />
    </>
  );
}
