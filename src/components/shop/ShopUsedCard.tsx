import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, MessageCircle, Tag, Eye, Heart } from 'lucide-react';
import { UsedProductListing } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';

interface ShopUsedCardProps {
  listing: UsedProductListing;
  onViewDetails: (listing: UsedProductListing) => void;
  onOpenChatWithAdmin?: (subject: string) => void;
}

export const ShopUsedCard: React.FC<ShopUsedCardProps> = ({
  listing,
  onViewDetails,
  onOpenChatWithAdmin
}) => {
  const [inWishlist, setInWishlist] = useState(() => marketplaceStore.isInWishlist(listing.id));

  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => {
      setInWishlist(marketplaceStore.isInWishlist(listing.id));
    });
    return () => unsub();
  }, [listing.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = marketplaceStore.toggleWishlist(listing.id, 'USED');
    setInWishlist(state);
  };

  return (
    <div
      id={`used-card-${listing.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Condition & Negotiable Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
          listing.condition === 'Like New'
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 text-white'
        }`}>
          {listing.condition}
        </span>
        {listing.isNegotiable && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
            দরদামযোগ্য
          </span>
        )}
      </div>

      {/* Wishlist Heart Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        title={inWishlist ? 'উইশলিস্ট থেকে মুছুন' : 'পছন্দের তালিকায় রাখুন'}
        className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 shadow-sm cursor-pointer ${
          inWishlist
            ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
            : 'bg-white/80 text-slate-500 hover:text-rose-600 hover:bg-white'
        }`}
      >
        <Heart size={15} className={inWishlist ? 'fill-rose-600' : ''} />
      </button>

      {/* Image */}
      <div
        onClick={() => onViewDetails(listing)}
        className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Eye size={13} />
            <span>লিস্টিং দেখুন</span>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin size={12} className="text-[#4e20b8]" />
              {listing.area}, {listing.district}
            </span>
            <span>{listing.inquiryCount} জন আগ্রহী</span>
          </div>

          <h3
            onClick={() => onViewDetails(listing)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#4e20b8] transition-colors cursor-pointer leading-snug"
            title={listing.title}
          >
            {listing.title}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block">প্রস্তাবিত মূল্য</span>
            <span className="text-base font-black text-slate-900">
              ৳ {listing.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onViewDetails(listing)}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Tag size={13} />
            <span>অফার / দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
