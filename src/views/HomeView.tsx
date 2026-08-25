import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  Headphones,
  Calendar,
  Lock,
  ArrowRight,
  Stethoscope,
  Building2,
  Wrench,
  Home,
  ShoppingBag,
  Briefcase,
  Globe,
  Video,
  HeartPulse,
  Users,
  Wind,
  Tv,
  ThermometerSnowflake,
  Zap,
  Droplets,
  Sparkles,
  BookOpen,
  Repeat,
  FileText,
  UserPlus,
  Grid,
  PhoneCall,
  Filter,
  Layers,
  Heart,
  MessageSquare,
  Newspaper
} from 'lucide-react';
import { marketplaceStore } from '../services/marketplaceStore';
import { useLocation } from '../context/LocationContext';
import { RenderCategoryIcon } from '../components/CategoryIconHelper';
import { CuteCatRunner } from '../components/CuteCatRunner';
import { ShowcaseItemProfileModal } from '../components/ShowcaseItemProfileModal';
import { CategoryShowcaseSection, ShowcaseCardItem } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenSearch }) => {
  const { formattedLocation, setIsLocationModalOpen } = useLocation();
  const [heroSearchText, setHeroSearchText] = useState('');
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  // Hero Banners Auto-Slider State
  const [heroBanners, setHeroBanners] = useState(() => marketplaceStore.getActiveHeroBanners());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Category Showcases State
  const [categoryShowcases, setCategoryShowcases] = useState<CategoryShowcaseSection[]>(() =>
    marketplaceStore.getCategoryShowcases()
  );
  const [activeTagGroup, setActiveTagGroup] = useState<string>('ALL');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Complete Profile & Booking Modal State
  const [selectedShowcaseItem, setSelectedShowcaseItem] = useState<ShowcaseCardItem | null>(null);
  const [selectedShowcaseSection, setSelectedShowcaseSection] = useState<CategoryShowcaseSection | null>(null);

  useEffect(() => {
    const updateStoreData = () => {
      const active = marketplaceStore.getActiveHeroBanners();
      setHeroBanners(active);
      setActiveSlideIndex((prev) => (prev >= active.length ? 0 : prev));
      setCategoryShowcases(marketplaceStore.getCategoryShowcases());
    };
    const unsub = marketplaceStore.subscribe(updateStoreData);
    return unsub;
  }, []);

  // Auto slide interval
  useEffect(() => {
    if (heroBanners.length <= 1 || isSlidePaused) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroBanners.length, isSlidePaused]);

  const currentSlide = heroBanners[activeSlideIndex] || heroBanners[0];

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev + 1) % (heroBanners.length || 1));
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev - 1 + heroBanners.length) % (heroBanners.length || 1));
  };

  const handleCategorySelect = (categoryKey: string, fallbackView: string) => {
    const targetIndex = heroBanners.findIndex((b) => b.categoryKey === categoryKey);
    if (targetIndex !== -1) {
      if (activeSlideIndex === targetIndex) {
        onNavigate(heroBanners[targetIndex].targetView || fallbackView);
      } else {
        setActiveSlideIndex(targetIndex);
      }
    } else {
      onNavigate(fallbackView);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchText.trim()) {
      onNavigate('service_request', { searchQuery: heroSearchText.trim() });
    } else {
      onOpenSearch();
    }
  };

  // Filtered showcases based on group and search query
  const filteredShowcases = categoryShowcases.filter((sec) => {
    if (!sec.isActive) return false;
    if (activeTagGroup !== 'ALL' && sec.tagGroup !== activeTagGroup) return false;
    if (categorySearchQuery.trim()) {
      const q = categorySearchQuery.toLowerCase();
      const matchTitleBangla = sec.titleBangla.toLowerCase().includes(q);
      const matchTitleEng = sec.titleEnglish.toLowerCase().includes(q);
      const matchSubtitle = (sec.subtitleBangla || '').toLowerCase().includes(q);
      const matchItems = sec.items.some(
        (it) => it.title.toLowerCase().includes(q) || it.subtitle.toLowerCase().includes(q)
      );
      return matchTitleBangla || matchTitleEng || matchSubtitle || matchItems;
    }
    return true;
  });

  const tagGroupTabs = [
    { id: 'ALL', label: 'সকল সার্ভিস (All 20+)', icon: Layers },
    { id: 'TECH', label: 'টেক ও ডিজিটাল', icon: Globe },
    { id: 'HEALTH', label: 'স্বাস্থ্য ও চিকিৎসা', icon: Stethoscope },
    { id: 'TRAVEL', label: 'হোটেল ও ট্রাভেল', icon: Building2 },
    { id: 'HOME_SERVICE', label: 'হোম সার্ভিস ও রিপেয়ার', icon: Wrench },
    { id: 'COMMERCE', label: 'কেনাকাটা ও পণ্য', icon: ShoppingBag },
    { id: 'CAREER', label: 'চাকরি ও ক্যারিয়ার', icon: Briefcase }
  ];

  // 4 Featured Categories Data (matching the 4 columns in the photo)
  const popularDoctors = [
    {
      id: 'doc-tanvir',
      name: 'ড. তানভীর হাসান',
      specialty: 'মেডিসিন বিশেষজ্ঞ',
      rating: '4.8',
      reviews: '320',
      fee: '৭০০',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'doc-samia',
      name: 'ড. সামিয়া আফরিন',
      specialty: 'চর্ম ও যৌন রোগ বিশেষজ্ঞ',
      rating: '4.7',
      reviews: '280',
      fee: '৬০০',
      photo: 'https://images.unsplash.com/photo-1594824813576-92850f96ee75?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'doc-ariful',
      name: 'ড. আরিফুল ইসলাম',
      specialty: 'হৃদরোগ বিশেষজ্ঞ',
      rating: '4.9',
      reviews: '410',
      fee: '৮০০',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&h=150&q=80'
    }
  ];

  const bestHotels = [
    {
      id: 'hotel-city-inn',
      name: 'হোটেল সিটি ইন',
      location: 'গুলশান, ঢাকা',
      rating: '4.5',
      price: '৩,২০০',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&h=160&q=80'
    },
    {
      id: 'hotel-royal-palace',
      name: 'হোটেল রয়্যাল প্যালেস',
      location: 'বনানী, ঢাকা',
      rating: '4.6',
      price: '৪,৫০০',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&h=160&q=80'
    },
    {
      id: 'hotel-world-downtown',
      name: 'হোটেল ওয়ার্ল্ড ডাউনটাউন',
      location: 'মিরপুর, ঢাকা',
      rating: '4.3',
      price: '২,৮০০',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&h=160&q=80'
    }
  ];

  const popularProducts = [
    {
      id: 'prod-samsung-a54',
      title: 'Samsung Galaxy A54',
      price: '২৭,৯৯৯',
      rating: '4.6',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=160&h=160&q=80'
    },
    {
      id: 'prod-cadbury-chocolate',
      title: 'ক্যাডবেরি ডেইরি মিল্ক চকলেট ২০০ গ্রাম',
      price: '২৮০',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=160&h=160&q=80'
    },
    {
      id: 'prod-boat-airdopes',
      title: 'boAt Airdopes 161 ব্লুটুথ ইয়ারবাডস',
      price: '১,৪৯০',
      rating: '4.5',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=160&h=160&q=80'
    }
  ];

  const recentJobs = [
    {
      id: 'job-uiux-softx',
      title: 'UI/UX Designer',
      company: 'SoftX Solutions',
      location: 'ঢাকা',
      salary: '৫০,০০০ - ৮০,০০০'
    },
    {
      id: 'job-digital-marketing',
      title: 'Digital Marketing Executive',
      company: 'MarketWay BD',
      location: 'ঢাকা',
      salary: '২৫,০০০ - ৪০,০০০'
    },
    {
      id: 'job-customer-support',
      title: 'Customer Support Officer',
      company: 'QAAGA Support',
      location: 'ঢাকা',
      salary: '২০,০০০ - ৩০,০০০'
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4">

      {/* 1. HERO BANNER SECTION (Matched with photo layout) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-orange-50/50 border border-purple-100/80 p-6 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Search Bar */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 leading-[1.2] tracking-tight">
                আপনার সব প্রয়োজন <br />
                <span className="text-[#4e20b8]">এক প্ল্যাটফর্মে</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mt-3 max-w-xl">
                সার্ভিস, পণ্য, হোটেল, ডাক্তার, জব—সবকিছু এখন এক জায়গায়। সহজে খুঁজুন, তুলনা করুন এবং আপনার মতো করে বেছে নিন।
              </p>
            </div>

            {/* Dual Search Box Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
            >
              {/* Location Select Input */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex flex-col items-start px-3.5 py-1.5 rounded-xl hover:bg-slate-50 text-left border-b sm:border-b-0 sm:border-r border-slate-100 min-w-[140px] cursor-pointer"
              >
                <span className="text-[10px] font-semibold text-slate-400">লোকেশন</span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <MapPin size={12} className="text-[#4e20b8]" />
                  <span className="truncate">ঢাকা, বাংলাদেশ</span>
                  <ChevronDown size={11} className="text-slate-400 ml-0.5" />
                </span>
              </button>

              {/* Service / Product Query Input */}
              <div className="flex-1 flex flex-col px-3 py-1">
                <label className="text-[10px] font-semibold text-slate-400">আপনি কী খুঁজছেন?</label>
                <input
                  type="text"
                  value={heroSearchText}
                  onChange={(e) => setHeroSearchText(e.target.value)}
                  placeholder="সার্ভিস, পণ্য বা কীওয়ার্ড"
                  className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="bg-[#ff6d00] hover:bg-[#ea6000] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Search size={15} />
                <span>খুঁজুন</span>
              </button>
            </form>

            {/* 3 Trust Checkpoints */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#4e20b8] fill-purple-50 shrink-0" />
                <span>সহজে বুকিং</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#4e20b8] fill-purple-50 shrink-0" />
                <span>নিরাপদ পেমেন্ট</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#ff6d00] fill-orange-50 shrink-0" />
                <span>বিশ্বস্ত সার্ভিস</span>
              </div>
            </div>
          </div>

          {/* Right Column: Auto-Sliding Category Banner + Synchronized Category Badges */}
          <div
            className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] lg:min-h-[420px] select-none w-full max-w-full"
            onMouseEnter={() => setIsSlidePaused(true)}
            onMouseLeave={() => setIsSlidePaused(false)}
          >
            {/* Ambient Background Glow matching the active slide theme */}
            <div
              className="absolute inset-2 sm:inset-4 rounded-3xl blur-3xl opacity-30 transition-all duration-700 pointer-events-none"
              style={{ backgroundColor: currentSlide?.themeColor || '#4e20b8' }}
            />

            {/* Center Interactive Auto-Sliding Banner Card */}
            <div
              onClick={() => onNavigate(currentSlide?.targetView || 'service_request')}
              className="relative z-10 w-full max-w-[280px] sm:max-w-none sm:w-64 lg:w-72 h-76 sm:h-84 lg:h-92 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/90 bg-slate-900 cursor-pointer group transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Slide Image with smooth transition */}
              <img
                key={currentSlide?.id || 'banner-default'}
                src={currentSlide?.imageUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=750&q=80'}
                alt={currentSlide?.titleBangla || 'QAAGA Verified Service'}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Top Header Tag: Slide Counter & Pause/Play Indicator */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{activeSlideIndex + 1} / {heroBanners.length}</span>
                </span>

                <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {currentSlide?.badgeBangla || 'ভেরিফাইড'}
                </span>
              </div>

              {/* Navigation Arrows on Slide */}
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer hover:scale-110"
                title="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer hover:scale-110"
                title="Next Slide"
              >
                <ChevronRight size={16} />
              </button>

              {/* Bottom Gradient Overlay & Detailed Information */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-transparent pt-12 pb-4 px-4 text-white z-20">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug line-clamp-1 drop-shadow-xs">
                      {currentSlide?.titleBangla}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-tight line-clamp-1">
                    {currentSlide?.subtitleBangla}
                  </p>

                  {currentSlide?.ratingText && (
                    <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 pt-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{currentSlide.ratingText}</span>
                    </div>
                  )}

                  {/* Call to action pill */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1 transition-all border border-white/25">
                      <span>সরাসরি দেখুন</span>
                      <ArrowRight size={12} />
                    </span>

                    {/* Progress Bar Indicators */}
                    <div className="flex items-center gap-1">
                      {heroBanners.map((b, idx) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === activeSlideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          title={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop / Tablet Floating Surrounding Category Badges (3 Left, 3 Right) */}
            <div className="hidden sm:flex absolute inset-0 pointer-events-none flex-col justify-between p-1 sm:p-2 z-30">
              
              {/* Top Row: Doctor (Left) & Home Service (Right) */}
              <div className="flex justify-between items-start">
                {/* 1. Doctor Booking */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('doctor', 'doctors')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -ml-2 lg:-ml-6 mt-1 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'doctor'
                      ? 'bg-emerald-600 text-white shadow-xl ring-4 ring-emerald-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'doctor' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Stethoscope size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>ডাক্তার বুকিং</span>
                      {currentSlide?.categoryKey === 'doctor' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>

                {/* 2. Home Service */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('home_service', 'service_request')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -mr-2 lg:-mr-6 mt-1 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'home_service'
                      ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'home_service' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Home size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>হোম সার্ভিস</span>
                      {currentSlide?.categoryKey === 'home_service' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Middle Row: Hotel (Left) & Products (Right) */}
              <div className="flex justify-between items-center my-auto">
                {/* 3. Hotel Booking */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('hotel', 'hotels')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -ml-3 lg:-ml-7 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'hotel'
                      ? 'bg-indigo-600 text-white shadow-xl ring-4 ring-indigo-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'hotel' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Building2 size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>হোটেল বুকিং</span>
                      {currentSlide?.categoryKey === 'hotel' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>

                {/* 4. Product Shopping */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('products', 'products')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -mr-3 lg:-mr-7 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'products'
                      ? 'bg-[#ff6d00] text-white shadow-xl ring-4 ring-orange-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'products' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <ShoppingBag size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>প্রোডাক্ট কেনাকাটা</span>
                      {currentSlide?.categoryKey === 'products' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Bottom Row: Repair Service (Left) & Jobs (Right) */}
              <div className="flex justify-between items-end">
                {/* 5. Repair Service */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('repair', 'service_request')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -ml-2 lg:-ml-6 mb-1 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'repair' || currentSlide?.categoryKey === 'technician'
                      ? 'bg-sky-600 text-white shadow-xl ring-4 ring-sky-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'repair' || currentSlide?.categoryKey === 'technician'
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-50 text-cyan-600'
                  }`}>
                    <Wrench size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>রিপেয়ার সার্ভিস</span>
                      {(currentSlide?.categoryKey === 'repair' || currentSlide?.categoryKey === 'technician') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>

                {/* 6. Jobs & Career */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('jobs', 'jobs')}
                  className={`pointer-events-auto transition-all duration-300 cursor-pointer -mr-2 lg:-mr-6 mb-1 px-3 py-2 rounded-2xl flex items-center gap-2 ${
                    currentSlide?.categoryKey === 'jobs'
                      ? 'bg-purple-600 text-white shadow-xl ring-4 ring-purple-300/80 scale-110 -translate-y-1 font-bold z-40'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 shadow-md border border-slate-100/90 hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    currentSlide?.categoryKey === 'jobs' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <Briefcase size={15} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight flex items-center gap-1 font-bold">
                      <span>জবস ও ক্যারিয়ার</span>
                      {currentSlide?.categoryKey === 'jobs' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-200 animate-ping" />
                      )}
                    </div>
                  </div>
                </button>
              </div>

            </div>

            {/* Mobile-Only Interactive Category Badge Grid (100% visible, fully readable, tap-friendly) */}
            <div className="sm:hidden grid grid-cols-2 gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={() => handleCategorySelect('doctor', 'doctors')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'doctor'
                    ? 'bg-emerald-600 text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <Stethoscope size={15} className={currentSlide?.categoryKey === 'doctor' ? 'text-white' : 'text-emerald-600'} />
                <span className="text-xs font-bold">ডাক্তার বুকিং</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('home_service', 'service_request')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'home_service'
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <Home size={15} className={currentSlide?.categoryKey === 'home_service' ? 'text-white' : 'text-blue-600'} />
                <span className="text-xs font-bold">হোম সার্ভিস</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('hotel', 'hotels')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'hotel'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <Building2 size={15} className={currentSlide?.categoryKey === 'hotel' ? 'text-white' : 'text-indigo-600'} />
                <span className="text-xs font-bold">হোটেল বুকিং</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('products', 'products')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'products'
                    ? 'bg-[#ff6d00] text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <ShoppingBag size={15} className={currentSlide?.categoryKey === 'products' ? 'text-white' : 'text-amber-600'} />
                <span className="text-xs font-bold">প্রোডাক্ট শপিং</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('repair', 'service_request')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'repair' || currentSlide?.categoryKey === 'technician'
                    ? 'bg-sky-600 text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <Wrench size={15} className={currentSlide?.categoryKey === 'repair' || currentSlide?.categoryKey === 'technician' ? 'text-white' : 'text-cyan-600'} />
                <span className="text-xs font-bold">রিপেয়ার সার্ভিস</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySelect('jobs', 'jobs')}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-left transition-all ${
                  currentSlide?.categoryKey === 'jobs'
                    ? 'bg-purple-600 text-white shadow-md font-bold'
                    : 'bg-white text-slate-800 border border-slate-200/80'
                }`}
              >
                <Briefcase size={15} className={currentSlide?.categoryKey === 'jobs' ? 'text-white' : 'text-purple-600'} />
                <span className="text-xs font-bold">জবস ও ক্যারিয়ার</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 2. LIVE COMMUNITY FEED & CREATOR UPDATES HIGHLIGHT SECTION (ABOVE MIO MIO CAT) */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold shrink-0">
              <Newspaper size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  কমিউনিটি লাইভ ফিড ও ফলোয়ার আপডেট 📢
                </h2>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার ফলো করা ডাক্তার, টেকনিশিয়ান ও হোটেলগুলোর সাম্প্রতিক নোটিস ও স্পেশাল ডিসকাউন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('feed', { tab: 'following' })}
              className="bg-purple-50 text-[#4e20b8] hover:bg-purple-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ফলোয়িং ফিড
            </button>
            <button
              onClick={() => onNavigate('feed', { tab: 'all' })}
              className="bg-[#4e20b8] hover:bg-[#41189e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>সম্পূর্ণ ফিড দেখুন</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Quick Highlight Cards from Feed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketplaceStore.getFeedPosts('all').slice(0, 3).map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate('feed')}
              className="group bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-200"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#4e20b8]">
                      {post.authorName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {post.authorDistrict || 'বাংলাদেশ'} • {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>

                {/* Content preview */}
                {post.title && (
                  <h5 className="text-xs font-bold text-slate-800 mb-1 line-clamp-1">{post.title}</h5>
                )}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>

                {/* Image thumbnail if present */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-2.5 h-24 rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={post.images[0]}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <Heart size={12} className="fill-rose-500" /> {post.likesCount} লাইক
                </span>
                <span className="text-[#4e20b8] font-bold group-hover:underline flex items-center gap-0.5">
                  বিস্তারিত <ChevronRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CUTE RUNNING CAT ASSISTANT WITH REAL-TIME SPEECH BUBBLE & SCROLL DOCK */}
      <CuteCatRunner onNavigate={onNavigate} />

      {/* 4. ALL CATEGORIES & SERVICE SHOWCASE ENGINE (সব ক্যাটাগরি শোকেস) */}
      <section className="space-y-4">
        
        {/* Header, Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4e20b8]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  সকল সার্ভিস ও ক্যাটাগরি শোকেস
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#4e20b8]">
                  {filteredShowcases.length} টি ক্যাটাগরি
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ডাক্তার, হোটেল, টেকনিশিয়ান, কেনাকাটা ও জবস — সব সেবা কার্ড স্টাইলে সাজানো
              </p>
            </div>

            {/* Quick Search inside Categories */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="যেকোনো সেবা বা ক্যাটাগরি খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4e20b8] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
            {tagGroupTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTagGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTagGroup(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#4e20b8] text-white shadow-xs scale-102'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <Icon size={13} className={isSelected ? 'text-white' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Showcase Grid (4 columns on lg/xl, 2 on md, 1 on sm) */}
        {filteredShowcases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
            <Search size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">কোনো ক্যাটাগরি বা সেবা পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">
              "{categorySearchQuery}" দিয়ে কোনো রেজাল্ট মেলেনি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setCategorySearchQuery('');
                setActiveTagGroup('ALL');
              }}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] font-bold text-xs rounded-xl border border-purple-200 transition-colors cursor-pointer"
            >
              সব ক্যাটাগরি দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredShowcases.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between hover:border-purple-300/80 hover:shadow-md transition-all duration-200 group/card"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-3.5 pb-2.5 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${section.themeColor}15`, color: section.themeColor }}
                      >
                        <RenderCategoryIcon iconName={section.iconName} size={15} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate group-hover/card:text-[#4e20b8] transition-colors">
                          {section.titleBangla}
                        </h3>
                        <span className="text-[10px] text-slate-400 block truncate leading-tight font-medium">
                          {section.titleEnglish}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(section.viewAllTargetView, section.viewAllTargetParams)}
                      className="text-xs font-bold text-[#4e20b8] hover:text-[#ff6d00] flex items-center gap-0.5 cursor-pointer transition-colors shrink-0 ml-1"
                    >
                      <span className="text-[11px]">সব দেখুন</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Category-Specific Photo Banner */}
                  {section.bannerImage && (
                    <div className="relative aspect-21/9 overflow-hidden bg-slate-900 group/banner cursor-pointer"
                         onClick={() => onNavigate(section.viewAllTargetView, section.viewAllTargetParams)}>
                      <img
                        src={section.bannerImage}
                        alt={section.titleBangla}
                        className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-500 opacity-90"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&h=250&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-2.5">
                        {section.bannerTagline && (
                          <span className="self-start text-[9px] font-black px-2 py-0.5 rounded-full bg-[#ff6d00] text-white shadow-md">
                            {section.bannerTagline}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-white leading-tight truncate mt-0.5 drop-shadow-sm">
                          {section.subtitleBangla || section.titleBangla}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Showcase Products & Services List Below the Banner */}
                  <div className="p-3 space-y-2.5">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedShowcaseItem(item);
                          setSelectedShowcaseSection(section);
                        }}
                        className="group/item flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 hover:bg-purple-50/50 transition-all border border-slate-100 hover:border-purple-200/80 cursor-pointer"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-13 h-13 rounded-lg object-cover ring-1 ring-slate-200 shrink-0 bg-slate-100 group-hover/item:scale-103 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                          {item.badge && (
                            <span className="absolute -top-1.5 -left-1 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-white/40 shadow-2xs">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover/item:text-[#4e20b8] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 leading-snug">
                            {item.subtitle}
                          </p>

                          {/* Rating & Review */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                            <span className="font-bold">{item.rating || '4.8'}</span>
                            {item.reviewCount && (
                              <span className="text-slate-400">({item.reviewCount})</span>
                            )}
                          </div>

                          {/* Price & View Profile / Open Button */}
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                            <span className="text-xs font-black text-slate-900">
                              ৳ {item.priceOrSalary}{' '}
                              {item.unitText && (
                                <span className="text-[9px] font-normal text-slate-500">
                                  {item.unitText}
                                </span>
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShowcaseItem(item);
                                setSelectedShowcaseSection(section);
                              }}
                              className="bg-[#4e20b8] hover:bg-[#3d1796] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center gap-1"
                            >
                              <span>{(!item.ctaText || item.ctaText === 'ওপেন করুন') ? 'বিস্তারিত দেখুন' : item.ctaText}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Full-Width Category Action Button */}
                <div className="p-3 pt-0">
                  <button
                    onClick={() => onNavigate(section.viewAllTargetView, section.viewAllTargetParams)}
                    className="w-full py-1.5 bg-purple-50/80 hover:bg-purple-100 text-[#4e20b8] rounded-lg text-xs font-bold transition-colors text-center cursor-pointer border border-purple-200/60 flex items-center justify-center gap-1"
                  >
                    <span>{section.viewAllButtonTextBangla || 'সব দেখুন'}</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. TRUST & FEATURE HIGHLIGHT BAR (5 FEATURES AS IN PHOTO FOOTER) */}
      <section className="bg-purple-50/60 border border-purple-100/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* 1. Verified Providers */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4e20b8] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">যাচাইকৃত প্রোভাইডার</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">সব প্রোভাইডার যাচাই করে যুক্ত করা হয়</p>
            </div>
          </div>

          {/* 2. Safe Payment */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#ff6d00] flex items-center justify-center shrink-0">
              <Lock size={19} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">নিরাপদ পেমেন্ট</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">১০০% নিরাপদ লেনদেন নিশ্চয়তা</p>
            </div>
          </div>

          {/* 3. 24/7 Support */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4e20b8] flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">২৪/৭ সাপোর্ট</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">যেকোনো সময় সবসময় আমাদের সাথে</p>
            </div>
          </div>

          {/* 4. Easy Booking */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4e20b8] flex items-center justify-center shrink-0">
              <Calendar size={19} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">সহজ বুকিং</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">দ্রুত ও সহজে বুকিং নিশ্চিত করুন</p>
            </div>
          </div>

          {/* 5. Trusted Reviews */}
          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#ff6d00] flex items-center justify-center shrink-0">
              <Star size={19} className="fill-[#ff6d00] text-[#ff6d00]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">বিশ্বস্ত রিভিউ</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">রিয়েল ইউজার রিভিউ দেখে বেছে নিন</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. COMPLETE PROFILE & INTERACTIVE ORDER MODAL */}
      <ShowcaseItemProfileModal
        item={selectedShowcaseItem}
        section={selectedShowcaseSection}
        isOpen={Boolean(selectedShowcaseItem)}
        onClose={() => {
          setSelectedShowcaseItem(null);
          setSelectedShowcaseSection(null);
        }}
        onNavigate={onNavigate}
      />

    </div>
  );
};
