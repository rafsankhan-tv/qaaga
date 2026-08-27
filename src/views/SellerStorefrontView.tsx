import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  BadgeCheck,
  ShieldCheck,
  Star,
  Phone,
  PhoneCall,
  MessageCircle,
  Share2,
  Heart,
  Search,
  Filter,
  Truck,
  RotateCcw,
  Clock,
  MapPin,
  CheckCircle2,
  Zap,
  ShoppingCart,
  Plus,
  ArrowLeft,
  Calendar,
  Sparkles,
  Award,
  Send,
  SlidersHorizontal,
  ChevronRight,
  User
} from 'lucide-react';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product, SellerStore, SellerReview } from '../types';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { SellerDirectChatModal } from '../components/shop/SellerDirectChatModal';
import { RatingStars } from '../components/common/RatingStars';
import { useAuth } from '../context/AuthContext';

interface SellerStorefrontViewProps {
  sellerId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SellerStorefrontView: React.FC<SellerStorefrontViewProps> = ({
  sellerId = 'seller-1',
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [store, setStore] = useState<SellerStore | undefined>(() =>
    marketplaceStore.getSellerStoreById(sellerId) || marketplaceStore.getSellerStores()[0]
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [selectedTab, setSelectedTab] = useState<'products' | 'deals' | 'about' | 'reviews'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState(currentUser?.fullName || '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  const activeSellerId = store?.id || sellerId;

  // Load and subscribe to store changes
  useEffect(() => {
    const refreshData = () => {
      const currentStore = marketplaceStore.getSellerStoreById(activeSellerId) ||
        marketplaceStore.getSellerStores().find(s => s.id === activeSellerId || s.userId === activeSellerId) ||
        marketplaceStore.getSellerStores()[0];
      
      setStore(currentStore);

      if (currentStore) {
        const storeProducts = marketplaceStore.getProducts().filter(
          p => p.sellerId === currentStore.id ||
               p.sellerId === currentStore.userId ||
               p.sellerShopName === currentStore.shopName
        );
        setProducts(storeProducts);

        const storeReviews = marketplaceStore.getSellerReviews(currentStore.id);
        setReviews(storeReviews);
      }
    };

    refreshData();
    const unsub = marketplaceStore.subscribe(refreshData);
    return () => unsub();
  }, [activeSellerId]);

  // Categories list derived from seller products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesDeals = selectedTab === 'deals' ? Boolean(p.discountPrice && p.discountPrice < p.price) : true;

        return matchesSearch && matchesCat && matchesDeals;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;

        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, searchQuery, selectedCategory, selectedTab, sortBy]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddToCart = (prod: Product, quantity: number = 1) => {
    marketplaceStore.addToCart(prod, quantity);
  };

  const handleBuyNow = (prod: Product, quantity: number = 1) => {
    marketplaceStore.addToCart(prod, quantity);
    onNavigate('checkout', { instantProduct: prod, instantQuantity: quantity });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !store) return;

    marketplaceStore.addSellerReview({
      sellerId: store.id,
      customerId: currentUser?.id || 'guest-customer',
      customerName: reviewerName.trim() || 'সম্মানিত গ্রাহক',
      customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: reviewRating,
      comment: reviewComment.trim(),
      productName: reviewProductName.trim() || (products[0]?.title || 'মার্কেটপ্লেস অর্ডার'),
      verifiedPurchase: true
    });

    setReviewComment('');
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 4000);
  };

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <Store size={48} className="mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">মার্চেন্ট স্টোর খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1">দয়া করে অন্য কোনো বিক্রেতার প্রোফাইল চেক করুন।</p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-4 px-4 py-2 bg-[#4e20b8] text-white text-xs font-bold rounded-xl"
        >
          সব প্রোডাক্ট দেখুন
        </button>
      </div>
    );
  }

  const coverBanner = store.shopBanner || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80';
  const shopLogo = store.shopLogo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onNavigate('products')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#4e20b8] font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>মার্কেটপ্লেস পণ্য তালিকা</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-medium truncate max-w-[150px] sm:max-w-[250px]">
              {store.shopName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'লিঙ্ক কপি হয়েছে!' : 'শপ শেয়ার'}</span>
            </button>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isFollowing
                  ? 'bg-rose-50 border border-rose-200 text-rose-600'
                  : 'bg-[#4e20b8] text-white hover:bg-[#3d1696]'
              }`}
            >
              <Heart size={13} className={isFollowing ? 'fill-rose-600' : ''} />
              <span>{isFollowing ? 'ফলো করা হয়েছে' : 'শপ ফলো করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STORE HERO HEADER BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
          
          {/* Cover Background */}
          <div className="h-44 sm:h-64 lg:h-72 w-full relative overflow-hidden">
            <img
              src={coverBanner}
              alt={store.shopName}
              className="w-full h-full object-cover object-center filter brightness-65"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>

          {/* Store Info Overlay Bar */}
          <div className="relative -mt-16 sm:-mt-20 p-5 sm:p-7 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <img
                  src={shopLogo}
                  alt={store.shopName}
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover border-4 border-amber-400/90 shadow-2xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-slate-900 rounded-full" title="অনলাইনে আছেন" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {store.shopName}
                  </h1>
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      <BadgeCheck size={13} /> ভেরিফাইড মার্চেন্ট
                    </span>
                  )}
                  {store.hasOfficialBadge && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-purple-500/30 text-purple-300 border border-purple-400/30 font-bold px-2 py-0.5 rounded-full">
                      <Sparkles size={12} /> অফিসিয়াল পার্টনার
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-amber-300">মালিক: {store.ownerName}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin size={12} className="text-rose-400" />
                    <span>{store.area || store.thana || 'ঢাকা'}, {store.district || 'ঢাকা'}</span>
                  </span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400">মেম্বার {new Date(store.createdAt || Date.now()).getFullYear()} থেকে</span>
                </div>

                <p className="text-xs text-slate-300/90 max-w-2xl leading-relaxed pt-1 line-clamp-2">
                  {store.shopBio || 'গুণগত মানের পণ্য, জেনুইন ব্র্যান্ড ওয়ারেন্টি ও সারাদেশে দ্রুততম ক্যাশ অন ডেলিভারি নিশ্চিতকারী বিশ্বস্ত মার্চেন্ট।'}
                </p>
              </div>
            </div>

            {/* Right: Direct Contact CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <a
                href={`tel:${store.phone}`}
                className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <PhoneCall size={16} />
                <span>সরাসরি কল দিন</span>
              </a>

              <a
                href={`https://wa.me/${(store.whatsapp || store.phone).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                title="WhatsApp এ কথা বলুন"
              >
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setIsChatModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-3 bg-[#4e20b8] hover:bg-[#3d1696] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95 border border-purple-400/40"
              >
                <MessageCircle size={16} />
                <span>সরাসরি চ্যাট</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white">{store.rating} / ৫.০</div>
                <div className="text-[10px] text-slate-400">{reviews.length || store.reviewCount} টি গ্রাহক রিভিউ</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Store size={16} className="text-purple-400 shrink-0" />
              <div>
                <div className="font-bold text-white">{products.length} টি পণ্য</div>
                <div className="text-[10px] text-slate-400">অ্যাক্টিভ ও রেডি টু শিপ</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock size={16} className="text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">&lt; ১৫ মিনিট</div>
                <div className="text-[10px] text-slate-400">গড় রেসপন্স সময়</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Truck size={16} className="text-teal-400 shrink-0" />
              <div>
                <div className="font-bold text-white">৯৯.৪% সাকসেস</div>
                <div className="text-[10px] text-slate-400">ডেলিভারি ফুলফিলমেন্ট</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* STORE NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === 'products'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store size={15} />
              <span>সব প্রোডাক্টস ও ক্যাটালগ ({products.length})</span>
            </button>

            <button
              onClick={() => setSelectedTab('deals')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === 'deals'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <Zap size={15} className="fill-current" />
              <span>হট ডিলস ও অফারসমূহ</span>
            </button>

            <button
              onClick={() => setSelectedTab('about')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === 'about'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={15} />
              <span>পরিচিতি ও ডেলিভারি পলিসি</span>
            </button>

            <button
              onClick={() => setSelectedTab('reviews')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === 'reviews'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Star size={15} />
              <span>গ্রাহক রিভিউ ({reviews.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 1 & 2: PRODUCTS & DEALS */}
        {(selectedTab === 'products' || selectedTab === 'deals') && (
          <div className="space-y-6">
            
            {/* Search, Filter & Sort Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Inside Store */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`"${store.shopName}" এর মধ্যে খুঁজুন...`}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] transition-all"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-purple-100 text-[#4e20b8] border border-purple-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat === 'all' ? 'সব ক্যাটাগরি' : cat}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end md:self-auto text-xs">
                <span className="text-slate-400 font-medium hidden sm:inline">সর্ট:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                >
                  <option value="featured">ফিচার্ড ডিল</option>
                  <option value="price_low">মূল্য: কম থেকে বেশি</option>
                  <option value="price_high">মূল্য: বেশি থেকে কম</option>
                  <option value="rating">সর্বোচ্চ রেটিং</option>
                </select>
              </div>

            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
                <Store size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">কোনো পণ্য খুঁজে পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-400">অনুসন্ধানের শব্দ পরিবর্তন করুন অথবা সব ক্যাটাগরি নির্বাচন করুন।</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => {
                  const currentPrice = prod.discountPrice || prod.price;
                  const discountPercent = prod.discountPrice
                    ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                    : 0;

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      {/* Product Image & Badges */}
                      <div
                        onClick={() => setActiveModalProduct(prod)}
                        className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountPercent > 0 && (
                          <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                            -{discountPercent}% ছাড়
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          স্টক: {prod.stock}
                        </div>
                      </div>

                      {/* Info & Price */}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                            {prod.category}
                          </div>
                          <h3
                            onClick={() => setActiveModalProduct(prod)}
                            className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mt-0.5 hover:text-[#4e20b8] transition-colors cursor-pointer"
                          >
                            {prod.title}
                          </h3>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base sm:text-lg font-black text-[#4e20b8]">
                              ৳ {currentPrice.toLocaleString()}
                            </span>
                            {prod.discountPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ৳ {prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <RatingStars rating={prod.rating} reviewCount={prod.reviewCount} />
                            <span className="text-emerald-600 font-semibold text-[10px]">ইন-স্টক</span>
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleAddToCart(prod, 1)}
                            className="py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4e20b8] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                          >
                            <ShoppingCart size={13} />
                            <span>কার্ট</span>
                          </button>

                          <button
                            onClick={() => handleBuyNow(prod, 1)}
                            className="py-2 rounded-xl bg-gradient-to-r from-[#ff6d00] to-amber-600 hover:from-[#ea6000] hover:to-amber-700 text-white font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Zap size={13} className="fill-white" />
                            <span>অর্ডার</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: ABOUT STORE & POLICIES */}
        {selectedTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: About, Trade License & Contact */}
            <div className="md:col-span-7 space-y-6">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Store size={20} className="text-[#4e20b8]" />
                  <span>মার্চেন্ট পরিচিতি ও বিবরণ</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {store.shopBio || 'qaaga.com এর ভেরিফাইড প্রফেশনাল পার্টনার হিসেবে আমরা সর্বোত্তম কোয়ালিটির প্রোডাক্ট এবং নির্ভরযোগ্য কাস্টমার সাপোর্ট প্রদান করে থাকি। প্রতিটি পণ্য প্যাকিং এর পূর্বে সতর্কতার সাথে পরীক্ষা করা হয়।'}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">প্রতিষ্ঠানের নাম</span>
                    <span className="font-bold text-slate-800">{store.shopName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">স্বত্বাধিকারী</span>
                    <span className="font-bold text-slate-800">{store.ownerName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">ট্রেড লাইসেন্স নম্বর</span>
                    <span className="font-mono font-bold text-slate-800">{store.tradeLicenseNumber || 'TRAD/DNCC/084920/2023'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">সার্টিফিকেশন স্ট্যাটাস</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <BadgeCheck size={13} /> ১০০% সরকারি ছাড়পত্র প্রাপ্ত
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Policy */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Truck size={20} className="text-amber-600" />
                  <span>ডেলিভারি শর্তাবলী ও কুরিয়ার পার্টনার</span>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                    <CheckCircle2 size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 block font-bold">ঢাকা সিটি ডেলিভারি (২৪-৪৮ ঘণ্টা):</strong>
                      <span>হোম ডেলিভারি সুবিধা এবং পণ্য হাতে পেয়ে মূল্য পরিশোধের ক্যাশ অন ডেলিভারি (COD)।</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                    <CheckCircle2 size={16} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-900 block font-bold">ঢাকার বাইরে সারাদেশে (৭২ ঘণ্টা):</strong>
                      <span>Steadfast, Pathao ও RedX কুরিয়ারের মাধ্যমে জেলা ও থানা পর্যায়ে দ্রুততম ডেলিভারি।</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Return Policy & Store Direct Contact */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Return Policy Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <RotateCcw size={20} className="text-blue-600" />
                  <span>৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>ভুল বা ডিফেক্টিভ পণ্যে তাৎক্ষণিক ফ্রি রিপ্লেসমেন্ট।</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>আনবক্সিং ভিডিও থাকলে কোনো শর্ত ছাড়াই রিফান্ড প্রযোজ্য।</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>১ বছরের অফিসিয়াল পার্টস ও সার্ভিস ওয়ারেন্টি সাপোর্ট।</span>
                  </li>
                </ul>
              </div>

              {/* Direct Store Contact Box */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
                <h3 className="font-bold text-base text-white">মার্চেন্টের সাথে যোগাযোগ</h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-amber-400" />
                    <span>হটলাইন: <strong>{store.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-rose-400" />
                    <span>ঠিকানা: {store.address || 'দোকান নং #১২, লেভেল ৩'}, {store.district || 'ঢাকা'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-emerald-400" />
                    <span>খোলা থাকে: প্রতিদিন সকাল ৯:০০ - রাত ১০:০০</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${store.phone}`}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-center shadow-xs"
                  >
                    <PhoneCall size={14} />
                    <span>কল দিন</span>
                  </a>
                  <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-center shadow-xs cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>চ্যাট করুন</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: CUSTOMER REVIEWS & FEEDBACK */}
        {selectedTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Reviews List */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  গ্রাহকদের রেটিং ও রিভিউ ({reviews.length})
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  গড় রেটিং: ★ {store.rating} / ৫.০
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                  এখনো কোনো রিভিউ জমা পড়েনি। আপনি প্রথম রিভিউটি প্রদান করুন!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.customerName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{rev.customerName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                ভেরিফাইড ক্রেতা
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      </div>

                      <RatingStars rating={rev.rating} />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {rev.productName && (
                      <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md inline-block font-medium">
                        পণ্য: {rev.productName}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="md:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4 sticky top-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">আপনার অভিজ্ঞতা বা রিভিউ লিখুন</h3>
                  <p className="text-xs text-slate-500 mt-0.5">আপনার মতামত অন্যান্য গ্রাহকদের সঠিক পণ্য বেছে নিতে সহায়তা করে।</p>
                </div>

                {reviewSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>ধন্যবাদ! আপনার রিভিউটি সফলভাবে প্রকাশিত হয়েছে।</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রেটিং নির্বাচন করুন:</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="p-1 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            className={`${
                              num <= reviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-auto font-bold text-slate-800">{reviewRating} তারকা</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">আপনার নাম:</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="উদা: আরিফুর রহমান"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ক্রয়কৃত পণ্য (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={reviewProductName}
                      onChange={(e) => setReviewProductName(e.target.value)}
                      placeholder="উদা: Cordless Drill Set"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">আপনার রিভিউ / মন্তব্য:</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পণ্যের কোয়ালিটি, ডেলিভারি স্পিড ও মার্চেন্টের ব্যবহার কেমন ছিল..."
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send size={14} />
                    <span>রিভিউ সাবমিট করুন</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PRODUCT DETAIL MODAL */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          isOpen={Boolean(activeModalProduct)}
          onClose={() => setActiveModalProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenSellerChat={(sid) => {
            setIsChatModalOpen(true);
          }}
        />
      )}

      {/* DIRECT CHAT MODAL */}
      {isChatModalOpen && (
        <SellerDirectChatModal
          sellerId={store.id}
          sellerShopName={store.shopName}
          sellerPhone={store.phone}
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}

    </div>
  );
};
