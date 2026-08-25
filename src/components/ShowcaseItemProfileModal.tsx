import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  Calendar,
  MapPin,
  Send,
  Lock,
  ChevronRight,
  User,
  ShoppingBag,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ShowcaseCardItem, CategoryShowcaseSection, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { RenderCategoryIcon } from './CategoryIconHelper';

interface ShowcaseItemProfileModalProps {
  item: ShowcaseCardItem | null;
  section?: CategoryShowcaseSection | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ShowcaseItemProfileModal: React.FC<ShowcaseItemProfileModalProps> = ({
  item,
  section,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Order Form States
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || 'ঢাকা, বাংলাদেশ');
  const [customerNotes, setCustomerNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceChoice, setAdvanceChoice] = useState<'twenty' | 'full' | 'cod'>('twenty');

  if (!isOpen || !item) return null;

  // Extract photos list (main + portfolio images)
  const allPhotos = [item.imageUrl, ...(item.portfolioImages || [])].filter(Boolean);
  const activePhoto = allPhotos[selectedPhotoIndex] || item.imageUrl;

  // Fallback defaults for rich profiles
  const providerName = item.providerName || (section ? `${section.titleBangla} ভেরিফাইড এক্সপার্ট` : 'QAAGA ভেরিফাইড স্পেশালিস্ট');
  const providerRole = item.providerRole || 'সার্টিফাইড ও অভিজ্ঞ প্রোভাইডার';
  const providerAvatar =
    item.providerAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80';
  const providerExperience = item.providerExperience || '৪+ বছরের অভিজ্ঞতা';
  const deliveryTime = item.deliveryTime || 'দ্রুত ডেলিভারি ও সাপোর্ট';
  const warranty = item.warrantyOrGuarantee || '১০০% ভেরিফাইড ও কোয়ালিটি গ্যারান্টি';
  const description =
    item.description ||
    `${item.title} — আপনার প্রয়োজন অনুযায়ী সর্বোচ্চ মানের সার্ভিস ও প্রফেশনাল সমাধান প্রদান করা হয়। সমস্ত কাজ দক্ষ কারিগর ও আধুনিক প্রযুক্তির মাধ্যমে নিশ্চিত করা হয়।`;

  // Standard feature checklist if not provided
  const defaultFeatures = [
    '১০০% জেনুইন ও প্রফেশনাল সার্ভিস',
    'ভেরিফাইড ও দক্ষ এক্সপার্ট দ্বারা কাজ সম্পাদন',
    'কাজের পর ৩০ দিনের ফ্রি ফলো-আপ সাপোর্ট',
    'নিরাপদ পেমেন্ট এসক্রো ও মানি ব্যাক নিশ্চয়তা',
    'জরুরি প্রয়োজনে দ্রুত রিপ্লাই ও গ্রাহক সেবা'
  ];
  const features = item.features && item.features.length > 0 ? item.features : defaultFeatures;

  // Calculate pricing numbers
  const numericPrice = parseInt(item.priceOrSalary.replace(/,/g, '').replace(/[^0-9]/g, '')) || 1000;
  const advanceAmount = Math.round(numericPrice * 0.2); // 20%

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      alert('অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন');
      return;
    }

    setIsOrdering(true);

