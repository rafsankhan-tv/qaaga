import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QAAGA Super Marketplace',
  description:
    "qaaga.com is Bangladesh's verified multi-service super marketplace for on-demand services, repairs, doctors, home care, hotels, products, and jobs.",
  openGraph: {
    title: 'QAAGA Super Marketplace',
    description:
      "qaaga.com is Bangladesh's verified multi-service super marketplace for on-demand services, repairs, doctors, home care, hotels, products, and jobs.",
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C72B62',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] antialiased bg-white text-slate-900 selection:bg-[#C72B62] selection:text-white">
        {children}
      </body>
    </html>
  );
}
