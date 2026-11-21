'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, LogIn, ShieldAlert } from 'lucide-react';
import {
  DEFAULT_BRANDING,
  SiteBranding,
  QaagaListing,
  BookingRecord,
} from '@/data/listings';
import {
  persistBrandingEverywhere,
  readSyncLocalBranding,
  reconcileBrandingOnLoad,
} from '@/lib/brandingStorage.client';
import { getSupabase } from '@/lib/supabaseClient';
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

type AdminAuthState = 'checking' | 'authorized' | 'denied';

export default function AdminPage() {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);
  const brandingRef = useRef<SiteBranding>(DEFAULT_BRANDING);
  const [authState, setAuthState] = useState<AdminAuthState>('checking');
  const [authMessage, setAuthMessage] = useState('Checking your secure administrator session…');
  const [listings, setListings] = useState<QaagaListing[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    brandingRef.current = branding;
  }, [branding]);

  useEffect(() => {
    let active = true;

    const loadAdmin = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        if (active) {
          setAuthMessage('Supabase is not configured for this deployment. Add the public project URL and publishable key in the deployment environment.');
          setAuthState('denied');
        }
        return;
      }

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (sessionError || !accessToken) {
          if (active) {
            setAuthMessage('Please log in with your QAAGA administrator account to continue.');
            setAuthState('denied');
          }
          return;
        }

        // Fetch the user from Supabase Auth; never trust localStorage or user_metadata for privileges.
        const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
        const authUser = authData.user;
        const email = authUser?.email?.trim().toLowerCase();

        if (authError || !authUser?.id || !email) {
          if (active) {
            setAuthMessage('Your login session is invalid or expired. Please log in again.');
            setAuthState('denied');
          }
          return;
        }

        // Only a trusted Supabase app_metadata claim can grant administrator access.
        if (authUser.app_metadata?.role !== 'admin') {
          if (active) {
            setAuthMessage('This account does not have administrator privileges. Contact the QAAGA Super Admin if you need access.');
            setAuthState('denied');
          }
          return;
        }

        // Confirm the account is active in the database as well as in the signed Auth claim.
        const profileResponse = await fetch(
          '/api/auth/profile?email=' + encodeURIComponent(email),
          { headers: { Authorization: 'Bearer ' + accessToken }, cache: 'no-store' }
        );
        const profileResult = await profileResponse.json().catch(() => ({}));
        if (
          !profileResponse.ok ||
          profileResult?.profile?.role !== 'admin' ||
          profileResult?.profile?.status !== 'active'
        ) {
          if (active) {
            setAuthMessage('Your Supabase administrator claim or active admin profile is missing. Sign in again after the Super Admin completes secure admin onboarding.');
            setAuthState('denied');
          }
          return;
        }

        if (!active) return;
        setAuthState('authorized');

        const localBranding = readSyncLocalBranding();
        if (localBranding) {
          setBranding(localBranding);
          brandingRef.current = localBranding;
        }

        const results = await Promise.allSettled([
          getListingsFromDatabase(),
          getBookingsFromDatabase(),
          reconcileBrandingOnLoad(),
        ]);

        if (!active) return;

        if (results[0].status === 'fulfilled') {
          setListings(results[0].value || []);
        } else {
          setDashboardError('Listings could not be loaded. Check the database access policies.');
        }

        if (results[1].status === 'fulfilled') {
          setBookings(results[1].value || []);
        } else {
          setDashboardError((current) => current || 'Bookings could not be loaded. Check the database access policies.');
        }

        if (results[2].status === 'fulfilled' && results[2].value) {
          setBranding(results[2].value);
          brandingRef.current = results[2].value;
        }
      } catch {
        if (active) {
          setAuthMessage('QAAGA could not verify your administrator session. Please try logging in again.');
          setAuthState('denied');
        }
      }
    };

    void loadAdmin();
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
    await persistBranding({
      ...brandingRef.current,
      logoUrl: null,
    });
  }, [persistBranding]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    await persistBranding({
      ...brandingRef.current,
      logoUrl: DEFAULT_BRANDING.logoUrl,
    });
  }, [persistBranding]);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 py-6">
        <DashboardSkeleton />
        <p className="text-center text-sm text-slate-500">{authMessage}</p>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Access Restricted</h1>
        <p className="text-sm text-slate-300 max-w-lg mt-3">{authMessage}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={15} />
            Return to QAAGA
          </Link>
          <Link
            href="/login?next=%2Fadmin%2Fdashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-sm font-semibold transition-colors"
          >
            <LogIn size={15} />
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {dashboardError ? (
        <div role="status" className="px-4 py-2 text-sm text-amber-800 bg-amber-50 border-b border-amber-200">
          {dashboardError}
        </div>
      ) : null}
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
