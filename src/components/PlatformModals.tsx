'use client';

import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  ImagePlus,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  GuestProfile,
  HostThread,
  QaagaListing,
} from '@/data/listings';
import { ListingCard, ListingImage } from './ListingCard';
import { uploadFileToSupabaseStorage } from '@/lib/supabaseService';

/* ========================================================================= */
/* 1. BECOME A HOST / CREATE & MANAGE LISTINGS MODAL                         */
/* ========================================================================= */
export const HostStudioModal: React.FC<{
  customListings: QaagaListing[];
  onClose: () => void;
  onPublish: (data: {
    title: string;
    area: string;
    category: 'stay' | 'experiences' | 'services';
    twoNightUsd: number;
    photo: string;
    guestFav: boolean;
  }) => void;
  onDeleteCustomListing: (id: string) => void;
}> = ({ customListings, onClose, onPublish, onDeleteCustomListing }) => {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Bukit Bintang');
  const [category, setCategory] = useState<'stay' | 'experiences' | 'services'>('stay');
  const [twoNightUsd, setTwoNightUsd] = useState('120');
  const [photo, setPhoto] = useState('/assets/kl-ui/kl-1.jpg');
  const [guestFav, setGuestFav] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setIsUploading(true);
    try {
      const res = await uploadFileToSupabaseStorage(file, 'qaaga-listings');
      if (res.url) {
        setPhoto(res.url);
      } else if (res.error) {
        setUploadError(res.error);
      }
    } catch {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedPrice = Math.max(20, parseInt(twoNightUsd.replace(/\D/g, ''), 10) || 120);
    onPublish({
      title: title.trim(),
      area,
      category,
      twoNightUsd: parsedPrice,
      photo,
      guestFav,
    });
    setTitle('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Become a host on qaaga.com</h3>
            <p className="text-xs text-slate-500">
              Publish a stay, experience, or hospitality service in Kuala Lumpur
            </p>
          </div>
          <button
            type="button"
            aria-label="Close host modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Listing Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Skyline Loft in Bukit Bintang"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'stay' | 'experiences' | 'services')
                }
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#C72B62]"
              >
                <option value="stay">Stay</option>
                <option value="experiences">Experiences</option>
                <option value="services">Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Neighborhood
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#C72B62]"
              >
                <option value="Bukit Bintang">Bukit Bintang</option>
                <option value="Kampung Bahru">Kampung Bahru</option>
                <option value="KLCC">KLCC</option>
                <option value="Mont Kiara">Mont Kiara</option>
                <option value="Bangsar">Bangsar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Price for 2 nights ($ USD)
              </label>
              <input
                type="number"
                min={20}
                max={5000}
                required
                value={twoNightUsd}
                onChange={(e) => setTwoNightUsd(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:border-[#C72B62]"
              />
            </div>

            <label className="flex items-center gap-2 h-11 px-3 rounded-xl border border-slate-200 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={guestFav}
                onChange={(e) => setGuestFav(e.target.checked)}
                className="accent-[#C72B62] w-4 h-4"
              />
              <span>Guest favorite badge</span>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Listing Photo (Supabase Storage)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs font-semibold text-[#C72B62] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>Upload image</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploadError && (
              <p className="text-xs text-rose-600">{uploadError}</p>
            )}

            {/* Current Active Preview */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <ListingImage src={photo} alt="Listing preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                Active Cover Photo
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Or choose from architectural presets:</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '/assets/kl-ui/kl-1.jpg',
                  '/assets/kl-ui/kl-2.jpg',
                  '/assets/kl-ui/kl-3.jpg',
                  '/assets/kl-ui/kl-4.jpg',
                  '/assets/kl-ui/kl-5.jpg',
                  '/assets/kl-ui/kl-6.jpg',
                ].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPhoto(src)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      photo === src
                        ? 'border-[#C72B62] scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ListingImage src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            Publish Listing Live
          </button>
        </form>

        {customListings.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-bold text-slate-500">
              Your Published Listings ({customListings.length})
            </p>
            <div className="space-y-2">
              {customListings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ListingImage
                      src={item.image}
                      alt={item.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.area} · ${item.twoNightPriceUsd}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onDeleteCustomListing(item.id)}
                    className="w-8 h-8 rounded-full hover:bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. MESSAGES / LIVE HOST CHAT INBOX MODAL                                  */
/* ========================================================================= */
export const MessagesInboxModal: React.FC<{
  threads: HostThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}> = ({ threads, activeThreadId, onSelectThread, onSendMessage, onClose }) => {
  const [draft, setDraft] = useState('');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[540px] max-h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-950">Messages</h3>
            <p className="text-xs text-slate-500">Direct communication with verified KL hosts</p>
          </div>
          <button
            type="button"
            aria-label="Close messages"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-0">
          <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-slate-100 overflow-y-auto divide-y divide-slate-100">
            {threads.map((t) => {
              const active = activeThread?.id === t.id;
              const lastMsg = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectThread(t.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    active ? 'bg-[#C72B62]/[0.06]' : 'hover:bg-slate-50'
                  }`}
                >
                  <ListingImage
                    src={t.listingImage}
                    alt={t.hostName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{t.hostName}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {lastMsg?.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{t.listingTitle}</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{lastMsg?.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="sm:col-span-7 flex flex-col min-h-0">
            {activeThread && (
              <>
                <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-900">{activeThread.hostName}</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-600">{activeThread.listingTitle}</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeThread.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === 'guest' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          m.sender === 'guest'
                            ? 'bg-[#C72B62] text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p>{m.text}</p>
                        <span
                          className={`block text-[10px] mt-1 ${
                            m.sender === 'guest' ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {m.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-3 border-t border-slate-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message to host..."
                    className="flex-1 h-10 px-4 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="w-10 h-10 rounded-full bg-[#C72B62] hover:bg-[#ad2253] text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. TRIPS & RESERVATIONS MODAL                                             */
/* ========================================================================= */
export const TripsModal: React.FC<{
  bookings: BookingRecord[];
  formatPrice: (twoNightUsd: number, nightsOverride?: number) => string;
  onCancelBooking: (id: string) => void;
  onOpenListingById: (listingId: string) => void;
  onClose: () => void;
}> = ({ bookings, formatPrice, onCancelBooking, onOpenListingById, onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              Trips & Reservations ({bookings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Manage your Kuala Lumpur stays, experiences & host check-ins
            </p>
          </div>
          <button
            type="button"
            aria-label="Close trips"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No upcoming trips yet. Click any home on qaaga.com to reserve!
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((bk) => (
              <div
                key={bk.id}
                className="p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div
                  onClick={() => onOpenListingById(bk.listingId)}
                  className="flex items-center gap-3.5 min-w-0 cursor-pointer"
                >
                  <ListingImage
                    src={bk.image}
                    alt={bk.title}
                    className="w-20 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                      <span className="font-semibold text-emerald-700">{bk.status}</span>
                      <span>·</span>
                      <span className="font-mono">{bk.confirmationCode}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5 hover:underline">
                      {bk.title}
                    </h4>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {bk.checkInLabel} · {bk.nights} night{bk.nights > 1 ? 's' : ''} ·{' '}
                      {bk.guests} guest{bk.guests > 1 ? 's' : ''} ·{' '}
                      <strong className="text-slate-900">
                        {formatPrice(bk.totalUsd, 2)}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCancelBooking(bk.id)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-rose-500 hover:text-rose-600 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer transition-colors"
                >
                  Cancel trip
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. COLLECTION / WISHLIST EXPLORER MODAL                                   */
/* ========================================================================= */
export const CollectionExplorerModal: React.FC<{
  title: string;
  items: QaagaListing[];
  wishlistIds: string[];
  userToggledHearts: Record<string, boolean>;
  activeNights: number;
  onlyGuestFavorites: boolean;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'rating';
  onToggleGuestFavorites: () => void;
  onChangeSort: (s: 'recommended' | 'price-asc' | 'price-desc' | 'rating') => void;
  formatPrice: (twoNightUsd: number) => string;
  onOpenListing: (item: QaagaListing) => void;
  onToggleWishlist: (e: React.MouseEvent, item: QaagaListing) => void;
  onClose: () => void;
}> = ({
  title,
  items,
  wishlistIds,
  userToggledHearts,
  activeNights,
  onlyGuestFavorites,
  sortBy,
  onToggleGuestFavorites,
  onChangeSort,
  formatPrice,
  onOpenListing,
  onToggleWishlist,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl 2xl:max-w-7xl min-[1920px]:max-w-[1700px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {title} ({items.length})
            </h3>
            <p className="text-xs text-slate-500">
              Malaysian capital with skyline views · Instant reservation
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onToggleGuestFavorites}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                onlyGuestFavorites
                  ? 'bg-[#C72B62] text-white border-[#C72B62]'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
              }`}
            >
              Guest favorites only
            </button>

            <select
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as typeof sortBy)}
              aria-label="Sort listings"
              className="h-8 px-3 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#C72B62]"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <button
              type="button"
              aria-label="Close explorer"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 min-[1920px]:grid-cols-7 gap-5">
          {items.map((item) => (
            <ListingCard
              key={`explorer-${item.id}`}
              item={item}
              isSaved={wishlistIds.includes(item.id)}
              isUserToggled={Boolean(userToggledHearts[item.id])}
              formattedPrice={formatPrice(item.twoNightPriceUsd)}
              activeNights={activeNights}
              vividSavedState={true}
              onOpen={(selected) => {
                onClose();
                onOpenListing(selected);
              }}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 5. GUEST PROFILE & ACCOUNT MODAL                                          */
/* ========================================================================= */
export const ProfileModal: React.FC<{
  profile: GuestProfile;
  onSave: (updated: GuestProfile) => void;
  onClose: () => void;
  onLogout?: () => void;
}> = ({ profile, onSave, onClose, onLogout }) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(profile.city);
  const [phone, setPhone] = useState(profile.phone || '');
  const [role, setRole] = useState<'customer' | 'guest' | 'host' | 'admin'>(profile.role || 'guest');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');

  const AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    onSave({
      fullName: fullName.trim(),
      email: email.trim(),
      city: city.trim() || 'Kuala Lumpur',
      phone: phone.trim() || undefined,
      role,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
      verified: true,
      joinedDate: profile.joinedDate || 'Nov 2026',
      status: 'active',
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C72B62]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#C72B62] text-white flex items-center justify-center font-bold text-base uppercase">
                {fullName.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                <span>Account Profile</span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                Verified member · Role: <span className="font-semibold text-slate-800">{role}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close profile modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Avatar</label>
          <div className="flex items-center gap-2">
            {AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(url)}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                  avatarUrl === url ? 'border-[#C72B62] scale-110 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711..."
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Home City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#C72B62]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">About / Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other guests and hosts about yourself..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Account Role (RBAC)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['guest', 'host', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                    role === r
                      ? 'bg-[#C72B62] text-white border-[#C72B62]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Supabase status badge */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Auth & Database Connected
            </span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Sync Active</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-sm font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Save Profile Changes
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 6. HELP CENTER & GUEST PROTECTION MODAL                                   */
/* ========================================================================= */
export const HelpCenterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={20} className="text-[#C72B62]" />
            <h3 className="text-base font-bold text-slate-950">
              Help Center & QaagaCover Protection
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close help modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#C72B62]/[0.05] border border-[#C72B62]/15 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#C72B62]" />
              <span>Every booking includes free QaagaCover</span>
            </p>
            <p>
              Full check-in guarantee, accuracy protection, and 24-hour safety support
              across all stays, experiences, and hospitality services on qaaga.com.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-2.5">
              <p className="font-semibold text-slate-900">How does self check-in work?</p>
              <p className="mt-0.5">
                Smart-lock codes and building concierge instructions are delivered directly
                in your Messages & Notifications 24 hours prior to arrival.
              </p>
            </div>
            <div className="py-2.5">
              <p className="font-semibold text-slate-900">Cancellation policy</p>
              <p className="mt-0.5">
                Cancel any upcoming trip free of charge from Trips & Reservations within 48
                hours of booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
