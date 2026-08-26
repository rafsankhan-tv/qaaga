import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Filter,
  Sparkles,
  Zap,
  Tag,
  BookOpen,
  FileText,
  RotateCcw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  TrendingUp,
  Store,
  Layers,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product, EBook, UsedProductListing, BlogPost } from '../types';

import { ShopProductCard } from '../components/shop/ShopProductCard';
import { ShopEbookCard } from '../components/shop/ShopEbookCard';
import { ShopUsedCard } from '../components/shop/ShopUsedCard';
import { ShopBlogCard } from '../components/shop/ShopBlogCard';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { EbookReaderModal } from '../components/shop/EbookReaderModal';
import { UsedProductDetailModal } from '../components/shop/UsedProductDetailModal';
import { PostUsedAdModal } from '../components/shop/PostUsedAdModal';
import { BlogArticleModal } from '../components/shop/BlogArticleModal';
import { ShopFlashDealsBanner } from '../components/shop/ShopFlashDealsBanner';

interface ProductsViewProps {
  onNavigate: (view: string, params?: any) => void;
  initialTab?: 'all' | 'products' | 'deals' | 'used' | 'ebooks' | 'blogs';
}

type TabType = 'all' | 'products' | 'deals' | 'used' | 'ebooks' | 'blogs';

