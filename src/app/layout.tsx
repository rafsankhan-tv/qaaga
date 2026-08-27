import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QAAGA Super Marketplace | সার্ভিস, ডাক্তার, নার্সিং, হোটেল, শপ ও ইবুক',
  description: 'বাংলাদেশের সর্বাধুনিক মাল্টি-সার্ভিস ও ইকমার্স সুপার প্ল্যাটফর্ম। বাসা-বাড়ির কাজ, ডাক্তার সিরিয়াল, নার্সিং সেবা, হোটেল বুকিং, অনলাইন শপিং ও ইবুক রিডার।',
  keywords: ['QAAGA', 'Bangladesh Marketplace', 'Home Services', 'Doctor Appointment', 'Nursing Caregiver', 'Hotel Booking', 'E-commerce', 'eBook'],
  authors: [{ name: 'QAAGA Marketplace' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4e20b8',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Hind_Siliguri',sans-serif] antialiased bg-slate-50 text-slate-900 selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
