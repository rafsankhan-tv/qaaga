import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  CheckCircle,
  FileText,
  ShieldCheck,
  Zap,
  Lock,
  Share2,
  Bookmark,
  Languages,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { EBook } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface EbookReaderModalProps {
  ebook: EBook | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export const EbookReaderModal: React.FC<EbookReaderModalProps> = ({
  ebook,
  isOpen,
  onClose,
  onPurchaseSuccess
}) => {
  const { currentUser } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [purchaseDone, setPurchaseDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'about'>('preview');

  if (!isOpen || !ebook) return null;

  // Check if current user already purchased this ebook
  const purchases = marketplaceStore.getEbookPurchases();
  const hasPurchased = purchaseDone || purchases.some(
    p => p.ebookId === ebook.id && (p.userId === currentUser?.id || currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN'))
  );

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedTrx = trxId.trim() || `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
      marketplaceStore.purchaseEbook(
        ebook.id,
        currentUser?.id || 'guest-user',
        generatedTrx
      );
      setPurchaseDone(true);
      setIsPurchasing(false);
      if (onPurchaseSuccess) onPurchaseSuccess();
    } catch (err: any) {
      alert(err?.message || 'ক্রয় সম্পন্ন হতে সমস্যা হয়েছে।');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-[#4e20b8]">
              <BookOpen size={16} />
            </span>
            <span className="text-xs font-bold text-slate-800">
              ডিজিটাল ই-বুক ও গাইড
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
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* Book Cover */}
            <div className="sm:col-span-4 space-y-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                <img
                  src={ebook.coverImage}
                  alt={ebook.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FileText size={12} />
                  <span>PDF ({ebook.fileSizeMb} MB)</span>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>মোট পৃষ্ঠা:</span>
                  <span className="font-bold text-slate-900">{ebook.pageCount} টি</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>ভাষা:</span>
                  <span className="font-bold text-slate-900">{ebook.language}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>ডাউনলোড:</span>
                  <span className="font-bold text-emerald-600">{ebook.downloadCount}+ পাঠক</span>
                </div>
              </div>
            </div>

            {/* Book Info & Content */}
            <div className="sm:col-span-8 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-[#4e20b8] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {ebook.category}
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-2 leading-snug">
                  {ebook.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  লেখক: <span className="font-bold text-slate-800">{ebook.author}</span>
                </p>
                <div className="mt-2">
                  <RatingStars rating={ebook.rating} reviewCount={ebook.reviewCount} />
                </div>
              </div>

              {/* Price / Access Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-amber-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">নির্ধারিত মূল্য</span>
                  <span className="text-2xl font-black text-[#4e20b8]">৳ {ebook.price}</span>
                </div>

                {hasPurchased ? (
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>আনলক করা হয়েছে</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPurchasing(true)}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4e20b8] to-purple-700 hover:from-purple-800 hover:to-purple-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Zap size={14} className="fill-amber-400 text-amber-400" />
                    <span>ই-বুকটি সংগ্রহ করুন</span>
                  </button>
                )}
              </div>

              {/* Tabs for Preview / About */}
              <div>
                <div className="flex border-b border-slate-200 text-xs font-bold gap-4">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'preview'
                        ? 'border-[#4e20b8] text-[#4e20b8]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📖 ফ্রি প্রিভিউ রিডার
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'about'
                        ? 'border-[#4e20b8] text-[#4e20b8]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    বইটির বিবরণ ও সূচিপত্র
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-3">
                  {activeTab === 'preview' ? (
                    <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-3 font-serif text-slate-800 text-xs sm:text-sm leading-relaxed">
                      <div className="flex items-center justify-between border-b border-amber-200/50 pb-2 text-xs font-sans text-amber-900 font-bold">
                        <span>নমুনা প্রিভিউ অংশ:</span>
                        <span className="text-[11px] font-normal text-amber-700">পৃষ্ঠা ১-১০ এর সারাংশ</span>
                      </div>
                      
                      <p className="whitespace-pre-line text-slate-700">
                        {ebook.previewSnippet}
                      </p>

                      {hasPurchased ? (
                        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-sans text-xs space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle size={15} />
                            <span>অভিনন্দন! আপনার অ্যাকাউন্ট থেকে সম্পূর্ণ ই-বুকটি সক্রিয় রয়েছে।</span>
                          </p>
                          <p className="text-[11px]">{ebook.fullContentSnippet}</p>
                          <button
                            onClick={() => alert(`ডাউনলোড শুরু হচ্ছে... টোকেন ভেরিফাইড: QAAGA-EBOOK-SECURE-DOWNLOAD`)}
                            className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Download size={14} />
                            <span>PDF ফাইল ডাউনলোড করুন ({ebook.fileSizeMb} MB)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200 text-[#4e20b8] font-sans text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock size={16} />
                            <span>বাকি {ebook.pageCount - 10} টি পৃষ্ঠা পড়তে সংগ্রহ করুন।</span>
                          </div>
                          <button
                            onClick={() => setIsPurchasing(true)}
                            className="font-bold underline cursor-pointer text-xs"
                          >
                            আনলক করুন ৳ {ebook.price}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed space-y-2 p-2">
                      <p>{ebook.description}</p>
                      <div className="pt-2">
                        <span className="font-bold text-slate-800 block mb-1">যা যা শিখবেন ও পাবেন:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          <li>রিয়েল-লাইফ কেস স্টাডি ও কোড রিপোজিটরি এক্সেস</li>
                          <li>প্র্যাকটিক্যাল আর্কিটেকচার ব্লুপ্রিন্ট ও চেকলিস্ট</li>
                          <li>লাইফটাইম আপডেট এবং অনলাইন সাপোর্ট গ্রুপ এক্সেস</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Modal Form Overlay inside Modal */}
              {isPurchasing && (
                <div className="p-4 bg-purple-900 text-white rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-purple-700 pb-2">
                    <span className="text-xs font-bold">ই-বুক ইনস্ট্যান্ট পেমেন্ট</span>
                    <button
                      onClick={() => setIsPurchasing(false)}
                      className="text-purple-300 hover:text-white cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  
                  <p className="text-xs text-purple-200">
                    বিকাশ বা নগদ নম্বর <strong className="text-white">01712-345678</strong> তে ৳ <strong>{ebook.price}</strong> সেন্ড মানি করুন অথবা সরাসরি পেমেন্ট কনফার্ম করুন:
                  </p>

                  <form onSubmit={handlePurchase} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="bKash TrxID (ঐচ্ছিক)"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-purple-950 border border-purple-600 text-white placeholder-purple-400 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md"
                    >
                      পেমেন্ট কনফার্ম করুন
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
