'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Home,
  RefreshCw,
  Search,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ListingCard } from '@/components/ListingCard';
import { SearchGridSkeleton } from '@/components/Skeletons';
import {
  DEFAULT_BRANDING,
  GuestProfile,
  ListingReview,
  QaagaCategory,
  QaagaListing,
  SiteBranding,
} from '@/data/listings';
import {
  fetchListingsWithStatus,
  FetchStatus,
  getReviewsFromDatabase,
  insertBookingToDatabase,
  insertReviewToDatabase,
} from '@/lib/supabaseService';

const ListingDetailModal = dynamic(
  () => import('@/components/ListingDetailModal').then((m) => m.ListingDetailModal),
  { ssr: false }
);

interface PropertiesCatalogClientProps {
  branding?: SiteBranding;
}

export default function PropertiesCatalogClient({
  branding = DEFAULT_BRANDING,
}: PropertiesCatalogClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState<QaagaListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('ok');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<QaagaCategory>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [userToggledWishlistIds, setUserToggledWishlistIds] = useState<string[]>([]);
  const [selectedListing, setSelectedListing] = useState<QaagaListing | null>(null);
  const [listingReviews, setListingReviews] = useState<ListingReview[]>([]);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GuestProfile | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    globalThis.setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    const res = await fetchListingsWithStatus();
    setListings(res.data);
    setFetchStatus(res.status);
    setFetchError(res.error || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchListingsWithStatus().then((res) => {
      if (!active) return;
      setListings(res.data);
      setFetchStatus(res.status);
      setFetchError(res.error || null);
      setIsLoading(false);
    });

    try {
      const savedWish = localStorage.getItem('qaaga_v3_wishlist');
      if (savedWish) setWishlistIds(JSON.parse(savedWish));
      const savedProfile = localStorage.getItem('qaaga_v3_profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    } catch {
      // ignore local storage read errors
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedListing) return;
    let active = true;
    setBookingSuccessCode(null);
    getReviewsFromDatabase(selectedListing.id).then((reviews) => {
      if (active) setListingReviews(reviews || []);
    });
    return () => {
      active = false;
    };
  }, [selectedListing]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent, item: QaagaListing) => {
    e.stopPropagation();
    setUserToggledWishlistIds((prev) =>
      prev.includes(item.id) ? prev : [...prev, item.id]
    );
    setWishlistIds((prev) => {
      const exists = prev.includes(item.id);
      const next = exists ? prev.filter((id) => id !== item.id) : [...prev, item.id];
      try {
        localStorage.setItem('qaaga_v3_wishlist', JSON.stringify(next));
      } catch {}
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist');
      return next;
    });
  }, [showToast]);

  const formatPrice = useCallback((twoNightUsd: number, nightsOverride?: number) => {
    const nights = nightsOverride ?? 2;
    const total = Math.round((twoNightUsd / 2) * nights);
    return `$${total}`;
  }, []);

  const handleConfirmBooking = useCallback(
    async (nights: number, guests: number) => {
      if (!selectedListing) return;
      const code = `QGA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const totalUsd = Math.round((selectedListing.twoNightPriceUsd / 2) * nights);
      await insertBookingToDatabase(
        {
          id: `bk-${Date.now()}`,
          listingId: selectedListing.id,
          title: selectedListing.title,
          area: selectedListing.area,
          image: selectedListing.image,
          checkInLabel: 'Flexible dates',
          nights,
          guests,
          totalUsd,
          confirmationCode: code,
          hostName: selectedListing.hostName || 'Verified Host',
          status: 'Pending',
        },
        userProfile?.email || 'guest@qaaga.com',
        userProfile?.fullName || 'Verified Guest'
      );
      setBookingSuccessCode(code);
    },
    [selectedListing, userProfile]
  );

  const handleAddReview = useCallback(
    async (rating: number, comment: string) => {
      if (!selectedListing) return;
      const review: ListingReview = {
        id: `rev-${Date.now()}`,
        author: userProfile?.fullName || 'Verified Guest',
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rating,
        comment,
      };
      await insertReviewToDatabase(selectedListing.id, review);
      setListingReviews((prev) => [review, ...prev]);
    },
    [selectedListing, userProfile]
  );

  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.area) set.add(l.area);
    });
    return Array.from(set).sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = listings.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (areaFilter !== 'all' && item.area !== areaFilter) return false;
      if (q) {
        const hay = `${item.title} ${item.area} ${item.city} ${item.subType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.twoNightPriceUsd - b.twoNightPriceUsd);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.twoNightPriceUsd - a.twoNightPriceUsd);
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    return list;
  }, [listings, category, areaFilter, query, sortBy]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <Link href="/" prefetch={true} aria-label="QAAGA Home">
              <BrandLogo branding={branding} variant="header" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/host/dashboard"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
            >
              <Home size={14} />
              <span>Host Studio</span>
            </Link>
            <Link
              href="/user/dashboard"
              prefetch={true}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold transition-colors"
            >
              <User size={14} />
              <span>{userProfile ? 'Dashboard' : 'Customer Hub'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            {(['all', 'stay', 'experiences', 'services'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {cat === 'all' ? 'All Properties' : cat === 'stay' ? 'Stays' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search area, building, room..."
                className="w-full h-9 pl-8 pr-8 rounded-full border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-[#C72B62]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              aria-label="Filter by area"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="h-9 px-3 rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">All Areas</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-slate-300 bg-white">
              <SlidersHorizontal size={13} className="text-slate-500" />
              <select
                aria-label="Sort properties"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-transparent cursor-pointer focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {isLoading ? (
          <SearchGridSkeleton count={12} />
        ) : fetchStatus === 'error' && listings.length === 0 ? (
          <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl border border-slate-200 bg-slate-50 text-center space-y-3">
            <Building2 size={32} className="text-[#C72B62] mx-auto" />
            <h2 className="text-base font-bold text-slate-900">Unable to load properties</h2>
            <p className="text-xs text-slate-500">
              {fetchError || 'Could not reach the Supabase database right now.'}
            </p>
            <button
              type="button"
              onClick={loadListings}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl border border-slate-200 bg-slate-50 text-center space-y-3">
            <Building2 size={32} className="text-slate-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">
              {listings.length === 0 ? 'No properties published yet' : 'No matching properties found'}
            </h2>
            <p className="text-xs text-slate-500">
              {listings.length === 0
                ? 'Live properties added by verified hosts in Supabase will appear here automatically.'
                : 'Try adjusting your area filter or search keywords.'}
            </p>
            {listings.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                  setAreaFilter('all');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Verified Furnished Apartments & Rooms ({filteredListings.length})
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 gap-x-5 gap-y-7">
              {filteredListings.map((item, idx) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  isSaved={wishlistIds.includes(item.id)}
                  isUserToggled={userToggledWishlistIds.includes(item.id)}
                  formattedPrice={formatPrice(item.twoNightPriceUsd, 2)}
                  activeNights={2}
                  onToggleWishlist={handleToggleWishlist}
                  onOpen={setSelectedListing}
                  priority={idx < 6}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg">
          {toastMsg}
        </div>
      )}

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isSaved={wishlistIds.includes(selectedListing.id)}
          reviews={listingReviews}
          initialNights={2}
          initialGuests={1}
          dateRangeLabel="Flexible dates"
          formatPrice={formatPrice}
          bookingSuccessCode={bookingSuccessCode}
          onClose={() => setSelectedListing(null)}
          onToggleWishlist={handleToggleWishlist}
          onShare={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(`${window.location.origin}/properties/${selectedListing.id}`).catch(() => {});
            }
            showToast('Property link copied');
          }}
          onMessageHost={() => router.push('/messages')}
          onConfirmBooking={handleConfirmBooking}
          onOpenTrips={() => router.push('/user/dashboard')}
          onAddReview={handleAddReview}
        />
      )}
    </div>
  );
}
