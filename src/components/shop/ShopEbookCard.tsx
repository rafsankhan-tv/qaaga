import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Zap, Eye, CheckCircle2, Heart } from 'lucide-react';
import { EBook } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { marketplaceStore } from '../../services/marketplaceStore';

interface ShopEbookCardProps {
  ebook: EBook;
  onOpenReader: (ebook: EBook) => void;
  hasPurchased?: boolean;
}

export const ShopEbookCard: React.FC<ShopEbookCardProps> = ({
  ebook,
  onOpenReader,
  hasPurchased = false
}) => {
  const [inWishlist, setInWishlist] = useState(() => marketplaceStore.isInWishlist(ebook.id));

  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => {
      setInWishlist(marketplaceStore.isInWishlist(ebook.id));
    });
    return () => unsub();
  }, [ebook.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = marketplaceStore.toggleWishlist(ebook.id, 'EBOOK');
    setInWishlist(state);
  };

  return (
    <div
      id={`ebook-card-${ebook.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
        <FileText size={10} />
        <span>PDF ({ebook.fileSizeMb} MB)</span>
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

      {/* Book Cover */}
      <div
        onClick={() => onOpenReader(ebook)}
        className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={ebook.coverImage}
          alt={ebook.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
          <span className="text-[10px] font-bold text-amber-300 line-clamp-1">
            {ebook.category}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              লেখক: <strong className="text-slate-800">{ebook.author}</strong>
            </span>
            <RatingStars rating={ebook.rating} reviewCount={ebook.reviewCount} />
          </div>

          <h3
            onClick={() => onOpenReader(ebook)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#4e20b8] transition-colors cursor-pointer leading-snug"
            title={ebook.title}
          >
            {ebook.title}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {ebook.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block text-[10px]">ডিজিটাল কপি</span>
            <span className="text-base font-black text-[#4e20b8]">৳ {ebook.price}</span>
          </div>

          <button
            onClick={() => onOpenReader(ebook)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              hasPurchased
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-[#4e20b8] to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white'
            }`}
          >
            {hasPurchased ? (
              <>
                <BookOpen size={13} />
                <span>পড়ুন ও ডাউনলোড</span>
              </>
            ) : (
              <>
                <Zap size={13} className="fill-amber-400 text-amber-400" />
                <span>প্রিভিউ ও কিনুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
