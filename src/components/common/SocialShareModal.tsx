import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Mail,
  Send,
  Sparkles,
  Link2,
  Smartphone
} from 'lucide-react';

export interface ShareTargetData {
  type: 'profile' | 'post' | 'service' | 'general';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url?: string;
  badge?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareTargetData | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  shareData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !shareData) return null;

  // Build the canonical sharing URL
  const getShareUrl = () => {
    if (shareData.url) return shareData.url;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://qaaga.com';
    const pathname = typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
    const baseUrl = `${origin}${pathname}`.replace(/\/$/, '') + '/';

    if (shareData.type === 'profile') {
      return `${baseUrl}?profile=${encodeURIComponent(shareData.id)}`;
    } else if (shareData.type === 'post') {
      return `${baseUrl}?post=${encodeURIComponent(shareData.id)}`;
    } else if (shareData.type === 'service') {
      return `${baseUrl}?service=${encodeURIComponent(shareData.id)}`;
    }
    return baseUrl;
  };

  const shareUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = `${shareData.title}${shareData.subtitle ? ' - ' + shareData.subtitle : ''} | QAAGA ভেরিফাইড প্ল্যাটফর্ম`;
  const encodedText = encodeURIComponent(shareText);

  // Robust Copy link to clipboard with multiple fallbacks
  const handleCopyLink = async () => {
    let succeeded = false;

    // Method 1: Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        succeeded = true;
      } catch (err) {
        console.warn('Clipboard API writeText failed:', err);
      }
    }

    // Method 2: execCommand Fallback
    if (!succeeded) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        succeeded = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackErr) {
        console.error('execCommand copy fallback failed:', fallbackErr);
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Native Web Share Sheet (if supported by browser/device)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.subtitle || shareText,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  // Social Share Platforms
  const shareChannels = [
    {
      name: 'WhatsApp',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      iconBg: 'bg-emerald-500',
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.274.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.419-.101.824z" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBg: 'bg-blue-500',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      name: 'Messenger',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
      iconBg: 'bg-blue-500',
      url: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.298 2.222.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.89-3.259-6.56 6.963z" />
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      color: 'bg-slate-900 hover:bg-black text-white',
      iconBg: 'bg-slate-800',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Telegram',
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      iconBg: 'bg-sky-400',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
      iconBg: 'bg-blue-600',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    {
      name: 'ইমেইল (Email)',
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      iconBg: 'bg-rose-500',
      url: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`,
      icon: <Mail className="w-5 h-5" />
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{ minHeight: '100vh', minWidth: '100vw' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg my-auto rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-scaleUp"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {shareData.type === 'profile'
                  ? 'প্রোফাইল শেয়ার করুন'
                  : shareData.type === 'post'
                  ? 'পোস্ট শেয়ার করুন'
                  : 'সার্ভিস লিংক শেয়ার করুন'}
              </h3>
              <p className="text-[10px] text-slate-500">
                সোশ্যাল মিডিয়া বা সরাসরি লিংক কপি করে বন্ধুদের সাথে শেয়ার করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Target Preview Card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            {shareData.image && (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 shadow-xs">
                <img
                  src={shareData.image}
                  alt={shareData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {shareData.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#4e20b8] inline-block mb-0.5">
                  {shareData.badge}
                </span>
              )}
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {shareData.title}
              </h4>
              {shareData.subtitle && (
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {shareData.subtitle}
                </p>
              )}
              <span className="text-[10px] text-purple-700 font-semibold block mt-1">
                QAAGA.com ভেরিফাইড হাব
              </span>
            </div>
          </div>

          {/* Direct Copy Link Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Link2 size={13} className="text-[#4e20b8]" />
                সরাসরি শেয়ার লিংক
              </span>
              {copied && (
                <span className="text-emerald-600 text-[10px] font-bold animate-fadeIn">
                  ✓ লিংক কপি হয়েছে!
                </span>
              )}
            </label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-slate-700 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#4e20b8] hover:bg-[#3d1796] text-white active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>কপি লিংক</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media 1-Tap Share Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              সোশ্যাল মিডিয়াতে শেয়ার করুন:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {shareChannels.map((ch) => (
                <a
                  key={ch.name}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2.5 rounded-xl ${ch.color} font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer justify-center`}
                >
                  {ch.icon}
                  <span className="truncate">{ch.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Native Device Share Sheet (Mobile / Tablet) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone size={15} className="text-[#4e20b8]" />
              <span>ডিভাইস শেয়ার মেনু ওপেন করুন (Native Share Sheet)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
