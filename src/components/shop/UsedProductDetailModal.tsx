import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Tag,
  UserCheck
} from 'lucide-react';
import { UsedProductListing } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface UsedProductDetailModalProps {
  listing: UsedProductListing | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithAdmin?: (subject: string) => void;
}

export const UsedProductDetailModal: React.FC<UsedProductDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onOpenChatWithAdmin
}) => {
  const { currentUser } = useAuth();
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [escrowRequested, setEscrowRequested] = useState(false);

  if (!isOpen || !listing) return null;

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice) return;
    setOfferSent(true);
    // Notify via platform support
    if (onOpenChatWithAdmin) {
      onOpenChatWithAdmin(`[সেকেন্ড হ্যান্ড অফার] "${listing.title}" - অফার মূল্য: ৳ ${offerPrice}`);
    }
  };

  const handleRequestEscrow = () => {
    setEscrowRequested(true);
    if (onOpenChatWithAdmin) {
      onOpenChatWithAdmin(`[এসক্রো ও হার্ডওয়্যার ইন্সপেকশন রিকোয়েস্ট] লিস্টিং: "${listing.title}" (ID: ${listing.id})`);
    }
  };

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles size={13} />
              <span>সেকেন্ড হ্যান্ড মার্কেট</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              কন্ডিশন: <strong className="text-slate-800">{listing.condition}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
            
            {/* Left: Photos & Escrow Note */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img
                  src={photos[selectedPhotoIdx]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {listing.category}
                </div>
                {listing.isNegotiable && (
                  <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                    দরদামযোগ্য
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedPhotoIdx === idx
                          ? 'border-[#4e20b8] ring-2 ring-[#4e20b8]/30'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Safe Escrow Box */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                  <span>QAAGA এসক্রো ও ভেরিফাইড ডায়াগনস্টিক সুরক্ষা</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  সেকেন্ড হ্যান্ড পণ্য কেনার আগে কোনো অগ্রিম টাকা সরাসরি বিক্রেতাকে দেবেন না। qaaga.com এসক্রোর মাধ্যমে পণ্যের ডায়াগনস্টিক টেস্ট ও টেকনিক্যাল ইন্সপেকশন রিপোর্ট সংগ্রহ করে নিরাপদ লেনদেন সম্পন্ন করুন।
                </p>
                <button
                  onClick={handleRequestEscrow}
                  disabled={escrowRequested}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    escrowRequested
                      ? 'bg-emerald-200 text-emerald-900 cursor-default'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{escrowRequested ? 'এসক্রো রিকোয়েস্ট সাবমিট হয়েছে' : 'এসক্রো ইন্সপেকশন সার্ভিস রিকোয়েস্ট করুন'}</span>
                </button>
              </div>
            </div>

            {/* Right: Info & Contact / Offer */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Location & Date */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin size={14} className="text-[#4e20b8]" />
                    {listing.area}, {listing.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(listing.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                  {listing.title}
                </h1>

                {/* Price */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">বিক্রয় মূল্য</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ৳ {listing.price.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    listing.condition === 'Like New'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {listing.condition}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">পণ্যের বিস্তারিত বিবরণ:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>

                {/* Seller Profile Summary */}
                <div className="p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 text-[#4e20b8] font-black flex items-center justify-center text-sm shadow-2xs">
                      {listing.sellerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{listing.sellerName}</span>
                        <UserCheck size={13} className="text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-slate-500">ভেরিফাইড ইউজার • {listing.inquiryCount} জন আগ্রহী</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    অ্যাক্টিভ লিস্টিং
                  </span>
                </div>

                {/* Make Offer Form */}
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Tag size={14} className="text-amber-700" />
                    <span>আপনার দাম প্রস্তাব করুন (Make an Offer)</span>
                  </div>

                  {offerSent ? (
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={15} />
                      <span>আপনার অফারটি অ্যাডমিন ও বিক্রেতার সেন্ট্রাল ডেটায় পাঠানো হয়েছে!</span>
                    </p>
                  ) : (
                    <form onSubmit={handleSendOffer} className="flex gap-2">
                      <input
                        type="number"
                        placeholder="উদাঃ 145000"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8] text-slate-800"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all active:scale-98"
                      >
                        অফার পাঠান
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (onOpenChatWithAdmin) {
                      onOpenChatWithAdmin(`[সেকেন্ড হ্যান্ড অনুসন্ধান] "${listing.title}" (ID: ${listing.id})`);
                    }
                  }}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#4e20b8] to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                >
                  <MessageCircle size={16} />
                  <span>হেল্পডেস্কে ইনকোয়ারি করুন</span>
                </button>

                <a
                  href={`tel:${listing.sellerPhone || '01712345678'}`}
                  className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-center"
                >
                  <Phone size={15} />
                  <span>কল করুন ({listing.sellerPhone ? listing.sellerPhone.slice(0, 5) + '...' : '01712...'})</span>
                </a>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
