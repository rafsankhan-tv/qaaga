import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  CreditCard,
  Zap,
  Trash2,
  Plus,
  Minus,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { marketplaceStore } from '../services/marketplaceStore';
import { useAuth } from '../context/AuthContext';
import { Product, ProductOrderItem } from '../types';

interface CartCheckoutViewProps {
  onNavigate: (view: string, params?: any) => void;
  instantProduct?: Product;
  instantQuantity?: number;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  onNavigate,
  instantProduct,
  instantQuantity = 1
}) => {
  const { currentUser } = useAuth();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const unsub = marketplaceStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const cartItems = marketplaceStore.getCartItems();
  const isInstantMode = Boolean(instantProduct);

  const [instantQty, setInstantQty] = useState(instantQuantity);

  // Form states
  const [recipientName, setRecipientName] = useState(currentUser?.fullName || 'তাহসিন আহমেদ');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '01819-876543');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [thanaArea, setThanaArea] = useState(currentUser?.area || 'ধানমন্ডি');
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.address || 'বাড়ি ২৪, ফ্ল্যাট ৪বি, রোড ৮/এ, ধানমন্ডি, ঢাকা ১২০৯'
  );
  const [customerNote, setCustomerNote] = useState('');
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_BKASH' | 'ONLINE_CARD'>('COD');
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [bkashPhone, setBkashPhone] = useState(recipientPhone || '01819-876543');
  const [bkashOtp, setBkashOtp] = useState('');
  const [bkashPin, setBkashPin] = useState('');
  const [bkashStep, setBkashStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [bkashSimulatedTxnId, setBkashSimulatedTxnId] = useState<string | null>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Placed order outcome
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  const itemsToCheckout: { product: Product; quantity: number }[] = isInstantMode && instantProduct
    ? [{ product: instantProduct, quantity: instantQty }]
    : cartItems;

  const isDhaka = district.toLowerCase().includes('dhaka') || district.includes('ঢাকা');
  const baseDeliveryFee = itemsToCheckout.length > 0 ? (isDhaka ? 80 : 130) : 0;
  const deliveryFee = itemsToCheckout.length > 0 ? (isExpressDelivery ? baseDeliveryFee + 70 : baseDeliveryFee) : 0;

  const subtotal = itemsToCheckout.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (code === 'QAAGA50' || code === 'DISCOUNT50') {
      setAppliedCoupon({ code, discount: 50 });
      setCouponInput('');
    } else if (code === 'QAAGA100' || code === 'SAVE100') {
      if (subtotal >= 1500) {
        setAppliedCoupon({ code, discount: 100 });
        setCouponInput('');
      } else {
        setCouponError('এই কুপন ব্যবহারের জন্য সর্বনিম্ন ১৫০০ টাকার অর্ডার প্রয়োজন।');
      }
    } else if (code === 'FREESHIP' || code === 'FREEDELIVERY') {
      setAppliedCoupon({ code, discount: deliveryFee });
      setCouponInput('');
    } else {
      setCouponError('কুপন কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ। চেষ্টা করুন: QAAGA50 বা QAAGA100');
    }
  };

  const handleCreateOrder = () => {
    if (itemsToCheckout.length === 0) return;
    if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);

    const orderItems: ProductOrderItem[] = itemsToCheckout.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
      image:
        item.product.images?.[0] ||
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      sellerId: item.product.sellerId || 'official-seller'
    }));

    setTimeout(() => {
      const newOrder = marketplaceStore.createProductOrder({
        customerId: currentUser?.id || 'user-customer-1',
        customerName: recipientName,
        customerPhone: recipientPhone,
        deliveryAddress,
        district,
        thana: thanaArea,
        area: thanaArea,
        items: orderItems,
        paymentMethod,
        transactionId: bkashSimulatedTxnId || undefined,
        discountAmount,
        couponCode: appliedCoupon?.code,
        customerNote,
        expressDelivery: isExpressDelivery
      });

      if (!isInstantMode) {
        marketplaceStore.clearCart();
      }

      setPlacedOrder(newOrder);
      setIsSubmitting(false);
    }, 600);
  };

  // If order placed successfully, show completion screen with Track button
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-50/80 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 size={44} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                অর্ডার নিশ্চিতকরণ সম্পন্ন
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                অর্ডার ট্র্যাকিং আইডি:{' '}
                <strong className="text-[#4e20b8] font-black text-base">{placedOrder.orderNumber}</strong>
              </p>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-semibold">ডেলিভারি পার্টনার</p>
                <p className="text-sm font-bold text-slate-900">{placedOrder.courierPartner}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold">ট্র্যাকিং নম্বর</p>
                <p className="text-sm font-black text-[#ff6d00] font-mono">{placedOrder.trackingNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">প্রাপক:</span>
                <p className="font-bold text-slate-800">{placedOrder.customerName}</p>
                <p className="text-slate-600">{placedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                <p className="font-semibold text-slate-800 line-clamp-2">{placedOrder.deliveryAddress}</p>
              </div>
              <div>
                <span className="text-slate-500">পেমেন্ট মেথড:</span>
                <p className="font-bold text-[#4e20b8]">
                  {placedOrder.paymentMethod === 'COD'
                    ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য দিন)'
                    : 'বিকাশ অনলাইন পেমেন্ট (পেইড)'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">সর্বমোট মূল্য:</span>
                <p className="text-base font-black text-slate-900">৳ {placedOrder.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* OTP Alert */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <ShieldCheck size={18} className="text-amber-600 shrink-0" />
                <span>ডেলিভারি ওটিপি কোড (OTP):</span>
              </div>
              <span className="text-lg font-black text-amber-900 font-mono tracking-widest bg-amber-200/80 px-2.5 py-0.5 rounded">
                {placedOrder.deliveryOtp}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onNavigate('track_order', { orderId: placedOrder.id })}
              className="w-full bg-gradient-to-r from-[#4e20b8] via-purple-700 to-[#ff6d00] hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer transform hover:scale-[1.01]"
            >
              <Truck size={18} />
              <span>লাইভ ডেলিভারি ট্র্যাক করুন (Live Order Tracker)</span>
              <ChevronRight size={16} />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('products')}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>আরও কেনাকাটা করুন</span>
              </button>

              <button
                onClick={() => onNavigate('customer_dashboard')}
                className="py-3 px-4 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User size={15} />
                <span>আমার অর্ডার তালিকা</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no items
  if (itemsToCheckout.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-20 h-20 rounded-full bg-purple-50 text-[#4e20b8] flex items-center justify-center">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">আপনার শপিং ব্যাগ বর্তমানে খালি</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          আপনার কার্টে কোনো প্রোডাক্ট যুক্ত নেই। শপে গিয়ে সেরা ডিল ও পছন্দের পণ্য খুঁজুন।
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-[#4e20b8] hover:bg-[#41189e] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
        >
          শপ ব্রাউজ করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#4e20b8] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>শপে ফিরে যান</span>
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-900">নিরাপদ চেকআউট ও ক্যাশ অন ডেলিভারি</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Form & Options (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Recipient & Shipping Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold text-xs">
                    ১
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    ডেলিভারি ঠিকানা ও প্রাপকের তথ্য
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">* আবশ্যকীয়</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রাপকের পূর্ণ নাম (Full Name) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="আপনার নাম লিখুন..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                    />
                    <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (Phone) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                    />
                    <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">জেলা (District) *</label>
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                    >
                      <option value="Dhaka">ঢাকা (Dhaka) - ৳৮০ ডেলিভারি</option>
                      <option value="Chittagong">চট্টগ্রাম (Chittagong) - ৳১৩০ ডেলিভারি</option>
                      <option value="Sylhet">সিলেট (Sylhet) - ৳১৩০ ডেলিভারি</option>
                      <option value="Rajshahi">রাজশাহী (Rajshahi) - ৳১৩০ ডেলিভারি</option>
                      <option value="Khulna">খুলনা (Khulna) - ৳১৩০ ডেলিভারি</option>
                      <option value="Barisal">বরিশাল (Barisal) - ৳১৩০ ডেলিভারি</option>
                      <option value="Rangpur">রংপুর (Rangpur) - ৳১৩০ ডেলিভারি</option>
                      <option value="Mymensingh">ময়মনসিংহ (Mymensingh) - ৳১৩০ ডেলিভারি</option>
                      <option value="Gazipur">গাজীপুর (Gazipur) - ৳১৩০ ডেলিভারি</option>
                      <option value="Narayanganj">নারায়ণগঞ্জ (Narayanganj) - ৳১৩০ ডেলিভারি</option>
                      <option value="Comilla">কুমিল্লা (Comilla) - ৳১৩০ ডেলিভারি</option>
                      <option value="Bogra">বগুড়া (Bogra) - ৳১৩০ ডেলিভারি</option>
                    </select>
                    <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">থানা / এরিয়া (Area) *</label>
                  <input
                    type="text"
                    value={thanaArea}
                    onChange={(e) => setThanaArea(e.target.value)}
                    placeholder="যেমন: ধানমন্ডি, উত্তরা, গুলশান..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সম্পূর্ণ ডেলিভারি ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নম্বর) *
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা পরিচিত ল্যান্ডমার্ক বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ডেলিভারি নির্দেশনা বা নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="যেমন: ৩টার পরে ডেলিভারি দিবেন অথবা সিকিউরিটির কাছে রাখবেন"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                />
              </div>

              {/* Express Delivery Option */}
              <div
                onClick={() => setIsExpressDelivery(!isExpressDelivery)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isExpressDelivery
                    ? 'border-[#ff6d00] bg-orange-50/70 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isExpressDelivery
                        ? 'bg-[#ff6d00] border-[#ff6d00] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isExpressDelivery && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <span>🚀 এক্সপ্রেস সেম-ডে ডেলিভারি (Fast Delivery)</span>
                      <span className="text-[10px] bg-[#ff6d00] text-white px-1.5 py-0.2 rounded font-black">
                        +৳৭০
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">ঢাকা সিটির ভেতর ২৪ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold text-xs">
                  ২
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    পেমেন্ট পদ্ধতি নির্বাচন করুন
                  </h3>
                  <p className="text-[11px] text-slate-500">আপনার সুবিধাজনক পেমেন্ট মোড বাছাই করুন</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* COD */}
                <div
                  onClick={() => {
                    setPaymentMethod('COD');
                    setBkashSimulatedTxnId(null);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-[#4e20b8] bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold">
                      <Truck size={20} />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'COD' ? 'border-[#4e20b8] bg-[#4e20b8]' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি (COD)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন</p>
                  </div>
                </div>

                {/* bKash / Online */}
                <div
                  onClick={() => {
                    setPaymentMethod('ONLINE_BKASH');
                    setIsBkashModalOpen(true);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'ONLINE_BKASH'
                      ? 'border-[#ff6d00] bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ff6d00] flex items-center justify-center font-bold">
                      <Zap size={20} />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'ONLINE_BKASH' ? 'border-[#ff6d00] bg-[#ff6d00]' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'ONLINE_BKASH' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-900">বিকাশ / নগদ ইনস্ট্যান্ট পেমেন্ট</h4>
                      {bkashSimulatedTxnId && (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                          পেইড ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {bkashSimulatedTxnId ? `Txn: ${bkashSimulatedTxnId}` : 'অনলাইনে ক্যাশলেস পে করুন'}
                    </p>
                  </div>
                </div>
              </div>

              {/* bKash verified banner */}
              {paymentMethod === 'ONLINE_BKASH' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      {bkashSimulatedTxnId
                        ? `বিকাশ অনলাইন পেমেন্ট ভেরিফাইড (TrxID: ${bkashSimulatedTxnId})`
                        : 'বিকাশ অনলাইন গেটওয়ে নির্বাচন করা হয়েছে।'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBkashModalOpen(true)}
                    className="text-xs font-bold text-[#4e20b8] hover:underline cursor-pointer"
                  >
                    {bkashSimulatedTxnId ? 'গৌপনীয়তা দেখুন' : 'পে করুন'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Cart Items (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5 sticky top-20">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#4e20b8]" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    অর্ডার সামারি ({itemsToCheckout.reduce((s, i) => s + i.quantity, 0)} আইটেম)
                  </h3>
                </div>
                {isInstantMode && (
                  <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap size={11} className="fill-amber-600" />
                    <span>ইনস্ট্যান্ট কিনুন</span>
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {itemsToCheckout.map((item) => {
                  const product = item.product;
                  const itemPrice = product.discountPrice || product.price;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100"
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={product.title}
                        className="w-14 h-14 rounded-lg object-cover bg-white shrink-0 border border-slate-200/80"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={product.title}>
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          ৳ {itemPrice.toLocaleString()} × {item.quantity}
                        </p>

                        {/* Qty changer */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center border border-slate-200 rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => {
                                if (isInstantMode) {
                                  setInstantQty(Math.max(1, instantQty - 1));
                                } else {
                                  marketplaceStore.updateCartQuantity(product.id, -1);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800">
                              {isInstantMode ? instantQty : item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isInstantMode) {
                                  setInstantQty(instantQty + 1);
                                } else {
                                  marketplaceStore.updateCartQuantity(product.id, 1);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {!isInstantMode && (
                            <button
                              type="button"
                              onClick={() => marketplaceStore.removeFromCart(product.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          ৳ {(itemPrice * (isInstantMode ? instantQty : item.quantity)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700">
                  ডিসকাউন্ট কুপন কোড (Promo Code)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="যেমন: QAAGA50"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none uppercase font-mono"
                    />
                    <Tag size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    <span className="font-bold">✓ কুপন {appliedCoupon.code} যোগ হয়েছে (-৳{appliedCoupon.discount})</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      বাতিল
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}
              </form>

              {/* Price Calculation Table */}
              <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-slate-800">৳ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-[10px] text-slate-400">({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'})</span>
                  </span>
                  <span className="font-bold text-slate-800">৳ {deliveryFee}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>- ৳ {discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-[#ff6d00]">৳ {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Submit Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateOrder}
                className="w-full bg-gradient-to-r from-[#ff6d00] to-amber-600 hover:from-[#ea6000] hover:to-amber-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>অর্ডার নিশ্চিত করুন (Place Order)</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-slate-500">
                  🛡️ ১০০% মান নিশ্চিত ও সহজ রিটার্ন গ্যারান্টি
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bKash Payment Simulation Modal */}
      {isBkashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            {/* bKash header */}
            <div className="bg-[#e2136e] text-white p-5 text-center relative">
              <h3 className="text-lg font-black tracking-wide">bKash Payment Gateway</h3>
              <p className="text-xs opacity-90 mt-0.5">মার্চেন্ট: QAAGA Digital Services</p>
              <div className="mt-3 bg-white/10 rounded-xl py-1.5 px-3 inline-block">
                <span className="text-sm font-black text-white">প্রদেয়: ৳ {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* bKash Body */}
            <div className="p-5 space-y-4">
              {bkashStep === 'phone' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    আপনার বিকাশ অ্যাকাউন্ট নম্বর দিন:
                  </label>
                  <input
                    type="tel"
                    value={bkashPhone}
                    onChange={(e) => setBkashPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2.5 text-center text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#e2136e] outline-none"
                  />
                  <p className="text-[11px] text-slate-500 text-center">
                    পেমেন্ট সম্পন্ন করতে আপনার বিকাশ নম্বরে ওটিপি পাঠানো হবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setBkashStep('otp')}
                    className="w-full bg-[#e2136e] hover:bg-[#c90f61] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    পরবর্তী (Next)
                  </button>
                </div>
              )}

              {bkashStep === 'otp' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 text-center">
                    ভেরিফিকেশন কোড (OTP) লিখুন:
                  </label>
                  <div className="text-center">
                    <input
                      type="text"
                      maxLength={6}
                      value={bkashOtp}
                      onChange={(e) => setBkashOtp(e.target.value)}
                      placeholder="1 2 3 4 5 6"
                      className="w-44 mx-auto px-3 py-2 text-center text-lg font-black tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#e2136e] outline-none"
                    />
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">ডেমো টেস্ট কোড: 123456</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBkashStep('pin')}
                    className="w-full bg-[#e2136e] hover:bg-[#c90f61] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    ওটিপি নিশ্চিত করুন
                  </button>
                </div>
              )}

              {bkashStep === 'pin' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 text-center">
                    আপনার বিকাশ পিন (PIN) দিন:
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value)}
                    placeholder="•••••"
                    className="w-36 mx-auto block px-3 py-2 text-center text-xl font-black tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#e2136e] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 text-center">
                    সিমুলেটেড সিকিউর গেটওয়ে - যেকোনো ৫ ডিজিট পিন দিন
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const txn = `BKASH_${Math.floor(10000000 + Math.random() * 90000000)}`;
                      setBkashSimulatedTxnId(txn);
                      setIsBkashModalOpen(false);
                      setPaymentMethod('ONLINE_BKASH');
                    }}
                    className="w-full bg-[#e2136e] hover:bg-[#c90f61] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    পেমেন্ট সম্পন্ন করুন
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsBkashModalOpen(false);
                  setBkashStep('phone');
                }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 py-1"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartCheckoutView;
