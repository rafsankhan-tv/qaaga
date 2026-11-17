import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { FaviconHeadSync } from '@/components/FaviconHeadSync';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import './globals.css';

export const dynamic = 'force-dynamic';

const BLANK_TRANSPARENT_ICON =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export async function generateMetadata(): Promise<Metadata> {
  const branding = await readServerBranding();
  const activeIcon = branding.faviconUrl || BLANK_TRANSPARENT_ICON;

  return {
    title: 'QAAGA | Stays, Experiences & Services',
    description:
      'Discover stays, experiences and local services with QAAGA.',
    openGraph: {
      title: 'QAAGA | Stays, Experiences & Services',
      description: 'Discover stays, experiences and local services with QAAGA.',
      type: 'website',
    },
    icons: {
      icon: activeIcon,
      shortcut: activeIcon,
      apple: activeIcon,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C72B62',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialBranding = await readServerBranding();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        {supabaseUrl ? (
          <>
            <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        ) : null}
      </head>
      <body className="antialiased bg-white text-slate-900 selection:bg-[#C72B62] selection:text-white">
        <FaviconHeadSync initialBranding={initialBranding} />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
