import React, { useState, useEffect } from 'react';
import {
  Zap,
  Tag,
  ShieldCheck,
  Truck,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  ArrowRight,
  Plus,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ShopFlashDealsBannerProps {
  onSelectTab: (tab: 'all' | 'products' | 'deals' | 'used' | 'ebooks' | 'blogs') => void;
  onOpenPostUsedAd: () => void;
}

export const ShopFlashDealsBanner: React.FC<ShopFlashDealsBannerProps> = ({
  onSelectTab,
  onOpenPostUsedAd
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      id: 1,
      tag: '🔥 হট মেগা সেল ও ফ্ল্যাশ ডিলস',
      title: 'নতুন গ্যাজেট ও ইলেকট্রনিক্সে সর্বোচ্চ ৪৫% পর্যন্ত ছাড়',
      subtitle: 'অরিজিনাল ব্র্যান্ড ওয়ারেন্টি সহ হোম অ্যাপ্লায়েন্স, পাওয়ার টুলস ও স্মার্ট গ্যাজেট ২৪ ঘণ্টার মধ্যে দ্রুত ডেলিভারি।',
      ctaText: 'ফ্ল্যাশ ডিলস দেখুন',
      ctaAction: () => onSelectTab('deals'),
      secondaryActionText: 'সকল পণ্য এক্সপ্লোর',
      secondaryAction: () => onSelectTab('products'),
      highlight: '⚡ সুপার সেভিং অফার',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80'
    },
    {
      id: 2,
      tag: '🔄 ভেরিফাইড সেকেন্ড হ্যান্ড বাজার',
      title: 'ব্যবহৃত ল্যাপটপ, বাইক ও গ্যাজেট কিনুন এসক্রো সুরক্ষায়',
      subtitle: 'টেকনিক্যাল ইন্সপেকশন ও ডায়াগনস্টিক টেস্ট সহ নিরাপদ লেনদেন অথবা আপনার অব্যবহৃত আইটেম সম্পূর্ণ ফ্রিতে পোস্ট করুন।',
      ctaText: 'ব্যবহৃত গ্যাজেট দেখুন',
      ctaAction: () => onSelectTab('used'),
      secondaryActionText: '+ ফ্রি বিজ্ঞাপন দিন',
      secondaryAction: onOpenPostUsedAd,
      highlight: '🛡️ ১০০% ভেরিফাইড বিক্রেতা',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80'
    },
    {
      id: 3,
      tag: '📚 ডিজিটাল ই-বুক ও প্র্যাকটিক্যাল গাইড',
      title: 'প্রোগ্রামিং, ফ্রিল্যান্সিং ও টেকনিক্যাল রিপেয়ার ই-বুক',
      subtitle: 'লাইভ ব্রাউজারে পড়ুন অথবা ফুল পিডিএফ ডাউনলোড করুন আজীবন এক্সেস সহ। বাংলাদেশের সর্ববৃহৎ ডিজিটাল বুক হাব।',
      ctaText: 'ই-বুক লাইব্রেরি দেখুন',
      ctaAction: () => onSelectTab('ebooks'),
      secondaryActionText: 'টেক ব্লগ ও গাইড',
      secondaryAction: () => onSelectTab('blogs'),
      highlight: '📖 আজীবন লাইফটাইম এক্সেস',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80'
    },
    {
      id: 4,
      tag: '⚡ স্মার্ট টুলস ও হোম অটোমেশন',
      title: 'প্রফেশনাল হার্ডওয়্যার, টেস্ট ইকুইপমেন্ট ও স্পেয়ার পার্টস',
      subtitle: 'মেকানিক, ইঞ্জিনিয়ার ও টেকনিশিয়ানদের জন্য আসল মানের টুলস ও যন্ত্রাংশ আকর্ষণীয় পাইকারি মূল্যে।',
      ctaText: 'টুলস ও এক্সেসরিজ',
      ctaAction: () => onSelectTab('products'),
      secondaryActionText: 'ডিলস চেক করুন',
      secondaryAction: () => onSelectTab('deals'),
      highlight: '🚚 ফ্রি ক্যাশ অন ডেলিভারি',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80'
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const slide = slides[currentSlide];

  return (
    <div
      id="shop-hero-full-slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800/80 bg-slate-950 min-h-[280px] sm:min-h-[320px] lg:min-h-[340px] flex items-center group select-none"
    >
      {/* Background Full-Coverage Images with Smooth Fade */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-10000"
          />
        </div>
      ))}

      {/* Balanced Ambient Gradient Scrim Overlay - Lighter so background photos are clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10 sm:from-slate-950/75 sm:via-slate-950/35 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

      {/* Content Overlay Layer */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-12 py-8 sm:py-10">
        <div className="max-w-3xl space-y-4">
          
          {/* Top Tag and Live Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-rose-600/90 text-white shadow-md backdrop-blur-md border border-rose-400/30">
              {slide.tag}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/10 text-amber-300 backdrop-blur-md border border-white/15">
              {slide.highlight}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.2] tracking-tight drop-shadow-md">
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none drop-shadow-sm">
            {slide.subtitle}
          </p>

          {/* Action Buttons & Features */}
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={slide.ctaAction}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#ff6d00] to-amber-500 hover:from-[#ea6000] hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight size={16} />
            </button>

            {slide.secondaryActionText && (
              <button
                type="button"
                onClick={slide.secondaryAction}
                className="py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>{slide.secondaryActionText}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Slide Navigation Dots / Indicators */}
      <div className="absolute bottom-4 right-6 sm:right-10 flex items-center gap-2 z-20">
        <span className="text-[11px] font-black text-white/70 hidden sm:inline-block mr-1">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            title={`Slide ${idx + 1}`}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx ? 'w-8 bg-[#ff6d00] shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Prev / Next Arrows */}
      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 opacity-70 hover:opacity-100 active:scale-90"
        title="পূর্ববর্তী স্লাইড"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 opacity-70 hover:opacity-100 active:scale-90"
        title="পরবর্তী স্লাইড"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
