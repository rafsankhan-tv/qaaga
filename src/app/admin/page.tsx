'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import {
  DEFAULT_BRANDING,
  SiteBranding,
  GuestProfile,
  QaagaListing,
  BookingRecord,
  SUPER_ADMIN_EMAIL,
} from '@/data/listings';
import {
  persistBrandingEverywhere,
  readSyncLocalBranding,
  reconcileBrandingOnLoad,
} from '@/lib/brandingStorage.client';
import {
  getListingsFromDatabase,
  getBookingsFromDatabase,
} from '@/lib/supabaseService';
import { DashboardSkeleton } from '@/components/Skeletons';

const AdminPanelModal = dynamic(
  () => import('@/components/AdminPanelModal').then((m) => m.AdminPanelModal),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 py-6">
        <DashboardSkeleton />
      </div>
    ),
  }
);

export default function AdminPage() {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);
  const brandingRef = useRef<SiteBranding>(DEFAULT_BRANDING);
  const [userProfile, setUserProfile] = useState<GuestProfile | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [listings, setListings] = useState<QaagaListing[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    brandingRef.current = branding;
  }, [branding]);

  useEffect(() => {
    let active = true;
    try {
      const stored = localStorage.getItem('qaaga_v3_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        const emailLower = (parsed.email || '').trim().toLowerCase();
        if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setIsAuthorized(true);
        } else if (parsed.role && parsed.role !== 'admin') {
          setIsAuthorized(false);
        }
      }
    } catch {
      // ignore
    }

    const syncLocal = readSyncLocalBranding();
    if (syncLocal) {
      setBranding(syncLocal);
      brandingRef.current = syncLocal;
    }

    Promise.all([
      getListingsFromDatabase(),
      getBookingsFromDatabase(),
      reconcileBrandingOnLoad(),
    ]).then(([dbListings, dbBookings, resolvedBranding]) => {
      if (!active) return;
      setListings(dbListings || []);
      setBookings(dbBookings || []);
      setBranding(resolvedBranding);
      brandingRef.current = resolvedBranding;
    });

    return () => {
      active = false;
    };
  }, []);

  const persistBranding = useCallback(async (next: SiteBranding) => {
    setBranding(next);
    brandingRef.current = next;
    const saved = await persistBrandingEverywhere(next);
    setBranding(saved);
    brandingRef.current = saved;
  }, []);

  const handleRemoveLogo = useCallback(async () => {
    const removed: SiteBranding = {
      ...brandingRef.current,
      logoUrl: null,
    };
    await persistBranding(removed);
  }, [persistBranding]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    const restored: SiteBranding = {
      ...brandingRef.current,
      logoUrl: DEFAULT_BRANDING.logoUrl,
    };
    await persistBranding(restored);
  }, [persistBranding]);

  const handleGrantAdminAccess = () => {
    const updated: GuestProfile = {
      fullName: userProfile?.fullName || 'Rafsan Khan (Super Admin)',
      email: SUPER_ADMIN_EMAIL,
      city: 'Kuala Lumpur',
      role: 'admin',
      verified: true,
    };
    setUserProfile(updated);
    setIsAuthorized(true);
    try {
      localStorage.setItem('qaaga_v3_profile', JSON.stringify(updated));
    } catch {}
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Access Restricted</h1>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          This area requires administrative privileges. You are currently logged in with a{' '}
          <strong className="text-white capitalize">{userProfile?.role || 'Guest'}</strong> account.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </Link>
          <button
            type="button"
            onClick={handleGrantAdminAccess}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            <KeyRound size={14} />
            <span>Switch to Admin Mode</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPanelModal
      branding={branding}
      onUpdateBranding={persistBranding}
      onRemoveLogo={handleRemoveLogo}
      onRestoreDefaultLogo={handleRestoreDefaultLogo}
      allListings={listings}
      bookings={bookings}
      standalone={true}
    />
  );
}

