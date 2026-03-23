/**
 * app/layout.tsx
 * Root layout with Thai font, dark mode, PWA meta.
 */

import type { Metadata, Viewport } from 'next';
import { Sarabun } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const sarabun = Sarabun({
  subsets:  ['latin', 'thai'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'FuelTH – หาน้ำมันใกล้คุณ',
  description: 'ตรวจสอบน้ำมันว่าง-เต็มแบบเรียลไทม์จากปั๊มทั่วไทย',
  keywords:    ['น้ำมัน', 'ปั๊ม', 'ดีเซล', 'แก๊สโซฮอล์', 'Thailand fuel'],
  manifest:    '/manifest.json',
  openGraph: {
    type:        'website',
    locale:      'th_TH',
    title:       'FuelTH',
    description: 'หาปั๊มน้ำมันและเช็คสถานะน้ำมันใกล้คุณแบบเรียลไทม์',
    siteName:    'FuelTH',
  },
};

export const viewport: Viewport = {
  themeColor:   '#f97316',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit:  'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
      </head>
      <body className={`${sarabun.variable} font-body bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
