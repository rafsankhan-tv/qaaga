'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Home,
  MessageSquare,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react';
import {
  AppNotification,
  BookingRecord,
  CURRENCY_CONFIG,
  CurrencyCode,
  DATE_OPTIONS,
  DEFAULT_BRANDING,
  GuestProfile,
  HostThread,
  ListingReview,
  QaagaCategory,
  QaagaListing,
  SiteBranding,
  STORAGE_KEYS,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';
import { HeaderSearch } from './HeaderSearch';
import { ListingCard } from './ListingCard';
import { CarouselSectionSkeleton, SearchGridSkeleton } from './Skeletons';
import {
  loadBestClientBranding,
  persistBrandingEverywhere,
  readSyncLocalBranding,
  reconcileBrandingOnLoad,
} from '@/lib/brandingStorage.client';
import { smoothScrollTo } from './SmoothScrollProvider';
import { getSupabase } from '@/lib/supabaseClient';
import {
  cancelBookingInDatabase,
  deleteListingFromDatabase,
  FetchStatus,
  fetchBookingsWithStatus,
  fetchListingsWithStatus,
  fetchThreadsWithStatus,
  getReviewsFromDatabase,
  insertBookingToDatabase,
  insertListingToDatabase,
  insertReviewToDatabase,
  saveUserProfileToDatabase,
  sendMessageToDatabase,
  createThreadInDatabase,
  subscribeToSupabaseTable,
} from '@/lib/supabaseService';

const AdminPanelModal = dynamic(
  () => import('./AdminPanelModal').then((m) => m.AdminPanelModal),
  { ssr: false }
);
const ListingDetailModal = dynamic(
  () => import('./ListingDetailModal').then((m) => m.ListingDetailModal),
  { ssr: false }
);
const CollectionExplorerModal = dynamic(
  () => import('./PlatformModals').then((m) => m.CollectionExplorerModal),
  { ssr: false }
);
const HelpCenterModal = dynamic(
  () => import('./PlatformModals').then((m) => m.HelpCenterModal),
  { ssr: false }
);
const HostStudioModal = dynamic(
  () => import('./PlatformModals').then((m) => m.HostStudioModal),
  { ssr: false }
);
const MessagesInboxModal = dynamic(
  () => import('./PlatformModals').then((m) => m.MessagesInboxModal),
  { ssr: false }
);
const TripsModal = dynamic(
  () => import('./PlatformModals').then((m) => m.TripsModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import('./AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);
const UserProfileModal = dynamic(
  () => import('./UserProfileModal').then((m) => m.UserProfileModal),
  { ssr: false }
);

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

interface ToastState {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

const STAY_SUBFILTERS = [
  { id: 'all', label: 'All stays' },
  { id: 'apartments', label: 'Apartments' },
  { id: 'rooms', label: 'Private rooms' },
  { id: 'condos', label: 'Sky condos' },
  { id: 'guest-fav', label: 'Guest favorites' },
  { id: 'under-100', label: 'Under $100' },
] as const;

const EXPERIENCE_SUBFILTERS = [
  { id: 'all', label: 'All experiences' },
  { id: 'culinary', label: 'Food & night markets' },
  { id: 'culture', label: 'Skyline & culture' },
  { id: 'nature', label: 'Outdoor & nature' },
  { id: 'guest-fav', label: 'Guest favorites' },
] as const;

const SERVICE_SUBFILTERS = [
  { id: 'all', label: 'All services' },
  { id: 'transport', label: 'Airport & chauffeur' },
  { id: 'dining', label: 'Private chef' },
  { id: 'wellness', label: 'Spa & wellness' },
  { id: 'concierge', label: 'Photography & care' },
] as const;

export interface QaagaWebsiteProps {
  initialBranding?: SiteBranding;
  initialRoute?: string;
  initialListingId?: string;
  initialBookingId?: string;
}

export const QaagaWebsite: React.FC<QaagaWebsiteProps> = ({
  initialBranding = DEFAULT_BRANDING,
  initialRoute,
  initialListingId,
  initialBookingId,
}) => {
  /* ======================================================================= */
  /* URL ROUTING HELPERS & STATE                                             */
  /* ======================================================================= */
  const navigateTo = useCallback((path: string, state: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(state, '', path);
    }
  }, []);

  /* ======================================================================= */
  /* NAVIGATION & SEARCH STATE                                               */
  /* ======================================================================= */
  const [activeCategory, setActiveCategory] = useState<QaagaCategory>(() => {
    if (initialRoute === '/rooms' || initialRoute === '/stay') return 'stay';
    if (initialRoute === '/experiences') return 'experiences';
    if (initialRoute === '/services') return 'services';
    return 'all';
  });
  const [subFilter, setSubFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const [whereQuery, setWhereQuery] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<(typeof DATE_OPTIONS)[number]>(
    DATE_OPTIONS[0]
  );
  const [calendarMonth, setCalendarMonth] = useState<'Nov' | 'Dec'>('Nov');
  const [customCheckInDay, setCustomCheckInDay] = useState<number | null>(null);
  const [customCheckOutDay, setCustomCheckOutDay] = useState<number | null>(null);
  const [checkInIso, setCheckInIso] = useState<string | null>(null);
  const [checkOutIso, setCheckOutIso] = useState<string | null>(null);

  const [adults, setAdults] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);

  const [activePopover, setActivePopover] = useState<'where' | 'when' | 'who' | null>(
    null
  );
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(false);

  /* ======================================================================= */
  /* PERSISTENT MARKETPLACE DATA STATE (REAL SUPABASE, ZERO MOCKS)           */
  /* ======================================================================= */
  const [dbListings, setDbListings] = useState<QaagaListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [listingsStatus, setListingsStatus] = useState<FetchStatus>('ok');
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [userToggledHearts, setUserToggledHearts] = useState<Record<string, boolean>>({});

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [threads, setThreads] = useState<HostThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [profile, setProfile] = useState<GuestProfile>({
    fullName: 'Guest User',
    email: '',
    city: 'Dhaka',
    verified: false,
    role: 'guest',
  });
  const [reviewsByListing, setReviewsByListing] = useState<
    Record<string, ListingReview[]>
  >({});

  /* ======================================================================= */
  /* MENUS, MODALS & TOAST STATE                                             */
  /* ======================================================================= */
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

  const [selectedListing, setSelectedListing] = useState<QaagaListing | null>(null);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);

  const [branding, setBranding] = useState<SiteBranding>(initialBranding);
  const brandingRef = useRef<SiteBranding>(initialBranding);

  useEffect(() => {
    brandingRef.current = branding;
  }, [branding]);

  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(initialRoute === '/host');
  const [isMessagesOpen, setIsMessagesOpen] = useState<boolean>(initialRoute === '/messages');
  const [isTripsOpen, setIsTripsOpen] = useState<boolean>(
    initialRoute === '/my-bookings' || Boolean(initialBookingId)
  );
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(initialRoute === '/profile');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(initialRoute === '/contact');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(initialRoute === '/admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(
    initialRoute === '/login' || initialRoute === '/register'
  );

  const [explorerCollection, setExplorerCollection] = useState<{
    mode: 'popular-kl' | 'wishlist' | 'experiences-services';
    title: string;
  } | null>(() => (initialRoute === '/wishlist' ? { mode: 'wishlist', title: 'Wishlist' } : null));
  const [explorerOnlyFavorites, setExplorerOnlyFavorites] = useState<boolean>(false);
  const [explorerSort, setExplorerSort] = useState<SortOption>('recommended');

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const recentCarouselRef = useRef<HTMLDivElement | null>(null);
  const wishlistCarouselRef = useRef<HTMLDivElement | null>(null);
  const popularCarouselRef = useRef<HTMLDivElement | null>(null);
  const curatedCarouselRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 4200);
  }, []);

  /* ======================================================================= */
  /* LOCAL STORAGE HYDRATION & SYNC                                          */
  /* ======================================================================= */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedWish = localStorage.getItem(STORAGE_KEYS.wishlist);
      if (savedWish) {
        const parsed = JSON.parse(savedWish);
        if (Array.isArray(parsed)) setWishlistIds(parsed);
      }
      const savedCurrency = localStorage.getItem(STORAGE_KEYS.currency) as CurrencyCode | null;
      if (savedCurrency && CURRENCY_CONFIG[savedCurrency]) {
        setCurrency(savedCurrency);
      }
      const syncLocal = readSyncLocalBranding();
      if (syncLocal && syncLocal.revision >= (initialBranding?.revision || 0)) {
        setBranding(syncLocal);
        brandingRef.current = syncLocal;
      }
    } catch {
      // Ignore storage parse issues in restricted frames
    } finally {
      setHydrated(true);
    }

    let cancelled = false;
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const syncBranding = () => {
      reconcileBrandingOnLoad(initialBranding).then((resolved) => {
        if (!cancelled) {
          setBranding(resolved);
          brandingRef.current = resolved;
        }
      });
    };
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(syncBranding, { timeout: 1500 });
    } else if (typeof globalThis !== 'undefined') {
      timerId = globalThis.setTimeout(syncBranding, 200);
    }

    const syncBrandingFromEvent = (evt: Event) => {
      const custom = evt as CustomEvent<SiteBranding | undefined>;
      if (custom?.detail) {
        setBranding(custom.detail);
        brandingRef.current = custom.detail;
        return;
      }
      loadBestClientBranding().then((best) => {
        if (best && !cancelled) {
          setBranding(best);
          brandingRef.current = best;
        }
      });
    };

    window.addEventListener('qaaga-branding-updated', syncBrandingFromEvent);
    window.addEventListener('storage', syncBrandingFromEvent);
    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId !== undefined && typeof window !== 'undefined') {
        window.clearTimeout(timerId);
      }
      window.removeEventListener('qaaga-branding-updated', syncBrandingFromEvent);
      window.removeEventListener('storage', syncBrandingFromEvent);
    };
  }, [initialBranding]);

  // Restore the authenticated Supabase session after reload and OAuth redirects.
  useEffect(() => {
    let active = true;
    const guestProfile: GuestProfile = {
      fullName: 'Guest User',
      email: '',
      city: 'Dhaka',
      verified: false,
      role: 'guest',
    };

    const restoreAuthenticatedProfile = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        if (active) setProfile(guestProfile);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (sessionError || !session?.access_token || !session.user.email) {
        if (active) {
          setProfile(guestProfile);
          setBookings([]);
          setThreads([]);
          setNotifications([]);
        }
        return;
      }

      const accessToken = session.access_token;
      const email = session.user.email.trim().toLowerCase();
      const headers = { Authorization: 'Bearer ' + accessToken };

      let response = await fetch('/api/auth/profile?email=' + encodeURIComponent(email), { headers });
      if (response.status === 404) {
        const metadata = session.user.user_metadata || {};
        const fallbackName =
          metadata.full_name ||
          metadata.name ||
          metadata.preferred_username ||
          email.split('@')[0].replace(/[._-]/g, ' ');

        response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: String(fallbackName).trim() || 'Member',
            email,
            city: 'Dhaka',
            role: 'guest',
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Unable to restore your QAAGA profile.');
      }

      const result = await response.json();
      const profileData = result.profile || {};
      if (!active) return;

      setProfile({
        fullName: profileData.fullName || 'Member',
        email,
        city: profileData.city || 'Dhaka',
        verified: Boolean(profileData.verified),
        role: profileData.role === 'admin' ? 'admin' : profileData.role === 'host' ? 'host' : 'guest',
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        bio: profileData.bio,
      });
    };

    restoreAuthenticatedProfile().catch((error) => {
      if (active) {
        setProfile(guestProfile);
        showToast({ message: error?.message || 'Could not restore your account session.' });
      }
    });

    const supabase = getSupabase();
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      queueMicrotask(() => {
        restoreAuthenticatedProfile().catch(() => {
          if (active) setProfile(guestProfile);
        });
      });
    });

    return () => {
      active = false;
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [showToast]);

  const loadListingsFromSupabase = useCallback(async () => {
    setIsLoadingListings(true);
    setListingsError(null);
    const res = await fetchListingsWithStatus();
    setListingsStatus(res.status);
    if (res.status === 'error') {
      setListingsError(res.error || 'Unable to load properties from Supabase.');
    } else {
      setDbListings(res.data);
    }
    setIsLoadingListings(false);
  }, []);

  // Supabase Database Hydration & Realtime Subscriptions
  useEffect(() => {
    let active = true;

    // 1. Fetch remote listings from Supabase
    setIsLoadingListings(true);
    fetchListingsWithStatus().then((res) => {
      if (!active) return;
      setListingsStatus(res.status);
      if (res.status === 'error') {
        setListingsError(res.error || 'Unable to load properties from Supabase.');
      } else {
        setDbListings(res.data);
      }
      setIsLoadingListings(false);
    });

    // 2. Fetch remote bookings when user email exists
    fetchBookingsWithStatus(profile.email || undefined).then((res) => {
      if (!active) return;
      if (res.status === 'ok') {
        setBookings(res.data);
      }
    });

    // 3. Fetch remote inbox threads
    fetchThreadsWithStatus().then((res) => {
      if (!active) return;
      if (res.status === 'ok' && res.data.length > 0) {
        setThreads(res.data);
        setActiveThreadId((prev) => prev || res.data[0].id);
      }
    });

    // 4. Supabase Realtime Channels
    const unsubListings = subscribeToSupabaseTable('properties', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = payload.new;
        if (item) {
          const mapped: QaagaListing = {
            id: String(item.id),
            title: item.title,
            area: item.area,
            hostEmail: item.host_email || undefined,
            city: item.city || 'Dhaka',
            subType: item.property_type || item.room_type || 'Apartment',
            category: item.category || 'stay',
            twoNightPriceUsd: Number(item.two_night_price_usd) || 0,
            rating: String(item.rating || '0'),
            reviewsCount: Number(item.reviews_count) || 0,
            guestFavorite: Boolean(item.guest_favorite),
            image: item.image || '',
            gallery: Array.isArray(item.gallery) ? item.gallery : (item.image ? [item.image] : []),
            maxGuests: Number(item.max_guests) || 2,
            bedrooms: item.bedrooms || '1 bedroom',
            hostName: item.host_name || 'Host',
            hostYears: 0,
            amenities: Array.isArray(item.amenities) ? item.amenities : [],
            description: item.description || '',
            inPopularKL: Boolean(item.in_popular_kl),
          };
          setDbListings((prev) => [mapped, ...prev.filter((i) => i.id !== mapped.id)]);
          setListingsStatus('ok');
        }
      } else if (payload.eventType === 'DELETE') {
        const delId = String(payload.old?.id);
        if (delId) {
          setDbListings((prev) => prev.filter((i) => i.id !== delId));
        }
      }
    });

    const unsubBookings = subscribeToSupabaseTable('bookings', (payload) => {
      if (payload.eventType === 'INSERT') {
        const b = payload.new;
        if (b) {
          const mappedBooking: BookingRecord = {
            id: b.id,
            confirmationCode: b.confirmation_code,
            listingId: b.listing_id,
            title: b.title,
            area: b.area,
            image: b.image,
            checkInLabel: b.check_in_label,
            nights: Number(b.nights),
            guests: Number(b.guests),
            totalUsd: Number(b.total_usd),
            hostName: b.host_name,
            status: b.status,
          };
          setBookings((prev) => [mappedBooking, ...prev.filter((item) => item.id !== mappedBooking.id)]);
        }
      } else if (payload.eventType === 'UPDATE') {
        const b = payload.new;
        if (b) {
          setBookings((prev) =>
            prev.map((item) =>
              item.id === b.id ? { ...item, status: b.status } : item
            )
          );
        }
      }
    });

    const unsubThreads = subscribeToSupabaseTable('threads', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const row = payload.new;
        if (row) {
          const mappedThread: HostThread = {
            id: String(row.id),
            hostName: row.host_name || 'Host',
            listingTitle: row.listing_title || 'Property conversation',
            listingImage: row.listing_image || '',
            unread: Boolean(row.unread),
            messages: [],
          };
          setThreads((prev) => [
            mappedThread,
            ...prev.filter((thread) => thread.id !== mappedThread.id),
          ]);
          setActiveThreadId((prev) => prev || mappedThread.id);
        }
      } else if (payload.eventType === 'DELETE') {
        const id = String(payload.old?.id || '');
        if (id) setThreads((prev) => prev.filter((thread) => thread.id !== id));
      }
    });

    const unsubMessages = subscribeToSupabaseTable('messages', (payload) => {
      if (payload.eventType !== 'INSERT') return;
      const row = payload.new;
      if (!row?.thread_id || !row?.id) return;
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== String(row.thread_id)) return thread;
          if (thread.messages.some((message) => message.id === String(row.id))) return thread;
          return {
            ...thread,
            messages: [
              ...thread.messages,
              {
                id: String(row.id),
                sender: row.sender === 'host' ? 'host' : 'guest',
                text: row.text || '',
                time: row.time || row.created_at || 'Just now',
              },
            ],
          };
        })
      );
    });

    return () => {
      active = false;
      unsubListings();
      unsubBookings();
      unsubThreads();
      unsubMessages();
    };
  }, [profile.email]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.currency, currency);
    } catch {}
  }, [currency, hydrated]);

  // Global Escape handler for modals & popovers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePopover(null);
        setIsNotifOpen(false);
        setIsAccountOpen(false);
        setSelectedListing(null);
        setIsHostModalOpen(false);
        setIsMessagesOpen(false);
        setIsTripsOpen(false);
        setIsProfileOpen(false);
        setIsHelpOpen(false);
        setIsAdminOpen(false);
        setExplorerCollection(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleUpdateBranding = useCallback(
    async (next: SiteBranding, toastMsg?: string) => {
      setBranding(next);
      brandingRef.current = next;
      const saved = await persistBrandingEverywhere(next);
      setBranding(saved);
      brandingRef.current = saved;
      if (toastMsg) {
        showToast({ message: toastMsg });
      }
    },
    [showToast]
  );

  const handleRemoveLogo = useCallback(async () => {
    const removed: SiteBranding = {
      ...brandingRef.current,
      logoUrl: null,
    };
    setBranding(removed);
    brandingRef.current = removed;
    const savedRemoved = await persistBrandingEverywhere(removed);
    setBranding(savedRemoved);
    brandingRef.current = savedRemoved;

    showToast({
      message: 'Logo removed permanently',
      undoLabel: 'Restore',
      onUndo: () => {
        const restored: SiteBranding = {
          ...brandingRef.current,
          logoUrl: DEFAULT_BRANDING.logoUrl,
        };
        setBranding(restored);
        brandingRef.current = restored;
        persistBrandingEverywhere(restored).then((saved) => {
          setBranding(saved);
          brandingRef.current = saved;
        });
        setToast(null);
      },
    });
  }, [showToast]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    const restored: SiteBranding = {
      ...brandingRef.current,
      logoUrl: DEFAULT_BRANDING.logoUrl,
    };
    setBranding(restored);
    brandingRef.current = restored;
    const saved = await persistBrandingEverywhere(restored);
    setBranding(saved);
    brandingRef.current = saved;
    showToast({ message: 'Restored official qaaga.com logo' });
  }, [showToast]);

  /* ======================================================================= */
  /* COMPUTED DATA & PRICE FORMATTER                                         */
  /* ======================================================================= */
  const allListings = useMemo(() => dbListings, [dbListings]);
  const customListings = useMemo(
    () => dbListings.filter((i) => i.id.startsWith('host-')),
    [dbListings]
  );

  // Handle Browser Back & Forward Buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setSelectedListing(null);
        setIsTripsOpen(false);
        setIsProfileOpen(false);
        setIsAuthModalOpen(false);
        setIsHelpOpen(false);
        setIsHostModalOpen(false);
        setIsAdminOpen(false);
        setIsMessagesOpen(false);
        setExplorerCollection(null);
        setActiveCategory('all');
      } else if (path.startsWith('/rooms/')) {
        const id = path.replace('/rooms/', '');
        const match = allListings.find((i) => i.id === id);
        if (match) setSelectedListing(match);
      } else if (path === '/rooms' || path === '/stay') {
        setActiveCategory('stay');
        setSelectedListing(null);
        setExplorerCollection(null);
      } else if (path === '/experiences') {
        setActiveCategory('experiences');
        setSelectedListing(null);
        setExplorerCollection(null);
      } else if (path === '/services') {
        setActiveCategory('services');
        setSelectedListing(null);
        setExplorerCollection(null);
      } else if (path === '/wishlist') {
        setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' });
        setSelectedListing(null);
      } else if (path === '/my-bookings') {
        setIsTripsOpen(true);
      } else if (path === '/login' || path === '/register') {
        setIsAuthModalOpen(true);
      } else if (path === '/profile') {
        setIsProfileOpen(true);
      } else if (path === '/contact') {
        setIsHelpOpen(true);
      } else if (path === '/admin') {
        setIsAdminOpen(true);
      } else if (path === '/messages') {
        setIsMessagesOpen(true);
      } else if (path === '/host') {
        setIsHostModalOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allListings]);

  // Synchronize initialListingId with allListings
  useEffect(() => {
    if (initialListingId && !selectedListing) {
      const match = allListings.find((i) => i.id === initialListingId);
      if (match) setSelectedListing(match);
    }
  }, [initialListingId, allListings, selectedListing]);

  const totalGuests = adults + childrenCount;

  const guestSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (totalGuests > 0) {
      parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    }
    if (infants > 0) {
      parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    }
    if (pets > 0) {
      parts.push(`${pets} pet${pets > 1 ? 's' : ''}`);
    }
    return parts.join(', ');
  }, [totalGuests, infants, pets]);

  const activeNights = selectedDates.nights || 2;

  const formatPrice = useCallback(
    (twoNightUsd: number, nightsOverride?: number) => {
      const cfg = CURRENCY_CONFIG[currency];
      const nights = nightsOverride ?? activeNights;
      const scaledUsd = Math.round((twoNightUsd / 2) * nights);
      const converted = Math.round(scaledUsd * cfg.rate);
      return `${cfg.symbol}${converted.toLocaleString('en-US')}`;
    },
    [currency, activeNights]
  );

  const hasActiveSearchCriteria =
    whereQuery.trim().length > 0 ||
    Boolean(selectedDates.display) ||
    totalGuests > 0 ||
    infants > 0 ||
    pets > 0;

  const filteredSearchListings = useMemo(() => {
    const q = whereQuery.trim().toLowerCase();
    return allListings.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (q) {
        const hay =
          `${item.title} ${item.area} ${item.city} ${item.subType} ${item.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (totalGuests > 0 && item.maxGuests < totalGuests) {
        return false;
      }
      return true;
    });
  }, [allListings, activeCategory, whereQuery, totalGuests]);

  const sortListings = useCallback(
    (items: QaagaListing[], mode: SortOption) => {
      const copy = [...items];
      if (mode === 'price-asc') {
        copy.sort((a, b) => a.twoNightPriceUsd - b.twoNightPriceUsd);
      } else if (mode === 'price-desc') {
        copy.sort((a, b) => b.twoNightPriceUsd - a.twoNightPriceUsd);
      } else if (mode === 'rating') {
        copy.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      }
      return copy;
    },
    []
  );

  // Category-specific filtered grid
  const categoryListings = useMemo(() => {
    if (activeCategory === 'all') return [];
    const base = filteredSearchListings.filter((i) => i.category === activeCategory);
    const bySub = base.filter((item) => {
      if (subFilter === 'all') return true;
      if (subFilter === 'guest-fav') return item.guestFavorite;
      if (subFilter === 'under-100') return item.twoNightPriceUsd < 100;
      return item.subType === subFilter;
    });
    return sortListings(bySub, sortBy);
  }, [activeCategory, filteredSearchListings, subFilter, sortBy, sortListings]);

  // Rows for "All" home canvas matching Screenshot_2026-11-04_at_2.23.12_AM_ec851fb8.png
  const recentlyViewedListings = useMemo(() => {
    const byId = new Map(allListings.map((item) => [item.id, item]));
    const ordered = recentlyViewedIds
      .map((id) => byId.get(id))
      .filter((x): x is QaagaListing => Boolean(x));
    const extraStays = allListings.filter(
      (item) => item.category === 'stay' && !recentlyViewedIds.includes(item.id)
    );
    return [...ordered, ...extraStays].slice(0, 16);
  }, [allListings, recentlyViewedIds]);

  const wishlistListings = useMemo(() => {
    const byId = new Map(allListings.map((item) => [item.id, item]));
    return wishlistIds
      .map((id) => byId.get(id))
      .filter((x): x is QaagaListing => Boolean(x));
  }, [allListings, wishlistIds]);

  const popularKLListings = useMemo(
    () =>
      allListings.filter(
        (item) => item.category === 'stay' && (item.inPopularKL || item.id.startsWith('host-'))
      ),
    [allListings]
  );

  const curatedExperiencesAndServices = useMemo(
    () => allListings.filter((item) => item.category !== 'stay'),
    [allListings]
  );

  const explorerItems = useMemo(() => {
    if (!explorerCollection) return [];
    let base: QaagaListing[] = [];
    if (explorerCollection.mode === 'popular-kl') {
      base = popularKLListings;
    } else if (explorerCollection.mode === 'wishlist') {
      base = wishlistListings;
    } else {
      base = curatedExperiencesAndServices;
    }
    if (explorerOnlyFavorites) {
      base = base.filter((i) => i.guestFavorite);
    }
    return sortListings(base, explorerSort);
  }, [
    explorerCollection,
    popularKLListings,
    wishlistListings,
    curatedExperiencesAndServices,
    explorerOnlyFavorites,
    explorerSort,
    sortListings,
  ]);

  const unreadThreadsCount = useMemo(
    () => threads.filter((t) => t.unread).length,
    [threads]
  );

  /* ======================================================================= */
  /* INTERACTION HANDLERS                                                    */
  /* ======================================================================= */
  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    const distance = Math.max(300, Math.round(ref.current.clientWidth * 0.82));
    ref.current.scrollBy({
      left: dir === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  const handleCloseMenus = useCallback(() => {
    setIsNotifOpen(false);
    setIsAccountOpen(false);
  }, []);

  const handleResetHome = useCallback(() => {
    setActiveCategory('all');
    setSubFilter('all');
    setSortBy('recommended');
    setWhereQuery('');
    setSelectedDates(DATE_OPTIONS[0]);
    setCustomCheckInDay(null);
    setCustomCheckOutDay(null);
    setCheckInIso(null);
    setCheckOutIso(null);
    setAdults(1);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
    setSearchSubmitted(false);
    setActivePopover(null);
    setSelectedListing(null);
    setIsTripsOpen(false);
    setIsProfileOpen(false);
    setIsAuthModalOpen(false);
    setIsHelpOpen(false);
    setIsHostModalOpen(false);
    setIsAdminOpen(false);
    setIsMessagesOpen(false);
    setExplorerCollection(null);
    smoothScrollTo(0, { duration: 1.0 });
    navigateTo('/');
  }, [navigateTo]);

  const handleSelectCategory = (cat: QaagaCategory) => {
    setActiveCategory(cat);
    setSubFilter('all');
    setActivePopover(null);
    if (typeof window !== 'undefined' && window.scrollY > 80) {
      smoothScrollTo(0, { duration: 1.0 });
    }
    if (cat === 'stay') {
      navigateTo('/rooms');
    } else if (cat === 'all') {
      navigateTo('/');
    } else {
      navigateTo(`/${cat}`);
    }
  };

  const toLocalIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateRange = (startIso: string, endIso: string) => {
    const start = new Date(`${startIso}T00:00:00`);
    const end = new Date(`${endIso}T00:00:00`);
    const fmt = (value: Date) =>
      value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const handleSelectDatePreset = (option: (typeof DATE_OPTIONS)[number]) => {
    setSelectedDates(option);
    if (!option.nights || option.id === 'default-2') {
      setCheckInIso(null);
      setCheckOutIso(null);
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + option.nights);
    const startIso = toLocalIsoDate(start);
    const endIso = toLocalIsoDate(end);
    const display = formatDateRange(startIso, endIso);

    setCheckInIso(startIso);
    setCheckOutIso(endIso);
    setCustomCheckInDay(start.getDate());
    setCustomCheckOutDay(end.getDate());
    setSelectedDates({
      ...option,
      label: display,
      display,
      tag: `${display} · ${option.nights} nights`,
    });
  };

  const handleSelectDateRange = (
    start: string | null,
    end: string | null,
    display: string,
    nights: number
  ) => {
    setCheckInIso(start);
    setCheckOutIso(end);
    setSelectedDates({
      id: `range-${start}-${end}`,
      label: display,
      display: display,
      nights: nights,
      tag: `${display} · ${nights} night${nights > 1 ? 's' : ''}`,
    });
  };

  const handleClearDates = () => {
    setCheckInIso(null);
    setCheckOutIso(null);
    setCustomCheckInDay(null);
    setCustomCheckOutDay(null);
    setSelectedDates(DATE_OPTIONS[0]);
  };

  const handleSelectCalendarDay = (day: number) => {
    const now = new Date();
    const monthIndex = calendarMonth === 'Nov' ? 10 : 11;
    let year = now.getFullYear();
    if (monthIndex < now.getMonth()) year += 1;

    const candidate = new Date(year, monthIndex, day);
    candidate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (candidate < today) {
      showToast({ message: 'Past dates cannot be selected. Choose a future date.' });
      return;
    }

    const candidateIso = toLocalIsoDate(candidate);
    if (!checkInIso || checkOutIso || candidateIso <= checkInIso) {
      setCheckInIso(candidateIso);
      setCheckOutIso(null);
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
      setSelectedDates({
        id: `custom-${candidateIso}`,
        label: `${calendarMonth} ${day} – Select check-out`,
        display: '',
        nights: 2,
        tag: 'Choose your check-out date',
      });
      return;
    }

    const start = new Date(`${checkInIso}T00:00:00`);
    const nights = Math.round((candidate.getTime() - start.getTime()) / 86400000);
    const display = formatDateRange(checkInIso, candidateIso);
    setCheckOutIso(candidateIso);
    setCustomCheckOutDay(day);
    setSelectedDates({
      id: `custom-${checkInIso}-${candidateIso}`,
      label: display,
      display,
      nights,
      tag: `${display} · ${nights} night${nights > 1 ? 's' : ''}`,
    });
  };

  const handleChangeGuestCount = (
    type: 'adults' | 'children' | 'infants' | 'pets',
    val: number
  ) => {
    if (type === 'adults') setAdults(Math.max(1, val));
    if (type === 'children') setChildrenCount(Math.max(0, val));
    if (type === 'infants') setInfants(Math.max(0, val));
    if (type === 'pets') setPets(Math.max(0, val));
  };

  const handleClearGuests = () => {
    setAdults(1);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
  };

  const handleExecuteSearch = () => {
    if (!hasActiveSearchCriteria) {
      setActivePopover('where');
      return;
    }
    setActivePopover(null);
    setSearchSubmitted(true);
    smoothScrollTo('#qaaga-listings-canvas', { offset: -90, duration: 1.1 });
  };

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent, item: QaagaListing) => {
      e.stopPropagation();
      const currentlySaved = wishlistIds.includes(item.id);
      setUserToggledHearts((prev) => ({ ...prev, [item.id]: true }));

      if (currentlySaved) {
        setWishlistIds((prev) => prev.filter((id) => id !== item.id));
        showToast({
          message: `Removed "${item.title}" from Wishlist`,
          undoLabel: 'Undo',
          onUndo: () => {
            setWishlistIds((prev) =>
              prev.includes(item.id) ? prev : [item.id, ...prev]
            );
            setToast(null);
          },
        });
      } else {
        setWishlistIds((prev) => [item.id, ...prev.filter((id) => id !== item.id)]);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: `Added to Wishlist · ${item.title}`,
            body: `Saved ${item.subType} in ${item.area} to your favorites wishlist.`,
            time: 'Just now',
            unread: true,
            actionType: 'wishlist',
          },
          ...prev,
        ]);
        showToast({
          message: `Saved "${item.title}" to Wishlist`,
          undoLabel: 'Undo',
          onUndo: () => {
            setWishlistIds((prev) => prev.filter((id) => id !== item.id));
            setToast(null);
          },
        });
      }
    },
    [wishlistIds, showToast]
  );

  const handleOpenListing = useCallback(
    (item: QaagaListing) => {
      setBookingSuccessCode(null);
      setSelectedListing(item);
      setRecentlyViewedIds((prev) => [
        item.id,
        ...prev.filter((existing) => existing !== item.id),
      ]);
      getReviewsFromDatabase(item.id).then((revs) => {
        setReviewsByListing((prev) => ({ ...prev, [item.id]: revs }));
      });
      navigateTo(`/rooms/${item.id}`, { listingId: item.id });
    },
    [navigateTo]
  );

  const handleConfirmBooking = async (nights: number, guestsCount: number) => {
    if (!selectedListing) return;

    if (!profile.email) {
      setIsAuthModalOpen(true);
      showToast({ message: 'Sign in before sending a booking request.' });
      return;
    }
    if (!checkInIso || !checkOutIso) {
      showToast({ message: 'Choose a valid check-in and check-out date first.' });
      setActivePopover('when');
      return;
    }
    if (!selectedListing.hostEmail) {
      showToast({ message: 'This listing is missing its verified host account. Booking is unavailable.' });
      return;
    }

    const start = new Date(`${checkInIso}T00:00:00`);
    const end = new Date(`${checkOutIso}T00:00:00`);
    const actualNights = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (!Number.isFinite(actualNights) || actualNights < 1 || end <= start) {
      showToast({ message: 'The selected date range is invalid.' });
      return;
    }

    const confirmationCode = `QG-${Date.now().toString().slice(-8)}`;
    const totalUsd = Math.round((selectedListing.twoNightPriceUsd / 2) * actualNights);
    const dateRange = formatDateRange(checkInIso, checkOutIso);
    const newBooking: BookingRecord = {
      id: `bk-${crypto.randomUUID()}`,
      confirmationCode,
      listingId: selectedListing.id,
      checkInDate: checkInIso,
      checkOutDate: checkOutIso,
      title: selectedListing.title,
      area: `${selectedListing.area}, ${selectedListing.city}`,
      image: selectedListing.image,
      checkInLabel: dateRange,
      nights: actualNights,
      guests: guestsCount,
      totalUsd,
      hostName: selectedListing.hostName,
      status: 'Pending',
    };

    try {
      const savedBooking = await insertBookingToDatabase(
        newBooking,
        profile.email,
        profile.fullName,
        selectedListing.hostEmail
      );
      setBookings((prev) => [savedBooking, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Booking request sent · ${confirmationCode}`,
          body: `${selectedListing.title} (${dateRange}) is awaiting host approval.`,
          time: 'Just now',
          unread: true,
          actionType: 'trips',
        },
        ...prev,
      ]);
      setBookingSuccessCode(confirmationCode);
      showToast({ message: `Booking request sent. Awaiting host approval · ${confirmationCode}` });
    } catch (error: any) {
      showToast({ message: error?.message || 'Booking could not be saved. Please try again.' });
    }
  };

  const handleMessageHostFromListing = async (item: QaagaListing) => {
    if (!profile.email) {
      setIsAuthModalOpen(true);
      showToast({ message: 'Sign in before messaging a host.' });
      return;
    }
    if (!item.hostEmail) {
      showToast({ message: 'This listing has no verified host contact yet.' });
      return;
    }

    const existing = threads.find((thread) => thread.listingTitle === item.title);
    if (existing) {
      setActiveThreadId(existing.id);
      setSelectedListing(null);
      setIsMessagesOpen(true);
      return;
    }

    try {
      const created = await createThreadInDatabase({
        propertyId: item.id,
        hostEmail: item.hostEmail,
        hostName: item.hostName,
        listingTitle: item.title,
        listingImage: item.image,
      });
      setThreads((prev) => [created, ...prev]);
      setActiveThreadId(created.id);
      setSelectedListing(null);
      setIsMessagesOpen(true);
    } catch (error: any) {
      showToast({ message: error?.message || 'Could not start this conversation.' });
    }
  };

  const handleSendMessage = async (text: string) => {
    const targetId = activeThreadId || threads[0]?.id;
    if (!targetId || !profile.email) {
      showToast({ message: 'Sign in and open a conversation before sending a message.' });
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    const sent = await sendMessageToDatabase(targetId, {
      sender: 'guest',
      text: cleanText,
      time: new Date().toISOString(),
    });
    if (!sent) {
      showToast({ message: 'Message was not sent. Check your connection and try again.' });
      return;
    }

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === targetId
          ? {
              ...thread,
              unread: false,
              messages: [
                ...thread.messages,
                {
                  id: `msg-${crypto.randomUUID()}`,
                  sender: 'guest',
                  text: cleanText,
                  time: 'Just now',
                },
              ],
            }
          : thread
      )
    );
    showToast({ message: 'Message sent.' });
  };

  const handlePublishHostListing = async (data: {
    title: string;
    area: string;
    category: 'stay' | 'experiences' | 'services';
    twoNightUsd: number;
    photo: string;
    guestFav: boolean;
  }) => {
    if (!profile.email) {
      setIsAuthModalOpen(true);
      showToast({ message: 'Sign in before publishing a property.' });
      return;
    }

    const newItem: QaagaListing = {
      id: `host-${crypto.randomUUID()}`,
      hostEmail: profile.email,
      title: data.title,
      area: data.area,
      city: profile.city || 'Dhaka',
      subType: data.category === 'stay' ? 'Apartment' : data.category,
      twoNightPriceUsd: data.twoNightUsd,
      rating: '0.0',
      reviewsCount: 0,
      guestFavorite: false,
      image: data.photo,
      gallery: [data.photo],
      category: data.category,
      maxGuests: 4,
      bedrooms: data.category === 'stay' ? '1 bedroom · 1 bed · 1 bath' : 'Hosted session · Up to 4 guests',
      hostName: profile.fullName,
      hostYears: 0,
      amenities: [],
      description: `Hosted by ${profile.fullName} in ${data.area}, ${profile.city || 'Dhaka'}.`,
      inPopularKL: false,
    };

    try {
      const saved = await insertListingToDatabase(newItem);
      setDbListings((prev) => [saved, ...prev]);
      setRecentlyViewedIds((prev) => [saved.id, ...prev]);
      setIsHostModalOpen(false);
      if (data.category !== 'stay' && activeCategory !== 'all') {
        setActiveCategory(data.category);
      }
      showToast({ message: `"${saved.title}" submitted for QAAGA review. It will appear publicly after approval.` });
    } catch (error: any) {
      showToast({ message: error?.message || 'Listing was not saved. Please try again.' });
    }
  };

  const handleDeleteCustomListing = async (id: string) => {
    const deleted = await deleteListingFromDatabase(id);
    if (!deleted) {
      showToast({ message: 'Listing could not be deleted. Check your account permissions.' });
      return;
    }
    setDbListings((prev) => prev.filter((item) => item.id !== id));
    setWishlistIds((prev) => prev.filter((wId) => wId !== id));
    setRecentlyViewedIds((prev) => prev.filter((rId) => rId !== id));
    showToast({ message: 'Listing removed successfully.' });
  };

  const handleAddReview = async (rating: number, comment: string) => {
    if (!selectedListing || !profile.email) {
      showToast({ message: 'Sign in before submitting a review.' });
      return;
    }
    try {
      const savedReview = await insertReviewToDatabase(selectedListing.id, {
        author: profile.fullName,
        rating,
        comment,
      });
      setReviewsByListing((prev) => ({
        ...prev,
        [selectedListing.id]: [savedReview, ...(prev[selectedListing.id] || [])],
      }));
      showToast({ message: 'Your review has been saved.' });
    } catch (error: any) {
      showToast({ message: error?.message || 'Your review could not be saved.' });
    }
  };

  const handleClickNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setIsNotifOpen(false);
    if (notif.actionType === 'trips') {
      setIsTripsOpen(true);
      navigateTo('/my-bookings');
    } else if (notif.actionType === 'messages') {
      setIsMessagesOpen(true);
      navigateTo('/messages');
    } else {
      setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' });
      navigateTo('/wishlist');
    }
  };

  const showFilteredSearchCanvas =
    activeCategory === 'all' && (searchSubmitted || hasActiveSearchCriteria);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0">
      {/* =================================================================== */}
      {/* TOP HEADER + CENTERED CATEGORY TABS + 3-SEGMENT SEARCH PILL + '+'   */}
      {/* =================================================================== */}
      <HeaderSearch
        branding={branding}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onResetHome={handleResetHome}
        whereQuery={whereQuery}
        onWhereChange={(val) => {
          setWhereQuery(val);
          if (!val) setSearchSubmitted(false);
        }}
        selectedDates={selectedDates}
        onSelectDates={handleSelectDatePreset}
        calendarMonth={calendarMonth}
        onToggleCalendarMonth={() =>
          setCalendarMonth((prev) => (prev === 'Nov' ? 'Dec' : 'Nov'))
        }
        customCheckInDay={customCheckInDay}
        customCheckOutDay={customCheckOutDay}
        onSelectCalendarDay={handleSelectCalendarDay}
        checkInIso={checkInIso}
        checkOutIso={checkOutIso}
        onSelectDateRange={handleSelectDateRange}
        onClearDates={handleClearDates}
        adults={adults}
        childrenCount={childrenCount}
        infants={infants}
        pets={pets}
        onChangeGuestCount={handleChangeGuestCount}
        onClearGuests={handleClearGuests}
        guestSummaryText={guestSummaryText}
        activePopover={activePopover}
        onSetActivePopover={setActivePopover}
        onExecuteSearch={handleExecuteSearch}
        matchingCount={filteredSearchListings.length}
        notifications={notifications}
        isNotifOpen={isNotifOpen}
        onToggleNotif={() => {
          setIsAccountOpen(false);
          setIsNotifOpen((prev) => !prev);
        }}
        onMarkAllNotifsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        }
        onClickNotification={handleClickNotification}
        isAccountOpen={isAccountOpen}
        onToggleAccount={() => {
          setIsNotifOpen(false);
          setIsAccountOpen((prev) => !prev);
        }}
        onCloseMenus={handleCloseMenus}
        profile={profile}
        bookingsCount={bookings.length}
        threadsCount={threads.length}
        unreadThreadsCount={unreadThreadsCount}
        wishlistCount={wishlistIds.length}
        currency={currency}
        onChangeCurrency={(c) => {
          setCurrency(c);
          showToast({ message: `Switched currency to ${CURRENCY_CONFIG[c].label}` });
        }}
        onOpenHostModal={() => {
          setIsHostModalOpen(true);
          navigateTo('/host');
        }}
        onOpenTrips={() => {
          setIsTripsOpen(true);
          navigateTo('/my-bookings');
        }}
        onOpenMessages={() => {
          setIsMessagesOpen(true);
          navigateTo('/messages');
        }}
        onOpenWishlist={() => {
          setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' });
          navigateTo('/wishlist');
        }}
        onOpenProfileModal={() => {
          setIsProfileOpen(true);
          navigateTo('/profile');
        }}
        onOpenHelpModal={() => {
          setIsHelpOpen(true);
          navigateTo('/contact');
        }}
        onOpenAdminModal={() => {
          setIsAdminOpen(true);
          navigateTo('/admin');
        }}
        onOpenAuthModal={() => {
          setIsAuthModalOpen(true);
          navigateTo('/login');
        }}
      />

      {/* =================================================================== */}
      {/* MAIN MARKETPLACE CANVAS                                             */}
      {/* =================================================================== */}
      <main id="qaaga-listings-canvas" className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 3xl:px-20 pt-6 sm:pt-7 pb-14 space-y-9 sm:space-y-11">
        {/* ----------------------------------------------------------------- */}
        {/* CASE A: ACTIVE SEARCH RESULTS ON "ALL"                            */}
        {/* ----------------------------------------------------------------- */}
        {showFilteredSearchCanvas && (
          <section aria-label="Search results" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em]">
                  Search results ({filteredSearchListings.length})
                </h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {[
                    whereQuery ? `Destination: ${whereQuery}` : 'All Kuala Lumpur',
                    selectedDates.display || '2 nights',
                    guestSummaryText || 'Any group size',
                  ].join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetHome}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-300 hover:border-[#C72B62] text-xs font-semibold text-slate-800 hover:text-[#C72B62] cursor-pointer transition-colors"
              >
                <X size={14} />
                <span>Clear search</span>
              </button>
            </div>

            {isLoadingListings ? (
              <SearchGridSkeleton count={12} />
            ) : filteredSearchListings.length === 0 ? (
              <div className="py-14 px-6 rounded-3xl border border-slate-200 text-center space-y-3">
                <p className="text-base font-bold text-slate-900">
                  No exact matches found for those filters
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try searching Bukit Bintang, Kampung Bahru, KLCC, Mont Kiara, or reset
                  guest counts to explore all available stays and experiences.
                </p>
                <button
                  type="button"
                  onClick={handleResetHome}
                  className="px-5 py-2.5 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                >
                  Show all listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 min-[2560px]:grid-cols-10 gap-x-5 gap-y-7">
                {filteredSearchListings.map((item, idx) => (
                  <ListingCard
                    key={`search-${item.id}`}
                    item={item}
                    priority={idx < 6}
                    isSaved={wishlistIds.includes(item.id)}
                    isUserToggled={Boolean(userToggledHearts[item.id])}
                    formattedPrice={formatPrice(item.twoNightPriceUsd)}
                    activeNights={activeNights}
                    onOpen={handleOpenListing}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CASE B: DEFAULT "ALL" HOME CANVAS                                 */}
        {/* ----------------------------------------------------------------- */}
        {activeCategory === 'all' && !showFilteredSearchCanvas && (
          <>
            {isLoadingListings ? (
              <div className="space-y-9 sm:space-y-11">
                <CarouselSectionSkeleton titleWidth="w-44" count={8} variant="recent" />
                <CarouselSectionSkeleton titleWidth="w-36" count={6} variant="wishlist" />
                <CarouselSectionSkeleton titleWidth="w-64" count={6} variant="wishlist" />
              </div>
            ) : allListings.length === 0 ? (
              <section className="py-16 px-6 rounded-3xl border border-slate-200 bg-slate-50/60 text-center space-y-3">
                <p className="text-lg font-bold text-slate-900">
                  {listingsStatus === 'error'
                    ? 'Unable to connect to live Supabase inventory'
                    : 'No published listings in Supabase yet'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {listingsError ||
                    'Listings published by hosts or synced to Supabase will appear here automatically in real time.'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={loadListingsFromSupabase}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHostModalOpen(true);
                      navigateTo('/host');
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Publish First Listing</span>
                  </button>
                </div>
              </section>
            ) : (
              <>
                {/* ROW 1: Recently viewed */}
                {recentlyViewedListings.length > 0 && (
                  <section
                    aria-labelledby="heading-recently-viewed"
                    className="group/recent space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h2
                        id="heading-recently-viewed"
                        className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em]"
                      >
                        Recently viewed
                      </h2>

                      <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover/recent:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          type="button"
                          aria-label="Scroll recently viewed left"
                          onClick={() => scrollCarousel(recentCarouselRef, 'left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Scroll recently viewed right"
                          onClick={() => scrollCarousel(recentCarouselRef, 'right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={recentCarouselRef}
                      data-lenis-prevent
                      className="carousel-scroll flex gap-3 sm:gap-3.5 lg:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-1"
                    >
                      {recentlyViewedListings.map((item, idx) => (
                        <ListingCard
                          key={`recent-${item.id}`}
                          item={item}
                          priority={idx < 5}
                          isSaved={wishlistIds.includes(item.id)}
                          isUserToggled={Boolean(userToggledHearts[item.id])}
                          formattedPrice={formatPrice(item.twoNightPriceUsd)}
                          activeNights={activeNights}
                          carouselItem={true}
                          variant="recent"
                          onOpen={handleOpenListing}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ROW 2: Wishlist */}
                <section aria-labelledby="heading-wishlist" className="space-y-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <h2
                      id="heading-wishlist"
                      className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em]"
                    >
                      Wishlist
                    </h2>

                    {wishlistListings.length > 6 && (
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Scroll wishlist left"
                          onClick={() => scrollCarousel(wishlistCarouselRef, 'left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Scroll wishlist right"
                          onClick={() => scrollCarousel(wishlistCarouselRef, 'right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {wishlistListings.length === 0 ? (
                    <div className="py-8 px-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Your Wishlist is currently empty
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tap the heart icon on any home to save it to your wishlist.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={wishlistCarouselRef}
                      data-lenis-prevent
                      className="carousel-scroll flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-1"
                    >
                      {wishlistListings.map((item) => (
                        <ListingCard
                          key={`wish-${item.id}`}
                          item={item}
                          isSaved={true}
                          isUserToggled={Boolean(userToggledHearts[item.id])}
                          formattedPrice={formatPrice(item.twoNightPriceUsd)}
                          activeNights={activeNights}
                          carouselItem={true}
                          variant="wishlist"
                          onOpen={handleOpenListing}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* ROW 3: Popular homes in Kuala Lumpur */}
                {popularKLListings.length > 0 && (
                  <section aria-labelledby="heading-popular-kl" className="space-y-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setExplorerOnlyFavorites(false);
                            setExplorerSort('recommended');
                            setExplorerCollection({
                              mode: 'popular-kl',
                              title: 'Popular homes in Kuala Lumpur',
                            });
                          }}
                          className="group inline-flex items-center gap-2 text-left cursor-pointer"
                        >
                          <h2
                            id="heading-popular-kl"
                            className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em] group-hover:text-[#C72B62] transition-colors"
                          >
                            Popular homes in Kuala Lumpur
                          </h2>
                          <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#C72B62] group-hover:text-white text-slate-800 flex items-center justify-center transition-colors shrink-0">
                            <ArrowRight size={15} strokeWidth={2.3} />
                          </span>
                        </button>
                        <p className="text-[13px] sm:text-[13.5px] text-slate-500 mt-0.5">
                          Malaysian capital with skyline views
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <button
                          type="button"
                          aria-label="Previous popular homes"
                          onClick={() => scrollCarousel(popularCarouselRef, 'left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Next popular homes"
                          onClick={() => scrollCarousel(popularCarouselRef, 'right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={popularCarouselRef}
                      data-lenis-prevent
                      className="carousel-scroll flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-1"
                    >
                      {popularKLListings.map((item) => (
                        <ListingCard
                          key={`popular-${item.id}`}
                          item={item}
                          isSaved={wishlistIds.includes(item.id)}
                          isUserToggled={Boolean(userToggledHearts[item.id])}
                          formattedPrice={formatPrice(item.twoNightPriceUsd)}
                          activeNights={activeNights}
                          carouselItem={true}
                          variant="wishlist"
                          onOpen={handleOpenListing}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ROW 4 (Below the fold): Experiences & Hospitality Services in KL */}
                {curatedExperiencesAndServices.length > 0 && (
                  <section
                    aria-labelledby="heading-experiences-services"
                    className="pt-2 space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setExplorerOnlyFavorites(false);
                            setExplorerSort('recommended');
                            setExplorerCollection({
                              mode: 'experiences-services',
                              title: 'Experiences & services in Kuala Lumpur',
                            });
                          }}
                          className="group inline-flex items-center gap-2 text-left cursor-pointer"
                        >
                          <h2
                            id="heading-experiences-services"
                            className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em] group-hover:text-[#C72B62] transition-colors"
                          >
                            Experiences & services in Kuala Lumpur
                          </h2>
                          <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#C72B62] group-hover:text-white text-slate-800 flex items-center justify-center transition-colors shrink-0">
                            <ArrowRight size={15} strokeWidth={2.3} />
                          </span>
                        </button>
                        <p className="text-[13px] sm:text-[13.5px] text-slate-500 mt-0.5">
                          Local night-market tours, private chefs, airport chauffeurs & spa care
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <button
                          type="button"
                          aria-label="Previous experiences and services"
                          onClick={() => scrollCarousel(curatedCarouselRef, 'left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-400 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Next experiences and services"
                          onClick={() => scrollCarousel(curatedCarouselRef, 'right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={curatedCarouselRef}
                      data-lenis-prevent
                      className="carousel-scroll flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-1"
                    >
                      {curatedExperiencesAndServices.map((item) => (
                        <ListingCard
                          key={`curated-${item.id}`}
                          item={item}
                          isSaved={wishlistIds.includes(item.id)}
                          isUserToggled={Boolean(userToggledHearts[item.id])}
                          formattedPrice={formatPrice(item.twoNightPriceUsd)}
                          activeNights={activeNights}
                          carouselItem={true}
                          variant="wishlist"
                          onOpen={handleOpenListing}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CASE C: DEDICATED STAY / EXPERIENCES / SERVICES CATEGORY VIEWS    */}
        {/* ----------------------------------------------------------------- */}
        {activeCategory !== 'all' && (
          <section aria-label={`${activeCategory} category`} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-2xl sm:text-[26px] font-bold text-slate-950 tracking-[-0.02em]">
                  {activeCategory === 'stay'
                    ? 'Stays in Kuala Lumpur'
                    : activeCategory === 'experiences'
                    ? 'Experiences in Kuala Lumpur'
                    : 'Hospitality Services in Kuala Lumpur'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {activeCategory === 'stay'
                    ? 'Skyline apartments, private rooms & infinity-pool condos verified by qaaga.com'
                    : activeCategory === 'experiences'
                    ? 'Hosted culinary walks, rooftop photography & cultural sessions led by locals'
                    : 'On-demand airport transfers, private in-residence chefs & wellness specialists'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <SlidersHorizontal size={15} className="text-slate-500 shrink-0" />
                <select
                  aria-label="Sort category listings"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 px-3.5 rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C72B62] cursor-pointer"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Clean Interactive Filter Controls */}
            <div data-lenis-prevent className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-1">
              {(activeCategory === 'stay'
                ? STAY_SUBFILTERS
                : activeCategory === 'experiences'
                ? EXPERIENCE_SUBFILTERS
                : SERVICE_SUBFILTERS
              ).map((chip) => {
                const isSelected = subFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSubFilter(chip.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#C72B62] text-white border-[#C72B62]'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {isLoadingListings ? (
              <SearchGridSkeleton count={12} />
            ) : categoryListings.length === 0 ? (
              <div className="py-12 px-6 rounded-3xl border border-slate-200 text-center space-y-3">
                <p className="text-sm font-bold text-slate-900">
                  No listings match this filter combination
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubFilter('all');
                    setWhereQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-[#C72B62] text-white text-xs font-semibold cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 min-[2560px]:grid-cols-10 gap-x-5 gap-y-7">
                {categoryListings.map((item, idx) => (
                  <ListingCard
                    key={`cat-${item.id}`}
                    item={item}
                    priority={idx < 6}
                    isSaved={wishlistIds.includes(item.id)}
                    isUserToggled={Boolean(userToggledHearts[item.id])}
                    formattedPrice={formatPrice(item.twoNightPriceUsd)}
                    activeNights={activeNights}
                    vividSavedState={true}
                    onOpen={handleOpenListing}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* =================================================================== */}
      {/* HOSPITALITY FOOTER                                                  */}
      {/* =================================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50/70">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 3xl:px-20 py-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8 text-xs text-slate-600">
            <div className="space-y-2.5">
              <button
                type="button"
                aria-label="qaaga.com footer home"
                onClick={handleResetHome}
                className="inline-flex items-center leading-none cursor-pointer"
              >
                <BrandLogo branding={branding} variant="footer" />
              </button>
              <p className="leading-relaxed text-slate-500">
                Stays, local experiences, and hospitality services across Kuala Lumpur —
                from Bukit Bintang penthouses to Kampung Bahru skyline condos.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Explore Kuala Lumpur</p>
              <ul className="space-y-1.5">
                {['Bukit Bintang', 'Kampung Bahru', 'KLCC', 'Mont Kiara'].map((hood) => (
                  <li key={hood}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('all');
                        setWhereQuery(hood);
                        setSearchSubmitted(true);
                        smoothScrollTo(0, { duration: 1.0 });
                      }}
                      className="hover:text-[#C72B62] hover:underline cursor-pointer"
                    >
                      Homes in {hood}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Your Account</p>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/user/dashboard"
                    prefetch={true}
                    className="hover:text-[#C72B62] hover:underline"
                  >
                    Customer Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTripsOpen(true)}
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Trips & Reservations ({bookings.length})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsMessagesOpen(true)}
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Host Messages ({threads.length})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' })
                    }
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Saved Wishlist ({wishlistIds.length})
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Hosting & Support</p>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/host/dashboard"
                    prefetch={true}
                    className="hover:text-[#C72B62] hover:underline"
                  >
                    Host Dashboard & Studio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    prefetch={true}
                    className="hover:text-[#C72B62] hover:underline"
                  >
                    Browse All Properties
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="inline-flex items-center gap-1 hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    <ShieldCheck size={13} className="text-[#C72B62]" />
                    <span>QaagaCover Protection</span>
                  </button>
                </li>
                <li>
                  <Link
                    href="/admin/dashboard"
                    prefetch={true}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-[#C72B62] hover:underline"
                  >
                    <Shield size={13} className="text-[#C72B62]" />
                    <span>Admin Panel (Logo & Site)</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 qaaga.com · Stays, Experiences & Hospitality Services</p>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                <Globe size={14} className="text-[#C72B62]" />
                <span>English (US)</span>
              </span>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                {(['USD', 'MYR', 'EUR', 'BDT'] as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      currency === code
                        ? 'bg-[#C72B62] text-white'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {CURRENCY_CONFIG[code].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                        */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 grid grid-cols-5 items-center"
      >
        <button
          type="button"
          aria-label="Home"
          onClick={handleResetHome}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold cursor-pointer ${
            activeCategory === 'all' && !isTripsOpen && !isMessagesOpen && !isProfileOpen && !isAuthModalOpen
              ? 'text-[#C72B62]'
              : 'text-slate-600'
          }`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          aria-label="Booking"
          onClick={() => {
            setIsTripsOpen(true);
            navigateTo('/my-bookings');
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold cursor-pointer relative ${
            isTripsOpen ? 'text-[#C72B62]' : 'text-slate-600'
          }`}
        >
          <div className="relative">
            <CalendarCheck2 size={20} />
            {bookings.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#C72B62] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {bookings.length}
              </span>
            )}
          </div>
          <span>Booking</span>
        </button>

        <button
          type="button"
          aria-label="Host a listing"
          onClick={() => {
            setIsHostModalOpen(true);
            navigateTo('/host');
          }}
          className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <span
            style={{
              background: 'linear-gradient(90deg, #E91D58, #D90065)',
              borderRadius: '100px',
              color: '#FFFFFF',
            }}
            className="w-10 h-10 flex items-center justify-center shadow-[0_2px_10px_rgba(233,29,88,0.35)] text-white hover:brightness-95"
          >
            <Plus size={21} strokeWidth={2.6} className="text-white" />
          </span>
        </button>

        <button
          type="button"
          aria-label="Inbox"
          onClick={() => {
            setIsMessagesOpen(true);
            navigateTo('/messages');
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold cursor-pointer relative ${
            isMessagesOpen ? 'text-[#C72B62]' : 'text-slate-600'
          }`}
        >
          <div className="relative">
            <MessageSquare size={20} />
            {threads.some((t) => t.unread) && (
              <span className="absolute -top-1 -right-1.5 bg-[#C72B62] w-2 h-2 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span>Inbox</span>
        </button>

        <button
          type="button"
          aria-label="Profile"
          onClick={() => {
            if (profile.verified) {
              setIsProfileOpen(true);
              navigateTo('/profile');
            } else {
              setIsAuthModalOpen(true);
              navigateTo('/login');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold cursor-pointer ${
            isAuthModalOpen || isProfileOpen ? 'text-[#C72B62]' : 'text-slate-600'
          }`}
        >
          <User size={20} />
          <span>{profile.verified ? (profile.fullName.split(' ')[0] || 'Profile') : 'Profile'}</span>
        </button>
      </nav>

      {/* =================================================================== */}
      {/* INTERACTIVE TOAST WITH UNDO                                         */}
      {/* =================================================================== */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm max-w-[92vw]"
        >
          <span className="truncate">{toast.message}</span>
          {toast.onUndo && (
            <button
              type="button"
              onClick={toast.onUndo}
              className="font-bold text-[#ff7aa8] hover:underline shrink-0 cursor-pointer"
            >
              {toast.undoLabel || 'Undo'}
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS                                                              */}
      {/* =================================================================== */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isSaved={wishlistIds.includes(selectedListing.id)}
          reviews={reviewsByListing[selectedListing.id] || []}
          initialNights={activeNights}
          initialGuests={Math.max(1, totalGuests || 2)}
          dateRangeLabel={selectedDates.display || 'Nov 14 – Nov 16'}
          formatPrice={formatPrice}
          bookingSuccessCode={bookingSuccessCode}
          onClose={() => {
            setSelectedListing(null);
            navigateTo('/');
          }}
          onToggleWishlist={handleToggleWishlist}
          onShare={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href).catch(() => {});
            }
            showToast({ message: `Copied link to "${selectedListing.title}"` });
          }}
          onMessageHost={handleMessageHostFromListing}
          onConfirmBooking={handleConfirmBooking}
          onOpenTrips={() => {
            setSelectedListing(null);
            setIsTripsOpen(true);
            navigateTo('/my-bookings');
          }}
          onAddReview={handleAddReview}
        />
      )}

      {isHostModalOpen && (
        <HostStudioModal
          customListings={customListings}
          onClose={() => {
            setIsHostModalOpen(false);
            navigateTo('/');
          }}
          onPublish={handlePublishHostListing}
          onDeleteCustomListing={handleDeleteCustomListing}
        />
      )}

      {isMessagesOpen && (
        <MessagesInboxModal
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={(id) => {
            setActiveThreadId(id);
            setThreads((prev) =>
              prev.map((t) => (t.id === id ? { ...t, unread: false } : t))
            );
          }}
          onSendMessage={handleSendMessage}
          onClose={() => {
            setIsMessagesOpen(false);
            navigateTo('/');
          }}
        />
      )}

      {isTripsOpen && (
        <TripsModal
          bookings={bookings}
          formatPrice={formatPrice}
          onCancelBooking={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            cancelBookingInDatabase(id).catch((err) =>
              console.warn('Cancel booking sync notice:', err)
            );
            showToast({ message: 'Reservation cancelled' });
          }}
          onOpenListingById={(listingId) => {
            const match = allListings.find((item) => item.id === listingId);
            setIsTripsOpen(false);
            if (match) handleOpenListing(match);
          }}
          onClose={() => {
            setIsTripsOpen(false);
            navigateTo('/');
          }}
        />
      )}

      {explorerCollection && (
        <CollectionExplorerModal
          title={explorerCollection.title}
          items={explorerItems}
          wishlistIds={wishlistIds}
          userToggledHearts={userToggledHearts}
          activeNights={activeNights}
          onlyGuestFavorites={explorerOnlyFavorites}
          sortBy={explorerSort}
          onToggleGuestFavorites={() => setExplorerOnlyFavorites((p) => !p)}
          onChangeSort={setExplorerSort}
          formatPrice={(usd) => formatPrice(usd)}
          onOpenListing={handleOpenListing}
          onToggleWishlist={handleToggleWishlist}
          onClose={() => {
            setExplorerCollection(null);
            navigateTo('/');
          }}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal
          branding={branding}
          profile={profile}
          customListings={customListings}
          currency={currency}
          onChangeCurrency={(c) => {
            setCurrency(c);
            showToast({ message: `Switched currency to ${CURRENCY_CONFIG[c].label}` });
          }}
          onOpenHostModal={() => {
            setIsProfileOpen(false);
            setIsHostModalOpen(true);
            navigateTo('/host');
          }}
          onSave={async (updated) => {
            try {
              const saved = await saveUserProfileToDatabase(updated);
              setProfile(saved);
              showToast({ message: 'Account profile updated successfully' });
            } catch (error: any) {
              showToast({ message: error?.message || 'Profile could not be saved.' });
            }
          }}
          onLogout={async () => {
            const supabase = getSupabase();
            if (supabase) {
              const { error } = await supabase.auth.signOut();
              if (error) {
                showToast({ message: 'Sign out failed. Please try again.' });
                return;
              }
            }
            const guest: GuestProfile = {
              fullName: 'Guest User',
              email: '',
              city: 'Dhaka',
              verified: false,
              role: 'guest',
            };
            setProfile(guest);
            setBookings([]);
            setThreads([]);
            setNotifications([]);
            setWishlistIds([]);
            showToast({ message: 'Signed out successfully' });
            setIsProfileOpen(false);
            navigateTo('/');
          }}
          onClose={() => {
            setIsProfileOpen(false);
            navigateTo('/');
          }}
        />
      )}

      {isHelpOpen && (
        <HelpCenterModal
          onClose={() => {
            setIsHelpOpen(false);
            navigateTo('/');
          }}
        />
      )}

      {isAdminOpen && (
        <AdminPanelModal
          branding={branding}
          onUpdateBranding={handleUpdateBranding}
          onRemoveLogo={handleRemoveLogo}
          onRestoreDefaultLogo={handleRestoreDefaultLogo}
          allListings={allListings}
          customListings={customListings}
          onDeleteCustomListing={handleDeleteCustomListing}
          onOpenHostModal={() => {
            setIsHostModalOpen(true);
            navigateTo('/host');
          }}
          bookings={bookings}
          onCancelBooking={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            cancelBookingInDatabase(id).catch((err) =>
              console.warn('Cancel booking sync notice:', err)
            );
            showToast({ message: 'Reservation cancelled' });
          }}
          onClose={() => {
            setIsAdminOpen(false);
            navigateTo('/');
          }}
        />
      )}

      {/* Supabase Email OTP / Social Login Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            navigateTo('/');
          }}
          branding={branding}
          profile={profile}
          onUpdateProfile={(updated) => {
            setProfile(updated);
          }}
          onOpenAdminModal={() => {
            setIsAdminOpen(true);
            navigateTo('/admin');
          }}
          onShowToast={showToast}
        />
      )}
    </div>
  );
};
