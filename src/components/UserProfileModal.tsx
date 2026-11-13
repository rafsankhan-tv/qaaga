'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe,
  Home,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquareQuote,
  Phone,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  CURRENCY_CONFIG,
  CurrencyCode,
  GuestProfile,
  QaagaListing,
  SiteBranding,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';

export interface UserProfileModalProps {
  branding: SiteBranding;
  profile: GuestProfile;
  onSave: (updated: GuestProfile) => void;
  onLogout?: () => void;
  onClose: () => void;
  customListings?: QaagaListing[];
  onOpenHostModal?: () => void;
  currency?: CurrencyCode;
  onChangeCurrency?: (c: CurrencyCode) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  branding,
  profile,
  onSave,
  onLogout,
  onClose,
  customListings = [],
  onOpenHostModal,
  currency = 'USD',
  onChangeCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<
    'about' | 'settings' | 'host' | 'connections' | 'reviews'
  >('about');

  const [showWrittenReviews, setShowWrittenReviews] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form edit states
  const [formName, setFormName] = useState(profile.fullName);
  const [formEmail, setFormEmail] = useState(profile.email);
  const [formCity, setFormCity] = useState(profile.city);
  const [formPhone, setFormPhone] = useState(profile.phone || '+60 12-345 6789');
  const [formBio, setFormBio] = useState(
    profile.bio ||
      'Travel enthusiast exploring Southeast Asia. Focused on design-forward apartments and skyline views in Kuala Lumpur.'
  );
  const [formRole, setFormRole] = useState<'customer' | 'guest' | 'host' | 'admin'>(
    profile.role || 'guest'
  );
  const [formAvatar, setFormAvatar] = useState(profile.avatarUrl || '');

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  ];

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    onSave({
      fullName: formName.trim(),
      email: formEmail.trim(),
      city: formCity.trim() || 'Kuala Lumpur',
      phone: formPhone.trim() || undefined,
      role: formRole,
      bio: formBio.trim() || undefined,
      avatarUrl: formAvatar || undefined,
      verified: true,
      joinedDate: profile.joinedDate || 'Nov 2026',
      status: 'active',
    });
    setIsEditing(false);
  };

  const initialLetter =
    (profile.fullName && profile.fullName.trim().charAt(0).toUpperCase()) || 'S';

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* TOP HEADER: qaaga.com logo + right controls                         */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: official qaaga.com logo */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to qaaga.com"
          className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] active:scale-95"
        >
          <BrandLogo branding={branding} variant="header" />
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="capitalize">{profile.role || 'Guest'}</span>
            <span className="text-slate-400">·</span>
            <span className="truncate max-w-[140px]">{profile.fullName}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <span>Exit</span>
            <X size={16} />
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN CONTAINER: Left sidebar functions + Right content area         */}
      {/* =================================================================== */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col md:flex-row gap-8 lg:gap-14">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR FUNCTIONS                                            */}
        {/* ================================================================= */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Profile
            </h1>
            <div className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 bg-white shadow-2xs">
              <UserCheck size={17} />
            </div>
          </div>

          {/* Left Navigation Buttons */}
          <nav aria-label="Profile sections" className="space-y-1.5 text-sm">
            {/* 1. About me (matches user screenshot) */}
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'about'
                  ? 'bg-slate-100 font-bold text-slate-950 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              {/* Framed avatar icon matching screenshot */}
              <div className="w-8 h-8 rounded-lg bg-slate-200/90 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300/80">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-700">{initialLetter}</span>
                )}
              </div>
              <span className="flex-1">About me</span>
              {activeTab === 'about' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C72B62]" />
              )}
            </button>

            {/* 2. Account settings */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-slate-100 font-bold text-slate-950 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 text-slate-700">
                <Settings size={17} />
              </div>
              <span className="flex-1">Account settings</span>
              {activeTab === 'settings' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C72B62]" />
              )}
            </button>

            {/* 3. Host profile (switch to host, listings, earnings) */}
            <button
              type="button"
              onClick={() => setActiveTab('host')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'host'
                  ? 'bg-slate-100 font-bold text-slate-950 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#C72B62]/10 overflow-hidden shrink-0 flex items-center justify-center border border-[#C72B62]/20 text-[#C72B62]">
                <Sparkles size={17} />
              </div>
              <span className="flex-1">Host profile</span>
              <span className="text-[10px] bg-[#C72B62] text-white font-bold px-1.5 py-0.5 rounded-full">
                Host
              </span>
            </button>

            {/* 4. Connections (matches screenshot) */}
            <button
              type="button"
              onClick={() => setActiveTab('connections')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'connections'
                  ? 'bg-slate-100 font-bold text-slate-950 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 overflow-hidden shrink-0 flex items-center justify-center border border-amber-200 text-amber-700">
                <Users size={17} />
              </div>
              <span className="flex-1">Connections</span>
              {activeTab === 'connections' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C72B62]" />
              )}
            </button>

            {/* 5. Reviews */}
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${
                activeTab === 'reviews'
                  ? 'bg-slate-100 font-bold text-slate-950 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 overflow-hidden shrink-0 flex items-center justify-center border border-blue-200 text-blue-700">
                <MessageSquareQuote size={17} />
              </div>
              <span className="flex-1">Reviews</span>
              {activeTab === 'reviews' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#C72B62]" />
              )}
            </button>
          </nav>

          {/* Verification & Trust Badge card */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Identity Verified</span>
            </p>
            <p className="leading-relaxed">
              Your profile is verified on qaaga.com. You have instant booking privileges.
            </p>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Member since</span>
              <span className="font-semibold text-slate-700">Nov 2026</span>
            </div>
          </div>

          {/* Sign Out Option */}
          {onLogout && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer text-left"
              >
                <LogOut size={15} />
                <span>Sign out from qaaga.com</span>
              </button>
            </div>
          )}
        </aside>

        {/* ================================================================= */}
        {/* RIGHT CONTENT AREA                                                */}
        {/* ================================================================= */}
        <main className="flex-1 min-w-0">
          {/* =============================================================== */}
          {/* TAB 1: About me (EXACT REPLICA of screenshot)                    */}
          {/* =============================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Header: "About me" + [Edit] button */}
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  About me
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Side-by-Side: Identity Card + "Complete your profile" */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 lg:gap-10">
                {/* Left Card: Big rounded card with avatar, name and role */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10 flex flex-col items-center justify-center text-center w-full sm:w-80 shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#1e40af] text-4xl sm:text-5xl font-bold select-none overflow-hidden shadow-inner">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initialLetter
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
                    {profile.fullName || 'Sohag'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 capitalize">
                    {profile.role || 'Guest'}
                  </p>
                </div>

                {/* Right Column: "Complete your profile" + description + "Get started" button */}
                <div className="flex-1 max-w-md pt-2 sm:pt-0">
                  <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-tight">
                    Complete your profile
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                    Your qaaga.com profile is an important part of every reservation. Complete
                    yours to help other hosts and guests get to know you.
                  </p>
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#e02667] to-[#C72B62] hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Get started</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Separator */}
              <div className="border-t border-slate-200/90 my-8 w-full" />

              {/* Bottom Section: Chat icon + "Show reviews I’ve written" */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowWrittenReviews((prev) => !prev)}
                  className="flex items-center gap-3 text-slate-800 hover:text-slate-950 font-medium text-sm sm:text-base cursor-pointer group"
                >
                  <MessageSquare
                    size={20}
                    className="text-slate-600 group-hover:text-slate-900 transition-colors"
                  />
                  <span className="underline-offset-4 group-hover:underline">
                    Show reviews I’ve written
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      showWrittenReviews ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showWrittenReviews && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-3 animate-in fade-in duration-150">
                    <p className="font-semibold text-slate-900">Your Guest Reviews (1)</p>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 text-xs">
                          Apartment in Bukit Bintang
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          <Star size={12} className="fill-amber-400" />
                          <span className="font-bold text-slate-800">5.0</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        “Spotless residence with breathtaking Kuala Lumpur skyline views. Smart-lock
                        check-in took under a minute and Wi-Fi was blazing fast.”
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        Written in November 2026
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details & Bio */}
              <div className="pt-4 space-y-4">
                <h4 className="text-base font-bold text-slate-900">About {profile.fullName}</h4>
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  {profile.bio ||
                    'Travel enthusiast exploring Southeast Asia. Focused on design-forward apartments and skyline views in Kuala Lumpur.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl text-xs text-slate-700 pt-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MapPin size={15} className="text-[#C72B62]" />
                    <span>Lives in: <strong className="text-slate-900">{profile.city || 'Kuala Lumpur'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Mail size={15} className="text-[#C72B62]" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone size={15} className="text-[#C72B62]" />
                    <span>{profile.phone || '+60 12-345 6789'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>Verified Guest Status</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: Account settings                                         */}
          {/* =============================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Account settings
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your personal information, login credentials, and global preferences.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/20 text-sm"
                    placeholder="e.g. Sohag Khan"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Supabase Auth)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/20 text-sm"
                      placeholder="user@qaaga.com"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone Number & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/20 text-sm"
                      placeholder="+60 12-345 6789"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/20 text-sm"
                      placeholder="Kuala Lumpur"
                    />
                  </div>
                </div>

                {/* Role Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Platform Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['guest', 'host', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormRole(r)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          formRole === r
                            ? 'border-[#C72B62] bg-[#C72B62]/10 text-[#C72B62]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency */}
                {onChangeCurrency && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Preferred Display Currency
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => onChangeCurrency(c)}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            currency === c
                              ? 'border-[#C72B62] bg-[#C72B62] text-white'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {c} ({CURRENCY_CONFIG[c].symbol})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    About You (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C72B62] focus:ring-2 focus:ring-[#C72B62]/20 text-sm leading-relaxed"
                    placeholder="Tell hosts and guests about yourself..."
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: Host profile                                             */}
          {/* =============================================================== */}
          {activeTab === 'host' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Host Profile</span>
                    <Sparkles size={22} className="text-[#C72B62]" />
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage your hosted listings, earnings, guest reviews, and host privileges.
                  </p>
                </div>

                {onOpenHostModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenHostModal();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e02667] to-[#C72B62] text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus size={16} />
                    <span>Become a Host / Add Listing</span>
                  </button>
                )}
              </div>

              {/* Host KPI Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Listings
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {customListings.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Host Rating
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1">
                    <span>5.0</span>
                    <Star size={18} className="fill-amber-400 text-amber-500" />
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Response Rate
                  </p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="text-sm font-bold text-[#C72B62] mt-2">Verified Host</p>
                </div>
              </div>

              {/* Your Published Listings */}
              <div className="pt-2">
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Your Published Listings ({customListings.length})
                </h3>

                {customListings.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                    <Home size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-800">No properties listed yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Earn extra income and welcome travelers by sharing your home or hosting an
                      experience on qaaga.com.
                    </p>
                    {onOpenHostModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenHostModal();
                        }}
                        className="mt-4 px-5 py-2 rounded-xl bg-[#C72B62] text-white text-xs font-bold hover:bg-[#ad2253] transition-colors cursor-pointer"
                      >
                        Publish Your First Listing
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex gap-3 items-center"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500">{item.area}</p>
                          <p className="text-xs font-extrabold text-[#C72B62] mt-1">
                            ${item.twoNightPriceUsd} / 2 nights
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: Connections                                              */}
          {/* =============================================================== */}
          {activeTab === 'connections' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Connections
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Connect with travel companions, co-travelers, and hosts you have stayed with.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      AH
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Amirul Hakim</p>
                      <p className="text-[11px] text-slate-500">Superhost in Bukit Bintang</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Connected
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      SJ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                      <p className="text-[11px] text-slate-500">Co-traveler · Kuala Lumpur</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    Travel partner
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: Reviews                                                  */}
          {/* =============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Reviews & Feedback
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Reviews you have written for hosts and feedback left by hosts about you.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Apartment in Bukit Bintang
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star size={13} className="fill-amber-400" />
                    <span className="font-bold text-slate-800">5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  “Spotless residence with breathtaking Kuala Lumpur skyline views. Smart-lock
                  check-in took under a minute and Wi-Fi was blazing fast.”
                </p>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Reviewed by {profile.fullName}</span>
                  <span>Nov 2026</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* EDIT PROFILE MODAL / OVERLAY                                        */}
      {/* =================================================================== */}
      {isEditing && (
        <div
          onClick={() => setIsEditing(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Your Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-2 mb-2">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormAvatar(url)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      formAvatar === url
                        ? 'border-[#C72B62] scale-105 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 opacity-80'
                    }`}
                  >
                    <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formAvatar}
                onChange={(e) => setFormAvatar(e.target.value)}
                placeholder="Or paste custom image URL"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About</label>
              <textarea
                rows={3}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                placeholder="Write a few lines about yourself..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProfile()}
                className="px-5 py-2 rounded-xl bg-[#C72B62] text-white text-xs font-bold hover:bg-[#ad2253] cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
