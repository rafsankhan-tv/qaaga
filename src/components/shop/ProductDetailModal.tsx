import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Store,
  Share2,
  Clock,
  RotateCcw,
  BadgeCheck,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { marketplaceStore } from '../../services/marketplaceStore';
import { SellerDirectChatModal } from './SellerDirectChatModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onOpenSellerChat?: (sellerId: string) => void;
  onViewSellerStore?: (sellerId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenSellerChat,
  onViewSellerStore
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [isSellerChatOpen, setIsSellerChatOpen] = useState(false);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'];

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;

  const sellerStore = marketplaceStore.getSellerStoreById(product.sellerId || '') ||
    marketplaceStore.getSellerStores().find(s => s.shopName === product.sellerShopName);

  const sellerPhone = sellerStore?.phone || '+8801711223344';
  const sellerShopName = sellerStore?.shopName || product.sellerShopName || 'Official QAAGA Verified Shop';
  const sellerLogo = sellerStore?.shopLogo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
  const sellerRating = sellerStore?.rating || product.rating || 4.9;
  const sellerReviewCount = sellerStore?.reviewCount || product.reviewCount || 120;
  const sellerId = sellerStore?.id || product.sellerId || 'seller-1';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChat = () => {
    if (onOpenSellerChat) {
      onOpenSellerChat(sellerId);
    } else {
      setIsSellerChatOpen(true);
    }
  };

  const handleGoToStore = () => {
    if (onViewSellerStore) {
      onClose();
      onViewSellerStore(sellerId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-100 text-[#4e20b8]">
                {product.category}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                SKU: <span className="font-mono text-slate-700">{product.sku}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="লিঙ্ক কপি করুন"
              >
                <Share2 size={15} />
                <span className="hidden sm:inline">{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left: Gallery */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  <img
                    src={images[selectedImageIdx]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                      <Zap size={13} className="fill-white" />
                      <span>-{discountPercent}% ছাড়</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <BadgeCheck size={13} className="text-emerald-400" />
                    <span>জেনুইন পণ্য</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          selectedImageIdx === idx
                            ? 'border-[#4e20b8] ring-2 ring-[#4e20b8]/30 scale-102'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-[#4e20b8]">
                    <ShieldCheck size={16} />
                    <span>QAAGA ট্রাস্ট ও কোয়ালিটি নিশ্চয়তা</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>১০০% অথেনটিক অরিজিনাল কম্পোনেন্ট</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <RotateCcw size={13} className="text-blue-600 shrink-0" />
                      <span>৭ দিনের সহজ রিটার্ন পলিসি</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Truck size={13} className="text-amber-600 shrink-0" />
                      <span>সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Info & Purchase */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  
                  {/* FULL SELLER INTERACTIVE CARD */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm border border-slate-800">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={sellerLogo}
                            alt={sellerShopName}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/80 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-white hover:text-amber-300 transition-colors">
                              {sellerShopName}
                            </span>
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <BadgeCheck size={11} /> ভেরিফাইড
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              ★ {sellerRating}
                            </span>
                            <span className="text-slate-400">({sellerReviewCount} রিভিউ)</span>
                            <span className="text-slate-500">&bull;</span>
                            <span className="text-emerald-400 font-semibold">&lt; ১৫ মি. রেসপন্স</span>
                          </div>
                        </div>
                      </div>

                      {/* Store Visit Action Button */}
                      {onViewSellerStore && (
                        <button
                          onClick={handleGoToStore}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95 ml-auto"
                        >
                          <Store size={14} />
                          <span>সম্পূর্ণ দোকান দেখুন</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>

                    {/* Direct Contact Action Bar: Phone Call + Live Chat */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                      <a
                        href={`tel:${sellerPhone}`}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs text-center"
                      >
                        <PhoneCall size={14} />
                        <span>সরাসরি কল করুন</span>
                      </a>

                      <button
                        onClick={handleOpenChat}
                        className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <MessageCircle size={14} />
                        <span>সরাসরি চ্যাট করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                    {product.title}
                  </h1>

                  {/* Price Section */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#4e20b8]">
                      ৳ {currentPrice.toLocaleString()}
                    </span>
                    {product.discountPrice && (
                      <>
                        <span className="text-sm font-semibold text-slate-400 line-through">
                          ৳ {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          ৳ {(product.price - product.discountPrice).toLocaleString()} সাশ্রয়
                        </span>
                      </>
                    )}
                    <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      স্টকে আছে ({product.stock} টি)
                    </span>
                  </div>

                  {/* Delivery & Warranty Snippets */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <Truck size={14} className="text-amber-600" />
                        <span>ডেলিভারি সময়</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-tight">
                        {product.deliveryInfo || 'ঢাকায় ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৩ দিন'}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span>ওয়ারেন্টি</span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-tight">
                        {product.warranty || '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি'}
                      </p>
                    </div>
                  </div>

                  {/* Tab switcher */}
                  <div className="pt-2">
                    <div className="flex border-b border-slate-200 text-xs font-bold gap-4">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                          activeTab === 'details'
                            ? 'border-[#4e20b8] text-[#4e20b8]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        বিবরণ ও ফিচারস
                      </button>
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                          activeTab === 'specs'
                            ? 'border-[#4e20b8] text-[#4e20b8]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        স্পেসিফিকেশন
                      </button>
                    </div>

                    <div className="py-3 text-xs text-slate-600 leading-relaxed min-h-[70px]">
                      {activeTab === 'details' ? (
                        <p>{product.description}</p>
                      ) : (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">মডেল / SKU:</span>
                            <span className="font-mono font-bold text-slate-800">{product.sku}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">ক্যাটাগরি:</span>
                            <span className="font-bold text-slate-800">{product.category}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">স্টক স্ট্যাটাস:</span>
                            <span className="font-bold text-emerald-600">রেডি টু শিপ ({product.stock} Units)</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">বিক্রেতা:</span>
                            <span className="font-bold text-[#4e20b8]">{sellerShopName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Action CTA Buttons */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">পরিমাণ নির্ধারণ করুন:</span>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-300">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-black w-7 text-center text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onAddToCart(product, quantity);
                      }}
                      className="py-3 px-4 rounded-2xl bg-purple-100 hover:bg-purple-200 text-[#4e20b8] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      <ShoppingCart size={16} />
                      <span>কার্টে যোগ করুন</span>
                    </button>

                    <button
                      onClick={() => {
                        onBuyNow(product, quantity);
                      }}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff6d00] to-amber-600 hover:from-[#ea6000] hover:to-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                    >
                      <Zap size={16} className="fill-white" />
                      <span>এখনই কিনুন (৳ {(currentPrice * quantity).toLocaleString()})</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Direct Seller Chat Modal */}
      {isSellerChatOpen && (
        <SellerDirectChatModal
          sellerId={sellerId}
          sellerShopName={sellerShopName}
          sellerPhone={sellerPhone}
          initialProduct={product}
          isOpen={isSellerChatOpen}
          onClose={() => setIsSellerChatOpen(false)}
          onViewStore={onViewSellerStore}
        />
      )}
    </>
  );
};

