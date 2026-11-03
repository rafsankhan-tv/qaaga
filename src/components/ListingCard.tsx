'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Heart, Star } from 'lucide-react';
import { QaagaListing } from '@/data/listings';

export const ListingImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 via-pink-50/40 to-slate-200 flex flex-col items-center justify-center text-slate-500 p-4 ${className}`}
      >
        <Building2 size={26} className="text-[#C72B62] mb-1.5" />
        <span className="text-xs font-medium text-center line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface ListingCardProps {
  item: QaagaListing;
  isSaved: boolean;
  isUserToggled: boolean;
  formattedPrice: string;
  activeNights: number;
  carouselItem?: boolean;
  vividSavedState?: boolean;
  onOpen: (item: QaagaListing) => void;
  onToggleWishlist: (e: React.MouseEvent, item: QaagaListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  isSaved,
  isUserToggled,
  formattedPrice,
  activeNights,
  carouselItem = false,
  vividSavedState = false,
  onOpen,
  onToggleWishlist,
}) => {
  const showCrimsonHeart = isSaved && (isUserToggled || vividSavedState);
  const nightsLabel =
    item.category === 'stay'
      ? `for ${activeNights} night${activeNights > 1 ? 's' : ''}`
      : 'per booking';

  return (
    <article
      className={`group relative flex flex-col text-left rounded-[20px] ${
        carouselItem
          ? 'snap-start shrink-0 w-[47%] sm:w-[31%] lg:w-[calc((100%-100px)/6)]'
          : ''
      }`}
    >
      {/* Rounded Square Photo Frame matching Screenshot_2026-11-04_at_2.23.12_AM */}
      <div className="relative w-full aspect-[1.05/1] rounded-[20px] overflow-hidden bg-slate-100">
        <button
          type="button"
          aria-label={`View details for ${item.title}`}
          onClick={() => onOpen(item)}
          className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C72B62]"
        >
          <ListingImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center scale-[1.035] group-hover:scale-[1.075] transition-transform duration-300"
          />
        </button>

        {/* Top-Left "Guest favorite" Pill */}
        {item.guestFavorite && (
          <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs text-slate-900 text-[12px] font-semibold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] leading-tight pointer-events-none">
            Guest favorite
          </span>
        )}

        {/* Top-Right 1-Click Interactive Heart Button */}
        <button
          type="button"
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          aria-label={
            isSaved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`
          }
          onClick={(e) => onToggleWishlist(e, item)}
          className="absolute top-2 right-2 z-20 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full cursor-pointer hover:scale-110 active:scale-90 transition-transform"
        >
          <Heart
            size={22}
            className={
              showCrimsonHeart
                ? 'fill-[#C72B62] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                : isSaved
                ? 'fill-black/50 hover:fill-[#C72B62] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)]'
                : 'fill-black/20 hover:fill-[#C72B62] text-white/95 stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)]'
            }
          />
        </button>
      </div>

      {/* Clean Unboxed Metadata Underneath Photo */}
      <div
        onClick={() => onOpen(item)}
        className="pt-2.5 px-0.5 space-y-0.5 cursor-pointer"
      >
        <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-[-0.01em] leading-snug truncate">
          {item.title}
        </h3>
        <div className="flex items-center gap-1 text-[12.5px] text-slate-500 tabular-nums leading-snug">
          <span>
            {formattedPrice} {nightsLabel}
          </span>
          <span aria-hidden="true">·</span>
          <Star size={11} className="fill-slate-500 text-slate-500 shrink-0 -mt-px" />
          <span>{item.rating}</span>
        </div>
      </div>
    </article>
  );
};
