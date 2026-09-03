'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="flex min-h-screen flex-col items-center justify-center p-4 font-sans antialiased bg-slate-50 text-slate-900">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে</h2>
          <p className="text-sm text-slate-600">অনুগ্রহ করে পেজটি আবার রিফ্রেশ করুন বা কিছুক্ষণ পর চেষ্টা করুন।</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
