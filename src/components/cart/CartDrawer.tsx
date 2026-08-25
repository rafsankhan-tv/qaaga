import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { marketplaceStore } from '../../services/marketplaceStore';
import { useAuth } from '../../context/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser } = useAuth();
  const cartItems = marketplaceStore.getCartItems();
  const cartCount = marketplaceStore.getCartCount();
  const subtotal = marketplaceStore.getCartSubtotal();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [recipientName, setRecipientName] = useState(currentUser?.fullName || 'রাকিব হাসান');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '01712-345678');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা');
  const [deliveryArea, setDeliveryArea] = useState(currentUser?.area || 'উত্তরা');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_BKASH'>('COD');
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDhaka = district.toLowerCase().includes('dhaka') || district.includes('ঢাকা');
  const deliveryFee = cartItems.length > 0 ? (isDhaka ? 80 : 130) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleUpdateQty = (productId: string, delta: number) => {
    marketplaceStore.updateCartQuantity(productId, delta);
  };

  const handleRemove = (productId: string) => {
    marketplaceStore.removeFromCart(productId);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      sellerId: item.product.sellerId || 'seller-1'
    }));

    const order = marketplaceStore.createProductOrder({
      customerId: currentUser?.id || 'guest-user',
      customerName: recipientName,
      customerPhone: recipientPhone,
      deliveryAddress,
      district,
      thana: deliveryArea,
      area: deliveryArea,
      items: orderItems,
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE_BKASH'
    });

    setLastOrderNumber(order.orderNumber);
    marketplaceStore.clearCart();
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4e20b8]/10 text-[#4e20b8] flex items-center justify-center font-bold">
                <ShoppingCart size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">আপনার শপিং ব্যাগ (Cart)</h3>
                <p className="text-[11px] text-slate-500 font-medium">{cartCount} টি আইটেম যুক্ত রয়েছে</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {step === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 px-4 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-50 text-[#4e20b8] flex items-center justify-center">
                      <ShoppingBag size={36} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">আপনার কার্ট বর্তমানে খালি</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        qaaga.com থেকে প্রয়োজনীয় টুলস, হার্ডওয়্যার ও ইলেকট্রনিক্স অর্ডার করতে পণ্য ব্রাউজ করুন।
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('products');
                      }}
                      className="bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>পণ্যসমূহ দেখুন</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs text-slate-500">
                      <span>নির্বাচিত পণ্যসমূহ</span>
                      <button
                        onClick={() => marketplaceStore.clearCart()}
                        className="text-rose-500 hover:text-rose-700 font-medium text-[11px] cursor-pointer"
                      >
                        সব মুছুন
                      </button>
                    </div>

                    {cartItems.map(({ product, quantity }) => {
                      const price = product.discountPrice || product.price;
                      return (
                        <div
                          key={product.id}
                          className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
                            alt={product.title}
                            className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200/80 p-1 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                                {product.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {product.sellerShopName || 'qaaga Verified Store'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50">
                              <div className="text-xs font-black text-[#ff6d00]">
                                ৳ {price * quantity}
                                {quantity > 1 && (
                                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                                    (৳ {price}/unit)
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                  <button
                                    onClick={() => handleUpdateQty(product.id, -1)}
                                    className="p-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold px-2 text-slate-800">{quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQty(product.id, 1)}
                                    className="p-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemove(product.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Delivery notice */}
                    <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-slate-700 flex items-center gap-2">
                      <Truck size={16} className="text-[#4e20b8] shrink-0" />
                      <span>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে।</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
                  <MapPin size={14} className="text-[#4e20b8]" />
                  <span>ডেলিভারি ঠিকানা ও তথ্য</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      প্রাপকের পূর্ণ নাম (Full Name) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                      />
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      মোবাইল নম্বর (Phone) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        required
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                      />
                      <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">জেলা (District)</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                      >
                        <option value="Dhaka">ঢাকা (Dhaka)</option>
                        <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                        <option value="Sylhet">সিলেট (Sylhet)</option>
                        <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                        <option value="Khulna">খুলনা (Khulna)</option>
                        <option value="Barisal">বরিশাল (Barisal)</option>
                        <option value="Rangpur">রংপুর (Rangpur)</option>
                        <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">এরিয়া / থানা</label>
                      <input
                        type="text"
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      সম্পূর্ণ ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নং) *
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      placeholder="বাড়ি, রোড, ফ্লোর বিস্তারিত লিখুন..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4e20b8] focus:bg-white outline-none resize-none"
                    />
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      পেমেন্ট পদ্ধতি (Payment Method)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'COD'
                            ? 'border-[#4e20b8] bg-purple-50/70 text-[#4e20b8] font-bold'
                            : 'border-slate-200 text-slate-700 bg-white'
                        }`}
                      >
                        <Truck size={15} />
                        <span className="text-xs">ক্যাশ অন ডেলিভারি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ONLINE_BKASH')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'ONLINE_BKASH'
                            ? 'border-[#ff6d00] bg-orange-50 text-[#ff6d00] font-bold'
                            : 'border-slate-200 text-slate-700 bg-white'
                        }`}
                      >
                        <CreditCard size={15} />
                        <span className="text-xs">বিকাশ / অনলাইন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-10 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    অর্ডার নাম্বার: <strong className="text-slate-800">{lastOrderNumber}</strong>
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>প্রাপক:</span>
                    <strong className="text-slate-900">{recipientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>মোবাইল:</span>
                    <strong className="text-slate-900">{recipientPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>পেমেন্ট মোড:</span>
                    <strong className="text-[#4e20b8]">
                      {paymentMethod === 'COD' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'বিকাশ অনলাইন'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি এরিয়া:</span>
                    <span>{deliveryArea}, {district}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('customer_dashboard');
                    }}
                    className="w-full bg-[#4e20b8] hover:bg-[#41189e] text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    কাস্টমার ড্যাশবোর্ডে ট্র্যাক করুন
                  </button>
                  <button
                    onClick={() => {
                      setStep('cart');
                      onClose();
                      onNavigate('products');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    আরও কেনাকাটা করুন
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Summary Actions */}
          {cartItems.length > 0 && step !== 'success' && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span>৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-[10px] text-slate-400">({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'})</span>
                  </span>
                  <span>৳ {deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-[#ff6d00]">৳ {grandTotal}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-[#ff6d00] hover:bg-[#ea6000] text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>চেকআউট করুন (Proceed to Checkout)</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="p-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex-1 bg-[#ff6d00] hover:bg-[#ea6000] text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>অর্ডার কনফার্ম করুন (৳ {grandTotal})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