    setTimeout(() => {
      // Create a service request / booking record in the store
      const newBookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
      
      const customerProfile: UserProfile = currentUser || {
        id: `guest-${Date.now()}`,
        email: 'guest@qaaga.com',
        fullName: customerName.trim() || 'সম্মানিত গ্রাহক',
        phone: customerPhone.trim(),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        gender: 'other',
        division: 'ঢাকা',
        district: 'ঢাকা',
        thana: 'গুলশান',
        area: 'ঢাকা সিটি',
        address: customerAddress || 'ঢাকা, বাংলাদেশ',
        roles: ['CUSTOMER'],
        activeRole: 'CUSTOMER',
        accountStatus: 'active',
        isVerified: true,
        rating: 5.0,
        reviewCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      marketplaceStore.createServiceRequest({
        customer: customerProfile,
        categoryId: section?.id || 'cat-repair',
        subCategory: item.title,
        title: `${item.title} - ${item.subtitle || 'সার্ভিস অর্ডার'}`,
        description: `অর্ডারকৃত প্যাকেজ: ${item.title}\nমূল্য: ৳ ${item.priceOrSalary}\nপ্রোভাইডার: ${item.providerName || 'অ্যাসাইনকৃত এক্সপার্ট'}\nনোট: ${customerNotes || 'কোনো অতিরিক্ত নির্দেশনা নেই'}\nপেমেন্ট মোড: ${advanceChoice === 'twenty' ? '২০% অগ্রিম (৳ ' + advanceAmount + ')' : 'সম্পূর্ণ মূল্য'}`,
        budget: numericPrice,
        isUrgent: false,
        preferredDate: preferredDate,
        preferredTime: 'সকাল ১০:০০ - বিকাল ৫:০০',
        district: 'ঢাকা',
        thana: 'গুলশান',
        area: 'ঢাকা সিটি',
        address: customerAddress || 'ঢাকা, বাংলাদেশ',
        images: [item.imageUrl],
        routingMode: 'ALL_ELIGIBLE',
        targetProviderIds: []
      });

      setIsOrdering(false);
      setOrderSuccess(true);
      setConfirmedBookingId(newBookingId);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL TOP HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            {section && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                style={{ backgroundColor: `${section.themeColor}15`, color: section.themeColor }}
              >
                <RenderCategoryIcon iconName={section.iconName} size={15} />
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-slate-900 line-clamp-1">
                {section?.titleBangla || 'সার্ভিস ও প্যাকেজ প্রোফাইল'}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                সম্পূর্ণ প্রোফাইল ও সরাসরি অর্ডার বিবরণী
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {orderSuccess ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-8 px-4 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  ধন্যবাদ! আমাদের ভেরিফাইড এক্সপার্ট ও সাপোর্ট টিম শীঘ্রই আপনার সাথে <strong>{customerPhone}</strong> নম্বরে যোগাযোগ করবে।
                </p>
              </div>

              {/* Order summary pill */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">বুকিং রেফারেন্স:</span>
                  <span className="font-mono font-bold text-[#4e20b8]">{confirmedBookingId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">প্যাকেজ / আইটেম:</span>
                  <span className="font-bold text-slate-800">{item.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">মোট মূল্য:</span>
                  <span className="font-black text-slate-900">৳ {item.priceOrSalary}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>২০% এসক্রো পেন্ডিং / কনফার্মড</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('customer_dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#4e20b8] hover:bg-[#3d1796] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  আমার ড্যাশবোর্ডে অর্ডার দেখুন
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  অন্যান্য সার্ভিস দেখুন
                </button>
              </div>
            </div>
          ) : (
            /* REGULAR COMPLETE PROFILE VIEW */
            <>
              {/* TOP HERO & GALLERY SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left: Photos & Gallery */}
                <div className="md:col-span-5 space-y-2.5">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 border border-slate-200 shadow-xs group">
                    <img
                      src={activePhoto}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-[#4e20b8] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        {item.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{item.rating || '4.9'} ({item.reviewCount || '100+'})</span>
                    </span>
                  </div>

                  {/* Thumbnails switcher */}
                  {allPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {allPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhotoIndex(idx)}
                          className={`w-14 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            selectedPhotoIndex === idx ? 'border-[#4e20b8] ring-2 ring-purple-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Title, Provider, Pricing Card */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Provider Info Pill */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <img
                      src={providerAvatar}
                      alt={providerName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {providerName}
                        </span>
                        <ShieldCheck size={14} className="text-[#4e20b8] shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{providerRole}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                          <Award size={10} />
                          <span>{providerExperience}</span>
                        </span>
                        <span>•</span>
                        <span>১০০% ভেরিফাইড প্রোফাইল</span>
                      </div>
                    </div>

                    {/* Quick Call Button */}
                    <a
                      href={`tel:${item.providerPhone || '01900000000'}`}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 flex items-center justify-center shadow-2xs transition-colors shrink-0"
                      title="সরাসরি কল করুন"
                    >
                      <Phone size={14} />
                    </a>
                  </div>

                  {/* Pricing and Advance Guarantee Bar */}
                  <div className="bg-gradient-to-br from-purple-50/70 to-orange-50/60 rounded-2xl p-3.5 border border-purple-100/90 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        প্যাকেজ মূল্য
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                          ৳ {item.priceOrSalary}
                        </span>
                        {item.unitText && (
                          <span className="text-xs font-semibold text-slate-500">
                            {item.unitText}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-[#4e20b8] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs inline-flex items-center gap-1">
                        <Lock size={10} />
                        <span>২০% অগ্রিমে বুকিং (৳ {advanceAmount.toLocaleString()})</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        বাকি ৮০% কাজের পর পরিশোধ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & SPECIFICATIONS */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#4e20b8]" />
                  <span>সার্ভিস বিবরণ ও প্রধান সুবিধাসমূহ</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  {description}
                </p>

                {/* Features Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs font-medium text-slate-700"
                    >
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline and Warranty Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-900">
                    <Clock size={15} className="text-[#4e20b8] shrink-0" />
                    <span><strong>ডেলিভারি সময়:</strong> {deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                    <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                    <span><strong>ওয়ারেন্টি:</strong> {warranty}</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE BOOKING / ORDER FORM (DIRECTLY INSIDE PROFILE) */}
              <div className="pt-3 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#ff6d00]" />
                    <span>এখনই অর্ডার বা বুকিং করুন</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    তাৎক্ষণিক কনফার্মেশন
                  </span>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-3.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        আপনার নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#4e20b8] focus:ring-1 focus:ring-[#4e20b8] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        মোবাইল নম্বর *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#4e20b8] focus:ring-1 focus:ring-[#4e20b8] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        ঠিকানা / ডেলিভারি এরিয়া
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="বাসা/অফিসের ঠিকানা বা শহর"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#4e20b8] focus:ring-1 focus:ring-[#4e20b8] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        পছন্দের তারিখ
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#4e20b8] focus:ring-1 focus:ring-[#4e20b8] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      বিশেষ নির্দেশনা বা কাজের বিস্তারিত নোট (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="আপনার কাজের নির্দিষ্ট কোনো রিকোয়ারমেন্ট থাকলে লিখুন..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#4e20b8] focus:ring-1 focus:ring-[#4e20b8] outline-none resize-none"
                    />
                  </div>

                  {/* Payment Preference Chips */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      পেমেন্ট অপশন বেছে নিন
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdvanceChoice('twenty')}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          advanceChoice === 'twenty'
                            ? 'bg-purple-50/80 border-[#4e20b8] ring-1 ring-[#4e20b8]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="advance"
                          checked={advanceChoice === 'twenty'}
                          onChange={() => setAdvanceChoice('twenty')}
                          className="mt-0.5 text-[#4e20b8]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            ২০% অগ্রিম এসক্রো ডিপোজিট
                          </div>
                          <div className="text-[10px] text-slate-500">
                            অগ্রিম মাত্র ৳ {advanceAmount.toLocaleString()} (বাকি কাজ শেষের পর)
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdvanceChoice('full')}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          advanceChoice === 'full'
                            ? 'bg-purple-50/80 border-[#4e20b8] ring-1 ring-[#4e20b8]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="advance"
                          checked={advanceChoice === 'full'}
                          onChange={() => setAdvanceChoice('full')}
                          className="mt-0.5 text-[#4e20b8]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            সম্পূর্ণ পেমেন্ট (১০০% এসক্রো)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            মোট ৳ {numericPrice.toLocaleString()} টাকা (১০০% মানি-ব্যাক সেফটি)
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Final Submit CTA Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isOrdering}
                      className="w-full py-3.5 bg-gradient-to-r from-[#4e20b8] to-[#6d28d9] hover:from-[#3d1796] hover:to-[#581c87] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <span>অর্ডার প্রসেস হচ্ছে...</span>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>সরাসরি অর্ডার নিশ্চিত করুন (৳ {item.priceOrSalary})</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-1.5 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span>QAAGA এসক্রো ও গ্যারান্টি সুরক্ষায় আপনার পেমেন্ট সম্পূর্ণ নিরাপদ</span>
                    </p>
                  </div>
                </form>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
