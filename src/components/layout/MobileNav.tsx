import React, { useState, useEffect } from 'react';
import {
  Home,
  Newspaper,
  Plus,
  MessageSquare,
  User,
  Sparkles,
  ShieldCheck,
  Wrench,
  Stethoscope,
  Hotel,
  ShoppingBag,
  Repeat,
  Briefcase,
  Bell,
  ShoppingCart,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Layers,
  Compass,
  Headphones,
  MapPin,
  CreditCard,
  Award,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
  BookOpen,
  HeartHandshake,
  UserCheck,
  Facebook,
  Youtube,
  Instagram,
  Video,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { marketplaceStore } from '../../services/marketplaceStore';
import { UserRole } from '../../types';
import { CartDrawer } from '../cart/CartDrawer';
import { SupportChatDrawer } from '../chat/SupportChatDrawer';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onOpenSearch }) => {
  const { currentUser, activeRole, switchRole, unreadNotificationCount, isAdmin, logout } = useAuth();
  const { formattedLocation, setIsLocationModalOpen } = useLocation();

  // Bottom sheets and drawers state
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Live store values
  const [cartCount, setCartCount] = useState(() => marketplaceStore.getCartCount());
  const [notifications, setNotifications] = useState(() => marketplaceStore.getNotifications());

  useEffect(() => {
    const handleUpdate = () => {
      setCartCount(marketplaceStore.getCartCount());
      setNotifications([...marketplaceStore.getNotifications()]);
    };
    const unsub = marketplaceStore.subscribe(handleUpdate);
    return unsub;
  }, []);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const availableRoles: { role: UserRole; title: string; desc: string; icon: any; color: string; bg: string }[] = [
    { role: 'CUSTOMER', title: 'কাস্টমার ভিউ', desc: 'সার্ভিস ও পণ্য অর্ডার', icon: User, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { role: 'PROVIDER', title: 'টেকনিশিয়ান / প্রোভাইডার', desc: 'সার্ভিস রিকোয়েস্ট ও কোটেশন', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { role: 'DOCTOR', title: 'ডাক্তার প্যানেল', desc: 'অ্যাপয়েন্টমেন্ট ও প্রেসক্রিপশন', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { role: 'HOTEL_MANAGER', title: 'হোটেল পার্টনার', desc: 'রিসোর্ট ও রুম ম্যানেজমেন্ট', icon: Hotel, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { role: 'SELLER', title: 'মার্কেট সেলার', desc: 'শপ ও ইনভেন্টরি ম্যানেজ', icon: ShoppingBag, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    { role: 'ADMIN', title: 'সুপার অ্যাডমিন টাওয়ার', desc: 'ফুল প্ল্যাটফর্ম কন্ট্রোল', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' }
  ];

  const handleQuickAction = (view: string, params?: any) => {
    setIsQuickActionOpen(false);
    onNavigate(view, params);
  };

  const handleProfileNav = (view: string, params?: any) => {
    setIsProfileSheetOpen(false);
    onNavigate(view, params);
  };

  return (
    <>
      {/* 1. Mobile Bottom Sticky Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1.5 py-1 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* 1. Home */}
          <button
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'home'
                ? 'text-[#4e20b8] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Home size={19} className={currentView === 'home' ? 'stroke-[2.5] text-[#4e20b8]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">হোম</span>
          </button>

          {/* 2. Service */}
          <button
            onClick={() => onNavigate('service_request')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'service_request'
                ? 'text-[#4e20b8] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Wrench size={19} className={currentView === 'service_request' ? 'stroke-[2.5] text-[#4e20b8]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">সার্ভিস</span>
          </button>

          {/* 3. Jobs */}
          <button
            onClick={() => onNavigate('jobs')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
              currentView === 'jobs'
                ? 'text-[#4e20b8] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Briefcase size={19} className={currentView === 'jobs' ? 'stroke-[2.5] text-[#4e20b8]' : 'stroke-2'} />
              <span className="absolute -top-1 -right-2 text-[8px] bg-[#ff6d00] text-white font-extrabold px-1 rounded-full leading-none py-0.5">
                New
              </span>
            </div>
            <span className="text-[10px] mt-0.5 font-medium">জবস</span>
          </button>

          {/* 4. Sohayota (Help / Support Chat) */}
          <button
            onClick={() => setIsChatOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isChatOpen
                ? 'text-[#4e20b8] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Headphones size={19} className={isChatOpen ? 'stroke-[2.5] text-[#4e20b8]' : 'stroke-2'} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">সহায়তা</span>
          </button>

          {/* 5. Profile & Role Hub */}
          <button
            onClick={() => setIsProfileSheetOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isProfileSheetOpen || currentView.includes('dashboard') || currentView === 'admin'
                ? 'text-[#4e20b8] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-purple-500/40">
                <img
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                  alt={currentUser?.fullName || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 ring-white" />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">প্রোফাইল</span>
          </button>

        </div>
      </nav>

      {/* 2. QUICK ACTION HUB (Bottom Sheet) */}
      {isQuickActionOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsQuickActionOpen(false)} />
          
          <div className="bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 animate-slideUp max-h-[85vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={17} className="text-[#ff6d00]" />
                  <span>কুইক অ্যাকশন ও বুকিং হাব</span>
                </h3>
                <p className="text-[11px] text-slate-500">আপনার প্রয়োজনীয় সার্ভিস বা পোস্ট তৈরি করুন</p>
              </div>
              <button
                onClick={() => setIsQuickActionOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => handleQuickAction('feed', { openCreateModal: true })}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#4e20b8] text-white flex items-center justify-center shadow-xs mb-2">
                  <Newspaper size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">নতুন ফিড পোস্ট</div>
                <div className="text-[10px] text-slate-500">কমিউনিটিতে আপডেট শেয়ার</div>
              </button>

              <button
                onClick={() => handleQuickAction('service_request')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#ff6d00] text-white flex items-center justify-center shadow-xs mb-2">
                  <Wrench size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">সার্ভিস রিকোয়েস্ট</div>
                <div className="text-[10px] text-slate-500">হোম ও টেকনিক্যাল মেরামত</div>
              </button>

              <button
                onClick={() => handleQuickAction('doctors')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
                  <Stethoscope size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">ডাক্তার অ্যাপয়েন্টমেন্ট</div>
                <div className="text-[10px] text-slate-500">অনলাইন ও চেম্বার বুকিং</div>
              </button>

              <button
                onClick={() => handleQuickAction('hotels')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs mb-2">
                  <Hotel size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">হোটেল ও রিসোর্ট</div>
                <div className="text-[10px] text-slate-500">কক্সবাজার, সিলেট ও অল বিডি</div>
              </button>

              <button
                onClick={() => handleQuickAction('used_products')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs mb-2">
                  <Repeat size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">সেকেন্ডহ্যান্ড সেল</div>
                <div className="text-[10px] text-slate-500">পুরাতন জিনিস বিক্রি পোস্ট</div>
              </button>

              <button
                onClick={() => handleQuickAction('jobs')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 text-left flex flex-col justify-between shadow-2xs hover:scale-102 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs mb-2">
                  <Briefcase size={18} />
                </div>
                <div className="font-bold text-xs text-slate-900">চাকরি ও সার্কুলার</div>
                <div className="text-[10px] text-slate-500">ভেরিফাইড জব সন্ধান</div>
              </button>
            </div>

            {/* Quick shortcuts */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center gap-1.5 text-slate-700 font-bold hover:text-[#4e20b8]"
              >
                <ShoppingCart size={15} className="text-[#ff6d00]" />
                <span>শপিং কার্ট ({cartCount})</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex items-center gap-1 text-slate-600 hover:text-[#4e20b8]"
              >
                <MapPin size={14} className="text-[#ff6d00]" />
                <span className="truncate max-w-[140px]">{formattedLocation}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PROFILE & FULL ACCOUNT HUB (Bottom Sheet) */}
      {isProfileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsProfileSheetOpen(false)} />
          
          <div className="bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

            {/* Profile Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white relative overflow-hidden mb-4 shadow-md">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-400">
                  <img
                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                    alt={currentUser?.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black truncate">{currentUser?.fullName || 'Rafsan Khan'}</h3>
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-xs text-purple-200/90 truncate">{currentUser?.email || 'qaaga@consultant.com'}</div>
                  
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      রোল: {activeRole}
                    </span>
                    <span className="text-[10px] text-slate-300 flex items-center gap-0.5">
                      <MapPin size={11} className="text-[#ff6d00]" /> ঢাকা
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Wallet & Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                <div className="bg-white/5 rounded-xl p-1.5">
                  <div className="text-[10px] text-slate-300">ওয়ালেট ব্যালেন্স</div>
                  <div className="text-xs font-black text-amber-300">৳ ২,৪৫০</div>
                </div>
                <div className="bg-white/5 rounded-xl p-1.5">
                  <div className="text-[10px] text-slate-300">রিওয়ার্ড পয়েন্ট</div>
                  <div className="text-xs font-black text-emerald-300">৩৫০ Pts</div>
                </div>
                <div className="bg-white/5 rounded-xl p-1.5">
                  <div className="text-[10px] text-slate-300">মোট বুকিং</div>
                  <div className="text-xs font-black text-purple-300">১২ টি</div>
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[#4e20b8]" />
                  <span>রোল মোড পরিবর্তন (Switch Role)</span>
                </span>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                  সক্রিয়: {activeRole}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((r) => {
                  const Icon = r.icon;
                  const isCurrent = activeRole === r.role;

                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        // Auto navigate to relevant dashboard if switched
                        if (r.role === 'CUSTOMER') onNavigate('customer_dashboard');
                        if (r.role === 'PROVIDER') onNavigate('provider_dashboard');
                        if (r.role === 'SELLER') onNavigate('seller_dashboard');
                        if (r.role === 'ADMIN') onNavigate('admin_portal');
                        setIsProfileSheetOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left border flex items-center gap-2.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#4e20b8] text-white border-[#4e20b8] shadow-sm'
                          : `${r.bg} text-slate-800 hover:border-purple-300`
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-white/20 text-white' : `${r.color} bg-white shadow-2xs`
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{r.title}</div>
                        <div className={`text-[9px] truncate ${isCurrent ? 'text-purple-200' : 'text-slate-500'}`}>
                          {r.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Dashboards & Management Links */}
            <div className="space-y-1 mb-4">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                ম্যানেজমেন্ট ড্যাশবোর্ড
              </span>

              <button
                onClick={() => handleProfileNav('customer_dashboard')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <span>কাস্টমার ড্যাশবোর্ড (বুকিং ও রিকোয়েস্ট)</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </button>

              <button
                onClick={() => handleProfileNav('provider_dashboard')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Wrench size={15} />
                  </div>
                  <span>প্রোভাইডার পোর্টাল (কোটেশন ও কাজ)</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </button>

              <button
                onClick={() => handleProfileNav('seller_dashboard')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <ShoppingBag size={15} />
                  </div>
                  <span>সেলার হাব (পণ্য ও বিক্রয় ম্যানেজ)</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </button>

              <button
                onClick={() => handleProfileNav('admin_portal')}
                className="w-full p-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 flex items-center justify-between text-xs font-black text-rose-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                    <ShieldCheck size={15} />
                  </div>
                  <span>Admin Control Tower (সুপার অ্যাডমিন)</span>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md font-bold">ALL ACCESS</span>
              </button>
            </div>

            {/* Quick Utilities: Cart, Support, Search */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => {
                  setIsProfileSheetOpen(false);
                  setIsCartOpen(true);
                }}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100"
              >
                <div className="relative">
                  <ShoppingCart size={18} className="text-[#4e20b8]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#ff6d00] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1">শপিং কার্ট</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileSheetOpen(false);
                  setIsChatOpen(true);
                }}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100"
              >
                <Headphones size={18} className="text-[#ff6d00]" />
                <span className="text-[11px] font-bold text-slate-800 mt-1">লাইভ হেল্প</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileSheetOpen(false);
                  if (onOpenSearch) onOpenSearch();
                  else onNavigate('service_request');
                }}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100"
              >
                <Search size={18} className="text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800 mt-1">সার্চ ফিল্টার</span>
              </button>
            </div>

            {/* 24/7 Direct Help & Contact Bar */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white mb-3 border border-indigo-900/40 shadow-sm">
              <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Headphones size={13} className="text-[#ff6d00]" />
                  <span>২৪/৭ কাস্টমার সাপোর্ট ও হেল্পডেস্ক</span>
                </span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:09658824360"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-amber-500/20 text-white text-xs font-bold transition-all border border-white/10"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#ff6d00] text-white flex items-center justify-center shrink-0">
                    <Phone size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] text-slate-300">সরাসরি কল</div>
                    <div className="truncate text-amber-300 font-bold">09658824360</div>
                  </div>
                </a>

                <a
                  href="https://wa.me/8801644985301"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-emerald-500/20 text-white text-xs font-bold transition-all border border-white/10"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Headphones size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] text-slate-300">হোয়াটসঅ্যাপ</div>
                    <div className="truncate text-emerald-300 font-bold">+8801644985301</div>
                  </div>
                </a>
              </div>

              <a
                href="mailto:qaaga@consultant.com"
                className="mt-2 flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 text-[11px] transition-all border border-white/5"
              >
                <Mail size={12} className="text-purple-400" />
                <span>ইমেইল: <strong className="text-white">qaaga@consultant.com</strong></span>
              </a>
            </div>

            {/* QAAGA Official Social Channels */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white mb-4">
              <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>আমাদের সোশ্যাল মিডিয়া পেজ ও চ্যানেল</span>
                <span className="text-[9px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold">Official</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://web.facebook.com/qaagaltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-[#1877F2]/30 text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Facebook size={15} className="text-[#1877F2] shrink-0" />
                  <span className="truncate">Facebook</span>
                </a>
                <a
                  href="https://www.youtube.com/@QAAGA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-[#FF0000]/30 text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Youtube size={15} className="text-[#FF4D4D] shrink-0" />
                  <span className="truncate">YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/qaaga/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-[#E4405F]/30 text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Instagram size={15} className="text-[#FF6B8B] shrink-0" />
                  <span className="truncate">Instagram</span>
                </a>
                <a
                  href="https://www.tiktok.com/@my.qaaga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Video size={15} className="text-teal-400 shrink-0" />
                  <span className="truncate">TikTok</span>
                </a>
              </div>
            </div>

            {/* Partner registration link & Logout */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleProfileNav('partner_register')}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <HeartHandshake size={15} />
                <span>ডাক্তার, টেকনিশিয়ান বা হোটেল পার্টনার হিসেবে যুক্ত হোন</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsProfileSheetOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span>লগআউট (Sign Out)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Support Chat Drawer (Accessible from bottom bar on mobile) */}
      <SupportChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNavigate={onNavigate}
      />

      {/* 5. Cart Drawer (Accessible from mobile action triggers) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
