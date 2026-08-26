import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, X, Headphones } from 'lucide-react';

export const FloatingHelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If visitor closed/hidden the widget
  if (isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-[74px] sm:bottom-6 left-3 sm:left-6 z-40 flex flex-col items-start gap-2 select-none">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-200/90 p-3.5 w-72 mb-1 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold">
                <Headphones size={15} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">২৪/৭ সরাসরি সহায়তা</h4>
                <p className="text-[10px] text-slate-400">আমরা সার্বক্ষণিক অনলাইনে আছি</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {/* 1. WhatsApp Action */}
            <a
              href="https://wa.me/8801644985301"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <MessageCircle size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">WhatsApp Chat</div>
                <div className="text-xs font-black text-emerald-950 truncate">+8801644985301</div>
              </div>
            </a>

            {/* 2. Direct Call Action */}
            <a
              href="tel:09658824360"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-950 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ff6d00] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Phone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Direct Call / Hotline</div>
                <div className="text-xs font-black text-amber-950 truncate">09658824360</div>
              </div>
            </a>

            {/* 3. Direct Email Action */}
            <a
              href="mailto:qaaga@consultant.com"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/70 text-purple-950 transition-all group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#4e20b8] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Mail size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Email Support</div>
                <div className="text-xs font-bold text-purple-950 truncate">qaaga@consultant.com</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill / Button with Dedicated 'X' Hide Button */}
      <div className="relative group/pill">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white pl-3.5 pr-4 py-2 rounded-full shadow-lg hover:shadow-xl border-2 border-white/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="কাস্টমার সাপোর্ট ও হেল্পডেস্ক"
        >
          <div className="relative">
            <MessageCircle size={18} className="animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-600 animate-ping" />
          </div>
          <div className="flex flex-col items-start leading-none text-left">
            <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider">Help & Support</span>
            <span className="text-xs font-black">WhatsApp / Call</span>
          </div>
        </button>

        {/* 'X' Button to Hide WhatsApp/Support widget completely */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer border border-white/60 transition-colors z-10"
          title="হাইড করুন (Hide)"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
};