export const ProductsView: React.FC<ProductsViewProps> = ({ onNavigate, initialTab = 'all' }) => {
  const { currentUser } = useAuth();

  // Active Store Tab
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [usedConditionFilter, setUsedConditionFilter] = useState<string>('ALL');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [selectedEbook, setSelectedEbook] = useState<EBook | null>(null);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);

  const [selectedUsedListing, setSelectedUsedListing] = useState<UsedProductListing | null>(null);
  const [isUsedModalOpen, setIsUsedModalOpen] = useState(false);

  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with store
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const products = marketplaceStore.getProducts();
  const ebooks = marketplaceStore.getEbooks();
  const usedProducts = marketplaceStore.getUsedProducts();
  const blogPosts = marketplaceStore.getBlogPosts();
  const cartCount = marketplaceStore.getCartCount();
  const cartSubtotal = marketplaceStore.getCartSubtotal();
  const cartItems = marketplaceStore.getCartItems();
  const wishlistCount = marketplaceStore.getWishlistCount();
  const userOrders = marketplaceStore.getUserOrders();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    marketplaceStore.addToCart(product, quantity);
    showToast(`"${product.title.slice(0, 25)}..." কার্টে যোগ হয়েছে!`);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    marketplaceStore.addToCart(product, quantity);
    setIsProductModalOpen(false);
    onNavigate('checkout', { instantProduct: product, instantQuantity: quantity });
  };

  const handleOpenSellerChat = (sellerId: string) => {
    onNavigate('support', { initialMessage: `[পণ্য অনুসন্ধান] বিক্রেতা আইডি: ${sellerId}` });
  };

  const handleOpenChatWithAdmin = (subject: string) => {
    onNavigate('support', { initialMessage: subject });
  };

  // Product categories
  const productCategories = [
    'ALL',
    'Smart Gadgets & Audio',
    'Computer & Accessories',
    'Tools & Hardware',
    'Electronics & Spares',
    'Home Automation'
  ];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortBy === 'price_low') return priceA - priceB;
    if (sortBy === 'price_high') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Deals (Discounted products)
  const flashDeals = products.filter((p) => p.discountPrice && p.discountPrice < p.price);

  // Filtering ebooks
  const filteredEbooks = ebooks.filter((e) => {
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtering used products
  const filteredUsedProducts = usedProducts.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = usedConditionFilter === 'ALL' || u.condition === usedConditionFilter;
    return matchesSearch && matchesCondition;
  });

  // Filtering blogs
  const filteredBlogs = blogPosts.filter((b) => {
    return (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* 1. Top Hero Full-Coverage Slider Banner */}
        <ShopFlashDealsBanner
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenPostUsedAd={() => setIsPostAdModalOpen(true)}
        />

        {/* 2. Deals & Shop Hub Search & Filter Box (Positioned directly under Slider) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Stats */}
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#4e20b8] to-purple-600 text-white shadow-md">
                  <ShoppingBag size={22} />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>ডিল ও শপ হাব</span>
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      অল-ইন-ওয়ান মার্কেট
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    অরিজিনাল প্রোডাক্ট, সেকেন্ড হ্যান্ড গ্যাজেট, ডিজিটাল ই-বুক এবং টেক গাইড এক ছাদের নিচে
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Wishlist, Track Order, Cart & Post Ad Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => onNavigate('wishlist')}
                className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-all cursor-pointer shadow-xs"
                title="আমার উইশলিস্ট"
              >
                <div className="relative">
                  <Heart size={16} className={wishlistCount > 0 ? 'fill-rose-600 text-rose-600' : ''} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">উইশলিস্ট</span>
              </button>

              {/* Live Order Tracker Button */}
              <button
                type="button"
                onClick={() => onNavigate('track_order')}
                className="py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4e20b8] font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-all cursor-pointer shadow-xs"
                title="অর্ডার ট্র্যাকিং"
              >
                <div className="relative">
                  <Truck size={16} />
                  {userOrders.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-[#ff6d00] text-white text-[9px] font-black flex items-center justify-center">
                      {userOrders.length}
                    </span>
                  )}
                </div>
                <span>ট্র্যাক অর্ডার</span>
              </button>

              {/* Free Used Ad Button */}
              <button
                type="button"
                onClick={() => setIsPostAdModalOpen(true)}
                className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">সেকেন্ড হ্যান্ড বিজ্ঞাপন</span>
                <span className="sm:hidden">বিজ্ঞাপন</span>
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => onNavigate('cart_checkout')}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#4e20b8] to-purple-800 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <div className="relative">
                  <ShoppingCart size={17} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#ff6d00] text-white text-[10px] font-black flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>কার্ট ({cartCount}) • ৳ {cartSubtotal.toLocaleString()}</span>
              </button>
            </div>

          </div>

          {/* Search & Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="প্রোডাক্ট, সেকেন্ড হ্যান্ড গ্যাজেট, ই-বুক বা গাইড খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] cursor-pointer"
              >
                <option value="featured">ফিচারড ফিল্টার</option>
                <option value="price_low">মূল্য: কম থেকে বেশি</option>
                <option value="price_high">মূল্য: বেশি থেকে কম</option>
                <option value="rating">সর্বোচ্চ রেটিং</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('all'); setSelectedCategory('ALL'); }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#4e20b8] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles size={15} />
            <span>সব কিছু ({products.length + ebooks.length + usedProducts.length + blogPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flame size={15} className={activeTab === 'deals' ? 'fill-white' : 'text-rose-600'} />
            <span>ফ্ল্যাশ ডিলস ({flashDeals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#4e20b8] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={15} />
            <span>নতুন পণ্য ও স্পেয়ার্স ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('used')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'used'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={15} />
            <span>সেকেন্ড হ্যান্ড মার্কেট ({usedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ebooks')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'ebooks'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen size={15} />
            <span>ডিজিটাল ই-বুক ({ebooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'blogs'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText size={15} />
            <span>ব্লগ ও টেক গাইড ({blogPosts.length})</span>
          </button>
        </div>

        {/* Sub Category Pills for Products */}
        {(activeTab === 'products' || activeTab === 'all') && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'সকল ক্যাটাগরি' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Used Condition Filter Pills */}
        {activeTab === 'used' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0">কন্ডিশন:</span>
            {['ALL', 'Brand New', 'Like New', 'Good', 'Fair'].map((cond) => (
              <button
                key={cond}
                onClick={() => setUsedConditionFilter(cond)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  usedConditionFilter === cond
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cond === 'ALL' ? 'সকল কন্ডিশন' : cond}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: ALL (Comprehensive Hub Overview) */}
        {/* ========================================================================= */}
        {activeTab === 'all' && (
          <div className="space-y-10">
            
            {/* Section 1: Flash Deals Highlights */}
            {flashDeals.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-100 text-rose-600">
                      <Flame size={18} />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        হট মেগা ডিসকাউন্ট ও ফ্ল্যাশ ডিলস
                      </h2>
                      <p className="text-xs text-slate-500">সীমিত সময়ের জন্য বিশেষ মূল্যে সেরা গ্যাজেট</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('deals')}
                    className="text-xs font-bold text-[#4e20b8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>সব ডিলস দেখুন</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {flashDeals.slice(0, 4).map((product) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                      isInCart={cartItems.some((ci) => ci.product.id === product.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Store Products */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-100 text-[#4e20b8]">
                    <ShoppingBag size={18} />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      নতুন পণ্য, হার্ডওয়্যার ও ইলেকট্রনিক্স
                    </h2>
                    <p className="text-xs text-slate-500">১০০% অথেনটিক কোয়ালিটি ও অফিসিয়াল ওয়ারেন্টি</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-[#4e20b8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>সব পণ্য দেখুন</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.slice(0, 8).map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                    isInCart={cartItems.some((ci) => ci.product.id === product.id)}
                  />
                ))}
              </div>
            </section>

            {/* Section 3: Second-Hand Market Highlights */}
            <section className="space-y-4 p-5 sm:p-6 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40 rounded-3xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-200 text-emerald-900 font-black">
                    <RotateCcw size={18} />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      ভেরিফাইড সেকেন্ড হ্যান্ড বাজার
                    </h2>
                    <p className="text-xs text-slate-500">এসক্রো ডায়াগনস্টিক সুরক্ষা ও ফ্রি লিস্টিং সুবিধা</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPostAdModalOpen(true)}
                    className="text-xs font-bold bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer hidden sm:inline-flex"
                  >
                    + ফ্রি বিজ্ঞাপন দিন
                  </button>
                  <button
                    onClick={() => setActiveTab('used')}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>সব সেকেন্ড হ্যান্ড দেখুন</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredUsedProducts.slice(0, 4).map((listing) => (
                  <ShopUsedCard
                    key={listing.id}
                    listing={listing}
                    onViewDetails={(l) => { setSelectedUsedListing(l); setIsUsedModalOpen(true); }}
                    onOpenChatWithAdmin={handleOpenChatWithAdmin}
                  />
                ))}
              </div>
            </section>

            {/* Section 4: eBooks & Digital Bookstore */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      ডিজিটাল ই-বুক ও প্র্যাকটিক্যাল ব্লুপ্রিন্ট
                    </h2>
                    <p className="text-xs text-slate-500">অনলাইন প্রিভিউ রিডার ও ইনস্ট্যান্ট পিডিএফ এক্সেস</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('ebooks')}
                  className="text-xs font-bold text-[#4e20b8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>সব ই-বুক দেখুন</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredEbooks.slice(0, 4).map((ebook) => (
                  <ShopEbookCard
                    key={ebook.id}
                    ebook={ebook}
                    onOpenReader={(eb) => { setSelectedEbook(eb); setIsEbookModalOpen(true); }}
                    hasPurchased={marketplaceStore.getEbookPurchases().some((p) => p.ebookId === ebook.id)}
                  />
                ))}
              </div>
            </section>

            {/* Section 5: Blog & DIY Guides */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                    <FileText size={18} />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      ব্লগ, বায়িং গাইড ও টেক টিপস
                    </h2>
                    <p className="text-xs text-slate-500">এক্সপার্ট ইঞ্জিনিয়ারদের পরামর্শ ও হার্ডওয়্যার টেস্ট চেকলিস্ট</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('blogs')}
                  className="text-xs font-bold text-[#4e20b8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>সব ব্লগ পড়ুন</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredBlogs.slice(0, 4).map((post) => (
                  <ShopBlogCard
                    key={post.id}
                    post={post}
                    onReadPost={(p) => { setSelectedBlogPost(p); setIsBlogModalOpen(true); }}
                  />
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: FLASH DEALS */}
        {/* ========================================================================= */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-rose-600" />
                <span className="text-xs font-bold text-rose-950">
                  ফ্ল্যাশ সেল ডিলস: স্টক শেষ হওয়ার আগেই সংগ্রহ করুন বিশেষ ছাড়ে।
                </span>
              </div>
              <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-lg">
                {flashDeals.length} টি ডিল সক্রিয়
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {flashDeals.map((product) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onBuyNow={(p) => handleBuyNow(p, 1)}
                  isInCart={cartItems.some((ci) => ci.product.id === product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: PRODUCTS */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <ShoppingBag size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">আপনার সার্চ বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                    isInCart={cartItems.some((ci) => ci.product.id === product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: USED / SECOND-HAND MARKET */}
        {/* ========================================================================= */}
        {activeTab === 'used' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  নিরাপদ সেকেন্ড হ্যান্ড মার্কেট: টেকনিক্যাল রিপোর্ট ও এসক্রো সুরক্ষায় লেনদেন করুন।
                </span>
              </div>
              <button
                onClick={() => setIsPostAdModalOpen(true)}
                className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>ফ্রি সেকেন্ড হ্যান্ড বিজ্ঞাপন দিন</span>
              </button>
            </div>

            {filteredUsedProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <RotateCcw size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">কোনো সেকেন্ড হ্যান্ড লিস্টিং পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">অন্য কোনো ফিল্টার বা অনুসন্ধান ট্রাই করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredUsedProducts.map((listing) => (
                  <ShopUsedCard
                    key={listing.id}
                    listing={listing}
                    onViewDetails={(l) => { setSelectedUsedListing(l); setIsUsedModalOpen(true); }}
                    onOpenChatWithAdmin={handleOpenChatWithAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: EBOOKS */}
        {/* ========================================================================= */}
        {activeTab === 'ebooks' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-700" />
                <span className="text-xs font-bold text-indigo-950">
                  ডিজিটাল ই-বুক লাইব্রেরি: প্রিভিউ পড়ুন এবং লাইফটাইম এক্সেস সহ ডাউনলোড করুন।
                </span>
              </div>
            </div>

            {filteredEbooks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <BookOpen size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">কোনো ই-বুক পাওয়া যায়নি</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredEbooks.map((ebook) => (
                  <ShopEbookCard
                    key={ebook.id}
                    ebook={ebook}
                    onOpenReader={(eb) => { setSelectedEbook(eb); setIsEbookModalOpen(true); }}
                    hasPurchased={marketplaceStore.getEbookPurchases().some((p) => p.ebookId === ebook.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW TAB: BLOGS */}
        {/* ========================================================================= */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-700" />
                <span className="text-xs font-bold text-blue-950">
                  টেক ও রিপেয়ার গাইডলাইন: ডিভাইস দীর্ঘস্থায়ী করার প্র্যাকটিক্যাল টিপস ও বিশ্লেষণ।
                </span>
              </div>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <FileText size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">কোনো ব্লগ পাওয়া যায়নি</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredBlogs.map((post) => (
                  <ShopBlogCard
                    key={post.id}
                    post={post}
                    onReadPost={(p) => { setSelectedBlogPost(p); setIsBlogModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trust & Guarantee Footer Banner */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-100 text-[#4e20b8] shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">১০০% অথেনটিক গ্যারান্টি</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">সব প্রোডাক্ট অরিজিনাল ও ভেরিফাইড ব্র্যান্ড সাপ্লায়ার থেকে সংরক্ষিত।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">দ্রুত ও নিরাপদ ডেলিভারি</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">ঢাকায় ২৪-৪৮ ঘণ্টায় এবং সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">এসক্রো ডায়াগনস্টিক সুরক্ষা</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">সেকেন্ড হ্যান্ড কেনাবেচায় প্ল্যাটফর্ম ভেরিফিকেশন ও সেফটি ট্রাস্ট।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800 shrink-0">
                <BookOpen size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">ইনস্ট্যান্ট ডিজিটাল ডেলিভারি</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">ই-বুক ও গাইড কেনার সাথে সাথে ফুল পিডিএফ ডাউনলোড এক্সেস।</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ALL INTERACTIVE MODALS */}
      {/* ========================================================================= */}

      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setSelectedProduct(null); }}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onBuyNow={(p, q) => handleBuyNow(p, q)}
        onOpenSellerChat={handleOpenSellerChat}
      />

      {/* 2. eBook Reader Modal */}
      <EbookReaderModal
        ebook={selectedEbook}
        isOpen={isEbookModalOpen}
        onClose={() => { setIsEbookModalOpen(false); setSelectedEbook(null); }}
        onPurchaseSuccess={() => showToast('ই-বুকটি সফলভাবে আনলক হয়েছে!')}
      />

      {/* 3. Used Product Detail Modal */}
      <UsedProductDetailModal
        listing={selectedUsedListing}
        isOpen={isUsedModalOpen}
        onClose={() => { setIsUsedModalOpen(false); setSelectedUsedListing(null); }}
        onOpenChatWithAdmin={handleOpenChatWithAdmin}
      />

      {/* 4. Post Free Used Ad Modal */}
      <PostUsedAdModal
        isOpen={isPostAdModalOpen}
        onClose={() => setIsPostAdModalOpen(false)}
        onSuccess={() => {
          showToast('আপনার সেকেন্ড হ্যান্ড বিজ্ঞাপনটি সফলভাবে পোস্ট হয়েছে!');
          setActiveTab('used');
        }}
      />

      {/* 5. Blog Article Modal */}
      <BlogArticleModal
        post={selectedBlogPost}
        isOpen={isBlogModalOpen}
        onClose={() => { setIsBlogModalOpen(false); setSelectedBlogPost(null); }}
        onNavigateToCategory={(catKey) => {
          setIsBlogModalOpen(false);
          onNavigate('services', { category: catKey });
        }}
      />

    </div>
  );
};
