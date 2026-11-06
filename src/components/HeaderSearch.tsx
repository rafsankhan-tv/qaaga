'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bell,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Shield,
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
  KL_DESTINATIONS,
  QaagaCategory,
  SiteBranding,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';

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

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
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
  const shouldCollapse = isScrolled && !isManualExpand;

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

  useEffect(() => {
    const getScrollY = () => {
      if (typeof window === 'undefined') return 0;
      return (
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };

    const handleScroll = () => {
      const currentY = getScrollY();
      const scrolled = currentY > 20;
      setIsScrolled((prev) => {
        if (prev !== scrolled) {
          if (!scrolled) {
            setIsManualExpand(false);
          }
          return scrolled;
        }
        return prev;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('touchmove', handleScroll);
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
      className={`sticky top-0 z-50 bg-white/98 backdrop-blur-md w-full transition-all duration-300 ${
        shouldCollapse
          ? 'border-b border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
          : 'border-b border-slate-200/90'
      }`}
    >
      <div
        className={`w-full px-3 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 transition-all duration-300 ease-in-out ${
          shouldCollapse
            ? 'py-2 sm:py-2.5 space-y-0'
            : 'pt-3 sm:pt-5 pb-3 sm:pb-6 space-y-3 sm:space-y-5'
        }`}
      >
        {/* ================================================================= */}
        {/* ROW 1: qaaga.com — Centered Tabs / Compact Pill — Host, Bell, User */}
        {/* ================================================================= */}
        <header
          className={`w-full transition-all duration-300 ${
            shouldCollapse
              ? 'flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4'
              : 'flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-2.5 md:gap-4'
          }`}
        >
          {/* Top-Left Official Brand Logo */}
          <div className="flex items-center shrink-0 md:justify-self-start">
            <button
              type="button"
              aria-label="qaaga.com home"
              onClick={onResetHome}
              className={`inline-flex items-center leading-none cursor-pointer shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C72B62] rounded-xl transition-transform duration-300 origin-left ${
                shouldCollapse ? 'scale-[0.82] sm:scale-[0.92]' : 'scale-100'
              }`}
            >
              <BrandLogo branding={branding} variant="header" />
            </button>
          </div>

          {/* Center: Category Tabs (Top) OR Compact Search Pill + Plus Button (Scrolled) */}
          <div
            ref={compactPillRef}
            className={`flex items-center justify-center relative min-h-[44px] sm:min-h-[48px] ${
              shouldCollapse
                ? 'flex-1 md:flex-initial md:justify-self-center min-w-0 px-1'
                : 'w-full md:w-auto md:justify-self-center'
            }`}
          >
            {/* Category Tabs: Shown at top */}
            <nav
              aria-label="Listing categories"
              className={`flex items-center justify-between min-[410px]:justify-center gap-2 min-[410px]:gap-4 sm:gap-7 lg:gap-10 overflow-x-auto scrollbar-none px-0.5 transition-all duration-300 ease-in-out ${
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
                    className={`relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer pb-2.5 pt-1 ${
                      isActive
                        ? 'text-slate-950 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 font-semibold'
                    }`}
                  >
                    <img
                      src={tab.iconSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className={`w-6 h-6 min-[410px]:w-7 min-[410px]:h-7 sm:w-9 sm:h-9 object-contain transition-all duration-300 ${
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

            {/* Compact Search Pill + Adjacent '+' Button: Shown on scroll */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2.5 transition-all duration-300 ease-in-out max-w-full ${
                shouldCollapse
                  ? 'opacity-100 scale-100 pointer-events-auto translate-y-0 visible'
                  : 'opacity-0 scale-95 pointer-events-none translate-y-2 absolute invisible'
              }`}
            >
              <button
                type="button"
                data-testid="compact-search-pill"
                aria-label="Search destination, dates, guests"
                onClick={() => {
                  setIsManualExpand(true);
                  onSetActivePopover('where');
                }}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-white border border-slate-300/90 hover:border-slate-400 rounded-full pl-2.5 sm:pl-3.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.14)] transition-all cursor-pointer group min-w-0"
              >
                {/* Stay / Category Logo beside Where */}
                <img
                  src={displayCategoryIcon}
                  alt="Stay"
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain shrink-0"
                />

                <span className="text-[11px] sm:text-[12.5px] md:text-[13.5px] font-bold text-slate-900 truncate max-w-[65px] sm:max-w-[100px] md:max-w-[130px]">
                  {displayWhere}
                </span>

                <span className="w-[1px] sm:w-[1.5px] h-3 sm:h-3.5 md:h-4 bg-slate-300 shrink-0" aria-hidden="true" />

                <span className="text-[11px] sm:text-[12.5px] md:text-[13.5px] font-bold text-slate-900 truncate max-w-[60px] sm:max-w-[90px] md:max-w-[120px]">
                  {displayWhen}
                </span>

                <span className="w-[1px] sm:w-[1.5px] h-3 sm:h-3.5 md:h-4 bg-slate-300 shrink-0" aria-hidden="true" />

                <span className="text-[11px] sm:text-[12.5px] md:text-[13.5px] font-normal text-slate-700 truncate max-w-[55px] sm:max-w-[85px] md:max-w-[110px]">
                  {displayWho}
                </span>

                {/* Solid #C72B62 Search Circle Button */}
                <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#C72B62] group-hover:bg-[#ad2253] text-white flex items-center justify-center shrink-0 ml-0.5 sm:ml-1 shadow-[0_2px_8px_rgba(199,43,98,0.28)] transition-transform group-hover:scale-105">
                  <Search size={13} strokeWidth={2.6} />
                </span>
              </button>

              {/* Plus Button beside Search Button (desktop/tablet only, hidden on mobile view top) */}
              <button
                type="button"
                aria-label="Create new listing"
                onClick={onOpenHostModal}
                className="hidden md:flex w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white border border-slate-300 hover:border-[#C72B62]/60 items-center justify-center text-[#C72B62] active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs hover:shadow-sm"
              >
                <Plus size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Right: "become a host" + Notification Bell + Avatar Menu (desktop only, hidden on mobile view top) */}
          <div
            ref={rightUtilsRef}
            className="relative hidden md:flex items-center justify-end shrink-0 gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 md:justify-self-end"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 lg:gap-4">
              <button
                type="button"
                onClick={onOpenHostModal}
                className="inline-flex items-center text-xs sm:text-[13px] md:text-[15px] text-slate-800 hover:text-slate-950 font-medium px-2 py-1 rounded-full hover:bg-slate-100/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="hidden sm:inline">become a host</span>
                <span className="inline sm:hidden">Host</span>
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

              {/* User Profile Avatar Button (no 3-line menu next to profile) */}
              <button
                type="button"
                aria-label={profile.verified ? `${profile.fullName}'s profile menu` : 'Log in or sign up'}
                onClick={() => {
                  if (profile.verified) {
                    onToggleAccount();
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-300 hover:border-slate-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0 active:scale-95 relative ${
                  profile.verified ? 'bg-[#C72B62] hover:bg-[#ad2253]' : 'bg-[#9E9E9E] hover:bg-[#828282]'
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
                  <User size={18} className="fill-white text-white" />
                )}
                {profile.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>

            {/* Notifications Dropdown Popover with Messages, Bookings & Wishlist Access */}
            {isNotifOpen && (
              <div className="absolute right-0 top-2 md:top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.18)] border border-slate-200 py-3 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
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
              </div>
            )}

            {/* Account / Profile Dropdown Menu */}
            {isAccountOpen && (
              <div className="absolute right-0 top-2 md:top-12 w-72 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.16)] border border-slate-200 py-2 z-50 text-left">
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
              </div>
            )}
          </div>
        </header>

        {/* ================================================================= */}
        {/* ROW 2: Centered 3-Segment Search Pill + Adjacent '+' Button       */}
        {/* ================================================================= */}
        <div
          ref={searchRef}
          className={`relative flex items-center justify-center gap-2 sm:gap-3.5 transition-all duration-300 ease-in-out ${
            shouldCollapse
              ? 'max-h-0 opacity-0 -translate-y-4 scale-95 pointer-events-none overflow-hidden my-0 py-0'
              : 'max-h-[160px] opacity-100 translate-y-0 scale-100 pointer-events-auto mt-3 sm:mt-4'
          }`}
        >
          <div
            className={`w-full rounded-full bg-white border border-slate-300/90 shadow-[0_3px_14px_rgba(15,23,42,0.05)] flex items-center transition-all duration-300 ${
              shouldCollapse
                ? 'max-w-[680px] sm:max-w-[720px] min-h-[46px] sm:min-h-[50px] pl-3.5 sm:pl-5 pr-1 sm:pr-1.5 py-0.5 sm:py-1'
                : 'max-w-[780px] min-h-[56px] sm:min-h-[64px] pl-4 sm:pl-7 pr-1.5 sm:pr-2 py-1 sm:py-1.5'
            }`}
          >
            {/* Segment 1: Where */}
            <div
              onClick={() => {
                onSetActivePopover('where');
                whereInputRef.current?.focus();
              }}
              className={`flex-1 min-w-0 py-0.5 sm:py-1 pr-1.5 sm:pr-2 rounded-full flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                activePopover === 'where' ? 'bg-slate-50 px-3 -ml-2' : ''
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
                  onFocus={() => onSetActivePopover('where')}
                  onChange={(e) => onWhereChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExecuteSearch();
                    }
                  }}
                  placeholder="Search destination"
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
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Crisp Dark Vertical Divider */}
            <div
              className={`w-[1.5px] bg-slate-800/80 mx-1.5 sm:mx-3 shrink-0 transition-all ${
                shouldCollapse ? 'h-4 sm:h-5' : 'h-6 sm:h-7'
              }`}
              aria-hidden="true"
            />

            {/* Segment 2: When */}
            <button
              type="button"
              onClick={() => onSetActivePopover(activePopover === 'when' ? null : 'when')}
              className={`w-[26%] sm:w-[30%] min-w-0 text-left py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                activePopover === 'when' ? 'bg-slate-100/80' : ''
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

            {/* Crisp Dark Vertical Divider */}
            <div
              className={`w-[1.5px] bg-slate-800/80 mx-1.5 sm:mx-3 shrink-0 transition-all ${
                shouldCollapse ? 'h-4 sm:h-5' : 'h-6 sm:h-7'
              }`}
              aria-hidden="true"
            />

            {/* Segment 3: Who */}
            <button
              type="button"
              onClick={() => onSetActivePopover(activePopover === 'who' ? null : 'who')}
              className={`w-[23%] sm:w-[25%] min-w-0 text-left py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                activePopover === 'who' ? 'bg-slate-100/80' : ''
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

            {/* Solid #C72B62 Search Button: Shows "Search" text when Where, When, or Who is clicked, icon only when resting */}
            <button
              type="button"
              aria-label="Search listings"
              onClick={handleExecuteSearch}
              className={`rounded-full bg-[#C72B62] hover:bg-[#ad2253] active:scale-95 text-white flex items-center justify-center shrink-0 ml-1 sm:ml-2 shadow-[0_3px_12px_rgba(199,43,98,0.28)] transition-all duration-300 cursor-pointer ${
                activePopover
                  ? shouldCollapse
                    ? 'h-8 sm:h-9 px-3 sm:px-3.5 gap-1.5'
                    : 'h-10 sm:h-12 px-4 sm:px-5 gap-2'
                  : shouldCollapse
                  ? 'w-8 h-8 sm:w-9 sm:h-9'
                  : 'w-10 h-10 sm:w-12 sm:h-12'
              }`}
            >
              <Search
                size={activePopover ? (shouldCollapse ? 14 : 16) : shouldCollapse ? 15 : 18}
                strokeWidth={2.6}
                className="shrink-0"
              />
              {activePopover && (
                <span className="text-xs sm:text-sm md:text-[15px] font-bold text-white tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 select-none">
                  Search
                </span>
              )}
            </button>
          </div>

          {/* Adjacent '+' Circle Button with #C72B62 Plus matching screenshot (hidden on mobile view) */}
          <button
            type="button"
            aria-label="Create new listing"
            onClick={onOpenHostModal}
            className={`hidden md:flex rounded-full bg-white border border-slate-300 hover:border-[#C72B62]/60 items-center justify-center text-[#C72B62] active:scale-95 transition-all shrink-0 cursor-pointer ${
              shouldCollapse ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-11 h-11 sm:w-[50px] sm:h-[50px]'
            }`}
          >
            <Plus size={shouldCollapse ? 20 : 25} strokeWidth={2.4} />
          </button>

          {/* POPOVER 1: WHERE */}
          {activePopover === 'where' && (
            <div
              className={`absolute left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[440px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-4 z-40 text-left transition-all ${
                shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
              }`}
            >
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs font-bold text-slate-500">
                  Suggested destinations in Kuala Lumpur
                </span>
                {whereQuery && (
                  <button
                    type="button"
                    onClick={() => onWhereChange('')}
                    className="text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {KL_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => {
                      const chosen = dest.name === 'All Kuala Lumpur' ? '' : dest.name;
                      onWhereChange(chosen);
                      onSetActivePopover('when');
                    }}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <span className="w-10 h-10 rounded-xl bg-[#C72B62]/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[#C72B62]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{dest.name}</p>
                      <p className="text-xs text-slate-500 truncate">{dest.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* POPOVER 2: WHEN */}
          {activePopover === 'when' && (
            <div
              className={`absolute left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[500px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left space-y-4 transition-all ${
                shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={onToggleCalendarMonth}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h4 className="text-sm font-bold text-slate-900">
                    {calendarMonth === 'Nov' ? 'November 2026' : 'December 2026'}
                  </h4>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={onToggleCalendarMonth}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Close calendar"
                  onClick={() => onSetActivePopover(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-1.5">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center tabular-nums">
                  {Array.from(
                    { length: calendarMonth === 'Nov' ? 30 : 31 },
                    (_, i) => i + 1
                  ).map((day) => {
                    const isStart = customCheckInDay === day;
                    const isEnd = customCheckOutDay === day;
                    const inRange =
                      customCheckInDay !== null &&
                      customCheckOutDay !== null &&
                      day > customCheckInDay &&
                      day < customCheckOutDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => onSelectCalendarDay(day)}
                        className={`h-9 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          isStart || isEnd
                            ? 'bg-[#C72B62] text-white'
                            : inRange
                            ? 'bg-[#C72B62]/10 text-[#C72B62]'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {DATE_OPTIONS.map((opt) => {
                  const active = selectedDates.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSelectDates(opt);
                        onSetActivePopover('who');
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#C72B62] text-white border-[#C72B62]'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                      }`}
                    >
                      {opt.tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* POPOVER 3: WHO */}
          {activePopover === 'who' && (
            <div
              className={`absolute left-0 right-0 mx-auto md:left-auto md:mx-0 md:right-20 w-full max-w-[380px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left transition-all ${
                shouldCollapse ? 'top-[50px] sm:top-[56px]' : 'top-[66px] sm:top-[74px]'
              }`}
            >
              <div className="divide-y divide-slate-100">
                {[
                  {
                    key: 'adults' as const,
                    title: 'Adults',
                    sub: 'Ages 13 or above',
                    val: adults,
                    min: 0,
                    max: 8,
                  },
                  {
                    key: 'children' as const,
                    title: 'Children',
                    sub: 'Ages 2 – 12',
                    val: childrenCount,
                    min: 0,
                    max: 6,
                  },
                  {
                    key: 'infants' as const,
                    title: 'Infants',
                    sub: 'Under 2',
                    val: infants,
                    min: 0,
                    max: 4,
                  },
                  {
                    key: 'pets' as const,
                    title: 'Pets',
                    sub: 'Bringing a service animal?',
                    val: pets,
                    min: 0,
                    max: 3,
                  },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="py-3 first:pt-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                      <p className="text-xs text-slate-500">{row.sub}</p>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <button
                        type="button"
                        aria-label={`Decrease ${row.title}`}
                        disabled={row.val <= row.min}
                        onClick={() =>
                          onChangeGuestCount(row.key, Math.max(row.min, row.val - 1))
                        }
                        className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-35 hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-900">
                        {row.val}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${row.title}`}
                        disabled={row.val >= row.max}
                        onClick={() =>
                          onChangeGuestCount(row.key, Math.min(row.max, row.val + 1))
                        }
                        className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-35 hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClearGuests}
                  className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                >
                  Clear guests
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSearch}
                  className="px-5 py-2 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply ({matchingCount} matches)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
