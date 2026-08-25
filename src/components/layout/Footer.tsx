import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Award, Lock, Headphones, Facebook, Youtube, Instagram, Video, Share2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-8 pb-20 md:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/80 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">20% Escrow Advance</div>
              <div className="text-[10px] text-slate-400">Locked until work starts</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/80 text-indigo-400 flex items-center justify-center shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Zero-Spam Privacy</div>
              <div className="text-[10px] text-slate-400">Masked contacts</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/80 text-indigo-400 flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Verified Specialists</div>
              <div className="text-[10px] text-slate-400">KYC & NID inspection</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/80 text-indigo-400 flex items-center justify-center shrink-0">
              <Headphones size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">24/7 Dispute Support</div>
              <div className="text-[10px] text-slate-400">Direct mediation</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-2">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                qaaga<span className="text-[#ff6d00]">.com</span>
              </span>
              <span className="text-[10px] font-bold bg-[#4e20b8]/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                Super Marketplace
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              qaaga.com is Bangladesh&apos;s verified multi-service super marketplace connecting technicians, BMDC doctors, home nurses, hotels, merchants, and job candidates.
            </p>
            <div className="pt-1 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#ff6d00] shrink-0" />
                <span className="truncate">Gulshan 2 &bull; Dhanmondi &bull; Nationwide Coverage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#ff6d00] shrink-0" />
                <span>Hotline: +880 1800-QAAGA-1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-[#ff6d00] shrink-0" />
                <span>support@qaaga.com</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                কমিউনিটি ও সোশ্যাল মিডিয়া
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://web.facebook.com/qaagaltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="QAAGA Facebook"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/30 text-xs font-bold transition-all hover:scale-105"
                >
                  <Facebook size={14} />
                  <span>Facebook</span>
                </a>

                <a
                  href="https://www.youtube.com/@QAAGA"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="QAAGA YouTube"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-[#FF4D4D] border border-[#FF0000]/30 text-xs font-bold transition-all hover:scale-105"
                >
                  <Youtube size={14} />
                  <span>YouTube</span>
                </a>

                <a
                  href="https://www.instagram.com/qaaga/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="QAAGA Instagram"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E4405F]/15 hover:bg-[#E4405F]/25 text-[#FF6B8B] border border-[#E4405F]/30 text-xs font-bold transition-all hover:scale-105"
                >
                  <Instagram size={14} />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.tiktok.com/@my.qaaga"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="QAAGA TikTok"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-all hover:scale-105"
                >
                  <Video size={14} className="text-teal-400" />
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Services</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('service_request', { categoryId: 'cat-ac-repair' })} className="hover:text-indigo-400 text-left">
                  AC Servicing & Gas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_request', { categoryId: 'cat-tv-repair' })} className="hover:text-indigo-400 text-left">
                  Smart TV Repair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_request', { categoryId: 'cat-refrigerator-repair' })} className="hover:text-indigo-400 text-left">
                  Refrigerator Servicing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_request', { categoryId: 'cat-web-design' })} className="hover:text-indigo-400 text-left">
                  Website Design
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service_request', { categoryId: 'cat-video-editing' })} className="hover:text-indigo-400 text-left">
                  Video Production
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Health & Travel */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Health & Travel</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-indigo-400 text-left">
                  Doctor Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nurses')} className="hover:text-indigo-400 text-left">
                  Home Nurse (12h/24h)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nurses')} className="hover:text-indigo-400 text-left">
                  Elderly Caregivers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hotels')} className="hover:text-indigo-400 text-left">
                  Hotels in Cox&apos;s Bazar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hotels')} className="hover:text-indigo-400 text-left">
                  Sylhet Resorts
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Marketplaces & Business */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Marketplace</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-indigo-400 text-left">
                  Product Shop (COD)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ebooks')} className="hover:text-indigo-400 text-left">
                  eBook Digital Store
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('used_products')} className="hover:text-indigo-400 text-left">
                  Used Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-indigo-400 text-left">
                  Job Openings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('partner_register')} className="hover:text-indigo-300 font-semibold text-indigo-400 text-left">
                  Partner Registration
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>&copy; 2026 QAAGA Super Marketplace (qaaga.com). All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">20% Escrow Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

