import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  User,
  ShieldCheck,
  Store,
  Wrench,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Menu,
  X,
  Bell,
  CheckCircle2,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { UserRole } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { CartDrawer } from '../cart/CartDrawer';
import { SupportChatDrawer } from '../chat/SupportChatDrawer';
import { NotificationDropdown } from '../notification/NotificationDropdown';
import { CuteCatAvatarSvg } from '../CuteCatAvatarSvg';
import { CuteCatAssistantModal } from '../CuteCatAssistantModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
  onOpenLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenSearch, onOpenLocation }) => {
  const { currentUser, activeRole, switchRole, unreadNotificationCount, isAdmin } = useAuth();
  const { formattedLocation, setIsLocationModalOpen } = useLocation();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Drawers, modals and dropdowns
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCatAssistantOpen, setIsCatAssistantOpen] = useState(false);

  // Live state from store
  const [cartCount, setCartCount] = useState(() => marketplaceStore.getCartCount());
  const [notifications, setNotifications] = useState(() => marketplaceStore.getNotifications());
  const [catSettings, setCatSettings] = useState(() => marketplaceStore.getCuteCatSettings());

  useEffect(() => {
    const handleStoreUpdate = () => {
      setCartCount(marketplaceStore.getCartCount());
      setNotifications([...marketplaceStore.getNotifications()]);
      setCatSettings(marketplaceStore.getCuteCatSettings());
    };
    const unsub = marketplaceStore.subscribe(handleStoreUpdate);
    return unsub;
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const openLocation = onOpenLocation || (() => setIsLocationModalOpen(true));

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      onNavigate('service_request', { searchQuery: headerSearchQuery.trim() });
    } else {
      onOpenSearch();
    }
  };

  const rolesList: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'CUSTOMER', label: 'Customer View', icon: User, color: 'text-blue-600 bg-blue-50' },
    { role: 'PROVIDER', label: 'Technician / Provider', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
    { role: 'SELLER', label: 'Merchant / Seller', icon: Store, color: 'text-emerald-600 bg-emerald-50' },
    { role: 'ADMIN', label: 'Admin Portal', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50' },
    { role: 'SUPER_ADMIN', label: 'Super Admin (Rafsan)', icon: Sparkles, color: 'text-purple-600 bg-purple-50' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-shadow">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* 1. Brand Logo & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center text-left group cursor-pointer shrink-0"
            >
              <span className="text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-[#4e20b8] leading-none select-none">
                qaaga<span className="text-[#ff6d00]">.com</span>
              </span>
            </button>

            {/* + Post New Service Request Button (Responsive: Compact on Mobile, Full on Desktop) */}
            <button
              onClick={() => onNavigate('service_request')}
              className="flex items-center gap-1 bg-[#4e20b8] hover:bg-[#41189e] active:scale-95 text-white px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer select-none shrink-0"
              title="সার্ভিস রিকোয়েস্ট পোস্ট করুন"
            >
              <PlusCircle size={13} className="text-[#ff6d00] shrink-0" />
              <span className="inline sm:hidden whitespace-nowrap text-[11px] font-bold">+ Post</span>
              <span className="hidden sm:inline whitespace-nowrap font-bold">+ Post New Service Request</span>
            </button>

            {/* Cute Cat Assistant Animated Mini Icon (Right next to Post New Service Request) */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setIsCatAssistantOpen(true)}
                className="relative flex items-center gap-1 bg-gradient-to-r from-purple-50 via-amber-50/80 to-purple-50 hover:from-purple-100 hover:to-amber-100 border-2 border-purple-300/80 hover:border-[#4e20b8] text-purple-950 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer select-none hover:scale-105 active:scale-95"
                title="মিউ মিউ এআই অ্যাসিস্ট্যান্ট (Voice & Photo Search 🐾)"
              >
                {/* Jumping/Bouncing Animated Mini Cat Avatar */}
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center -my-0.5">
                  <div className="animate-catLapjhat">
                    <CuteCatAvatarSvg
                      skin={catSettings.catSkin || 'orange-tabby'}
                      size={24}
                      customUrl={catSettings.avatarUrl}
                      isTalking={false}
                    />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                </div>

                <span className="hidden md:inline font-black text-[11px] text-[#4e20b8]">
                  AI ক্যাট
                </span>

                <span className="hidden sm:inline-flex items-center text-[10px] text-purple-600">
                  <Sparkles size={11} className="text-amber-500 animate-spin" />
                </span>
              </button>

              {/* Hover Tooltip Preview */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap animate-fadeIn">
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1" />
                <div className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-1.5 border border-slate-700">
                  <span>🐾 কথা বলুন ও ছবি দিয়ে খুঁজুন!</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Desktop Navigation Links (Original position for Home & Live Feed) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'home' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              হোম
            </button>
            <button
              onClick={() => onNavigate('feed')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentView === 'feed'
                  ? 'bg-purple-100 text-[#4e20b8] font-bold'
                  : 'hover:text-[#4e20b8] hover:bg-purple-50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6d00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6d00]"></span>
              </span>
              <span>ফিড ও আপডেট</span>
            </button>
            <button
              onClick={() => onNavigate('service_request')}
              className={`hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'service_request' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              সব সার্ভিস
            </button>
            <button
              onClick={() => onNavigate('doctors')}
              className={`hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'doctors' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              ডাক্তার
            </button>
            <button
              onClick={() => onNavigate('hotels')}
              className={`hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'hotels' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              হোটেল
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'products' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              ডিলস
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className={`flex items-center gap-1 hover:text-[#4e20b8] transition-colors cursor-pointer ${
                currentView === 'jobs' ? 'text-[#4e20b8] font-bold' : ''
              }`}
            >
              <span>জবস</span>
              <span className="text-[9px] bg-[#ff6d00] text-white font-bold px-1.5 py-0.2 rounded-full">
                নতুন
              </span>
            </button>
            <button
              onClick={() => onNavigate('customer_dashboard')}
              className="hover:text-[#4e20b8] transition-colors cursor-pointer"
            >
              সহায়তা
            </button>
          </nav>

          {/* 3. Global Search Bar (Only shown on sub-views on tablet/laptop) */}
          {currentView !== 'home' ? (
            <div className="hidden md:flex lg:hidden xl:flex flex-1 max-w-xs mx-2">
              <form onSubmit={handleHeaderSearchSubmit} className="w-full relative flex items-center">
                <input
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  onClick={onOpenSearch}
                  placeholder="সার্ভিস বা ডাক্তার খুঁজুন..."
                  className="w-full pl-3 pr-20 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4e20b8] transition-all cursor-pointer"
                />
                <button
                  type="submit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeaderSearchSubmit(e);
                  }}
                  className="absolute right-1 top-1 bottom-1 bg-[#ff6d00] hover:bg-[#ea6000] text-white text-[11px] font-bold px-2.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Search size={12} />
                  <span>খুঁজুন</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* 4. Action Icons & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsUserMenuOpen(false);
                }}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  isNotificationOpen ? 'bg-purple-100 text-[#4e20b8]' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onNavigate={onNavigate}
              />
            </div>

            {/* Live Support & Chat Icon */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="24/7 Live Support & Messenger"
            >
              <MessageSquare size={18} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff6d00] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Name & Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 py-1 px-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/30">
                  <img
                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                    alt={currentUser?.fullName || "User"}
                    className="w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 aspect-square rounded-full object-cover shrink-0 block"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 whitespace-nowrap">
                  {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Rafsan'}
                </span>
                <ChevronDown size={13} className="text-slate-400 hidden sm:inline shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/30">
                      <img
                        src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                        alt={currentUser?.fullName || "User"}
                        className="w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 aspect-square rounded-full object-cover shrink-0 block"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.fullName || 'Rafsan Khan'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'rafsankhan.tv@gmail.com'}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] bg-purple-50 text-[#4e20b8] border border-purple-100 font-bold px-2 py-0.5 rounded-md">
                          Role: {activeRole}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate">ঢাকা, বাংলাদেশ</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        onNavigate('customer_dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Customer Dashboard</span>
                      <span className="text-[10px] text-slate-400">আমার বুকিং ও রিকোয়েস্ট</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('provider_dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Provider Dashboard</span>
                      <span className="text-[10px] text-slate-400">কোটেশন ও সার্ভিস</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('seller_dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Seller Dashboard</span>
                      <span className="text-[10px] text-slate-400">পণ্য ও অর্ডার</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('admin_portal');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-lg font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>Admin Control Tower</span>
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">All Access</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        onNavigate('partner_register');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 rounded-lg font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>প্রোভাইডার / সেলার হিসেবে যুক্ত হোন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Global Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1 border border-slate-200/80"
              title="সমস্ত ক্যাটাগরি ও মেনু"
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              <span className="hidden sm:inline lg:hidden text-xs font-bold text-slate-700">মেনু</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. ALL-PAGES STICKY QUICK CATEGORY NAVIGATION BAR (Visible across ALL devices on ALL pages) */}
      <div className="border-t border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center">
          
          {/* Scrollable category row with generous right padding for full mobile visibility */}
          <div className="w-full overflow-x-auto scrollbar-none py-1.5 flex items-center gap-1 sm:gap-1.5 text-xs font-semibold whitespace-nowrap pr-8 sm:pr-6">
            {[
              { id: 'home', label: 'হোম', icon: '🏠' },
              { id: 'feed', label: 'লাইভ ফিড', icon: '📢', badge: 'LIVE', badgeColor: 'bg-[#ff6d00]' },
              { id: 'doctors', label: 'ডাক্তার বুকিং', icon: '🩺', badge: 'BMDC' },
              { id: 'service_request', label: 'সার্ভিস রিকোয়েস্ট', icon: '🛠️' },
              { id: 'hotels', label: 'হোটেল ও ট্রাভেল', icon: '🏖️' },
              { id: 'products', label: 'ডিলস ও শপ', icon: '🛍️' },
              { id: 'jobs', label: 'জবস ও ক্যারিয়ার', icon: '💼', badge: 'নতুন', badgeColor: 'bg-emerald-600' },
              { id: 'nurses', label: 'নার্স ও কেয়ার', icon: '👩‍⚕️' },
              { id: 'used_products', label: 'সেকেন্ডহ্যান্ড মার্কেট', icon: '🔄' },
              { id: 'ebooks', label: 'ই-বুক ও ব্লগ', icon: '📚' },
              { id: 'admin_portal', label: 'কন্ট্রোল টাওয়ার', icon: '🛡️', badge: 'Admin', badgeColor: 'bg-purple-700' }
            ].map((item) => {
              const isActive =
                currentView === item.id ||
                (item.id === 'admin_portal' && currentView === 'admin');

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#4e20b8] text-white shadow-xs scale-102 ring-2 ring-purple-300'
                      : 'text-slate-700 hover:text-[#4e20b8] hover:bg-purple-50 bg-white/70 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] text-white font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white text-[#4e20b8]'
                          : item.badgeColor || 'bg-[#ff6d00]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Mobile / Slide-down Navigation Menu (When burger menu is toggled) */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-slate-200 shadow-xl p-4 sm:p-6 space-y-4 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🌟 সমস্ত সার্ভিস ও পেজ ডিরেক্টরি</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg"
            >
              বন্ধ করুন ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { id: 'home', title: 'হোম পেজ', desc: 'মূল ড্যাশবোর্ড', icon: '🏠', color: 'bg-purple-50 text-[#4e20b8] border-purple-200' },
              { id: 'feed', title: 'লাইভ ফিড ও আপডেট', desc: 'কমিউনিটি পোস্ট ও অফার', icon: '📢', color: 'bg-amber-50 text-amber-900 border-amber-200' },
              { id: 'doctors', title: 'স্পেশালিস্ট ডাক্তার', desc: 'চেম্বার ও অনলাইন কনসাল্ট', icon: '🩺', color: 'bg-blue-50 text-blue-900 border-blue-200' },
              { id: 'service_request', title: 'সার্ভিস রিকোয়েস্ট', desc: 'হোম ও টেকনিক্যাল সার্ভিস', icon: '🛠️', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
              { id: 'hotels', title: 'হোটেল ও রিসোর্ট', desc: 'কক্সবাজার, সিলেট ও অল বিডি', icon: '🏖️', color: 'bg-sky-50 text-sky-900 border-sky-200' },
              { id: 'products', title: 'টুলস ও পণ্য শপ', desc: 'স্পেশাল ডিসকাউন্ট ডিল', icon: '🛍️', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
              { id: 'jobs', title: 'চাকরি ও সার্কুলার', desc: 'ভেরিফাইড জব ও নিয়োগ', icon: '💼', color: 'bg-orange-50 text-orange-900 border-orange-200' },
              { id: 'nurses', title: 'নার্স ও কেয়ারগিভার', desc: 'হোম পেশেন্ট কেয়ার', icon: '👩‍⚕️', color: 'bg-pink-50 text-pink-900 border-pink-200' },
              { id: 'used_products', title: 'সেকেন্ডহ্যান্ড মার্কেট', desc: 'বাই ও সেল প্লাটফর্ম', icon: '🔄', color: 'bg-teal-50 text-teal-900 border-teal-200' },
              { id: 'ebooks', title: 'ই-বুক ও ব্লগ', desc: 'নলেজ বেস ও গাইডলাইন', icon: '📚', color: 'bg-violet-50 text-violet-900 border-violet-200' },
              { id: 'customer_dashboard', title: 'কাস্টমার ড্যাশবোর্ড', desc: 'আমার সব অর্ডার ও বুকিং', icon: '👤', color: 'bg-slate-50 text-slate-800 border-slate-200' },
              { id: 'admin_portal', title: 'অ্যাডমিন কন্ট্রোল টাওয়ার', desc: 'ফুল ম্যানেজমেন্ট সেন্টার', icon: '🛡️', color: 'bg-rose-50 text-rose-900 border-rose-200' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  onNavigate(nav.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left border flex flex-col justify-between transition-all hover:scale-102 cursor-pointer shadow-2xs ${nav.color}`}
              >
                <div className="text-lg mb-1">{nav.icon}</div>
                <div className="font-bold text-xs">{nav.title}</div>
                <div className="text-[10px] opacity-75 truncate">{nav.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                openLocation();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-slate-700 font-bold hover:text-[#4e20b8]"
            >
              <MapPin size={14} className="text-[#ff6d00]" />
              <span>লোকেশন পরিবর্তন: {formattedLocation}</span>
            </button>

            <button
              onClick={() => {
                setIsCatAssistantOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-[#4e20b8] font-bold flex items-center gap-1"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>AI অ্যাসিস্ট্যান্ট</span>
            </button>
          </div>
        </div>
      )}

      {/* Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={onNavigate}
      />

      <SupportChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Global Cute Cat Assistant Modal (Voice, Photo, Text Search) */}
      <CuteCatAssistantModal
        isOpen={isCatAssistantOpen}
        onClose={() => setIsCatAssistantOpen(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
};


