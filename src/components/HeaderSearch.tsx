'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CalendarCheck2,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react';
import {
  AppNotification,
  CATEGORY_TABS,
  CURRENCY_CONFIG,
  CurrencyCode,
  DATE_OPTIONS,
  GuestProfile,
  QaagaCategory,
  SiteBranding,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';

const SearchLocationPanel = dynamic(
  () => import('./SearchLocationPanel').then((m) => m.SearchLocationPanel),
  { ssr: false }
);
const SearchCalendar = dynamic(
  () => import('./SearchCalendar').then((m) => m.SearchCalendar),
  { ssr: false }
);
const SearchGuestSelector = dynamic(
  () => import('./SearchGuestSelector').then((m) => m.SearchGuestSelector),
  { ssr: false }
);
const MobileSearchModal = dynamic(
  () => import('./MobileSearchModal').then((m) => m.MobileSearchModal),
  { ssr: false }
);

interface HeaderSearchProps {
  branding: SiteBranding;
  activeCategory: QaagaCategory;
  onSelectCategory: (cat: QaagaCategory) => void;
  onResetHome: () => void;

  // Search state
  whereQuery: string;
  onWhereChange: (val: string) => void;
  selectedDates: (typeof DATE_OPTIONS)[number];
  onSelectDates: (opt: (typeof DATE_OPTIONS)[number]) => void;
  calendarMonth: 'Nov' | 'Dec';
  onToggleCalendarMonth: () => void;
  customCheckInDay: number | null;
  customCheckOutDay: number | null;
  onSelectCalendarDay: (day: number) => void;

  checkInIso?: string | null;
  checkOutIso?: string | null;
  onSelectDateRange?: (checkIn: string | null, checkOut: string | null, display: string, nights: number) => void;
  onClearDates?: () => void;

  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeGuestCount: (type: 'adults' | 'children' | 'infants' | 'pets', val: number) => void;
  onClearGuests: () => void;
  guestSummaryText: string;

  activePopover: 'where' | 'when' | 'who' | null;
  onSetActivePopover: (p: 'where' | 'when' | 'who' | null) => void;
  onExecuteSearch: () => void;
  matchingCount: number;

  // Right utility controls
  notifications: AppNotification[];
  isNotifOpen: boolean;
  onToggleNotif: () => void;
  onMarkAllNotifsRead: () => void;
  onClickNotification: (notif: AppNotification) => void;

  isAccountOpen: boolean;
  onToggleAccount: () => void;
  onCloseMenus: () => void;

  profile: GuestProfile;
  bookingsCount: number;
  threadsCount: number;
  unreadThreadsCount?: number;
  wishlistCount: number;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;

  onOpenHostModal: () => void;
  onOpenTrips: () => void;
  onOpenMessages: () => void;
  onOpenWishlist: () => void;
  onOpenProfileModal: () => void;
  onOpenHelpModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = React.memo(({
  branding,
  activeCategory,
  onSelectCategory,
  onResetHome,
  whereQuery,
  onWhereChange,
  selectedDates,
  onSelectDates,
  calendarMonth,
  onToggleCalendarMonth,
  customCheckInDay,
  customCheckOutDay,
  onSelectCalendarDay,
  checkInIso,
  checkOutIso,
  onSelectDateRange,
  onClearDates,
  adults,
  childrenCount,
  infants,
  pets,
  onChangeGuestCount,
  onClearGuests,
  guestSummaryText,
  activePopover,
  onSetActivePopover,
  onExecuteSearch,
  matchingCount,
  notifications,
  isNotifOpen,
  onToggleNotif,
  onMarkAllNotifsRead,
  onClickNotification,
  isAccountOpen,
  onToggleAccount,
  onCloseMenus,
  profile,
  bookingsCount,
  threadsCount,
  unreadThreadsCount = 0,
  wishlistCount,
  currency,
  onChangeCurrency,
  onOpenHostModal,
  onOpenTrips,
  onOpenMessages,
  onOpenWishlist,
  onOpenProfileModal,
  onOpenHelpModal,
  onOpenAdminModal,
  onOpenAuthModal,
}) => {
  const searchRef = useRef<HTMLDivElement | null>(null);
  const compactPillRef = useRef<HTMLDivElement | null>(null);
  const whereInputRef = useRef<HTMLInputElement | null>(null);
  const rightUtilsRef = useRef<HTMLDivElement | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isManualExpand, setIsManualExpand] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileInitialTab, setMobileInitialTab] = useState<'where' | 'when' | 'who'>('where');

  const shouldCollapse = isScrolled && !isManualExpand;

  const handleOpenSearchModal = (tab: 'where' | 'when' | 'who' = 'where') => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileInitialTab(tab);
      setIsMobileModalOpen(true);
    } else {
      setIsManualExpand(true);
      onSetActivePopover(tab);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSetActivePopover(null);
        setIsManualExpand(false);
        setIsMobileModalOpen(false);
        onCloseMenus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSetActivePopover, onCloseMenus]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inSearch = searchRef.current && searchRef.current.contains(target);
      const inCompact = compactPillRef.current && compactPillRef.current.contains(target);
      if (!inSearch && !inCompact) {
        onSetActivePopover(null);
        setIsManualExpand(false);
      }
      if (rightUtilsRef.current && !rightUtilsRef.current.contains(target)) {
        onCloseMenus();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onSetActivePopover, onCloseMenus]);

  const isScrolledRef = useRef(false);
  const isManualExpandRef = useRef(false);
  const lastToggleTimeRef = useRef(0);

  useEffect(() => {
    isScrolledRef.current = isScrolled;
  }, [isScrolled]);

  useEffect(() => {
    isManualExpandRef.current = isManualExpand;
  }, [isManualExpand]);

  useEffect(() => {
    const getScrollY = () => {
      if (typeof window === 'undefined') return 0;
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.scroll === 'number') {
        return lenis.scroll;
      }
      return (
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };

    // Airbnb-style asymmetric threshold & transition protection:
    // 1. Scrolling down past 45px smoothly compacts the navigation bar.
    // 2. Scrolling back up expands when reaching the very top (scrollY <= 8px).
    // 3. A 280ms transition lock discards synthetic reflow scroll events, preventing animation jitter.
    const COLLAPSE_THRESHOLD = 45;
    const EXPAND_THRESHOLD = 8;

    let ticking = false;

    const updateScrollState = () => {
      const scrollY = getScrollY();
      const now = Date.now();

      // Guard against synthetic scroll oscillations during CSS transitions
      if (now - lastToggleTimeRef.current < 280) {
        if (scrollY > EXPAND_THRESHOLD) {
          return;
        }
      }

      if (scrollY > COLLAPSE_THRESHOLD) {
        if (!isScrolledRef.current) {
          isScrolledRef.current = true;
          lastToggleTimeRef.current = now;
          setIsScrolled(true);
        }
      } else if (scrollY <= EXPAND_THRESHOLD) {
        if (isScrolledRef.current) {
          isScrolledRef.current = false;
          lastToggleTimeRef.current = now;
          setIsScrolled(false);
          if (isManualExpandRef.current) {
            setIsManualExpand(false);
          }
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initialize on mount
    updateScrollState();

    window.addEventListener('scroll', handleScroll, { passive: true });
    const lenis = (window as any).__lenis;
    if (lenis?.on) {
      lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenis?.off) {
        lenis.off('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (activePopover === 'where') {
      const id = window.setTimeout(() => {
        whereInputRef.current?.focus();
      }, 20);
      return () => window.clearTimeout(id);
    }
  }, [activePopover]);

  const handleExecuteSearch = () => {
    setIsManualExpand(false);
    onExecuteSearch();
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const totalAlertsCount = unreadNotifCount + unreadThreadsCount;
  const activeTabObj =
    CATEGORY_TABS.find((tab) => tab.id === activeCategory) || CATEGORY_TABS[0];
  const stayTab = CATEGORY_TABS.find((tab) => tab.id === 'stay');
  const displayCategoryIcon =
    activeCategory === 'experiences' || activeCategory === 'services'
      ? activeTabObj.iconSrc
      : stayTab?.iconSrc || '/assets/kl-ui/icon-stay.png';
  const displayWhere = whereQuery.trim() ? whereQuery : 'Where';
  const displayWhen = selectedDates.display ? selectedDates.display : 'When';
  const displayWho = guestSummaryText ? guestSummaryText : 'Who';

  return (
    <div
      className={`sticky top-0 z-50 bg-white/98 backdrop-blur-md w-full transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shouldCollapse
          ? 'border-b border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
          : 'border-b border-slate-200/60 shadow-none'
      }`}
    >
      <div
        className={`w-full px-3 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 ${
          shouldCollapse
            ? 'py-2 sm:py-2.5 space-y-0'
            : 'pt-3 sm:pt-4 pb-3 sm:pb-4 space-y-2.5 sm:space-y-4'
        }`}
      >
        {/* ================================================================= */}
        {/* ROW 1: qaaga.com — Centered Tabs / Compact Pill — Host, Bell, User */}
        {/* ================================================================= */}
        <header className="w-full flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4">
          {/* Top-Left Official Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              aria-label="qaaga.com home"
              onClick={onResetHome}
              className={`inline-flex items-center leading-none cursor-pointer shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B62] rounded-xl transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left ${
                shouldCollapse ? 'scale-[0.82] sm:scale-[0.92]' : 'scale-100'
              }`}
            >
              <BrandLogo branding={branding} variant="header" />
            </button>
          </div>

          {/* Center: Desktop Category Tabs (Top) OR Compact Search Pill + Plus Button (Scrolled) */}
          <div
            ref={compactPillRef}
            className={`flex items-center justify-center relative min-h-[44px] sm:min-h-[48px] px-1 sm:px-2 min-w-0 ${
              shouldCollapse ? 'flex-1 md:flex-initial' : 'hidden md:flex flex-1'
            }`}
          >
            {/* Desktop Category Tabs: Shown at top on md+ */}
            <nav
              aria-label="Listing categories"
              className={`hidden md:flex items-center justify-center gap-4 sm:gap-7 lg:gap-10 overflow-x-auto scrollbar-none px-0.5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shouldCollapse
                  ? 'opacity-0 scale-95 pointer-events-none -translate-y-2 absolute invisible'
                  : 'opacity-100 scale-100 pointer-events-auto translate-y-0 visible'
              }`}
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectCategory(tab.id)}
                    className={`relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer pb-2.5 pt-1 ${
                      isActive
                        ? 'text-slate-950 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 font-semibold'
                    }`}
                  >
                    <img
                      src={tab.iconSrc}
                      alt=""
                      width={36}
                      height={36}
                      decoding="async"
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className={`w-6 h-6 min-[410px]:w-7 min-[410px]:h-7 sm:w-9 sm:h-9 object-contain transition-transform duration-200 ${
                        isActive ? 'scale-105' : 'opacity-95 hover:opacity-100'
                      }`}
                    />
                    <span className="text-[12.5px] min-[410px]:text-[13.5px] sm:text-[14.5px] font-semibold tracking-[-0.01em]">
                      {tab.label}
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Compact Search Pill + Adjacent '+' Button: Shown on scroll on all screen sizes */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2.5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full ${
                shouldCollapse
                  ? 'opacity-100 scale-100 pointer-events-auto translate-y-0 visible'
                  : 'opacity-0 scale-95 pointer-events-none translate-y-2 absolute invisible'
              }`}
            >
              <button
                type="button"
                data-testid="compact-search-pill"
                aria-label="Search destination, dates, guests"
                onClick={() => handleOpenSearchModal('where')}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-white border border-slate-300/90 hover:border-slate-400 rounded-full pl-2 sm:pl-3.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.14)] transition-shadow cursor-pointer group min-w-0"
              >
                {/* Stay / Category Logo beside Where */}
                <img
                  src={displayCategoryIcon}
                  alt="Stay"
                  width={24}
                  height={24}
                  decoding="async"
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain shrink-0"
                />

                <span className="text-[11px] sm:text-[12.5px] md:text-[13.5px] font-bold text-slate-900 truncate max-w-[65px] sm:max-w-[100px] md:max-w-[130px]">
                  {displayWhere}
                </span>

                <span className="w-[1px] sm:w-[1.5px] h-3 sm:h-3.5 md:h-4 bg-slate-300 shrink-0" aria-hidden="true" />

                <span className="text-[11px] sm:text-[12.5px] md:text-[13.5px] font-bold text-slate-900 truncate max-w-[55px] sm:max-w-[90px] md:max-w-[120px]">
                  {displayWhen}
                </span>

                <span className="hidden sm:inline-block w-[1px] sm:w-[1.5px] h-3 sm:h-3.5 md:h-4 bg-slate-300 shrink-0" aria-hidden="true" />

                <span className="hidden sm:inline-block text-[11px] sm:text-[12.5px] md:text-[13.5px] font-normal text-slate-700 truncate max-w-[55px] sm:max-w-[85px] md:max-w-[110px]">
                  {displayWho}
                </span>

                {/* Gradient Search Button */}
                <span
                  className="search-button w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 ml-0.5 sm:ml-1 transition-transform duration-200 ease-out group-hover:scale-105"
                  style={{ borderRadius: '32px' }}
                >
                  <Search size={14} className="text-white" strokeWidth={2.5} />
                </span>
              </button>

              {/* Plus Button beside Search Button: linear-gradient(90deg, #E91D58, #D90065), white plus icon */}
              <button
                type="button"
                aria-label="Create new listing"
                onClick={onOpenHostModal}
                style={{
                  background: 'linear-gradient(90deg, #E91D58, #D90065)',
                  color: '#FFFFFF',
                  borderRadius: '100px',
                }}
                className="flex w-7 h-7 sm:w-8 sm:h-8 border-0 border-none items-center justify-center text-white active:scale-95 transition-transform shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(233,29,88,0.32)] hover:brightness-90 hover:scale-105"
              >
                <Plus size={16} strokeWidth={2.6} className="text-white" />
              </button>
            </div>
          </div>

          {/* Right: "become a host" + Notification Bell + Avatar Menu */}
          <div
            ref={rightUtilsRef}
            className="relative flex items-center justify-end shrink-0 gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 lg:gap-4">
              <button
                type="button"
                onClick={onOpenHostModal}
                className="hidden md:inline-flex items-center text-xs sm:text-[13px] md:text-[15px] text-slate-800 hover:text-slate-950 font-medium px-2 py-1 rounded-full hover:bg-slate-100/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>become a host</span>
              </button>

              {/* Notification Bell Icon + #C72B62 Combined Total Count */}
              <button
                type="button"
                aria-label="Notifications"
                onClick={onToggleNotif}
                className="relative min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell
                  size={21}
                  className="fill-[#949494] text-[#767676] hover:fill-[#767676] transition-colors"
                />
                {(totalAlertsCount > 0 || notifications.length > 0) && (
                  <span className="absolute top-0.5 right-0.5 text-[12px] sm:text-[14px] font-bold text-[#C72B62] leading-none tabular-nums">
                    {totalAlertsCount > 0 ? totalAlertsCount : notifications.length}
                  </span>
                )}
              </button>

              {/* User Profile / Account Menu Pill (Airbnb style: hamburger + avatar, opens Account & Admin menu) */}
              <button
                type="button"
                aria-label={profile.verified ? `${profile.fullName}'s account menu` : 'Main account menu'}
                onClick={onToggleAccount}
                className="flex items-center gap-2 pl-2.5 sm:pl-3 pr-1 sm:pr-1.5 py-1 rounded-full border border-slate-300 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-white active:scale-95 shrink-0"
              >
                <Menu size={16} className="text-slate-700 shrink-0 ml-0.5" />
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 text-white flex items-center justify-center shrink-0 relative ${
                    profile.verified ? 'bg-[#C72B62]' : 'bg-[#717171]'
                  }`}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : profile.verified ? (
                    <span className="text-xs sm:text-sm font-bold text-white uppercase select-none">
                      {profile.fullName.charAt(0) || 'U'}
                    </span>
                  ) : (
                    <User size={16} className="fill-white text-white" />
                  )}
                  {profile.verified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
              </button>
            </div>

            {/* Notifications Dropdown Popover with Messages, Bookings & Wishlist Access */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-11 sm:top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.18)] border border-slate-200 py-3 z-50 text-left"
                >
                {/* Header */}
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Notifications & Activity</p>
                    <p className="text-[11px] text-slate-500">
                      {totalAlertsCount > 0 ? `${totalAlertsCount} new updates & alerts` : 'All caught up'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotifsRead}
                        className="text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Close notifications"
                      onClick={onCloseMenus}
                      className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Quick Access: Messages, Bookings, Wishlist */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Direct Access
                    </p>
                    <span className="text-[10px] text-slate-400">Activity Hub</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Messages */}
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenus();
                        onOpenMessages();
                      }}
                      className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#C72B62]/50 hover:bg-[#C72B62]/[0.04] transition-all cursor-pointer text-center relative shadow-2xs hover:shadow-xs"
                    >
                      <div className="relative mb-1">
                        <MessageSquare size={17} className="text-[#C72B62]" />
                        {unreadThreadsCount > 0 && (
                          <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#C72B62] rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-[#C72B62] truncate w-full">
                        Messages
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {unreadThreadsCount > 0 ? `${unreadThreadsCount} new` : `${threadsCount} chats`}
                      </span>
                    </button>

                    {/* Bookings */}
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenus();
                        onOpenTrips();
                      }}
                      className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#C72B62]/50 hover:bg-[#C72B62]/[0.04] transition-all cursor-pointer text-center relative shadow-2xs hover:shadow-xs"
                    >
                      <div className="relative mb-1">
                        <CalendarCheck2 size={17} className="text-[#C72B62]" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-[#C72B62] truncate w-full">
                        Bookings
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {bookingsCount} {bookingsCount === 1 ? 'trip' : 'trips'}
                      </span>
                    </button>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenus();
                        onOpenWishlist();
                      }}
                      className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#C72B62]/50 hover:bg-[#C72B62]/[0.04] transition-all cursor-pointer text-center relative shadow-2xs hover:shadow-xs"
                    >
                      <div className="relative mb-1">
                        <Heart size={17} className="text-[#C72B62]" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-[#C72B62] truncate w-full">
                        Wishlist
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {wishlistCount} saved
                      </span>
                    </button>
                  </div>
                </div>

                {/* Notifications & Responses Feed */}
                <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Recent Alerts & Responses
                  </p>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                    {notifications.length}
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <p className="text-xs text-slate-500 font-medium">No recent alerts</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Messages and booking updates will appear here
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => onClickNotification(n)}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          n.unread ? 'bg-[#C72B62]/[0.04]' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            n.actionType === 'messages'
                              ? 'bg-pink-100 text-[#C72B62]'
                              : n.actionType === 'trips'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-[#C72B62]'
                          }`}
                        >
                          {n.actionType === 'messages' ? (
                            <MessageSquare size={13} />
                          ) : n.actionType === 'trips' ? (
                            <CalendarCheck2 size={13} />
                          ) : (
                            <Heart size={13} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                        </div>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#C72B62] shrink-0 mt-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Account / Profile Dropdown Menu */}
            <AnimatePresence>
              {isAccountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-11 sm:top-12 w-72 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.16)] border border-slate-200 py-2 z-50 text-left"
                >
                {/* Primary Log In or Sign Up Button */}
                <div className="p-1.5 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#C72B62]/[0.08] hover:bg-[#C72B62]/[0.15] text-[#C72B62] font-semibold cursor-pointer text-left transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <User size={15} />
                      <span>Log in or sign up</span>
                    </span>
                    <span className="text-[10px] bg-[#C72B62] text-white px-2 py-0.5 rounded-full font-bold">
                      OTP
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onCloseMenus();
                    onOpenProfileModal();
                  }}
                  className="w-full px-4 py-2.5 border-b border-slate-100 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{profile.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {profile.email} · Edit profile
                  </p>
                </button>

                <div className="p-1.5 space-y-0.5 text-[13px] text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenMessages();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <span>Messages</span>
                    <span className="text-xs font-bold text-[#C72B62] tabular-nums">
                      {threadsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenTrips();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <span>Trips & Reservations</span>
                    <span className="text-xs font-bold text-[#C72B62] tabular-nums">
                      {bookingsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenWishlist();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <span>Wishlist</span>
                    <span className="text-xs font-semibold text-slate-500 tabular-nums">
                      {wishlistCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenHostModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#C72B62]/[0.06] hover:bg-[#C72B62]/[0.12] text-[#C72B62] font-semibold cursor-pointer"
                  >
                    <span>Become a host</span>
                    <Plus size={15} strokeWidth={2.4} />
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5">
                    <Link
                      href="/user/dashboard"
                      prefetch={true}
                      onClick={onCloseMenus}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutDashboard size={14} className="text-[#C72B62]" />
                        <span>Customer Dashboard</span>
                      </span>
                    </Link>
                    <Link
                      href="/host/dashboard"
                      prefetch={true}
                      onClick={onCloseMenus}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutDashboard size={14} className="text-slate-600" />
                        <span>Host Dashboard</span>
                      </span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenAdminModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer mt-1"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Shield size={14} />
                      <span>Admin Panel</span>
                    </span>
                    <span className="text-[10px] font-medium text-white/80">
                      Logo & Site
                    </span>
                  </button>
                </div>

                {/* Currency Switcher */}
                <div className="px-3.5 py-2.5 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Display currency
                  </p>
                  <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['USD', 'MYR', 'EUR', 'BDT'] as CurrencyCode[]).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => onChangeCurrency(code)}
                        className={`py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          currency === code
                            ? 'bg-white text-[#C72B62] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenus();
                      onOpenHelpModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    <HelpCircle size={14} className="text-[#C72B62]" />
                    <span>Help Center & Guest Protection</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </header>

        {/* ================================================================= */}
        {/* ROW 2: Search Section (Mobile Dedicated Card & Categories + Desktop 3-Segment) */}
        {/* ================================================================= */}
        {!shouldCollapse && (
          <div
            ref={searchRef}
            className="relative flex flex-col items-center justify-center gap-2 sm:gap-3.5 w-full mt-2 sm:mt-4 mb-0 overflow-visible"
          >
          {/* MOBILE ONLY (md:hidden): Dedicated Full-Width Search Card + Adjacent '+' Button */}
          <div className="md:hidden w-full space-y-2.5">
            {/* Mobile Search Bar + Adjacent '+' Button */}
            <div className="flex items-center gap-2 w-full">
              {/* Full-Width Mobile Airbnb Search Bar */}
              <button
                type="button"
                onClick={() => handleOpenSearchModal('where')}
                className="flex-1 min-w-0 flex items-center justify-between bg-white border border-slate-300/90 rounded-full px-3.5 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)] transition-[box-shadow,transform] cursor-pointer text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Search size={15} className="text-[#C72B62]" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">
                      {whereQuery.trim() ? whereQuery : 'Where to?'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                      {[
                        whereQuery ? 'Any week' : 'Anywhere',
                        selectedDates.display || 'Any week',
                        guestSummaryText || 'Add guests',
                      ].join(' · ')}
                    </p>
                  </div>
                </div>
                <span
                  className="search-button w-8 h-8 flex items-center justify-center shrink-0 ml-1.5"
                  style={{ borderRadius: '32px' }}
                >
                  <SlidersHorizontal size={14} className="text-white" />
                </span>
              </button>

              {/* Mobile '+' Button right beside search bar */}
              <button
                type="button"
                aria-label="Create new listing"
                onClick={onOpenHostModal}
                style={{
                  background: 'linear-gradient(90deg, #E91D58, #D90065)',
                  color: '#FFFFFF',
                  borderRadius: '100px',
                }}
                className="w-10 h-10 flex border-0 border-none text-white items-center justify-center active:scale-95 transition-transform shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(233,29,88,0.32)] hover:brightness-90"
              >
                <Plus size={18} strokeWidth={2.6} className="text-white" />
              </button>
            </div>

            {/* Mobile Category Tabs Strip */}
            <nav
              aria-label="Mobile listing categories"
              className="flex items-center justify-center gap-5 min-[380px]:gap-7 overflow-x-auto scrollbar-none px-1 pt-0.5"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectCategory(tab.id)}
                    className={`relative flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer pb-2 pt-1 ${
                      isActive
                        ? 'text-slate-950 font-bold'
                        : 'text-slate-500 hover:text-slate-800 font-semibold'
                    }`}
                  >
                    <img
                      src={tab.iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      decoding="async"
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className={`w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 object-contain transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'opacity-85'
                      }`}
                    />
                    <span className="text-[12.5px] min-[380px]:text-[13px] tracking-[-0.01em]">
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* DESKTOP ONLY (hidden md:flex): Centered 3-Segment Search Pill + Adjacent '+' Button */}
          <div className="hidden md:flex items-center justify-center gap-2 sm:gap-3.5 w-full">
            <div
              className="w-full rounded-full bg-white border border-slate-300/90 shadow-[0_3px_14px_rgba(15,23,42,0.05)] flex items-center max-w-[850px] min-h-[58px] sm:min-h-[66px] pl-4 sm:pl-7 pr-1.5 sm:pr-2.5 py-1.5"
            >
            {/* Segment 1: Where */}
            <div
              onClick={() => handleOpenSearchModal('where')}
              className={`flex-1 min-w-0 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full flex items-center justify-between gap-1 cursor-pointer transition-all ${
                activePopover === 'where'
                  ? 'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200/90'
                  : 'hover:bg-slate-100/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="qaaga-where-input"
                  className={`block font-bold text-slate-950 leading-tight cursor-pointer transition-all ${
                    shouldCollapse ? 'text-[11px]' : 'text-[12px]'
                  }`}
                >
                  Where
                </label>
                <input
                  ref={whereInputRef}
                  id="qaaga-where-input"
                  type="text"
                  value={whereQuery}
                  onFocus={() => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                      onSetActivePopover('where');
                    }
                  }}
                  onChange={(e) => onWhereChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExecuteSearch();
                    }
                  }}
                  placeholder="Where are you going?"
                  className={`w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none truncate transition-all ${
                    shouldCollapse
                      ? 'text-[12px] sm:text-[13px] mt-0'
                      : 'text-[12.5px] sm:text-[14px] mt-0.5'
                  }`}
                />
              </div>
              {whereQuery && (
                <button
                  type="button"
                  aria-label="Clear destination"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWhereChange('');
                  }}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Crisp Divider 1: Fades out when adjacent segment is active */}
            <div
              className={`w-[1px] bg-slate-300 mx-1 shrink-0 transition-opacity ${
                activePopover === 'where' || activePopover === 'when' ? 'opacity-0' : 'opacity-100'
              } ${shouldCollapse ? 'h-4 sm:h-5' : 'h-6 sm:h-7'}`}
              aria-hidden="true"
            />

            {/* Segment 2: When */}
            <button
              type="button"
              onClick={() => handleOpenSearchModal('when')}
              className={`w-[28%] sm:w-[32%] min-w-0 text-left py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-all cursor-pointer ${
                activePopover === 'when'
                  ? 'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200/90'
                  : 'hover:bg-slate-100/60'
              }`}
            >
              <span
                className={`block font-bold text-slate-950 leading-tight transition-all ${
                  shouldCollapse ? 'text-[11px]' : 'text-[12px]'
                }`}
              >
                When
              </span>
              <span
                className={`block leading-tight truncate transition-all ${
                  shouldCollapse
                    ? 'text-[12px] sm:text-[13px] mt-0'
                    : 'text-[12.5px] sm:text-[14px] mt-0.5'
                } ${
                  selectedDates.display ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {selectedDates.display || 'Add dates'}
              </span>
            </button>

            {/* Crisp Divider 2: Fades out when adjacent segment is active */}
            <div
              className={`w-[1px] bg-slate-300 mx-1 shrink-0 transition-opacity ${
                activePopover === 'when' || activePopover === 'who' ? 'opacity-0' : 'opacity-100'
              } ${shouldCollapse ? 'h-4 sm:h-5' : 'h-6 sm:h-7'}`}
              aria-hidden="true"
            />

            {/* Segment 3: Who */}
            <button
              type="button"
              onClick={() => handleOpenSearchModal('who')}
              className={`w-[24%] sm:w-[26%] min-w-0 text-left py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-all cursor-pointer ${
                activePopover === 'who'
                  ? 'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200/90'
                  : 'hover:bg-slate-100/60'
              }`}
            >
              <span
                className={`block font-bold text-slate-950 leading-tight transition-all ${
                  shouldCollapse ? 'text-[11px]' : 'text-[12px]'
                }`}
              >
                Who
              </span>
              <span
                className={`block leading-tight truncate tabular-nums transition-all ${
                  shouldCollapse
                    ? 'text-[12px] sm:text-[13px] mt-0'
                    : 'text-[12.5px] sm:text-[14px] mt-0.5'
                } ${
                  guestSummaryText ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {guestSummaryText || 'Add guests'}
              </span>
            </button>

            {/* Custom Search Button with exact linear gradient, hover radial-gradient, and border-radius: 32px */}
            <button
              type="button"
              aria-label="Search"
              onClick={handleExecuteSearch}
              className={`search-button inline-flex items-center justify-center border-0 border-none text-white font-[600] tracking-normal cursor-pointer select-none shrink-0 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ml-1 sm:ml-2 ${
                activePopover
                  ? 'py-[10px] sm:py-[14px] px-[16px] sm:px-[24px] gap-[8px]'
                  : 'w-11 h-11 sm:w-12 sm:h-12 p-0'
              }`}
            >
              <Search
                size={activePopover ? 20 : 18}
                className="text-white shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              {activePopover && (
                <span className="leading-none text-white font-[600] text-[15px] sm:text-[16px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                  Search
                </span>
              )}
            </button>
          </div>

          {/* Adjacent '+' Circle Button beside Search Button:
              background: linear-gradient(90deg, #E91D58, #D90065), border-radius: 100px, white plus icon */}
          <button
            type="button"
            aria-label="Create new listing"
            onClick={onOpenHostModal}
            style={{
              background: 'linear-gradient(90deg, #E91D58, #D90065)',
              color: '#FFFFFF',
              borderRadius: '100px',
            }}
            className={`hidden md:flex border-0 border-none text-white items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer shadow-[0_4px_16px_rgba(233,29,88,0.32)] hover:brightness-90 hover:scale-105 hover:shadow-[0_6px_22px_rgba(233,29,88,0.42)] ${
              shouldCollapse ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-11 h-11 sm:w-12 sm:h-12'
            }`}
          >
            <Plus size={shouldCollapse ? 20 : 24} strokeWidth={2.6} className="text-white" />
          </button>
        </div>

          {/* POPOVER 1: WHERE */}
          <AnimatePresence>
            {activePopover === 'where' && (
              <motion.div
                key="popover-where"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden md:block absolute left-0 right-0 mx-auto md:left-1/4 md:-translate-x-1/4 md:mx-0 w-full max-w-[480px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left ${
                  shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
                }`}
              >
                <SearchLocationPanel
                  whereQuery={whereQuery}
                  onSelectLocation={(chosen) => {
                    onWhereChange(chosen);
                    onSetActivePopover('when');
                  }}
                  onClear={() => onWhereChange('')}
                  onClose={() => onSetActivePopover(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* POPOVER 2: WHEN (Two-month calendar on Desktop) */}
          <AnimatePresence>
            {activePopover === 'when' && (
              <motion.div
                key="popover-when"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden md:block absolute left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[760px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-6 z-40 text-left ${
                  shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
                }`}
              >
                <SearchCalendar
                  checkInDate={checkInIso || null}
                  checkOutDate={checkOutIso || null}
                  onSelectRange={(start, end, display, nights) => {
                    if (onSelectDateRange) {
                      onSelectDateRange(start, end, display, nights);
                    } else {
                      onSelectDates({
                        id: `range-${start}-${end}`,
                        label: display,
                        display: display,
                        nights: nights,
                        tag: `${display} · ${nights} night${nights > 1 ? 's' : ''}`,
                      });
                    }
                  }}
                  onClear={() => {
                    if (onClearDates) {
                      onClearDates();
                    } else {
                      onSelectDates(DATE_OPTIONS[0]);
                    }
                  }}
                  onClose={() => onSetActivePopover(null)}
                  onNext={() => onSetActivePopover('who')}
                  isMobileSheet={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* POPOVER 3: WHO */}
          <AnimatePresence>
            {activePopover === 'who' && (
              <motion.div
                key="popover-who"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden md:block absolute left-0 right-0 mx-auto md:left-auto md:mx-0 md:right-16 w-full max-w-[400px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left ${
                  shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
                }`}
              >
                <SearchGuestSelector
                  adults={adults}
                  childrenCount={childrenCount}
                  infants={infants}
                  pets={pets}
                  onChangeGuestCount={onChangeGuestCount}
                  onClear={onClearGuests}
                  onApply={() => onSetActivePopover(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Dedicated Search Bottom Sheet / Modal */}
      <MobileSearchModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        whereQuery={whereQuery}
        onSelectLocation={(chosen) => onWhereChange(chosen)}
        onClearLocation={() => onWhereChange('')}
        checkInDate={checkInIso || null}
        checkOutDate={checkOutIso || null}
        onSelectDateRange={(start, end, display, nights) => {
          if (onSelectDateRange) {
            onSelectDateRange(start, end, display, nights);
          } else {
            onSelectDates({
              id: `range-${start}-${end}`,
              label: display,
              display: display,
              nights: nights,
              tag: `${display} · ${nights} night${nights > 1 ? 's' : ''}`,
            });
          }
        }}
        onClearDates={() => {
          if (onClearDates) {
            onClearDates();
          } else {
            onSelectDates(DATE_OPTIONS[0]);
          }
        }}
        selectedDatesDisplay={selectedDates.display}
        adults={adults}
        childrenCount={childrenCount}
        infants={infants}
        pets={pets}
        onChangeGuestCount={onChangeGuestCount}
        onClearGuests={onClearGuests}
        guestSummaryText={guestSummaryText}
        onExecuteSearch={handleExecuteSearch}
        matchingCount={matchingCount}
        initialTab={mobileInitialTab}
      />
    </div>
  );
});

HeaderSearch.displayName = 'HeaderSearch';
