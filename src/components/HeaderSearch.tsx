'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MapPin,
  Minus,
  Plus,
  Search,
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
} from '@/data/listings';

interface HeaderSearchProps {
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
  wishlistCount: number;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;

  onOpenHostModal: () => void;
  onOpenTrips: () => void;
  onOpenMessages: () => void;
  onOpenWishlist: () => void;
  onOpenProfileModal: () => void;
  onOpenHelpModal: () => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
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
  wishlistCount,
  currency,
  onChangeCurrency,
  onOpenHostModal,
  onOpenTrips,
  onOpenMessages,
  onOpenWishlist,
  onOpenProfileModal,
  onOpenHelpModal,
}) => {
  const searchRef = useRef<HTMLDivElement | null>(null);
  const whereInputRef = useRef<HTMLInputElement | null>(null);
  const rightUtilsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        onSetActivePopover(null);
      }
      if (rightUtilsRef.current && !rightUtilsRef.current.contains(e.target as Node)) {
        onCloseMenus();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onSetActivePopover, onCloseMenus]);

  useEffect(() => {
    if (activePopover === 'where') {
      const id = window.setTimeout(() => {
        whereInputRef.current?.focus();
      }, 20);
      return () => window.clearTimeout(id);
    }
  }, [activePopover]);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="border-b border-slate-200/90 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 sm:pt-5 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
        {/* ================================================================= */}
        {/* ROW 1: qaaga.com — Centered 4 Category Tabs — Host, Bell 2, User  */}
        {/* ================================================================= */}
        <header className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-3 md:gap-4">
          {/* Top-Left Brand Wordmark ("qaaga.com" in #C72B62) + Mobile Right Icons */}
          <div className="flex items-center justify-between md:justify-self-start">
            <button
              type="button"
              onClick={onResetHome}
              className="inline-flex items-baseline leading-none cursor-pointer whitespace-nowrap shrink-0 text-left"
            >
              <span className="text-[27px] sm:text-[28px] font-bold tracking-[-0.035em] text-[#C72B62]">
                qaaga
              </span>
              <span className="text-[15.5px] sm:text-[16px] font-bold tracking-[-0.02em] text-[#C72B62] ml-0.5">
                .com
              </span>
            </button>

            {/* Mobile Compact Bell & Profile Trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                onClick={onToggleNotif}
                className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <Bell size={22} className="fill-[#8F8F8F] text-[#737373]" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0.5 right-1 text-[13px] font-bold text-[#C72B62] leading-none tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label="Open account menu"
                onClick={onToggleAccount}
                className="w-9 h-9 rounded-full bg-[#9E9E9E] text-white flex items-center justify-center cursor-pointer"
              >
                <User size={19} className="fill-white text-white" />
              </button>
            </div>
          </div>

          {/* Center: Mathematically Centered 4 Illustrated Category Tabs */}
          <nav
            aria-label="Listing categories"
            className="w-full md:w-auto md:justify-self-center flex items-center justify-between min-[410px]:justify-center gap-2 min-[410px]:gap-5 sm:gap-8 lg:gap-11 overflow-x-auto scrollbar-none px-0.5"
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectCategory(tab.id)}
                  className={`relative flex items-center gap-1.5 sm:gap-2.5 pb-2.5 pt-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
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
                    className={`w-6 h-6 min-[410px]:w-7 min-[410px]:h-7 sm:w-9 sm:h-9 object-contain transition-transform duration-150 ${
                      isActive ? 'scale-105' : 'opacity-95 hover:opacity-100'
                    }`}
                  />
                  <span className="text-[12.5px] min-[410px]:text-[13.5px] sm:text-[14.5px] tracking-[-0.01em]">
                    {tab.label}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: "become a host" + Notification Bell(2) + Avatar Menu */}
          <div
            ref={rightUtilsRef}
            className="relative flex md:justify-self-end items-center justify-end gap-3.5 lg:gap-4 shrink-0"
          >
            <div className="hidden md:flex items-center gap-3.5 lg:gap-4">
              <button
                type="button"
                onClick={onOpenHostModal}
                className="inline-flex items-center text-[15px] text-slate-800 hover:text-slate-950 font-normal px-2.5 py-1.5 rounded-full hover:bg-slate-100/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                become a host
              </button>

              {/* Notification Bell Icon + #C72B62 Superscript Count matching screenshot */}
              <button
                type="button"
                aria-label="Notifications"
                onClick={onToggleNotif}
                className="relative min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell
                  size={25}
                  className="fill-[#949494] text-[#767676] hover:fill-[#767676] transition-colors"
                />
                {notifications.length > 0 && (
                  <span className="absolute top-0.5 right-1 text-[14px] font-bold text-[#C72B62] leading-none tabular-nums">
                    {unreadNotifCount > 0 ? unreadNotifCount : notifications.length}
                  </span>
                )}
              </button>

              {/* User Profile Avatar Circle */}
              <button
                type="button"
                aria-label="Account menu"
                onClick={onToggleAccount}
                className="w-9 h-9 rounded-full bg-[#9E9E9E] hover:bg-[#828282] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <User size={20} className="fill-white text-white" />
              </button>
            </div>

            {/* Notifications Dropdown Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 top-2 md:top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.16)] border border-slate-200 py-2.5 z-50 text-left">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <p className="text-[11px] text-slate-500">
                      {unreadNotifCount} unread updates
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

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => onClickNotification(n)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                        n.unread ? 'bg-[#C72B62]/[0.04]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                        <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.body}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Account / Profile Dropdown Menu */}
            {isAccountOpen && (
              <div className="absolute right-0 top-2 md:top-12 w-72 bg-white rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.16)] border border-slate-200 py-2 z-50 text-left">
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
          className="relative flex items-center justify-center gap-2.5 sm:gap-3.5"
        >
          <div className="w-full max-w-[780px] min-h-[56px] sm:min-h-[64px] rounded-full bg-white border border-slate-300/90 shadow-[0_3px_14px_rgba(15,23,42,0.05)] pl-4 sm:pl-7 pr-1.5 sm:pr-2 py-1 sm:py-1.5 flex items-center">
            {/* Segment 1: Where */}
            <div
              onClick={() => {
                onSetActivePopover('where');
                whereInputRef.current?.focus();
              }}
              className={`flex-1 min-w-0 py-1 pr-2 rounded-full flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                activePopover === 'where' ? 'bg-slate-50 px-3 -ml-2' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="qaaga-where-input"
                  className="block text-[12px] font-bold text-slate-950 leading-tight cursor-pointer"
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
                      onExecuteSearch();
                    }
                  }}
                  placeholder="Search destination"
                  className="w-full bg-transparent text-[12.5px] sm:text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none truncate mt-0.5"
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
              className="h-6 sm:h-7 w-[1.5px] bg-slate-800/80 mx-2 sm:mx-4 shrink-0"
              aria-hidden="true"
            />

            {/* Segment 2: When */}
            <button
              type="button"
              onClick={() => onSetActivePopover(activePopover === 'when' ? null : 'when')}
              className={`w-[26%] sm:w-[30%] min-w-0 text-left py-1 px-1.5 sm:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                activePopover === 'when' ? 'bg-slate-100/80' : ''
              }`}
            >
              <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                When
              </span>
              <span
                className={`block text-[12.5px] sm:text-[14px] leading-tight truncate mt-0.5 ${
                  selectedDates.display ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {selectedDates.display || 'Add dates'}
              </span>
            </button>

            {/* Crisp Dark Vertical Divider */}
            <div
              className="h-6 sm:h-7 w-[1.5px] bg-slate-800/80 mx-2 sm:mx-4 shrink-0"
              aria-hidden="true"
            />

            {/* Segment 3: Who */}
            <button
              type="button"
              onClick={() => onSetActivePopover(activePopover === 'who' ? null : 'who')}
              className={`w-[23%] sm:w-[25%] min-w-0 text-left py-1 px-1.5 sm:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                activePopover === 'who' ? 'bg-slate-100/80' : ''
              }`}
            >
              <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                Who
              </span>
              <span
                className={`block text-[12.5px] sm:text-[14px] leading-tight truncate mt-0.5 tabular-nums ${
                  guestSummaryText ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {guestSummaryText || 'Add guests'}
              </span>
            </button>

            {/* Solid #C72B62 Search Circle Button */}
            <button
              type="button"
              aria-label="Search listings"
              onClick={onExecuteSearch}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C72B62] hover:bg-[#ad2253] active:scale-95 text-white flex items-center justify-center shrink-0 ml-1.5 sm:ml-2 shadow-[0_3px_10px_rgba(199,43,98,0.28)] transition-all cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Adjacent '+' Circle Button with #C72B62 Plus matching screenshot */}
          <button
            type="button"
            aria-label="Create new listing"
            onClick={onOpenHostModal}
            className="w-11 h-11 sm:w-[50px] sm:h-[50px] rounded-full bg-white border border-slate-300 hover:border-[#C72B62]/60 flex items-center justify-center text-[#C72B62] active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={25} strokeWidth={2.4} />
          </button>

          {/* POPOVER 1: WHERE */}
          {activePopover === 'where' && (
            <div className="absolute top-[66px] sm:top-[74px] left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[440px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-4 z-40 text-left">
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
            <div className="absolute top-[66px] sm:top-[74px] left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[500px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left space-y-4">
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
            <div className="absolute top-[66px] sm:top-[74px] left-0 right-0 mx-auto md:left-auto md:mx-0 md:right-20 w-full max-w-[380px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left">
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
                  onClick={onExecuteSearch}
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
