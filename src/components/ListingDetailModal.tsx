'use client';

import React, { useState } from 'react';
import { Check, Heart, Mail, Share2, ShieldCheck, Star, X } from 'lucide-react';
import { ListingReview, QaagaListing } from '@/data/listings';
import { ListingImage } from './ListingCard';

interface ListingDetailModalProps {
  listing: QaagaListing;
  isSaved: boolean;
  reviews: ListingReview[];
  initialNights: number;
  initialGuests: number;
  dateRangeLabel: string;
  formatPrice: (twoNightUsd: number, nightsOverride?: number) => string;
  bookingSuccessCode: string | null;
  onClose: () => void;
  onToggleWishlist: (e: React.MouseEvent, item: QaagaListing) => void;
  onShare: () => void;
  onMessageHost: (item: QaagaListing) => void;
  onConfirmBooking: (nights: number, guests: number) => void;
  onOpenTrips: () => void;
  onAddReview: (rating: number, comment: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = React.memo(({
  listing,
  isSaved,
  reviews,
  initialNights,
  initialGuests,
  dateRangeLabel,
  formatPrice,
  bookingSuccessCode,
  onClose,
  onToggleWishlist,
  onShare,
  onMessageHost,
  onConfirmBooking,
  onOpenTrips,
  onAddReview,
}) => {
  const [activePhoto, setActivePhoto] = useState<string>(listing.image);
  const [nights, setNights] = useState<number>(initialNights);
  const [guests, setGuests] = useState<number>(initialGuests);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    onAddReview(reviewRating, reviewText.trim());
    setReviewText('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Sticky Modal Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-950 truncate">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 tabular-nums mt-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                <Star size={12} className="fill-slate-900 text-slate-900" />
                {listing.rating}
              </span>
              <span>·</span>
              <span>{listing.reviewsCount} reviews</span>
              <span>·</span>
              <span>
                {listing.area}, {listing.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onShare}
              className="px-3 py-2 rounded-full hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={(e) => onToggleWishlist(e, listing)}
              className="px-3 py-2 rounded-full hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Heart
                size={15}
                className={
                  isSaved ? 'fill-[#C72B62] text-[#C72B62]' : 'text-slate-700'
                }
              />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Two-Column Detail & Contiguous Reservation Layout */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left 7 Columns: Gallery, Host, Description, Amenities, Reviews */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2.5">
              <div className="relative aspect-[1.35/1] rounded-2xl overflow-hidden bg-slate-100">
                <ListingImage
                  src={activePhoto || listing.image}
                  alt={listing.title}
                  priority={true}
                  sizes="(max-width: 1023px) 100vw, 560px"
                  className="w-full h-full object-cover scale-[1.03]"
                />
                {listing.guestFavorite && (
                  <span className="absolute top-3.5 left-3.5 bg-white/95 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    Guest favorite · Top 5% of homes
                  </span>
                )}
              </div>

              {listing.gallery.length > 1 && (
                <div className="flex items-center gap-2.5">
                  {listing.gallery.map((gImg, idx) => (
                    <button
                      key={`${gImg}-${idx}`}
                      type="button"
                      onClick={() => setActivePhoto(gImg)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-transform duration-200 cursor-pointer ${
                        activePhoto === gImg
                          ? 'border-[#C72B62] scale-[1.02]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <ListingImage
                        src={gImg}
                        alt=""
                        sizes="80px"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="text-base font-bold text-slate-900">
                  Hosted by {listing.hostName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {listing.bedrooms} · Up to {listing.maxGuests} guests · {listing.hostYears}{' '}
                  years hosting
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#C72B62]/10 text-[#C72B62] font-bold flex items-center justify-center shrink-0">
                {listing.hostName.charAt(0)}
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">
                What this place offers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.amenities.map((am) => (
                  <div
                    key={am}
                    className="flex items-center gap-2 text-xs text-slate-700 py-1"
                  >
                    <Check size={14} className="text-[#C72B62] shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Reviews & Live Review Form */}
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Guest Reviews ({listing.reviewsCount})
                </h4>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star size={13} className="fill-[#C72B62] text-[#C72B62]" />
                  {listing.rating}
                </span>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{rev.author}</span>
                      <span className="text-slate-400">{rev.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReviewSubmit} className="flex items-center gap-2 pt-1">
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  aria-label="Rating"
                  className="h-9 px-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#C72B62]"
                >
                  <option value={5}>★ 5</option>
                  <option value={4}>★ 4</option>
                  <option value={3}>★ 3</option>
                </select>
                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write a review about this stay..."
                  className="flex-1 h-9 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* Right 5 Columns: Sticky Contiguous Reservation Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] space-y-4 sticky top-20">
              <div className="flex items-baseline justify-between">
                <div className="tabular-nums">
                  <span className="text-2xl font-bold text-slate-950">
                    {formatPrice(listing.twoNightPriceUsd, nights)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    {listing.category === 'stay'
                      ? `for ${nights} night${nights > 1 ? 's' : ''}`
                      : 'total'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 tabular-nums">
                  <Star size={12} className="fill-slate-900 text-slate-900" />
                  {listing.rating}
                </span>
              </div>

              <div className="rounded-xl border border-slate-300 divide-y divide-slate-300 text-xs">
                <div className="grid grid-cols-2 divide-x divide-slate-300">
                  <div className="p-3">
                    <span className="block text-[10px] font-bold uppercase text-slate-500">
                      Dates
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                      {dateRangeLabel}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">
                        Nights
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {nights} {nights > 1 ? 'nights' : 'night'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNights((n) => Math.max(1, n - 1))}
                        className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setNights((n) => Math.min(30, n + 1))}
                        className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">
                      Guests
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {guests} guest{guests > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(listing.maxGuests, g + 1))}
                      className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {bookingSuccessCode ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>Booking Confirmed!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Confirmation code:{' '}
                    <strong className="font-mono">{bookingSuccessCode}</strong>. Added to
                    your Trips & Notifications.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenTrips}
                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    View in Trips
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onConfirmBooking(nights, guests)}
                  className="w-full py-3.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] active:scale-[0.99] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(199,43,98,0.28)] transition-all cursor-pointer"
                >
                  Reserve
                </button>
              )}

              <button
                type="button"
                onClick={() => onMessageHost(listing)}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail size={14} />
                <span>Message {listing.hostName}</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Free cancellation within 48 hours · Protected by QaagaCover
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ListingDetailModal.displayName = 'ListingDetailModal';
