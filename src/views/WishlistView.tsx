import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookOpen,
  Repeat,
  Package,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product, EBook, UsedProductListing } from '../types';

interface WishlistViewProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct?: (product: Product) => void;
  onSelectEbook?: (ebook: EBook) => void;
  onSelectUsedProduct?: (item: UsedProductListing) => void;
  onBuyNow?: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  onNavigate,
  onSelectProduct,
  onSelectEbook,
  onSelectUsedProduct,
  onBuyNow
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | 'PRODUCT' | 'EBOOK' | 'USED'>('ALL');

  const wishlistProducts = marketplaceStore.getWishlistProducts();
  const wishlistEbooks = marketplaceStore.getWishlistEbooks();
  const wishlistUsed = marketplaceStore.getWishlistUsedProducts();

  const totalCount = wishlistProducts.length + wishlistEbooks.length + wishlistUsed.length;

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((p) => marketplaceStore.addToCart(p, 1));
    alert('উইশলিস্টের সকল প্রোডাক্ট সফলভাবে কার্টে যোগ করা হয়েছে!');
    onNavigate('checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-purple-700 to-[#4e20b8] text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('products')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <Heart size={24} className="fill-white" />
                <span>আমার উইশলিস্ট / পছন্দের তালিকা (Wishlist)</span>
              </h1>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              আপনার সংরক্ষিত পছন্দের পণ্য, ই-বুক এবং ব্যবহৃত আইটেম একসাথে
            </p>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="bg-white hover:bg-rose-50 text-[#4e20b8] font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>সব পণ্য কার্টে নিন</span>
              </button>
              <button
                type="button"
                onClick={() => marketplaceStore.clearWishlist()}
                className="bg-white/10 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl border border-white/20 transition-all cursor-pointer"
                title="Clear all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-[#4e20b8] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={14} />
            <span>সকল সংরক্ষিত আইটেম ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRODUCT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PRODUCT'
                ? 'bg-[#4e20b8] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package size={14} />
            <span>নতুন পণ্য ({wishlistProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EBOOK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'EBOOK'
                ? 'bg-[#4e20b8] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={14} />
            <span>ই-বুক সমূহ ({wishlistEbooks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'USED'
                ? 'bg-[#4e20b8] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Repeat size={14} />
            <span>ব্যবহৃত বাজার ({wishlistUsed.length})</span>
          </button>
        </div>

        {totalCount === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
              <Heart size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">আপনার উইশলিস্ট তালিকা খালি</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার পছন্দের যেকোনো নতুন প্রোডাক্ট, ই-বুক বা সেকেন্ড হ্যান্ড আইটেমের হার্ট (❤️) আইকনে ক্লিক করে সংরক্ষণ করুন।
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="bg-gradient-to-r from-[#4e20b8] to-[#ff6d00] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>শপে প্রোডাক্ট খুঁজুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Products Section */}
            {(activeTab === 'ALL' || activeTab === 'PRODUCT') && wishlistProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Package size={18} className="text-[#4e20b8]" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    সংরক্ষিত নতুন পণ্য ({wishlistProducts.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlistProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative">
                        <img
                          src={prod.images?.[0]}
                          alt={prod.title}
                          className="w-full h-44 object-cover cursor-pointer"
                          onClick={() => onSelectProduct?.(prod)}
                        />
                        <button
                          type="button"
                          onClick={() => marketplaceStore.removeFromWishlist(prod.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-[#4e20b8] uppercase tracking-wider">
                            {prod.category}
                          </p>
                          <h3
                            onClick={() => onSelectProduct?.(prod)}
                            className="text-xs font-bold text-slate-900 hover:text-[#4e20b8] transition-colors cursor-pointer line-clamp-2 mt-0.5"
                          >
                            {prod.title}
                          </h3>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-slate-900">
                              ৳ {(prod.discountPrice || prod.price).toLocaleString()}
                            </span>
                            {prod.discountPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ৳ {prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                marketplaceStore.addToCart(prod, 1);
                                alert('কার্টে যোগ করা হয়েছে!');
                              }}
                              className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <ShoppingBag size={12} />
                              <span>কার্টে নিন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (onBuyNow) {
                                  onBuyNow(prod);
                                } else {
                                  marketplaceStore.addToCart(prod, 1);
                                  onNavigate('checkout', { instantProduct: prod, instantQuantity: 1 });
                                }
                              }}
                              className="py-2 px-2.5 bg-[#ff6d00] hover:bg-[#ea6000] text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <span>এখনই কিনুন</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ebooks Section */}
            {(activeTab === 'ALL' || activeTab === 'EBOOK') && wishlistEbooks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <BookOpen size={18} className="text-[#4e20b8]" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    সংরক্ষিত ই-বুক সমূহ ({wishlistEbooks.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlistEbooks.map((eb) => (
                    <div
                      key={eb.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative">
                        <img
                          src={eb.coverImage}
                          alt={eb.title}
                          className="w-full h-44 object-cover cursor-pointer"
                          onClick={() => onSelectEbook?.(eb)}
                        />
                        <button
                          type="button"
                          onClick={() => marketplaceStore.removeFromWishlist(eb.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-[#4e20b8]">{eb.author}</p>
                          <h3
                            onClick={() => onSelectEbook?.(eb)}
                            className="text-xs font-bold text-slate-900 hover:text-[#4e20b8] cursor-pointer line-clamp-2 mt-0.5"
                          >
                            {eb.title}
                          </h3>
                        </div>

                        <div>
                          <span className="text-sm font-black text-slate-900">
                            {eb.price === 0 ? 'ফ্রি ই-বুক' : `৳ ${eb.price.toLocaleString()}`}
                          </span>

                          <button
                            type="button"
                            onClick={() => onSelectEbook?.(eb)}
                            className="w-full mt-3 py-2 px-3 bg-[#4e20b8] hover:bg-[#41189e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BookOpen size={13} />
                            <span>পড়ুন / ডাউনলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Used Market Section */}
            {(activeTab === 'ALL' || activeTab === 'USED') && wishlistUsed.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Repeat size={18} className="text-[#ff6d00]" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    সংরক্ষিত সেকেন্ড হ্যান্ড আইটেম ({wishlistUsed.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlistUsed.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative">
                        <img
                          src={u.photos?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'}
                          alt={u.title}
                          className="w-full h-44 object-cover cursor-pointer"
                          onClick={() => onSelectUsedProduct?.(u)}
                        />
                        <button
                          type="button"
                          onClick={() => marketplaceStore.removeFromWishlist(u.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] bg-orange-100 text-[#ff6d00] font-black px-2 py-0.5 rounded">
                            {u.condition}
                          </span>
                          <h3
                            onClick={() => onSelectUsedProduct?.(u)}
                            className="text-xs font-bold text-slate-900 hover:text-[#4e20b8] cursor-pointer line-clamp-2 mt-1.5"
                          >
                            {u.title}
                          </h3>
                        </div>

                        <div>
                          <span className="text-sm font-black text-slate-900">৳ {u.price.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => onSelectUsedProduct?.(u)}
                            className="w-full mt-3 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>বিক্রেতার সাথে যোগাযোগ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
export default WishlistView;
