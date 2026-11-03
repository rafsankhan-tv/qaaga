'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-slate-200">
          <p className="text-xl font-bold text-[#C72B62]">qaaga.com</p>
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500">
            Please refresh the page or click below to try again.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-400">Ref: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
