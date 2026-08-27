import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  Package,
  TrendingUp,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  Star,
  Edit3,
  Trash2,
  Eye,
  Store,
  BadgeCheck,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Settings,
  Phone,
  RotateCcw,
  Clock,
  Send,
  SlidersHorizontal,
  X,
  CreditCard,
  Building2,
  ChevronRight,
  Sparkles,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { Product, ProductOrder, SellerStore, SellerPayoutRequest, SellerReview } from '../types';
import { RatingStars } from '../components/common/RatingStars';

interface SellerDashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

const PRESET_PRODUCT_IMAGES = [
  { label: 'Cordless Drill', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smart Home Plug', url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80' },
  { label: 'Air Purifier', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80' },
  { label: 'Digital Multimeter', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'CCTV Camera', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Power Tool Set', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80' }
];

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  
  const [allStores, setAllStores] = useState<SellerStore[]>(() => marketplaceStore.getSellerStores());
  const [selectedSellerId, setSelectedSellerId] = useState<string>(() => {
    const stores = marketplaceStore.getSellerStores();
    const matched = stores.find(s => s.userId === currentUser?.id || s.id === currentUser?.id);
    return matched ? matched.id : (stores[0]?.id || 'seller-1');
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payouts' | 'settings' | 'reviews'>('overview');
  
  // Store Data
  const currentStore = useMemo(() => {
    return allStores.find(s => s.id === selectedSellerId) || allStores[0];
  }, [allStores, selectedSellerId]);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [payouts, setPayouts] = useState<SellerPayoutRequest[]>([]);
  const [reviews, setReviews] = useState<SellerReview[]>([]);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Tools & Hardware',
    price: 2500,
    discountPrice: 2200,
    stock: 20,
    sku: '',
    warranty: '১ বছরের ব্র্যান্ড রিপ্লেসমেন্ট ওয়ারেন্টি',
    deliveryInfo: 'ঢাকায় ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টা',
    description: '',
    images: [PRESET_PRODUCT_IMAGES[0].url],
    inStock: true,
    isFeatured: false
  });

  // Payout Request Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(5000);
  const [payoutMethod, setPayoutMethod] = useState<'BKASH' | 'NAGAD' | 'BANK'>('BKASH');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    district: 'ঢাকা',
    area: 'মিরপুর ১০',
    address: '',
    shopBio: '',
    shopLogo: '',
    shopBanner: '',
    tradeLicenseNumber: '',
    deliveryPolicy: '',
    returnPolicy: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankRoutingNumber: '',
    bkashMerchantNumber: ''
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Sync Data
  const refreshAllData = () => {
    const stores = marketplaceStore.getSellerStores();
    setAllStores(stores);

    const store = stores.find(s => s.id === selectedSellerId) || stores[0];
    if (store) {
      const prods = marketplaceStore.getProducts().filter(
        p => p.sellerId === store.id || p.sellerId === store.userId || p.sellerShopName === store.shopName
      );
      setProducts(prods);

      const ords = marketplaceStore.getOrders().filter(
        o => o.items.some(i => {
          const prod = marketplaceStore.getProductById(i.productId);
          return prod && (prod.sellerId === store.id || prod.sellerId === store.userId || prod.sellerShopName === store.shopName);
        })
      );
      setOrders(ords.length > 0 ? ords : marketplaceStore.getOrders());

      const payReqs = marketplaceStore.getSellerPayouts(store.id);
      setPayouts(payReqs);

      const revs = marketplaceStore.getSellerReviews(store.id);
      setReviews(revs);

      setSettingsForm({
        shopName: store.shopName || '',
        ownerName: store.ownerName || '',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        district: store.district || 'ঢাকা',
        area: store.area || 'মিরপুর',
        address: store.address || '',
        shopBio: store.shopBio || '',
        shopLogo: store.shopLogo || '',
        shopBanner: store.shopBanner || '',
        tradeLicenseNumber: store.tradeLicenseNumber || '',
        deliveryPolicy: store.deliveryPolicy || 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি।',
        returnPolicy: store.returnPolicy || '৭ দিনের মধ্যে ত্রুটিপূর্ণ পণ্যে সহজ রিপ্লেসমেন্ট।',
        bankAccountName: store.bankAccountName || '',
        bankAccountNumber: store.bankAccountNumber || '',
        bankName: store.bankName || '',
        bankRoutingNumber: store.bankRoutingNumber || '',
        bkashMerchantNumber: store.bkashMerchantNumber || ''
      });
    }
  };

  useEffect(() => {
    refreshAllData();
    const unsub = marketplaceStore.subscribe(refreshAllData);
    return () => unsub();
  }, [selectedSellerId]);

  // Derived metrics
  const totalSalesAmount = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCatFilter === 'all' || p.category === productCatFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCatFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter === 'all') return true;
      return o.orderStatus === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      category: 'Tools & Hardware',
      price: 2500,
      discountPrice: 2200,
      stock: 20,
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      warranty: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
      deliveryInfo: 'ঢাকায় ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টা',
      description: 'অরিজিনাল ব্র্যান্ডের গুণগত মানসম্মত পণ্য। ফুল কিট এক্সেসরিজ অন্তর্ভুক্ত।',
      images: [PRESET_PRODUCT_IMAGES[0].url],
      inStock: true,
      isFeatured: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title,
      category: prod.category,
      price: prod.price,
      discountPrice: prod.discountPrice || prod.price,
      stock: prod.stock,
      sku: prod.sku,
      warranty: prod.warranty || '১ বছরের অফিসিয়াল ওয়ারেন্টি',
      deliveryInfo: prod.deliveryInfo || 'ঢাকায় ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টা',
      description: prod.description,
      images: prod.images || [PRESET_PRODUCT_IMAGES[0].url],
      inStock: prod.inStock ?? true,
      isFeatured: prod.isFeatured ?? false
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim() || !currentStore) return;

    if (editingProductId) {
      marketplaceStore.updateProduct(editingProductId, {
        ...productForm,
        sellerShopName: currentStore.shopName
      });
    } else {
      marketplaceStore.addProduct({
        ...productForm,
        sellerId: currentStore.id,
        sellerShopName: currentStore.shopName,
        isApproved: true,
        rating: 5.0,
        reviewCount: 0
      });
    }

    setIsProductModalOpen(false);
    setEditingProductId(null);
  };

  const handleDeleteProduct = (prodId: string, title: string) => {
    if (confirm(`আপনি কি "${title}" প্রোডাক্টটি আপনার স্টোর থেকে মুছে ফেলতে চান?`)) {
      marketplaceStore.deleteProduct(prodId);
    }
  };

  const handleToggleStock = (prodId: string) => {
    marketplaceStore.toggleProductInStock(prodId);
  };

  const handleToggleFeatured = (prodId: string) => {
    marketplaceStore.toggleProductFeatured(prodId);
  };

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, nextStatus: any) => {
    marketplaceStore.updateOrderStatus(orderId, nextStatus, `মার্চেন্ট (${currentStore?.shopName}) কর্তৃক স্ট্যাটাস আপডেট`);
  };

  // Payout request submission
  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || payoutAmount <= 0) return;

    if (payoutAmount > (currentStore.availableBalance || 0)) {
      alert(`আপনার বর্তমান উত্তোলনের উপযোগী ব্যালেন্স ৳ ${(currentStore.availableBalance || 0).toLocaleString()}। আপনি ব্যালেন্সের অতিরিক্ত উত্তোলন করতে পারবেন না।`);
      return;
    }

    marketplaceStore.requestSellerPayout({
      sellerId: currentStore.id,
      shopName: currentStore.shopName,
      amount: payoutAmount,
      method: payoutMethod,
      accountDetails: payoutMethod === 'BANK' ? `${payoutBankName} - ${payoutAccount}` : `${payoutMethod} (${payoutAccount})`,
      note: payoutNote
    });

    setIsPayoutModalOpen(false);
    setPayoutNote('');
    alert('টাকা উত্তোলনের আবেদন সফল হয়েছে! অ্যাডমিন কর্তৃক ভেরিফাই করে অল্প সময়ের মধ্যে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেওয়া হবে।');
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    marketplaceStore.updateSellerStore(currentStore.id, settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={currentStore?.shopLogo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
              alt={currentStore?.shopName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-white shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentStore?.shopName}
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 shadow-xs">
                  <BadgeCheck size={12} /> ভেরিফাইড সেলার পোর্টাল
                </span>
              </div>
              
              <div className="text-xs text-slate-300 flex items-center gap-3 mt-1 flex-wrap">
                <span>মালিক: <strong>{currentStore?.ownerName}</strong></span>
                <span>&bull;</span>
                <span>ফোন: {currentStore?.phone}</span>
                <span>&bull;</span>
                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                  ★ {currentStore?.rating || 5.0} ({reviews.length} রিভিউ)
                </span>
              </div>

              {/* Multi-store selector if available */}
              {allStores.length > 1 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">সেলার প্রোফাইল পরিবর্তন:</span>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  >
                    {allStores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.shopName} ({s.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('seller_store', { sellerId: currentStore?.id })}
              className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Store size={15} />
              <span>পাবলিক স্টোর দেখুন</span>
              <ExternalLink size={13} />
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="flex-1 sm:flex-none bg-[#4e20b8] hover:bg-[#3d1696] text-white font-black text-xs px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-purple-400/40"
            >
              <PlusCircle size={15} />
              <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', icon: TrendingUp },
          { id: 'products', label: `পণ্য তালিকা ও স্টক (${products.length})`, icon: Package },
          { id: 'orders', label: `অর্ডার ও কুরিয়ার ডিসপ্যাচ (${orders.length})`, icon: Truck },
          { id: 'payouts', label: `ওয়ালেট ও টাকা উত্তোলন (৳ ${(currentStore?.availableBalance || 0).toLocaleString()})`, icon: DollarSign },
          { id: 'reviews', label: `গ্রাহকদের রিভিউ (${reviews.length})`, icon: Star },
          { id: 'settings', label: 'শপ প্রোফাইল ও পলিসি সেটিংস', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>সর্বমোট বিক্রয়</span>
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                ৳ {totalSalesAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                লাইফটাইম সেলস হিস্ট্রি
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>উত্তোলনের উপযোগী ব্যালেন্স</span>
                <CreditCard size={16} className="text-[#4e20b8]" />
              </div>
              <div className="text-2xl font-black text-[#4e20b8] mt-2">
                ৳ {(currentStore?.availableBalance || 0).toLocaleString()}
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="text-[11px] text-purple-700 hover:underline font-bold mt-1 cursor-pointer"
              >
                উত্তোলন আবেদন করুন &rarr;
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>গৃহীত অর্ডার সংখ্যা</span>
                <Truck size={16} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {orders.length} টি
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                ক্যাশ অন ডেলিভারি ও অনলাইন
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>তালিকাভুক্ত পণ্য (SKU)</span>
                <Package size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {products.length} টি
              </div>
              <div className="text-[11px] text-blue-700 font-semibold mt-1">
                সরাসরি লাইভ ক্যাটালগ
              </div>
            </div>
          </div>

          {/* Quick Courier Dispatch Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">সাম্প্রতিক কুরিয়ার ও শিপিং কিউ</h3>
                <p className="text-xs text-slate-500">গ্রাহকের অর্ডার প্রসেস করুন এবং ডেলিভারি স্ট্যাটাস আপডেট দিন</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#4e20b8] hover:underline"
              >
                সব অর্ডার দেখুন ({orders.length}) &rarr;
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">কোনো অর্ডার অপেক্ষমান নেই।</div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map(ord => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        গ্রাহক: <strong>{ord.customerName}</strong> ({ord.customerPhone}) &bull; {ord.deliveryAddress}, {ord.area}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        পণ্য: {ord.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">৳ {ord.totalAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-amber-800 font-bold">{ord.paymentMethod}</div>
                      </div>

                      {ord.orderStatus === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'PROCESSING')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          কনফার্ম করুন
                        </button>
                      )}
                      {ord.orderStatus === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'SHIPPED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                        >
                          কুরিয়ারে পাঠান
                        </button>
                      )}
                      {ord.orderStatus === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                        >
                          ডেলিভার্ড মার্ক করুন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT (CRUD) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="প্রোডাক্ট বা SKU খুঁজুন..."
                className="w-full bg-slate-50 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle size={15} />
                <span>+ নতুন পণ্য যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">পণ্য ও ছবি</th>
                    <th className="p-4">ক্যাটাগরি & SKU</th>
                    <th className="p-4">বিক্রয়মূল্য</th>
                    <th className="p-4">স্টক সংখ্যা</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        কোনো প্রোডাক্ট পাওয়া যায়নি। "+ নতুন পণ্য যোগ করুন" বাটনে ক্লিক করে পণ্য লিস্টিং শুরু করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || PRESET_PRODUCT_IMAGES[0].url}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">{prod.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">রেটিং: ★ {prod.rating} ({prod.reviewCount} রিভিউ)</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[10px] block w-fit">
                            {prod.category}
                          </span>
                          <span className="font-mono text-slate-500 text-[10px] mt-1 block">
                            {prod.sku}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-black text-slate-900">
                            ৳ {(prod.discountPrice || prod.price).toLocaleString()}
                          </div>
                          {prod.discountPrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ৳ {prod.price.toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className={`font-bold ${prod.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {prod.stock} টি
                          </div>
                        </td>

                        <td className="p-4 space-y-1">
                          <button
                            onClick={() => handleToggleStock(prod.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold block cursor-pointer transition-colors ${
                              prod.inStock !== false && prod.stock > 0
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {prod.inStock !== false && prod.stock > 0 ? 'স্টকে আছে' : 'স্টক আউট'}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleFeatured(prod.id)}
                              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                prod.isFeatured
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="ফিচার্ড ডিল টগল"
                            >
                              <Sparkles size={14} />
                            </button>

                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-2 rounded-xl bg-purple-50 text-[#4e20b8] hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
                              title="এডিট করুন"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.title)}
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Order Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            {['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                  orderStatusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'সব অর্ডার' : st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">অর্ডার তালিকা ({filteredOrders.length})</h3>
              <span className="text-xs text-slate-500">স্টেটাস পরিবর্তনের সাথে সাথে ক্রেতা SMS/নোটিফিকেশন পাবেন</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredOrders.map(ord => (
                <div key={ord.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{ord.orderNumber}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-[#4e20b8]">
                        {ord.orderStatus}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      ক্রেতা: <strong>{ord.customerName}</strong> ({ord.customerPhone})
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      ঠিকানা: {ord.deliveryAddress}, {ord.area}, {ord.district}
                    </div>

                    <div className="text-slate-600 text-[11px] pt-1">
                      আইটেমস: {ord.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-base">৳ {ord.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-amber-800 font-bold">{ord.paymentMethod}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: WALLET & PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          
          {/* Wallet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md space-y-3">
              <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">উত্তোলনের উপযোগী ব্যালেন্স</span>
              <div className="text-3xl font-black">
                ৳ {(currentStore?.availableBalance || 0).toLocaleString()}
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                + টাকা উত্তোলন রিকোয়েস্ট
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">প্রসেসিং পেন্ডিং ব্যালেন্স</span>
              <div className="text-2xl font-black text-amber-700">
                ৳ {(currentStore?.pendingBalance || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">অ্যাডমিন কর্তৃক ভেরিফিকেশনের পর পাঠানো হবে।</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">সর্বমোট পরিশোধিত</span>
              <div className="text-2xl font-black text-emerald-700">
                ৳ {payouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">সরাসরি বিকাশ ও ব্যাংক ট্রান্সফারে ছাড়কৃত।</p>
            </div>
          </div>

          {/* Payout Requests History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">টাকা উত্তোলনের ইতিহাস ({payouts.length})</h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {payouts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">এখনো কোনো উত্তোলন রিকোয়েস্ট তৈরি করা হয়নি।</div>
              ) : (
                payouts.map(pay => (
                  <div key={pay.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">
                        ৳ {pay.amount.toLocaleString()} &bull; <span className="text-purple-800">{pay.method}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        অ্যাকাউন্ট: {pay.accountDetails} &bull; তারিখ: {new Date(pay.requestedAt).toLocaleDateString('bn-BD')}
                      </div>
                      {pay.transactionRef && (
                        <div className="text-emerald-700 font-mono text-[10px] mt-0.5">
                          Trx ID: {pay.transactionRef}
                        </div>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      pay.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pay.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-800'
                        : pay.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">গ্রাহকদের ফিডব্যাক ও রেটিং ({reviews.length})</h3>
            
            <div className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">এখনো কোনো রিভিউ নেই।</div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="py-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{rev.customerName}</div>
                      <RatingStars rating={rev.rating} />
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                    {rev.productName && (
                      <div className="text-[10px] text-slate-400">পণ্য: {rev.productName}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">মার্চেন্ট শপ সেটিংস ও তথ্য হালনাগাদ</h3>
              <p className="text-xs text-slate-500">আপনার পাবলিক স্টোর ও পণ্যের পৃষ্ঠায় এই তথ্যগুলো সরাসরি প্রদর্শিত হবে</p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </div>

          {settingsSavedMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>শপ সেটিংস ও যোগাযোগের তথ্য সফলভাবে হালনাগাদ হয়েছে!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">দোকান / শপের নাম:</label>
              <input
                type="text"
                value={settingsForm.shopName}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">স্বত্বাধিকারীর নাম:</label>
              <input
                type="text"
                value={settingsForm.ownerName}
                onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">হটলাইন ফোন নম্বর (সরাসরি কল):</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর:</label>
              <input
                type="text"
                value={settingsForm.whatsapp}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">জেলা ও থানা / এলাকা:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settingsForm.district}
                  onChange={(e) => setSettingsForm({ ...settingsForm, district: e.target.value })}
                  placeholder="জেলা (যেমন: ঢাকা)"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  value={settingsForm.area}
                  onChange={(e) => setSettingsForm({ ...settingsForm, area: e.target.value })}
                  placeholder="এলাকা (যেমন: মিরপুর ১০)"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">দোকানের বিস্তারিত ঠিকানা:</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                placeholder="দোকান নং #১২, লেভেল ৩"
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">শপ লোগো ইমেজ URL:</label>
              <input
                type="text"
                value={settingsForm.shopLogo}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopLogo: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">শপ কভার ব্যানার ইমেজ URL:</label>
              <input
                type="text"
                value={settingsForm.shopBanner}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopBanner: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">দোকানের পরিচিতি ও বায়ো (Bio):</label>
              <textarea
                rows={3}
                value={settingsForm.shopBio}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopBio: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ডেলিভারি পলিসি বিবরণ:</label>
              <textarea
                rows={2}
                value={settingsForm.deliveryPolicy}
                onChange={(e) => setSettingsForm({ ...settingsForm, deliveryPolicy: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">রিটার্ন ও রিপ্লেসমেন্ট পলিসি বিবরণ:</label>
              <textarea
                rows={2}
                value={settingsForm.returnPolicy}
                onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicy: e.target.value })}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#4e20b8] hover:bg-[#3d1696] text-white font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProductId ? 'পণ্য সম্পাদনা করুন (Edit Product)' : 'নতুন পণ্য যুক্ত করুন (Add New Product)'}
                </h3>
                <p className="text-xs text-slate-500">আপনার শপ ক্যাটালগে পণ্যটি সরাসরি যুক্ত হবে</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">পণ্যের শিরোনাম (Product Title):</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="উদা: Bosch Professional 12V Cordless Drill"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium text-xs"
                  >
                    <option value="Tools & Hardware">Tools & Hardware (টুলস ও হার্ডওয়্যার)</option>
                    <option value="Home & Kitchen">Home & Kitchen (হোম অ্যাপ্লায়েন্স)</option>
                    <option value="Electronics & IT">Electronics & IT (ইলেকট্রনিক্স)</option>
                    <option value="Smart Gadgets">Smart Gadgets (স্মার্ট গ্যাজেট)</option>
                    <option value="E-Books & Guides">E-Books & Guides (ডিজিটাল বই)</option>
                    <option value="Used & Refurbished">Used & Refurbished (ব্যবহৃত পণ্য)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মডেল / SKU নম্বর:</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="SKU-XXX"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মূল মূল্য (৳):</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অফার মূল্য (৳):</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">স্টক সংখ্যা:</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              {/* Preset Image Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">পণ্যের ছবি (URL বা প্রিসেট নির্বাচন করুন):</label>
                <input
                  type="text"
                  value={productForm.images[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] mb-2"
                />

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, images: [preset.url] })}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                        productForm.images[0] === preset.url ? 'border-[#4e20b8] ring-2 ring-purple-300' : 'border-slate-200'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ওয়ারেন্টি বিবরণ:</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    placeholder="১ বছরের ব্র্যান্ড রিপ্লেসমেন্ট"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডেলিভারি সময়:</label>
                  <input
                    type="text"
                    value={productForm.deliveryInfo}
                    onChange={(e) => setProductForm({ ...productForm, deliveryInfo: e.target.value })}
                    placeholder="২৪-৪৮ ঘণ্টা"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পণ্যের বিবরণ ও স্পেসিফিকেশন:</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="পণ্য সম্পর্কে বিস্তারিত লিখুন..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="rounded text-[#4e20b8]"
                    />
                    <span>ফিচার্ড ডিল হিসেবে দেখান</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold cursor-pointer shadow-md"
                  >
                    {editingProductId ? 'আপডেট করুন' : 'পণ্য যোগ করুন'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REQUEST PAYOUT MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">টাকা উত্তোলনের আবেদন (Request Payout)</h3>
                <p className="text-xs text-slate-500">
                  বর্তমান ব্যালেন্স: <strong>৳ {(currentStore?.availableBalance || 0).toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">উত্তোলনের পরিমাণ (৳):</label>
                <input
                  type="number"
                  max={currentStore?.availableBalance || 0}
                  min={500}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-black text-sm text-[#4e20b8]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড নির্বাচন করুন:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BKASH', 'NAGAD', 'BANK'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayoutMethod(method)}
                      className={`p-2 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        payoutMethod === method
                          ? 'bg-[#4e20b8] text-white border-[#4e20b8]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {payoutMethod === 'BANK' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ব্যাংকের নাম ও শাখা:</label>
                    <input
                      type="text"
                      value={payoutBankName}
                      onChange={(e) => setPayoutBankName(e.target.value)}
                      placeholder="উদা: DBBL, Mirpur Branch"
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ব্যাংক অ্যাকাউন্ট নম্বর:</label>
                    <input
                      type="text"
                      value={payoutAccount}
                      onChange={(e) => setPayoutAccount(e.target.value)}
                      placeholder="Account No & Title"
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{payoutMethod} পার্সোনাল / মার্চেন্ট নম্বর:</label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট বা মন্তব্য (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="যেমন: জরুরি উইথড্রয়াল"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  রিকোয়েস্ট সাবমিট করুন
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
