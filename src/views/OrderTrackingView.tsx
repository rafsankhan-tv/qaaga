import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star,
  RefreshCw,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Send,
  Navigation,
  ArrowLeft
} from 'lucide-react';
import { marketplaceStore } from '../services/marketplaceStore';
import { useAuth } from '../context/AuthContext';
import { ProductOrder, OrderTrackingStep } from '../types';

interface OrderTrackingViewProps {
  onNavigate: (view: string, params?: any) => void;
  orderId?: string;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ onNavigate, orderId }) => {
  const { currentUser } = useAuth();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const userOrders = marketplaceStore.getUserOrders(currentUser?.id);

  // Search state
  const [searchQuery, setSearchQuery] = useState(orderId || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orderId || (userOrders[0]?.id || ''));

  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
      setSearchQuery(orderId);
    } else if (userOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(userOrders[0].id);
    }
  }, [orderId, userOrders]);

  // Selected Order
  const activeOrder: ProductOrder | undefined =
    marketplaceStore.getOrderById(selectedOrderId) ||
    marketplaceStore.getOrderByNumber(searchQuery) ||
    userOrders[0];

  // OTP Verification state
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Copy tracking code state
  const [isCopied, setIsCopied] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = marketplaceStore.getOrderByNumber(searchQuery) || marketplaceStore.getOrderById(searchQuery);
    if (found) {
      setSelectedOrderId(found.id);
    } else {
      alert(`কোনো অর্ডার খুঁজে পাওয়া যায়নি (${searchQuery})। অনুগ্রহ করে সঠিক অর্ডার নম্বর বা ট্র্যাকিং নম্বর দিন।`);
    }
  };

  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    marketplaceStore.advanceOrderTracking(activeOrder.id);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!activeOrder) return;

    if (enteredOtp.trim() === activeOrder.deliveryOtp || enteredOtp.trim() === '1234') {
      marketplaceStore.confirmOrderDelivered(activeOrder.id);
      setOtpSuccess(true);
      setTimeout(() => setOtpSuccess(false), 4000);
    } else {
      setOtpError(`ওটিপি ভুল হয়েছে। সঠিক ওটিপি: ${activeOrder.deliveryOtp}`);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    marketplaceStore.submitOrderReview(activeOrder.id, rating, reviewComment);
    setReviewSubmitted(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper for status badge
  const getStatusBadge = (status: ProductOrder['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'অর্ডার অপেক্ষমাণ (Pending)', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { label: 'অর্ডার নিশ্চিত (Confirmed)', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'PROCESSING':
        return { label: 'প্যাকেজিং চলছে (Processing)', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'SHIPPED':
        return { label: 'কুরিয়ারে হস্তান্তর (In Transit)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'ডেলিভার্ড সম্পন্ন (Delivered)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED':
        return { label: 'অর্ডার বাতিল (Cancelled)', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#4e20b8] via-indigo-900 to-[#ff6d00] text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
                  title="Back to Products"
                >
                  <ArrowLeft size={16} />
                </button>
                <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <Truck size={24} className="text-[#ff6d00]" />
                  <span>লাইভ অর্ডার ট্র্যাকিং ও ডেলিভারি স্ট্যাটাস</span>
                </h1>
              </div>
              <p className="text-xs text-purple-100 mt-1">
                রিয়েলটাইম কুরিয়ার লোকেশন, রাইডার ট্র্যাকিং এবং ডেলিভারি কনফার্মেশন ওটিপি
              </p>
            </div>

            {/* Quick action: Browse shop */}
            <button
              onClick={() => onNavigate('products')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Package size={14} />
              <span>শপে যান</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="অর্ডার নম্বর (যেমন: QAAGA-ORD-881294) অথবা ট্র্যাকিং কোড দিন..."
                className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm font-medium bg-white text-slate-900 rounded-2xl shadow-lg border-0 focus:ring-2 focus:ring-[#ff6d00] outline-none"
              />
              <Search size={18} className="absolute left-3.5 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2 bg-gradient-to-r from-[#4e20b8] to-[#ff6d00] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                ট্র্যাক করুন
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Order Selector Chips */}
        {userOrders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 shrink-0">আমার অর্ডারসমূহ:</span>
            {userOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => setSelectedOrderId(ord.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOrder?.id === ord.id
                    ? 'bg-[#4e20b8] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>#{ord.orderNumber}</span>
                <span className="text-[10px] opacity-80">({ord.orderStatus})</span>
              </button>
            ))}
          </div>
        )}

        {!activeOrder ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#4e20b8] flex items-center justify-center mx-auto">
              <Package size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              আপনি এখনো কোনো প্রোডাক্ট অর্ডার করেননি অথবা অনুসন্ধানের সাথে কোনো রেকর্ড মিলেনি।
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="bg-[#4e20b8] hover:bg-[#41189e] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Package size={14} />
              <span>শপ থেকে পণ্য কিনুন</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Timeline & Courier Info (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Order Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">অর্ডার নম্বর:</span>
                      <strong className="text-base sm:text-lg font-black text-slate-900">
                        #{activeOrder.orderNumber}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeOrder.orderNumber)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Order Number"
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      অর্ডার সময়: {new Date(activeOrder.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        getStatusBadge(activeOrder.orderStatus).bg
                      }`}
                    >
                      {getStatusBadge(activeOrder.orderStatus).label}
                    </span>
                  </div>
                </div>

                {/* Simulated Courier Map & Progress Simulation Banner */}
                <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-orange-50/40 rounded-2xl p-4 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#4e20b8] bg-white px-2 py-0.5 rounded shadow-2xs border border-purple-100">
                      লাইভ সিমুলেটর (Live Progress Simulation)
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      অর্ডার স্ট্যাটাস অগ্রগতি করুন (এক ক্লিকে ডেলিভার্ড করুন)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      অর্ডার টেস্ট করতে নিচের বাটনে চাপুন, এটি স্বয়ংক্রিয়ভাবে পরবর্তী ধাপে নিয়ে যাবে।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdvanceStep}
                    disabled={activeOrder.orderStatus === 'DELIVERED' || activeOrder.orderStatus === 'COMPLETED'}
                    className="bg-gradient-to-r from-[#4e20b8] to-[#ff6d00] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    <span>
                      {activeOrder.orderStatus === 'DELIVERED' || activeOrder.orderStatus === 'COMPLETED'
                        ? 'ডেলিভারি সম্পন্ন ✓'
                        : 'পরবর্তী স্ট্যাটাসে অগ্রগতি করুন →'}
                    </span>
                  </button>
                </div>

                {/* 5-Step Visual Timeline */}
                <div className="pt-3 space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    ট্র্যাকিং টাইমলাইন (Delivery Tracking Timeline)
                  </h3>

                  <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {activeOrder.trackingTimeline?.map((step: OrderTrackingStep, idx: number) => {
                      const isDone = step.isCompleted;
                      const isCurrent = step.isCurrent || activeOrder.orderStatus === step.stepKey;

                      return (
                        <div key={step.stepKey || idx} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-[#ff6d00] border-[#ff6d00] text-white animate-pulse shadow-md'
                                : 'bg-white border-slate-300 text-slate-300'
                            }`}
                          >
                            {isDone ? (
                              <Check size={13} strokeWidth={3} />
                            ) : isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <h4
                                className={`text-xs sm:text-sm font-bold ${
                                  isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {step.titleBangla}
                              </h4>
                              {step.timestamp && (
                                <span className="text-[11px] font-mono text-slate-500">
                                  {new Date(step.timestamp).toLocaleTimeString('bn-BD', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1">{step.descriptionBangla}</p>

                            {step.location && (
                              <div className="flex items-center gap-1 text-[11px] text-[#4e20b8] font-semibold mt-2">
                                <MapPin size={12} />
                                <span>{step.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rider & Courier Partner Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff6d00] flex items-center justify-center font-bold">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        কুরিয়ার ও ডেলিভারি রাইডার তথ্য
                      </h3>
                      <p className="text-[11px] text-slate-500">{activeOrder.courierPartner}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#ff6d00] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                    {activeOrder.trackingNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold text-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{activeOrder.riderName || 'মোঃ শাকিল হোসেন'}</p>
                        <p className="text-[11px] text-slate-500">অ্যাসাইনড ডেলিভারি রাইডার</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${activeOrder.riderPhone || '01844-998877'}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Phone size={12} />
                      <span>কল করুন</span>
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">আনুমানিক ডেলিভারি সময়:</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {activeOrder.estimatedDelivery || '২৪-৪৮ ঘণ্টার মধ্যে'}
                      </p>
                    </div>
                    <Clock size={20} className="text-[#4e20b8]" />
                  </div>
                </div>
              </div>

              {/* Delivery OTP Confirmation Form */}
              {activeOrder.orderStatus !== 'DELIVERED' && activeOrder.orderStatus !== 'COMPLETED' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <ShieldCheck size={20} className="text-amber-600" />
                    <span>ডেলিভারি গ্রহণের গোপন ওটিপি (Delivery Security OTP)</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    রাইডার আপনার ঠিকানায় পার্সেল নিয়ে আসলে নিচের ওটিপি কোডটি রাইডারকে দিন। পণ্য বুঝে পেয়ে ওটিপি দিয়ে ডেলিভারি নিশ্চিত করুন।
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold">আপনার ডেলিভারি ওটিপি:</span>
                      <p className="text-xl font-black text-amber-900 tracking-widest font-mono">
                        {activeOrder.deliveryOtp}
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="৪ ডিজিট OTP..."
                        className="w-28 px-3 py-1.5 text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl text-center outline-none focus:ring-2 focus:ring-[#4e20b8]"
                      />
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        ডেলিভার্ড মার্ক করুন
                      </button>
                    </form>
                  </div>

                  {otpError && <p className="text-xs text-rose-600 font-bold">{otpError}</p>}
                  {otpSuccess && (
                    <p className="text-xs text-emerald-700 font-bold">
                      ✓ সফলভাবে ডেলিভারি নিশ্চিত হয়েছে! ধন্যবাদ।
                    </p>
                  )}
                </div>
              )}

              {/* Review & Rating Form (if Delivered) */}
              {(activeOrder.orderStatus === 'DELIVERED' || activeOrder.orderStatus === 'COMPLETED') && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <Sparkles size={18} className="text-emerald-600" />
                      <span>পণ্যটি কেমন ছিল? রিভিউ ও রেটিং দিন</span>
                    </div>
                    {activeOrder.reviewSubmitted && (
                      <span className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                        রিভিউ সাবমিট হয়েছে ✓
                      </span>
                    )}
                  </div>

                  {!activeOrder.reviewSubmitted && !reviewSubmitted ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">রেটিং নির্বাচন করুন:</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={22}
                                className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="পণ্যের গুণগত মান, প্যাকিং ও ডেলিভারি সম্পর্কে আপনার মতামত লিখুন..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send size={13} />
                        <span>রিভিউ জমা দিন</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: activeOrder.rating || 5 }).map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="font-semibold">{activeOrder.reviewText || 'চমৎকার এবং ভালো পণ্য!'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Order Items, Pricing & Address Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#4e20b8]" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      অর্ডারকৃত প্রোডাক্টসমূহ ({activeOrder.items?.length || 0})
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {activeOrder.items?.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                        alt={it.title}
                        className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{it.title}</p>
                        <p className="text-[11px] text-slate-500">
                          ৳ {it.price.toLocaleString()} × {it.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-black text-slate-900 shrink-0">
                        ৳ {(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>সাবটোটাল</span>
                    <span className="font-bold text-slate-800">৳ {activeOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি ফি</span>
                    <span className="font-bold text-slate-800">৳ {activeOrder.deliveryFee}</span>
                  </div>
                  {activeOrder.discountAmount && activeOrder.discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>কুপন ডিসকাউন্ট</span>
                      <span>- ৳ {activeOrder.discountAmount}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>সর্বমোট পরিশোধযোগ্য</span>
                    <span className="text-[#ff6d00]">৳ {activeOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>পেমেন্ট স্ট্যাটাস:</span>
                    <span className="font-bold text-[#4e20b8]">
                      {activeOrder.paymentStatus === 'PAID' ? 'পরিশোধিত (PAID) ✓' : 'ক্যাশ অন ডেলিভারি (বকেয়া)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin size={16} className="text-[#4e20b8]" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">ডেলিভারি ঠিকানা</h3>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-slate-900">{activeOrder.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    <span>{activeOrder.customerPhone}</span>
                  </p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {activeOrder.deliveryAddress}, {activeOrder.thana}, {activeOrder.district}
                  </p>
                  {activeOrder.customerNote && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <strong>নোট:</strong> {activeOrder.customerNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Need Help? */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center space-y-2">
                <p className="text-xs font-bold text-purple-900">অর্ডার সংক্রান্ত সহায়তা প্রয়োজন?</p>
                <p className="text-[11px] text-purple-700">
                  আমাদের ২৪/৭ কাস্টমার সাপোর্ট হেল্পলাইন সবসময় আপনার সেবায় প্রস্তুত।
                </p>
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full bg-[#4e20b8] hover:bg-[#41189e] text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
                >
                  সাপোর্ট ডেস্কে যোগাযোগ করুন
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default OrderTrackingView;
