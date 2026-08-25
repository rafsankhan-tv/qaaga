import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Stethoscope,
  Wrench,
  Building2,
  Briefcase,
  ExternalLink,
  Pause,
  Play,
  Settings,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Heart
} from 'lucide-react';
import { FeedBannerSlide } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface FeedBannerSliderProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenCreatePost: () => void;
  onFilterCategory?: (categoryKey: string) => void;
}

export const FeedBannerSlider: React.FC<FeedBannerSliderProps> = ({
  onNavigate,
  onOpenCreatePost,
  onFilterCategory
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.activeRole === 'SUPER_ADMIN' || currentUser?.activeRole === 'ADMIN';

  const [slides, setSlides] = useState<FeedBannerSlide[]>(() =>
    marketplaceStore.getFeedSlides(true)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const SLIDE_DURATION_MS = 5000;
  const PROGRESS_TICK_MS = 50;

  // Subscribe to store updates
  useEffect(() => {
    const updateSlides = () => {
      const activeSlides = marketplaceStore.getFeedSlides(true);
      setSlides(activeSlides);
      if (currentIndex >= activeSlides.length && activeSlides.length > 0) {
        setCurrentIndex(0);
      }
    };
    const unsubscribe = marketplaceStore.subscribe(updateSlides);
    return () => unsubscribe();
  }, [currentIndex]);

  // Handle slide rotation timer & progress bar
  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(pct);
    }, PROGRESS_TICK_MS);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, slides.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleCtaClick = (slide: FeedBannerSlide) => {
    if (slide.targetView === 'create_post') {
      onOpenCreatePost();
    } else if (slide.targetView.startsWith('feed_')) {
      const catKey = slide.targetView.replace('feed_', '');
      if (onFilterCategory) {
        if (catKey === 'explore' || catKey === 'all') onFilterCategory('all');
        else if (catKey === 'health') onFilterCategory('doctor');
        else if (catKey === 'repair') onFilterCategory('repair');
        else if (catKey === 'hotel') onFilterCategory('hotel');
        else if (catKey === 'jobs') onFilterCategory('jobs');
        else onFilterCategory(catKey);
      }
    } else {
      onNavigate(slide.targetView, slide.targetParams);
    }
  };

  const handleSecondaryCtaClick = (slide: FeedBannerSlide) => {
    if (!slide.secondaryTargetView) return;
    if (slide.secondaryTargetView === 'create_post') {
      onOpenCreatePost();
    } else if (slide.secondaryTargetView.startsWith('feed_')) {
      const catKey = slide.secondaryTargetView.replace('feed_', '');
      if (onFilterCategory) {
        if (catKey === 'explore' || catKey === 'all') onFilterCategory('all');
        else if (catKey === 'health') onFilterCategory('doctor');
        else if (catKey === 'repair') onFilterCategory('repair');
        else if (catKey === 'hotel') onFilterCategory('hotel');
        else if (catKey === 'jobs') onFilterCategory('jobs');
        else onFilterCategory(catKey);
      }
    } else {
      onNavigate(slide.secondaryTargetView, slide.secondaryTargetParams);
    }
  };

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      id="feed-banner-slider"
      className="relative rounded-3xl overflow-hidden shadow-xl mb-6 border border-slate-700/30 transition-all group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Container with Full Bleed Photo & Left Frosted-Glass to Right Clear Gradient */}
      <div
        className={`relative min-h-[270px] sm:min-h-[290px] lg:min-h-[310px] p-5 sm:p-8 lg:p-10 text-white flex flex-col justify-between overflow-hidden bg-slate-950`}
      >
        {/* Full Image in Background (Clear on Right) */}
        {currentSlide.imageUrl ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.titleBangla}
              className="w-full h-full object-cover object-center lg:object-right transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Left Frosted Glass Blur & Gradient Overlay -> Right Clear Transition */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                currentSlide.bgGradient
                  ? currentSlide.bgGradient
                  : 'from-[#1e1b4b] via-[#311042]/90 to-transparent'
              } opacity-95 via-75% lg:via-55% lg:to-transparent pointer-events-none`}
            />
            {/* Frosted Glass Backdrop Blur Mask from Left */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 backdrop-blur-md [mask-image:linear-gradient(to_right,black_60%,transparent_100%)] pointer-events-none" />
            
            {/* Top & Bottom Soft Vignette for Enhanced Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
          </div>
        ) : (
          /* Fallback Gradient if no image */
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              currentSlide.bgGradient || 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]'
            }`}
          />
        )}

        {/* Soft Background Visual Blur Accents */}
        <div className="absolute -left-12 -top-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar inside Slide */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap min-w-0">
            {/* Badge */}
            {currentSlide.badgeBangla && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur-md px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-sm border border-white/20">
                <Sparkles size={12} className="text-amber-300 animate-spin-slow shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-none">{currentSlide.badgeBangla}</span>
              </span>
            )}

            {/* Highlight text tag */}
            {currentSlide.highlightTextBangla && (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs shrink-0">
                <Zap size={11} className="fill-slate-950 shrink-0" />
                <span>{currentSlide.highlightTextBangla}</span>
              </span>
            )}

            {/* Live Indicator */}
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-xs shrink-0">
              LIVE
            </span>
          </div>

          {/* Controls: Play/Pause, Slide Counter, Admin Quick Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin', { tab: 'FEED_SLIDER' })}
                title="অ্যাডমিন প্যানেল থেকে স্লাইডার কন্ট্রোল ও এডিট করুন"
                className="bg-black/50 hover:bg-black/70 text-amber-300 hover:text-amber-200 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-xl backdrop-blur-md border border-amber-300/30 flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Settings size={11} />
                <span className="hidden sm:inline">স্লাইডার এডিট</span>
              </button>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'অটোপ্লে চালু করুন' : 'অটোপ্লে থামিয়ে রাখুন'}
              className="w-7 h-7 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
            >
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
            </button>

            <span className="text-[11px] sm:text-xs font-mono font-bold bg-black/40 px-2 sm:px-2.5 py-1 rounded-lg text-white/95 backdrop-blur-md border border-white/10 shrink-0">
              {String(currentIndex + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Center Content Section: Left Frosted Content & Clear Right View */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center my-auto">
          {/* Text & CTAs */}
          <div className="lg:col-span-8 space-y-2.5 sm:space-y-3">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-snug drop-shadow-md break-words">
              {currentSlide.titleBangla}
            </h1>
            
            <p className="text-purple-100 text-xs sm:text-sm max-w-2xl leading-relaxed text-slate-100/95 drop-shadow-sm font-medium">
              {currentSlide.subtitleBangla}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={() => handleCtaClick(currentSlide)}
                className="flex items-center gap-2 bg-white text-slate-900 hover:bg-amber-300 hover:text-slate-950 active:scale-95 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg hover:shadow-xl cursor-pointer shrink-0"
              >
                {currentSlide.targetView === 'create_post' ? (
                  <PlusCircle size={15} className="text-[#4e20b8]" />
                ) : (
                  <Zap size={15} className="text-amber-500" />
                )}
                <span>{currentSlide.ctaTextBangla}</span>
              </button>

              {currentSlide.secondaryCtaTextBangla && (
                <button
                  onClick={() => handleSecondaryCtaClick(currentSlide)}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 active:scale-95 text-white border border-white/30 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <span>{currentSlide.secondaryCtaTextBangla}</span>
                  <ExternalLink size={12} className="text-white/80" />
                </button>
              )}
            </div>
          </div>

          {/* Right Visual Floating Tag / Info pill (Glassmorphic) */}
          <div className="hidden lg:flex lg:col-span-4 justify-end items-center">
            <div className="bg-black/40 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2.5 text-white shadow-xl flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[11px] font-bold text-slate-200">
                  {currentSlide.themeTag ? currentSlide.themeTag.toUpperCase() : 'COMMUNITY'}
                </div>
                <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <ShieldCheck size={13} /> ১০০% ভেরিফাইড
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pagination & Navigation Controls */}
        <div className="relative z-10 pt-3 sm:pt-4 flex flex-row items-center justify-between gap-2 sm:gap-3 border-t border-white/15 mt-3 sm:mt-4">
          
          {/* Quick theme slide selector dots/capsules */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-[70%] sm:max-w-full pb-1 sm:pb-0 scrollbar-none pr-4">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all cursor-pointer rounded-full flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold whitespace-nowrap shrink-0 ${
                  idx === currentIndex
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'bg-white/15 text-white/80 hover:bg-white/30 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[160px]">
                  {slide.badgeBangla?.replace(/^[^\w\s\u0980-\u09FF]+/, '').trim() || slide.titleBangla.slice(0, 15)}
                </span>
              </button>
            ))}
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrev}
              aria-label="পূর্ববর্তী স্লাইড"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/15 shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              aria-label="পরবর্তী স্লাইড"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/15 shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Smooth Linear Progress Bar along top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
