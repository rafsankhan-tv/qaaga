import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Star, ShieldCheck, Check, Eye, Heart } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { marketplaceStore } from '../../services/marketplaceStore';

interface ShopProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isInCart?: boolean;
}

export const ShopProductCard: React.FC<ShopProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onBuyNow,
  isInCart = false
}) => {
  const [inWishlist, setInWishlist] = useState(() => marketplaceStore.isInWishlist(product.id));

  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => {
      setInWishlist(marketplaceStore.isInWishlist(product.id));
    });
    return () => unsub();
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = marketplaceStore.toggleWishlist(product.id, 'PRODUCT');
    setInWishlist(state);
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#4e20b8]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
          <Zap size={11} className="fill-white" />
          <span>-{discountPercent}%</span>
        </div>
      )}

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

      {/* Image Thumbnail Container */}
      <div
        onClick={() => onQuickView(product)}
        className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Eye size={13} />
            <span>বিস্তারিত দেখুন</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4e20b8] line-clamp-1">
              {product.sellerShopName || 'Official Store'}
            </span>
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#4e20b8] transition-colors cursor-pointer leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ৳ {currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ৳ {product.price.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              স্টক: {product.stock}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onAddToCart(product)}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isInCart
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-purple-50 hover:bg-purple-100 text-[#4e20b8]'
              }`}
            >
              {isInCart ? <Check size={14} /> : <ShoppingCart size={14} />}
              <span>{isInCart ? 'কার্টে আছে' : 'কার্ট'}</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-[#ff6d00] to-amber-600 hover:from-[#ea6000] hover:to-amber-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-98"
            >
              <Zap size={13} className="fill-white" />
              <span>কিনুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

