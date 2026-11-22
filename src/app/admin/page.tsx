'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import {
  DEFAULT_BRANDING,
  SiteBranding,
  GuestProfile,
  QaagaListing,
  BookingRecord,
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
import { getSupabase } from '@/lib/supabaseClient';
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

type AdminAuthState = 'checking' | 'authorized' | 'denied';

export default function AdminPage() {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);
  const brandingRef = useRef<SiteBranding>(DEFAULT_BRANDING);
  const [userProfile, setUserProfile] = useState<GuestProfile | null>(null);
  const [authState, setAuthState] = useState<AdminAuthState>('checking');
  const [listings, setListings] = useState<QaagaListing[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    brandingRef.current = branding;
  }, [branding]);

  useEffect(() => {
    let active = true;

    const loadAdminDashboard = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        if (active) setAuthState('denied');
        return;
      }

      // Only Supabase's verified app_metadata claim is trusted for admin access.
      // localStorage, user_metadata, and editable profile fields are not authorization.
      const { data, error } = await supabase.auth.getUser();
      const user = data.user;
      if (error || !user?.id || user.app_metadata?.role !== 'admin') {
        if (active) {
          setUserProfile(user ? {
            fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'Member',
            email: user.email || '',
            city: 'Dhaka',
            role: 'guest',
            verified: Boolean(user.email_confirmed_at),
          } : null);
          setAuthState('denied');
        }
        return;
      }

      if (!active) return;
      setUserProfile({
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'Administrator',
        email: user.email || '',
        city: 'Dhaka',
        role: 'admin',
        verified: Boolean(user.email_confirmed_at),
      });

      const syncLocal = readSyncLocalBranding();
      if (syncLocal) {
        setBranding(syncLocal);
        brandingRef.current = syncLocal;
      }

      const [dbListings, dbBookings, resolvedBranding] = await Promise.all([
        getListingsFromDatabase(),
        getBookingsFromDatabase(),
        reconcileBrandingOnLoad(),
      ]);

      if (!active) return;
      setListings(dbListings || []);
      setBookings(dbBookings || []);
      setBranding(resolvedBranding);
      brandingRef.current = resolvedBranding;
      setAuthState('authorized');
    };

    loadAdminDashboard().catch(() => {
      if (active) setAuthState('denied');
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

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 py-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Access Restricted</h1>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          This area requires a verified administrator account. You are currently signed in as{' '}
          <strong className="text-white">{userProfile?.email || 'a guest'}</strong>.
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
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/roles" className="fixed right-5 top-5 z-[100] inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-slate-800">
        <ShieldAlert size={14} /> Role Management
      </Link>
      <AdminPanelModal
        branding={branding}
        onUpdateBranding={persistBranding}
        onRemoveLogo={handleRemoveLogo}
        onRestoreDefaultLogo={handleRestoreDefaultLogo}
        allListings={listings}
        bookings={bookings}
        standalone={true}
      />
    </>
  );
}
