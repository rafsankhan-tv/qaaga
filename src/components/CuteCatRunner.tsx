import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Flame
} from 'lucide-react';
import { CuteCatAssistantSettings } from '../types';
import { marketplaceStore } from '../services/marketplaceStore';
import { CuteCatAvatarSvg } from './CuteCatAvatarSvg';
import { CuteCatAssistantModal } from './CuteCatAssistantModal';

interface CuteCatRunnerProps {
  onNavigate: (view: string, params?: any) => void;
  renderStage?: boolean;
  renderFloating?: boolean;
}

export const CuteCatRunner: React.FC<CuteCatRunnerProps> = ({
  onNavigate,
  renderStage = true,
  renderFloating = true
}) => {
  const [settings, setSettings] = useState<CuteCatAssistantSettings>(() =>
    marketplaceStore.getCuteCatSettings()
  );

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [assistantModalMode, setAssistantModalMode] = useState<'chat' | 'text' | 'voice' | 'photo'>('chat');
  const [showHeartReact, setShowHeartReact] = useState(false);
  const [isFloatingBubbleVisible, setIsFloatingBubbleVisible] = useState(true);
  const [isMouthTalking, setIsMouthTalking] = useState(false);
  const [bubbleAnimationKey, setBubbleAnimationKey] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => {
      setSettings(marketplaceStore.getCuteCatSettings());
    });
    return unsub;
  }, []);

  // Message rotation interval with mouth-talking animation
  useEffect(() => {
    if (!settings.messages || settings.messages.length === 0) return;

    const interval = setInterval(() => {
      // Trigger mouth talking animation when message bursts out
      setIsMouthTalking(true);
      setTimeout(() => setIsMouthTalking(false), 900);

      setCurrentMessageIndex((prev) => (prev + 1) % settings.messages.length);
      setBubbleAnimationKey((prev) => prev + 1);
    }, (settings.speechIntervalSeconds || 3.5) * 1000);

    return () => clearInterval(interval);
  }, [settings.messages, settings.speechIntervalSeconds]);

  // Window scroll listener for floating dock on any device
  useEffect(() => {
    if (!renderFloating || !settings.enableFloatingOnScroll) {
      setIsScrolledDown(false);
      return;
    }

    const checkScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      // Default to 120px so user gets the floating assistant quickly when scrolling on mobile or desktop
      const threshold = Math.min(settings.scrollThresholdPx || 120, 150);
      setIsScrolledDown(scrollY > threshold);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [renderFloating, settings.enableFloatingOnScroll, settings.scrollThresholdPx]);

  if (!settings.isEnabled) {
    return null;
  }

  const currentMessage =
    settings.messages[currentMessageIndex] || 'তুমি কি চাও আমাকে বলো? আমি খুঁজে দিচ্ছি! 🐾✨';

  const handleCatClick = (mode: 'chat' | 'text' | 'voice' | 'photo' = 'chat') => {
    setShowHeartReact(true);
    setIsMouthTalking(true);
    setTimeout(() => {
      setShowHeartReact(false);
      setIsMouthTalking(false);
    }, 1200);
    setAssistantModalMode(mode);
    setIsAssistantModalOpen(true);
  };

  return (
    <>
      {/* 1. CENTERED JUMPING CAT STAGE WITH MOUTH-POPPING SPEECH BUBBLE STICKER (Embedded Stage) */}
      {renderStage && (
        <section
          id="cute-cat-stage"
          className="relative overflow-hidden rounded-3xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/90 via-amber-50/60 to-purple-100/80 p-4 sm:p-5 shadow-sm transition-all"
        >
          {/* Subtle decorative background sparkles and paw prints */}
          <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden select-none">
            <div className="absolute top-2 left-8 text-purple-300 text-xs font-mono">🐾  🐾</div>
            <div className="absolute bottom-3 left-16 text-amber-400 text-xs font-mono">🐾</div>
            <div className="absolute top-3 right-12 text-purple-300 text-xs font-mono">🐾  🐾</div>
            <div className="absolute bottom-2 right-24 text-amber-400 text-xs font-mono">🐾</div>
            {/* Subtle glow circles */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-200/40 rounded-full blur-2xl" />
          </div>

          {/* Top Header Row */}
          <div className="flex items-center justify-between relative z-10 mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4e20b8]"></span>
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>{settings.catName}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-purple-700 bg-purple-200/70 border border-purple-300/60 px-2.5 py-0.5 rounded-full">
                  {settings.catSubtitleBangla || 'লাইভ ক্যাট অ্যাসিস্ট্যান্ট'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCatClick('voice')}
                className="text-xs font-bold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                title="কথা বলে সার্চ করুন"
              >
                <span>🎤 ভয়েস</span>
              </button>
              <button
                onClick={() => handleCatClick('photo')}
                className="text-xs font-bold text-amber-800 hover:text-white hover:bg-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                title="ছবি আপলোড করে সার্চ করুন"
              >
                <span>📷 ফটো</span>
              </button>
              <button
                onClick={() => handleCatClick('chat')}
                className="text-xs font-bold text-[#4e20b8] hover:text-white hover:bg-[#4e20b8] bg-white/90 border border-purple-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Sparkles size={13} className="text-amber-500 animate-spin" />
                <span>AI চ্যাট করুন 💬</span>
              </button>
            </div>
          </div>

          {/* CENTER STAGE: JUMPING/BOUNCING CAT & MOUTH-POPPING SPEECH BUBBLE */}
          <div className="relative flex flex-col items-center justify-center py-2 sm:py-3 select-none">
            
            {/* MOUTH-POPPING SPEECH BUBBLE STICKER (Floating out of cat's mouth) */}
            <div
              key={bubbleAnimationKey}
              onClick={() => handleCatClick('chat')}
              className="relative z-20 cursor-pointer group mb-2 max-w-[92%] sm:max-w-xl animate-mouthBubblePop"
            >
              {/* The Main Sticker Box */}
              <div className="relative bg-gradient-to-r from-white via-purple-50/50 to-white backdrop-blur-md border-2 border-[#4e20b8] px-4 sm:px-6 py-2.5 sm:py-3 rounded-3xl shadow-lg group-hover:shadow-xl group-hover:border-[#ff6d00] transition-all transform group-hover:scale-102 flex items-center gap-3">
                
                {/* Animated Glowing Sparkle / Mic Icon */}
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#4e20b8] to-[#ff6d00] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                </div>

                {/* Text Sticker Body */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-black tracking-wider text-purple-700 flex items-center gap-1">
                    <span>মিউ মিউ বলছে:</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug">
                    "{currentMessage}"
                  </p>
                </div>

                {/* Click Callout Badge */}
                <span className="hidden sm:inline-flex text-[10px] font-black text-purple-900 bg-amber-300/80 hover:bg-amber-400 px-2.5 py-1 rounded-xl shadow-2xs shrink-0 transition-colors">
                  ট্যাপ করুন ✨
                </span>
              </div>

              {/* CONNECTING MOUTH BUBBLES STREAM (o O ° coming out of mouth) */}
              <div className="absolute left-1/2 -bottom-3.5 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none">
                <div className="w-2.5 h-2.5 bg-white border border-[#4e20b8] rounded-full shadow-2xs animate-pulse" />
                <div className="w-1.5 h-1.5 bg-[#4e20b8] rounded-full shadow-2xs" />
                <div className="w-1 h-1 bg-[#ff6d00] rounded-full" />
              </div>
            </div>

            {/* THE JUMPING / BOUNCING CUTE CAT (CENTERED) */}
            <div
              className="relative cursor-pointer transition-transform group"
              onClick={() => handleCatClick('text')}
            >
              {/* Soft Shadow on Floor that scales when jumping */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-4 bg-purple-900/20 rounded-full blur-xs animate-catFloorShadow" />

              {/* Jump Container */}
              <div className="relative animate-catLapjhat">
                <CuteCatAvatarSvg
                  skin={settings.catSkin || 'orange-tabby'}
                  isTalking={isMouthTalking}
                  size={88}
                  customUrl={settings.avatarUrl}
                  className="transform group-hover:scale-110 transition-transform drop-shadow-md"
                />

                {/* Heart Pop Reaction on Click */}
                {showHeartReact && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-rose-500 font-black text-sm animate-bounce flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full shadow-md border border-rose-200">
                    <Heart size={16} className="fill-rose-500 text-rose-500 animate-pulse" />
                    <span>মিউ! 🐾</span>
                  </div>
                )}
              </div>
            </div>

            {/* Playful prompt pill */}
            <div className="mt-1 text-[11px] font-bold text-purple-900/80 bg-white/80 border border-purple-200 px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
              <span>🐾 কথা বলুন, ছবি তুলুন বা ট্যাপ করে সার্চ করুন</span>
            </div>
          </div>

          {/* Quick Clickable Suggestions Under Track */}
          <div className="mt-2 pt-2.5 border-t border-purple-200/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-purple-950 shrink-0 flex items-center gap-1 bg-purple-200/50 px-2 py-1 rounded-lg">
              <Flame size={13} className="text-amber-500" />
              <span>দ্রুত খুঁজুন:</span>
            </span>
            {settings.quickChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => onNavigate(chip.view, chip.params)}
                className="text-[11px] font-semibold text-slate-700 bg-white/95 hover:bg-[#4e20b8] hover:text-white border border-purple-200/80 hover:border-[#4e20b8] px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 2. DOCKED FLOATING MINI-CAT WIDGET (When visitor scrolls down the page on any device) */}
      {renderFloating && isScrolledDown && settings.enableFloatingOnScroll && (
        <div
          id="docked-cat-floating"
          className={`fixed ${
            settings.floatingPosition === 'bottom-left'
              ? 'left-3 sm:left-6 items-start'
              : 'right-3 sm:right-6 items-end'
          } bottom-[76px] md:bottom-6 z-50 flex flex-col animate-slideUp select-none`}
          style={{
            transform: `scale(${settings.floatingScale || 0.95})`,
            transformOrigin: settings.floatingPosition === 'bottom-left' ? 'bottom left' : 'bottom right'
          }}
        >
          {/* Floating Speech Bubble above Mini-Cat */}
          {isFloatingBubbleVisible && (
            <div
              onClick={() => handleCatClick('chat')}
              className="relative mb-2 bg-white/95 backdrop-blur-md border-2 border-[#4e20b8] text-slate-800 text-xs font-bold px-3.5 py-2 rounded-2xl shadow-2xl max-w-[210px] sm:max-w-[250px] leading-snug animate-mouthBubblePop cursor-pointer hover:border-[#ff6d00] transition-colors"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFloatingBubbleVisible(false);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer shadow-xs z-10"
                title="Hide speech bubble"
              >
                ✕
              </button>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-500 shrink-0 text-sm">💬</span>
                <span className="text-[11px] sm:text-xs text-slate-800 leading-tight">
                  {currentMessage}
                </span>
              </div>
              {/* Pointer bubbles down to cat's mouth */}
              <div
                className={`absolute -bottom-2 ${
                  settings.floatingPosition === 'bottom-left' ? 'left-6' : 'right-6'
                } flex flex-col items-center`}
              >
                <div className="w-2 h-2 bg-white border border-[#4e20b8] rounded-full" />
                <div className="w-1 h-1 bg-[#4e20b8] rounded-full" />
              </div>
            </div>
          )}

          {/* Mini Docked Animated Jumping Cat Button */}
          <div
            className="relative group cursor-pointer"
            onClick={() => handleCatClick('chat')}
            title="মিউ মিউ অ্যাসিস্ট্যান্টকে জিজ্ঞেস করুন"
          >
            {/* Glowing animated pulsing aura */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-amber-400 to-purple-600 rounded-full blur-xs opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />

            <div className="relative bg-white rounded-full p-2 border-2 border-[#4e20b8] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
              <div className="animate-catLapjhat">
                <CuteCatAvatarSvg
                  skin={settings.catSkin || 'orange-tabby'}
                  isTalking={isMouthTalking}
                  size={52}
                  customUrl={settings.avatarUrl}
                />
              </div>

              {/* Online pulse status beacon */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            {/* Click CTA label pill: জিজ্ঞেস করুন 🐾 */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#4e20b8] hover:bg-[#3b1594] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap border border-white flex items-center gap-1 transition-transform group-hover:scale-105">
              <span>জিজ্ঞেস করুন</span>
              <span>🐾</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MULTIMODAL CUTE CAT ASSISTANT MODAL (Voice, Photo, Text Search) */}
      <CuteCatAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        onNavigate={onNavigate}
        initialMode={assistantModalMode}
      />

      {/* Global CSS Animation for Cat Lapjhat and Mouth Bubble Pop */}
      <style>{`
        /* Energetic Cat Jumping / Lapjhat Animation */
        @keyframes catLapjhat {
          0%, 100% {
            transform: translateY(0) scale(1, 1);
          }
          30% {
            transform: translateY(-16px) scale(0.96, 1.05);
          }
          50% {
            transform: translateY(-22px) scale(0.98, 1.04);
          }
          70% {
            transform: translateY(-8px) scale(1.02, 0.98);
          }
          85% {
            transform: translateY(2px) scale(1.06, 0.94);
          }
        }

        /* Floor Shadow scales with jump */
        @keyframes catFloorShadow {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.25;
          }
          50% {
            transform: translateX(-50%) scale(0.6);
            opacity: 0.1;
          }
        }

        /* Mouth Bubble Sticker Popping Out */
        @keyframes mouthBubblePop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.85);
          }
          60% {
            opacity: 1;
            transform: translateY(-4px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-catLapjhat {
          animation: catLapjhat 1.8s ease-in-out infinite;
        }

        .animate-catFloorShadow {
          animation: catFloorShadow 1.8s ease-in-out infinite;
        }

        .animate-mouthBubblePop {
          animation: mouthBubblePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scaleUp {
          animation: scaleUp 0.25s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};
