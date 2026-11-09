'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  variant?: 'recent' | 'wishlist' | 'default';
  cardWidthClass?: string;
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
  variant = 'default',
  cardWidthClass,
  vividSavedState = false,
  onOpen,
  onToggleWishlist,
}) => {
  const showCrimsonHeart = isSaved && (isUserToggled || vividSavedState);
  const nightsLabel =
    item.category === 'stay'
      ? `for ${activeNights} night${activeNights > 1 ? 's' : ''}`
      : 'per booking';

  let responsiveWidthClass = '';
  if (cardWidthClass) {
    responsiveWidthClass = cardWidthClass;
  } else if (carouselItem) {
    if (variant === 'recent') {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-36px)/3.25)] min-[540px]:w-[calc((100%-48px)/4.25)] sm:w-[calc((100%-60px)/5.25)] md:w-[calc((100%-80px)/6)] lg:w-[calc((100%-112px)/8)] xl:w-[calc((100%-112px)/8)] 2xl:w-[calc((100%-112px)/8)]';
    } else if (variant === 'wishlist') {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-14px)/2)] min-[500px]:w-[calc((100%-28px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] xl:w-[calc((100%-64px)/5)] 2xl:w-[calc((100%-64px)/5)]';
    } else {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-14px)/2)] min-[500px]:w-[calc((100%-28px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] xl:w-[calc((100%-80px)/6)] 2xl:w-[calc((100%-100px)/7)]';
    }
  }

  return (
    <article
      className={`group relative flex flex-col text-left rounded-[16px] sm:rounded-[20px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 ${responsiveWidthClass}`}
    >
      {/* Rounded Square Photo Frame */}
      <div className="relative w-full aspect-[1.05/1] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300">
        <button
          type="button"
          aria-label={`View details for ${item.title}`}
          onClick={() => onOpen(item)}
          className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C72B62]"
        >
          <ListingImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center scale-[1.02] group-hover:scale-[1.08] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </button>

        {/* Top-Left "Guest favorite" Pill */}
        {item.guestFavorite && (
          <span
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-white/95 backdrop-blur-xs text-slate-900 font-semibold rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] leading-tight pointer-events-none transition-transform duration-200 group-hover:scale-[1.02] ${
              variant === 'recent'
                ? 'hidden sm:inline-block text-[11px] px-2 py-0.5'
                : 'text-[11px] sm:text-[12px] px-2.5 sm:px-3 py-0.5 sm:py-1'
            }`}
          >
            Guest favorite
          </span>
        )}

        {/* Top-Right 1-Click Interactive Heart Button with spring physics */}
        <motion.button
          type="button"
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          aria-label={
            isSaved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`
          }
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.82 }}
          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
          onClick={(e) => onToggleWishlist(e, item)}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex items-center justify-center rounded-full cursor-pointer ${
            variant === 'recent'
              ? 'min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px]'
              : 'min-w-[40px] min-h-[40px]'
          }`}
        >
          <Heart
            size={variant === 'recent' ? 18 : 22}
            className={
              showCrimsonHeart
                ? 'fill-[#C72B62] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-colors duration-200'
                : isSaved
                ? 'fill-black/50 hover:fill-[#C72B62] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)] transition-colors duration-200'
                : 'fill-black/20 hover:fill-[#C72B62] text-white/95 stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)] transition-colors duration-200'
            }
          />
        </motion.button>
      </div>

      {/* Clean Unboxed Metadata Underneath Photo */}
      <div
        onClick={() => onOpen(item)}
        className="pt-2 sm:pt-2.5 px-0.5 space-y-0.5 cursor-pointer"
      >
        <h3
          className={`font-semibold text-slate-900 tracking-[-0.01em] leading-snug truncate ${
            variant === 'recent' ? 'text-[12px] sm:text-[13.5px]' : 'text-[13.5px]'
          }`}
        >
          {item.title}
        </h3>
        <div
          className={`flex items-center gap-1 text-slate-500 tabular-nums leading-snug ${
            variant === 'recent'
              ? 'text-[11px] sm:text-[12.5px]'
              : 'text-[12px] sm:text-[12.5px]'
          }`}
        >
          <span className="truncate">
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
