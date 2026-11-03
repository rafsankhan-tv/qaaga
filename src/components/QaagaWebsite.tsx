'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ArrowRight,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  Heart,
  MessageSquare,
  Plus,
  RotateCcw,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AppNotification,
  BookingRecord,
  CURRENCY_CONFIG,
  CurrencyCode,
  DATE_OPTIONS,
  DEFAULT_BRANDING,
  DEFAULT_REVIEWS,
  GuestProfile,
  HostThread,
  INITIAL_BOOKINGS,
  INITIAL_LISTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_THREADS,
  ListingReview,
  QaagaCategory,
  QaagaListing,
  SiteBranding,
  STORAGE_KEYS,
} from '@/data/listings';
import { AdminPanelModal } from './AdminPanelModal';
import { BrandLogo } from './BrandLogo';
import { HeaderSearch } from './HeaderSearch';
import { ListingCard } from './ListingCard';
import { ListingDetailModal } from './ListingDetailModal';
import {
  CollectionExplorerModal,
  HelpCenterModal,
  HostStudioModal,
  MessagesInboxModal,
  ProfileModal,
  TripsModal,
} from './PlatformModals';

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

export const QaagaWebsite: React.FC = () => {
  /* ======================================================================= */
  /* NAVIGATION & SEARCH STATE                                               */
  /* ======================================================================= */
  const [activeCategory, setActiveCategory] = useState<QaagaCategory>('all');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const [whereQuery, setWhereQuery] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<(typeof DATE_OPTIONS)[number]>(
    DATE_OPTIONS[0]
  );
  const [calendarMonth, setCalendarMonth] = useState<'Nov' | 'Dec'>('Nov');
  const [customCheckInDay, setCustomCheckInDay] = useState<number | null>(null);
  const [customCheckOutDay, setCustomCheckOutDay] = useState<number | null>(null);

  const [adults, setAdults] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);

  const [activePopover, setActivePopover] = useState<'where' | 'when' | 'who' | null>(
    null
  );
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(false);

  /* ======================================================================= */
  /* PERSISTENT MARKETPLACE DATA STATE                                       */
  /* ======================================================================= */
  const [customListings, setCustomListings] = useState<QaagaListing[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    INITIAL_LISTINGS.filter((item) => item.inInitialWishlist).map((item) => item.id)
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    INITIAL_LISTINGS.filter((item) => item.inInitialRecent).map((item) => item.id)
  );
  const [userToggledHearts, setUserToggledHearts] = useState<Record<string, boolean>>({});

  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [threads, setThreads] = useState<HostThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [profile, setProfile] = useState<GuestProfile>({
    fullName: 'Amina Rahman',
    email: 'amina@qaaga.com',
    city: 'Kuala Lumpur',
    verified: true,
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

  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);

  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState<boolean>(false);
  const [isTripsOpen, setIsTripsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const [explorerCollection, setExplorerCollection] = useState<{
    mode: 'popular-kl' | 'wishlist' | 'experiences-services';
    title: string;
  } | null>(null);
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
      const savedBookings = localStorage.getItem(STORAGE_KEYS.bookings);
      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        if (Array.isArray(parsed)) setBookings(parsed);
      }
      const savedThreads = localStorage.getItem(STORAGE_KEYS.threads);
      if (savedThreads) {
        const parsed = JSON.parse(savedThreads);
        if (Array.isArray(parsed) && parsed.length > 0) setThreads(parsed);
      }
      const savedNotifs = localStorage.getItem(STORAGE_KEYS.notifications);
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
      const savedCustom = localStorage.getItem(STORAGE_KEYS.customListings);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) setCustomListings(parsed);
      }
      const savedCurrency = localStorage.getItem(STORAGE_KEYS.currency) as CurrencyCode | null;
      if (savedCurrency && CURRENCY_CONFIG[savedCurrency]) {
        setCurrency(savedCurrency);
      }
      const savedProfile = localStorage.getItem(STORAGE_KEYS.profile);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed.fullName === 'string') setProfile(parsed);
      }
      const savedBranding = localStorage.getItem(STORAGE_KEYS.branding);
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        if (parsed && typeof parsed === 'object') {
          setBranding({ ...DEFAULT_BRANDING, ...parsed });
        }
      }
    } catch {
      // Ignore storage parse issues in restricted frames
    } finally {
      setHydrated(true);
    }

    fetch('/api/branding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.branding) {
          setBranding(data.branding);
          try {
            localStorage.setItem(
              STORAGE_KEYS.branding,
              JSON.stringify(data.branding)
            );
          } catch {}
        }
      })
      .catch(() => {});

    const syncBrandingFromStorage = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.branding);
        if (raw) {
          setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(raw) });
        }
      } catch {}
    };
    window.addEventListener('qaaga-branding-updated', syncBrandingFromStorage);
    window.addEventListener('storage', syncBrandingFromStorage);
    return () => {
      window.removeEventListener('qaaga-branding-updated', syncBrandingFromStorage);
      window.removeEventListener('storage', syncBrandingFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    } catch {}
  }, [bookings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
    } catch {}
  }, [threads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
    } catch {}
  }, [notifications, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.customListings, JSON.stringify(customListings));
    } catch {}
  }, [customListings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.currency, currency);
    } catch {}
  }, [currency, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch {}
  }, [profile, hydrated]);

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
      try {
        localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(next));
        window.dispatchEvent(new Event('qaaga-branding-updated'));
      } catch {}
      try {
        await fetch('/api/branding', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
      } catch {}
      if (toastMsg) {
        showToast({ message: toastMsg });
      }
    },
    [showToast]
  );

  const handleRemoveLogo = useCallback(async () => {
    const removed: SiteBranding = {
      ...branding,
      logoUrl: null,
      updatedAt: new Date().toISOString(),
    };
    setBranding(removed);
    try {
      localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(removed));
      window.dispatchEvent(new Event('qaaga-branding-updated'));
    } catch {}
    try {
      await fetch('/api/branding?target=logo', { method: 'DELETE' });
    } catch {}
    showToast({
      message: 'Logo removed from qaaga.com',
      undoLabel: 'Restore',
      onUndo: () => {
        const restored: SiteBranding = {
          ...removed,
          logoUrl: DEFAULT_BRANDING.logoUrl,
          updatedAt: new Date().toISOString(),
        };
        setBranding(restored);
        try {
          localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(restored));
          window.dispatchEvent(new Event('qaaga-branding-updated'));
        } catch {}
        fetch('/api/branding?target=logo&reset=true', { method: 'DELETE' }).catch(
          () => {}
        );
        setToast(null);
      },
    });
  }, [branding, showToast]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    const restored: SiteBranding = {
      ...branding,
      logoUrl: DEFAULT_BRANDING.logoUrl,
      updatedAt: new Date().toISOString(),
    };
    setBranding(restored);
    try {
      localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(restored));
      window.dispatchEvent(new Event('qaaga-branding-updated'));
    } catch {}
    try {
      await fetch('/api/branding?target=logo&reset=true', { method: 'DELETE' });
    } catch {}
    showToast({ message: 'Restored official qaaga.com logo' });
  }, [branding, showToast]);

  /* ======================================================================= */
  /* COMPUTED DATA & PRICE FORMATTER                                         */
  /* ======================================================================= */
  const allListings = useMemo(
    () => [...customListings, ...INITIAL_LISTINGS],
    [customListings]
  );

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
    return [...ordered, ...extraStays.slice(0, 6)];
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
    setAdults(0);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
    setSearchSubmitted(false);
    setActivePopover(null);
  }, []);

  const handleSelectCategory = (cat: QaagaCategory) => {
    setActiveCategory(cat);
    setSubFilter('all');
    setActivePopover(null);
  };

  const handleSelectCalendarDay = (day: number) => {
    if (customCheckInDay === null || (customCheckInDay !== null && customCheckOutDay !== null)) {
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
      const nextDisplay = `${calendarMonth} ${day} – ${calendarMonth} ${Math.min(
        calendarMonth === 'Nov' ? 30 : 31,
        day + 2
      )}`;
      setSelectedDates({
        id: `custom-${calendarMonth}-${day}`,
        label: nextDisplay,
        display: nextDisplay,
        nights: 2,
        tag: `${nextDisplay} · 2 nights`,
      });
    } else if (day > customCheckInDay) {
      setCustomCheckOutDay(day);
      const nights = Math.max(1, day - customCheckInDay);
      const nextDisplay = `${calendarMonth} ${customCheckInDay} – ${calendarMonth} ${day}`;
      setSelectedDates({
        id: `custom-${calendarMonth}-${customCheckInDay}-${day}`,
        label: nextDisplay,
        display: nextDisplay,
        nights,
        tag: `${nextDisplay} · ${nights} night${nights > 1 ? 's' : ''}`,
      });
    } else {
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
    }
  };

  const handleChangeGuestCount = (
    type: 'adults' | 'children' | 'infants' | 'pets',
    val: number
  ) => {
    if (type === 'adults') setAdults(val);
    if (type === 'children') {
      setChildrenCount(val);
      if (val > 0 && adults === 0) setAdults(1);
    }
    if (type === 'infants') {
      setInfants(val);
      if (val > 0 && adults === 0) setAdults(1);
    }
    if (type === 'pets') {
      setPets(val);
      if (val > 0 && adults === 0) setAdults(1);
    }
  };

  const handleClearGuests = () => {
    setAdults(0);
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
  };

  const handleToggleWishlist = (e: React.MouseEvent, item: QaagaListing) => {
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
      showToast({
        message: `Saved "${item.title}" to Wishlist`,
        undoLabel: 'Undo',
        onUndo: () => {
          setWishlistIds((prev) => prev.filter((id) => id !== item.id));
          setToast(null);
        },
      });
    }
  };

  const handleRestoreInitialWishlist = () => {
    const initialIds = INITIAL_LISTINGS.filter((i) => i.inInitialWishlist).map(
      (i) => i.id
    );
    setWishlistIds(initialIds);
    showToast({ message: 'Restored all 6 Kuala Lumpur Wishlist homes' });
  };

  const handleOpenListing = (item: QaagaListing) => {
    setBookingSuccessCode(null);
    setSelectedListing(item);
    setRecentlyViewedIds((prev) => [
      item.id,
      ...prev.filter((existing) => existing !== item.id),
    ]);
  };

  const handleConfirmBooking = (nights: number, guestsCount: number) => {
    if (!selectedListing) return;
    const code = `QG-KL${Math.floor(1000 + Math.random() * 9000)}`;
    const totalUsd = Math.round((selectedListing.twoNightPriceUsd / 2) * nights);
    const dateRange = selectedDates.display || 'Nov 14 – Nov 16';

    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      confirmationCode: code,
      listingId: selectedListing.id,
      title: selectedListing.title,
      area: `${selectedListing.area}, ${selectedListing.city}`,
      image: selectedListing.image,
      checkInLabel: dateRange,
      nights,
      guests: guestsCount,
      totalUsd,
      hostName: selectedListing.hostName,
      status: 'Confirmed',
    };

    setBookings((prev) => [newBooking, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Reservation confirmed · ${code}`,
        body: `${selectedListing.title} (${dateRange} · ${nights} night${
          nights > 1 ? 's' : ''
        }) is confirmed.`,
        time: 'Just now',
        unread: true,
        actionType: 'trips',
      },
      ...prev,
    ]);
    setBookingSuccessCode(code);
    showToast({ message: `Reservation confirmed! Code: ${code}` });
  };

  const handleMessageHostFromListing = (item: QaagaListing) => {
    const existing = threads.find((t) => t.listingTitle === item.title);
    if (existing) {
      setActiveThreadId(existing.id);
    } else {
      const created: HostThread = {
        id: `thread-${Date.now()}`,
        hostName: item.hostName,
        listingTitle: item.title,
        listingImage: item.image,
        unread: false,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'host',
            text: `Hi ${profile.fullName.split(' ')[0]}! Let me know any questions about ${item.title} in ${item.area}.`,
            time: 'Just now',
          },
        ],
      };
      setThreads((prev) => [created, ...prev]);
      setActiveThreadId(created.id);
    }
    setSelectedListing(null);
    setIsMessagesOpen(true);
  };

  const handleSendMessage = (text: string) => {
    const targetId = activeThreadId || threads[0]?.id;
    if (!targetId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              unread: false,
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: 'guest',
                  text,
                  time: 'Just now',
                },
                {
                  id: `msg-reply-${Date.now() + 1}`,
                  sender: 'host',
                  text: 'Thanks for reaching out! Dates are available and smart-lock self check-in is ready whenever you arrive.',
                  time: 'Just now',
                },
              ],
            }
          : t
      )
    );
  };

  const handlePublishHostListing = (data: {
    title: string;
    area: string;
    category: 'stay' | 'experiences' | 'services';
    twoNightUsd: number;
    photo: string;
    guestFav: boolean;
  }) => {
    const newItem: QaagaListing = {
      id: `host-${Date.now()}`,
      title: data.title,
      area: data.area,
      city: 'Kuala Lumpur',
      subType:
        data.category === 'stay'
          ? 'apartments'
          : data.category === 'experiences'
          ? 'culture'
          : 'concierge',
      twoNightPriceUsd: data.twoNightUsd,
      rating: '5.0',
      reviewsCount: 1,
      guestFavorite: data.guestFav,
      image: data.photo,
      gallery: [data.photo, '/assets/clean-rooms/room-gulshan-studio.jpg'],
      category: data.category,
      maxGuests: 4,
      bedrooms:
        data.category === 'stay'
          ? '1 bedroom · 2 beds · 1 bath'
          : 'Hosted session · Up to 4 guests',
      hostName: profile.fullName,
      hostYears: 2,
      amenities: [
        'Verified qaaga.com Host',
        'Instant Confirmation',
        'High-Speed Wi-Fi',
        'QaagaCover Included',
      ],
      description: `Hosted by ${profile.fullName} in ${data.area}, Kuala Lumpur. Thoughtfully prepared space with seamless check-in and skyline neighborhood access.`,
      inInitialRecent: true,
      inPopularKL: true,
    };

    setCustomListings((prev) => [newItem, ...prev]);
    setRecentlyViewedIds((prev) => [newItem.id, ...prev]);
    setIsHostModalOpen(false);
    if (data.category !== 'stay' && activeCategory !== 'all') {
      setActiveCategory(data.category);
    }
    showToast({ message: `Published "${newItem.title}" live on qaaga.com` });
  };

  const handleDeleteCustomListing = (id: string) => {
    setCustomListings((prev) => prev.filter((item) => item.id !== id));
    setWishlistIds((prev) => prev.filter((wId) => wId !== id));
    setRecentlyViewedIds((prev) => prev.filter((rId) => rId !== id));
    showToast({ message: 'Removed host listing' });
  };

  const handleAddReview = (rating: number, comment: string) => {
    if (!selectedListing) return;
    const rev: ListingReview = {
      id: `rev-${Date.now()}`,
      author: profile.fullName,
      date: 'November 2026',
      rating,
      comment,
    };
    setReviewsByListing((prev) => ({
      ...prev,
      [selectedListing.id]: [rev, ...(prev[selectedListing.id] || DEFAULT_REVIEWS)],
    }));
    showToast({ message: 'Your guest review has been posted' });
  };

  const handleClickNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setIsNotifOpen(false);
    if (notif.actionType === 'trips') {
      setIsTripsOpen(true);
    } else if (notif.actionType === 'messages') {
      setIsMessagesOpen(true);
    } else {
      setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' });
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
        onSelectDates={setSelectedDates}
        calendarMonth={calendarMonth}
        onToggleCalendarMonth={() =>
          setCalendarMonth((prev) => (prev === 'Nov' ? 'Dec' : 'Nov'))
        }
        customCheckInDay={customCheckInDay}
        customCheckOutDay={customCheckOutDay}
        onSelectCalendarDay={handleSelectCalendarDay}
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
        wishlistCount={wishlistIds.length}
        currency={currency}
        onChangeCurrency={(c) => {
          setCurrency(c);
          showToast({ message: `Switched currency to ${CURRENCY_CONFIG[c].label}` });
        }}
        onOpenHostModal={() => setIsHostModalOpen(true)}
        onOpenTrips={() => setIsTripsOpen(true)}
        onOpenMessages={() => setIsMessagesOpen(true)}
        onOpenWishlist={() =>
          setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' })
        }
        onOpenProfileModal={() => setIsProfileOpen(true)}
        onOpenHelpModal={() => setIsHelpOpen(true)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
      />

      {/* =================================================================== */}
      {/* MAIN MARKETPLACE CANVAS                                             */}
      {/* =================================================================== */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-7 pb-14 space-y-9 sm:space-y-11">
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

            {filteredSearchListings.length === 0 ? (
              <div className="py-14 px-6 rounded-3xl border border-slate-200 text-center space-y-3">
                <p className="text-base font-bold text-slate-900">
                  No exact matches found for those filters
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try searching Bukit Bintang, Kampung Bahru, KLCC, Mont Kiara, or reset
                  guest counts to explore all Kuala Lumpur stays and experiences.
                </p>
                <button
                  type="button"
                  onClick={handleResetHome}
                  className="px-5 py-2.5 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                >
                  Show all Kuala Lumpur listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-7">
                {filteredSearchListings.map((item) => (
                  <ListingCard
                    key={`search-${item.id}`}
                    item={item}
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
        {/* CASE B: DEFAULT "ALL" HOME CANVAS MATCHING TARGET SCREENSHOT 1:1  */}
        {/* ----------------------------------------------------------------- */}
        {activeCategory === 'all' && !showFilteredSearchCanvas && (
          <>
            {/* ROW 1: Recently viewed */}
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
                className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
              >
                {recentlyViewedListings.map((item) => (
                  <ListingCard
                    key={`recent-${item.id}`}
                    item={item}
                    isSaved={wishlistIds.includes(item.id)}
                    isUserToggled={Boolean(userToggledHearts[item.id])}
                    formattedPrice={formatPrice(item.twoNightPriceUsd)}
                    activeNights={activeNights}
                    carouselItem={true}
                    onOpen={handleOpenListing}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>

            {/* ROW 2: Wishlist */}
            <section aria-labelledby="heading-wishlist" className="space-y-3.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2
                    id="heading-wishlist"
                    className="text-[20px] sm:text-[22px] font-bold text-slate-950 tracking-[-0.02em]"
                  >
                    Wishlist
                  </h2>
                  {wishlistListings.length < 6 && (
                    <button
                      type="button"
                      onClick={handleRestoreInitialWishlist}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Restore all 6</span>
                    </button>
                  )}
                </div>

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
                <div className="py-10 px-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Your Wishlist is currently empty
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tap the heart icon on any Kuala Lumpur home to save it right here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreInitialWishlist}
                    className="px-4 py-2 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                  >
                    Restore default Wishlist
                  </button>
                </div>
              ) : (
                <div
                  ref={wishlistCarouselRef}
                  className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
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
                      onOpen={handleOpenListing}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 3: Popular homes in Kuala Lumpur → + Subtitle + < > Controls */}
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
                className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
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
                    onOpen={handleOpenListing}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>

            {/* ROW 4 (Below the fold): Experiences & Hospitality Services in KL */}
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
                className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
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
                    onOpen={handleOpenListing}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>
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
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
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

            {categoryListings.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-7">
                {categoryListings.map((item) => (
                  <ListingCard
                    key={`cat-${item.id}`}
                    item={item}
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-600">
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <li>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Guest Profile
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Hosting & Support</p>
              <ul className="space-y-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHostModalOpen(true)}
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Become a host on qaaga.com
                  </button>
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
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    24/7 Guest Help Center
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(true)}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-[#C72B62] hover:underline cursor-pointer"
                  >
                    <Shield size={13} className="text-[#C72B62]" />
                    <span>Admin Panel (Logo & Site)</span>
                  </button>
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
          onClick={handleResetHome}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold cursor-pointer ${
            activeCategory === 'all' && !isTripsOpen && !isMessagesOpen
              ? 'text-[#C72B62]'
              : 'text-slate-600'
          }`}
        >
          <Compass size={20} />
          <span>Explore</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setExplorerCollection({ mode: 'wishlist', title: 'Wishlist' })
          }
          className="flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold text-slate-600 cursor-pointer"
        >
          <Heart size={20} />
          <span>Wishlist</span>
        </button>

        <button
          type="button"
          aria-label="Host a listing"
          onClick={() => setIsHostModalOpen(true)}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="w-10 h-10 rounded-full bg-[#C72B62] text-white flex items-center justify-center shadow-sm">
            <Plus size={21} strokeWidth={2.5} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsTripsOpen(true)}
          className="flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold text-slate-600 cursor-pointer"
        >
          <CalendarCheck2 size={20} />
          <span>Trips</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMessagesOpen(true)}
          className="flex flex-col items-center justify-center py-1 gap-0.5 text-[11px] font-semibold text-slate-600 cursor-pointer"
        >
          <MessageSquare size={20} />
          <span>Inbox</span>
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
          reviews={reviewsByListing[selectedListing.id] || DEFAULT_REVIEWS}
          initialNights={activeNights}
          initialGuests={Math.max(1, totalGuests || 2)}
          dateRangeLabel={selectedDates.display || 'Nov 14 – Nov 16'}
          formatPrice={formatPrice}
          bookingSuccessCode={bookingSuccessCode}
          onClose={() => setSelectedListing(null)}
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
          }}
          onAddReview={handleAddReview}
        />
      )}

      {isHostModalOpen && (
        <HostStudioModal
          customListings={customListings}
          onClose={() => setIsHostModalOpen(false)}
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
          onClose={() => setIsMessagesOpen(false)}
        />
      )}

      {isTripsOpen && (
        <TripsModal
          bookings={bookings}
          formatPrice={formatPrice}
          onCancelBooking={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            showToast({ message: 'Reservation cancelled' });
          }}
          onOpenListingById={(listingId) => {
            const match = allListings.find((item) => item.id === listingId);
            setIsTripsOpen(false);
            if (match) handleOpenListing(match);
          }}
          onClose={() => setIsTripsOpen(false)}
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
          onClose={() => setExplorerCollection(null)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            showToast({ message: 'Guest profile updated' });
          }}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {isHelpOpen && <HelpCenterModal onClose={() => setIsHelpOpen(false)} />}

      {isAdminOpen && (
        <AdminPanelModal
          branding={branding}
          onUpdateBranding={handleUpdateBranding}
          onRemoveLogo={handleRemoveLogo}
          onRestoreDefaultLogo={handleRestoreDefaultLogo}
          allListings={allListings}
          customListings={customListings}
          onDeleteCustomListing={handleDeleteCustomListing}
          onOpenHostModal={() => setIsHostModalOpen(true)}
          bookings={bookings}
          onCancelBooking={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            showToast({ message: 'Reservation cancelled' });
          }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
};
