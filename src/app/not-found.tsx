'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, Home, Search, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      {/* Top Brand Bar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 sm:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 focus:outline-none">
          <span className="text-2xl font-black tracking-tight text-[#C72B62]">qaaga</span>
          <span className="text-2xl font-light text-slate-900">.com</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-700 hover:text-[#C72B62] flex items-center gap-1.5 transition-colors"
        >
          <Home size={15} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-12">
        <div className="w-20 h-20 rounded-3xl bg-[#C72B62]/[0.08] border border-[#C72B62]/20 text-[#C72B62] flex items-center justify-center mb-6 shadow-sm">
          <Compass size={40} strokeWidth={2.2} className="animate-spin-slow" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
          We can&apos;t seem to find the page you&apos;re looking for
        </h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-md">
          The link you followed may be broken, or the page may have been moved.
          Explore our verified stays in Kuala Lumpur or return to the marketplace.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(199,43,98,0.25)]"
          >
            <Home size={16} />
            <span>Go to Homepage</span>
          </Link>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold transition-colors shadow-2xs"
          >
            <Search size={16} />
            <span>Explore All Rooms</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold transition-colors shadow-2xs"
          >
            <ShieldCheck size={16} />
            <span>Help Center</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
        <p>© 2026 qaaga.com · Stays, Experiences & Hospitality Services</p>
      </footer>
    </div>
  );
}
