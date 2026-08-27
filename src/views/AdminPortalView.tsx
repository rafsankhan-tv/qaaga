import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Settings,
  Layers,
  Users,
  DollarSign,
  Send,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Check,
  FileText,
  Lock,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  ExternalLink,
  Star,
  Search,
  LayoutGrid,
  Heart,
  MessageSquare,
  Flame,
  Smile,
  Bot,
  Globe,
  UploadCloud,
  RotateCcw,
  Copy,
  CheckCircle,
  Store,
  BadgeCheck,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Building2,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { RenderCategoryIcon } from '../components/CategoryIconHelper';
import { CuteCatAvatarSvg } from '../components/CuteCatAvatarSvg';
import { CUTE_CAT_SKIN_PRESETS } from '../data/cuteCatData';
import {
  FAVICON_PRESETS,
  getActiveFaviconHref,
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
  DEFAULT_SITE_DESCRIPTION
} from '../data/faviconPresets';
import {
  ServiceRequest,
  ProviderOffer,
  ServiceCategory,
  PlatformSystemSettings,
  HeroBannerSlide,
  CategoryShowcaseSection,
  ShowcaseCardItem,
  CuteCatAssistantSettings,
  CatQuickChip,
  FeedBannerSlide,
  SellerStore,
  SellerPayoutRequest
} from '../types';

interface AdminPortalViewProps {
  onNavigate: (view: string, params?: any) => void;
  initialTab?: string;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onNavigate, initialTab }) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'REQUEST_MODERATION'
    | 'OFFER_MODERATION'
    | 'SELLERS'
    | 'SELLER_PAYOUTS'
    | 'BANNERS'
    | 'FEED_SLIDER'
    | 'SHOWCASES'
    | 'CUTE_CAT'
    | 'CATEGORIES'
    | 'PROVIDERS'
    | 'SETTINGS'
    | 'BRANDING'
    | 'FINANCES'
  >((initialTab as any) || 'REQUEST_MODERATION');

  const [requests, setRequests] = useState(() => marketplaceStore.getRequests());
  const [offers, setOffers] = useState(() => marketplaceStore.getOffers());
  const [categories, setCategories] = useState(() => marketplaceStore.getCategories());
  const [providers, setProviders] = useState(() => marketplaceStore.getProviders());
  const [bookings, setBookings] = useState(() => marketplaceStore.getBookings());
  const [settings, setSettings] = useState(() => marketplaceStore.getSettings());
  const [heroBanners, setHeroBanners] = useState(() => marketplaceStore.getHeroBanners());
  const [feedSlides, setFeedSlides] = useState<FeedBannerSlide[]>(() =>
    marketplaceStore.getAllFeedSlides()
  );
  const [showcases, setShowcases] = useState<CategoryShowcaseSection[]>(() =>
    marketplaceStore.getCategoryShowcases()
  );
  const [cuteCatSettings, setCuteCatSettings] = useState<CuteCatAssistantSettings>(() =>
    marketplaceStore.getCuteCatSettings()
  );
  const [sellerStores, setSellerStores] = useState<SellerStore[]>(() =>
    marketplaceStore.getSellerStores()
  );
  const [sellerPayouts, setSellerPayouts] = useState<SellerPayoutRequest[]>(() =>
    marketplaceStore.getAllSellerPayouts()
  );

  // Seller Management Modal & Form State
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerForm, setSellerForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    district: 'ঢাকা',
    area: 'মিরপুর',
    address: '',
    shopBio: '',
    shopLogo: '',
    shopBanner: '',
    isVerified: true,
    isApproved: true,
    hasOfficialBadge: false,
    tradeLicenseNumber: '',
    deliveryPolicy: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টা',
    returnPolicy: '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি'
  });

  // Payout Moderation Modal State
  const [selectedPayoutForProcess, setSelectedPayoutForProcess] = useState<SellerPayoutRequest | null>(null);
  const [payoutProcessStatus, setPayoutProcessStatus] = useState<'APPROVED' | 'PAID' | 'REJECTED'>('PAID');
  const [payoutTrxRef, setPayoutTrxRef] = useState('');
  const [payoutAdminNote, setPayoutAdminNote] = useState('');

  // Site Branding & Favicon Management Form State
  const [brandingForm, setBrandingForm] = useState({
    siteTitle: settings.siteTitle || DEFAULT_SITE_TITLE,
    siteName: settings.siteName || DEFAULT_SITE_NAME,
    siteTagline: settings.siteTagline || DEFAULT_SITE_TAGLINE,
    siteDescription: settings.siteDescription || DEFAULT_SITE_DESCRIPTION,
    themeColor: settings.themeColor || '#7c3aed',
    showTaglineInBrowserTitle: settings.showTaglineInBrowserTitle ?? true
  });
  const [customFaviconUrlInput, setCustomFaviconUrlInput] = useState(
    settings.faviconType === 'custom_url' ? settings.faviconUrl : ''
  );
  const [faviconUploadPreview, setFaviconUploadPreview] = useState<string>(
    settings.customFaviconUpload || ''
  );
  const [brandingSuccessMsg, setBrandingSuccessMsg] = useState<string | null>(null);
  const [copiedDataUri, setCopiedDataUri] = useState(false);

  // Feed Banner Slider Form State
  const [isAddingFeedSlide, setIsAddingFeedSlide] = useState(false);
  const [editingFeedSlideId, setEditingFeedSlideId] = useState<string | null>(null);
  const [feedSlideForm, setFeedSlideForm] = useState<Omit<FeedBannerSlide, 'id'>>({
    titleBangla: '',
    subtitleBangla: '',
    badgeBangla: '🌟 লাইভ কমিউনিটি হাব',
    highlightTextBangla: '১০০% ভেরিফাইড প্রফেশনাল',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]',
    accentColor: '#fbbf24',
    ctaTextBangla: '+ নতুন পোস্ট / আপডেট দিন',
    targetView: 'create_post',
    secondaryCtaTextBangla: 'জনপ্রিয় প্রফেশনাল এক্সপ্লোর',
    secondaryTargetView: 'feed_explore',
    isPublished: true,
    order: 1,
    themeTag: 'community'
  });

  // Cute Cat Assistant Form State
  const [newCatMessage, setNewCatMessage] = useState('');
  const [editingMessageIdx, setEditingMessageIdx] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [newChipLabel, setNewChipLabel] = useState('');
  const [newChipView, setNewChipView] = useState('doctors');

  // Category addition form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatBangla, setNewCatBangla] = useState('');
  const [newCatSubcategories, setNewCatSubcategories] = useState('Installation, Maintenance, Repair, Consultation');
  const [newCatType, setNewCatType] = useState<any>('SERVICE');

  // Banner slide form state
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Omit<HeroBannerSlide, 'id'>>({
    categoryKey: 'repair',
    titleBangla: '',
    subtitleBangla: '',
    badgeBangla: 'ভেরিফাইড স্পেশালিস্ট',
    ratingText: '৪.৯ ★ (১০০+ রিভিউ)',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'service_request',
    themeColor: '#0284c7',
    accentGradient: 'from-sky-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 1
  });

  // Showcase Section Form State
  const [isAddingShowcase, setIsAddingShowcase] = useState(false);
  const [editingShowcaseId, setEditingShowcaseId] = useState<string | null>(null);
  const [showcaseForm, setShowcaseForm] = useState<Omit<CategoryShowcaseSection, 'id' | 'items'>>({
    categoryKey: 'home_service',
    titleBangla: '',
    titleEnglish: '',
    subtitleBangla: '',
    bannerImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=300&q=80',
    bannerTagline: '২০% অগ্রিমে বুকিং',
    themeColor: '#4e20b8',
    iconName: 'Wrench',
    tagGroup: 'HOME_SERVICE',
    viewAllTargetView: 'service_request',
    viewAllButtonTextBangla: 'সব সার্ভিস ও রেট দেখুন',
    isFeatured: false,
    isActive: true,
    order: 1
  });

  // Individual Card Item Modal State
  const [selectedShowcaseForItems, setSelectedShowcaseForItems] = useState<CategoryShowcaseSection | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<Omit<ShowcaseCardItem, 'id'>>({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    rating: '4.8',
    reviewCount: '150',
    priceOrSalary: '৫০০',
    unitText: 'শুরু',
    badge: 'সেরা সার্ভিস',
    ctaText: 'বিস্তারিত দেখুন',
    targetView: 'service_request',
    targetParams: {},
    description: '',
    features: [],
    providerName: '',
    providerRole: '',
    providerAvatar: '',
    providerPhone: '01700000000',
    providerExperience: '৩+ বছর অভিজ্ঞতা',
    deliveryTime: '২৪-৪৮ ঘন্টা',
    warrantyOrGuarantee: '১০০% কোয়ালিটি গ্যারান্টি',
    advancePercent: 20
  });

  // Dispatch selector
  const [selectedReqForDispatch, setSelectedReqForDispatch] = useState<ServiceRequest | null>(null);
  const [dispatchProviderIds, setDispatchProviderIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      setRequests(marketplaceStore.getRequests());
      setOffers(marketplaceStore.getOffers());
      setCategories(marketplaceStore.getCategories());
      setProviders(marketplaceStore.getProviders());
      setBookings(marketplaceStore.getBookings());
      setSettings(marketplaceStore.getSettings());
      setHeroBanners(marketplaceStore.getHeroBanners());
      setFeedSlides(marketplaceStore.getAllFeedSlides());
      const updatedShowcases = marketplaceStore.getCategoryShowcases();
      setShowcases(updatedShowcases);
      setCuteCatSettings(marketplaceStore.getCuteCatSettings());
      setSellerStores(marketplaceStore.getSellerStores());
      setSellerPayouts(marketplaceStore.getAllSellerPayouts());

      // Keep selected showcase in sync if open
      if (selectedShowcaseForItems) {
        const found = updatedShowcases.find((s) => s.id === selectedShowcaseForItems.id);
        if (found) setSelectedShowcaseForItems(found);
      }
    };
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, [selectedShowcaseForItems?.id]);

  // Seller Management Handlers
  const handleStartAddSeller = () => {
    setEditingSellerId(null);
    setSellerForm({
      shopName: '',
      ownerName: '',
      phone: '',
      whatsapp: '',
      district: 'ঢাকা',
      area: 'মিরপুর',
      address: '',
      shopBio: '',
      shopLogo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      shopBanner: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
      isVerified: true,
      isApproved: true,
      hasOfficialBadge: false,
      tradeLicenseNumber: `TRAD/DNCC/${Math.floor(100000 + Math.random() * 900000)}/2024`,
      deliveryPolicy: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ৭২ ঘণ্টা ক্যাশ অন ডেলিভারি।',
      returnPolicy: '৭ দিনের মধ্যে সহজ ফ্রি রিপ্লেসমেন্ট গ্যারান্টি।'
    });
    setIsSellerModalOpen(true);
  };

  const handleStartEditSeller = (seller: SellerStore) => {
    setEditingSellerId(seller.id);
    setSellerForm({
      shopName: seller.shopName,
      ownerName: seller.ownerName || '',
      phone: seller.phone,
      whatsapp: seller.whatsapp || seller.phone,
      district: seller.district || 'ঢাকা',
      area: seller.area || 'মিরপুর',
      address: seller.address || '',
      shopBio: seller.shopBio || '',
      shopLogo: seller.shopLogo || '',
      shopBanner: seller.shopBanner || '',
      isVerified: seller.isVerified,
      isApproved: seller.isApproved ?? true,
      hasOfficialBadge: seller.hasOfficialBadge || false,
      tradeLicenseNumber: seller.tradeLicenseNumber || '',
      deliveryPolicy: seller.deliveryPolicy || '',
      returnPolicy: seller.returnPolicy || ''
    });
    setIsSellerModalOpen(true);
  };

  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.shopName.trim() || !sellerForm.ownerName.trim()) return;

    if (editingSellerId) {
      marketplaceStore.updateSellerStore(editingSellerId, sellerForm);
    } else {
      marketplaceStore.addSellerStore({
        ...sellerForm,
        rating: 5.0,
        reviewCount: 0,
        availableBalance: 0,
        pendingBalance: 0
      });
    }

    setIsSellerModalOpen(false);
    setEditingSellerId(null);
  };

  const handleDeleteSeller = (sellerId: string, shopName: string) => {
    if (confirm(`Are you sure you want to remove merchant store "${shopName}" from the platform?`)) {
      marketplaceStore.deleteSellerStore(sellerId);
    }
  };

  const handleToggleSellerVerify = (sellerId: string) => {
    marketplaceStore.toggleSellerVerification(sellerId);
  };

  const handleToggleSellerApproval = (sellerId: string) => {
    marketplaceStore.toggleSellerApproval(sellerId);
  };

  const handleToggleSellerOfficialBadge = (sellerId: string) => {
    marketplaceStore.toggleSellerOfficialBadge(sellerId);
  };

  // Payout Moderation Handlers
  const handleOpenProcessPayout = (payout: SellerPayoutRequest) => {
    setSelectedPayoutForProcess(payout);
    setPayoutProcessStatus('PAID');
    setPayoutTrxRef(`TXN-${Date.now().toString(36).toUpperCase()}`);
    setPayoutAdminNote('অ্যাডমিন কর্তৃক অনুমোদিত ও পেমেন্ট সম্পন্ন হয়েছে।');
  };

  const handleConfirmProcessPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayoutForProcess) return;

    marketplaceStore.processSellerPayout(
      selectedPayoutForProcess.id,
      payoutProcessStatus,
      payoutTrxRef,
      payoutAdminNote
    );

    setSelectedPayoutForProcess(null);
  };

  const pendingRequests = requests.filter((r) => r.status === 'ADMIN_REVIEW');
  const pendingOffers = offers.filter((o) => o.status === 'ADMIN_REVIEW');

  const handleApproveAndDispatchRequest = (req: ServiceRequest) => {
    const targetIds = dispatchProviderIds.length > 0
      ? dispatchProviderIds
      : providers.filter((p) => p.serviceCategoryIds.includes(req.categoryId)).map((p) => p.id);

    marketplaceStore.adminApproveAndDispatchRequest(
      req.id,
      targetIds,
      currentUser?.fullName || 'QAAGA Admin'
    );
    setSelectedReqForDispatch(null);
    setDispatchProviderIds([]);
  };

  const handleApproveOffer = (offerId: string) => {
    marketplaceStore.adminApproveOffer(offerId, currentUser?.fullName || 'QAAGA Admin', 'Offer verified by QAAGA Moderation');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = `cat-${newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newCat: ServiceCategory = {
      id,
      name: newCatName.trim(),
      banglaName: newCatBangla.trim() || undefined,
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      iconName: 'Wrench',
      description: `Professional ${newCatName.trim()} services across Bangladesh`,
      subcategories: newCatSubcategories.split(',').map((s) => s.trim()).filter(Boolean),
      categoryType: newCatType,
      defaultAdvancePercent: 20,
      minPrice: 500,
      bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      isFeatured: false
    };

    marketplaceStore.addCategory(newCat);
    setNewCatName('');
    setNewCatBangla('');
  };

  // Banner Management Handlers
  const handleStartAddBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      categoryKey: 'repair',
      titleBangla: '',
      subtitleBangla: '',
      badgeBangla: 'ভেরিফাইড স্পেশালিস্ট',
      ratingText: '৪.৯ ★ (১০০+ রিভিউ)',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=750&q=80',
      targetView: 'service_request',
      themeColor: '#0284c7',
      accentGradient: 'from-sky-900/90 via-slate-900/80 to-slate-950/95',
      isActive: true,
      order: heroBanners.length + 1
    });
    setIsAddingBanner(true);
  };

  const handleStartEditBanner = (banner: HeroBannerSlide) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      categoryKey: banner.categoryKey,
      titleBangla: banner.titleBangla,
      subtitleBangla: banner.subtitleBangla,
      badgeBangla: banner.badgeBangla || 'ভেরিফাইড স্পেশালিস্ট',
      ratingText: banner.ratingText || '৪.৯ ★ (১০০+ রিভিউ)',
      imageUrl: banner.imageUrl,
      targetView: banner.targetView || 'service_request',
      themeColor: banner.themeColor || '#0284c7',
      accentGradient: banner.accentGradient || 'from-sky-900/90 via-slate-900/80 to-slate-950/95',
      isActive: banner.isActive !== false,
      order: banner.order
    });
    setIsAddingBanner(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.titleBangla.trim()) return;

    if (editingBannerId) {
      marketplaceStore.updateHeroBanner(editingBannerId, bannerForm);
    } else {
      marketplaceStore.addHeroBanner({
        ...bannerForm,
        order: heroBanners.length + 1
      });
    }

    setIsAddingBanner(false);
    setEditingBannerId(null);
  };

  const handleDeleteBanner = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete banner "${title}"?`)) {
      marketplaceStore.deleteHeroBanner(id);
    }
  };

  const handleToggleBanner = (id: string) => {
    marketplaceStore.toggleHeroBanner(id);
  };

  const handleMoveBanner = (id: string, direction: 'up' | 'down') => {
    marketplaceStore.moveHeroBannerOrder(id, direction);
  };

  // Feed Banner Slider Handlers
  const handleStartAddFeedSlide = () => {
    setEditingFeedSlideId(null);
    setFeedSlideForm({
      titleBangla: '',
      subtitleBangla: '',
      badgeBangla: '🌟 নতুন আপডেট',
      highlightTextBangla: 'ভেরিফাইড প্রফেশনাল',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]',
      accentColor: '#fbbf24',
      ctaTextBangla: '+ নতুন পোস্ট / আপডেট দিন',
      targetView: 'create_post',
      secondaryCtaTextBangla: 'জনপ্রিয় প্রফেশনাল এক্সপ্লোর',
      secondaryTargetView: 'feed_explore',
      isPublished: true,
      order: feedSlides.length + 1,
      themeTag: 'community'
    });
    setIsAddingFeedSlide(true);
  };

  const handleStartEditFeedSlide = (slide: FeedBannerSlide) => {
    setEditingFeedSlideId(slide.id);
    setFeedSlideForm({
      titleBangla: slide.titleBangla,
      subtitleBangla: slide.subtitleBangla,
      badgeBangla: slide.badgeBangla || '🌟 লাইভ কমিউনিটি',
      highlightTextBangla: slide.highlightTextBangla || '',
      imageUrl: slide.imageUrl || '',
      bgGradient: slide.bgGradient || 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]',
      accentColor: slide.accentColor || '#fbbf24',
      ctaTextBangla: slide.ctaTextBangla,
      targetView: slide.targetView,
      secondaryCtaTextBangla: slide.secondaryCtaTextBangla || '',
      secondaryTargetView: slide.secondaryTargetView || '',
      isPublished: slide.isPublished,
      order: slide.order,
      themeTag: slide.themeTag || 'community'
    });
    setIsAddingFeedSlide(true);
  };

  const handleSaveFeedSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedSlideForm.titleBangla.trim()) return;

    if (editingFeedSlideId) {
      marketplaceStore.updateFeedSlide(editingFeedSlideId, feedSlideForm);
    } else {
      marketplaceStore.createFeedSlide({
        ...feedSlideForm,
        order: feedSlides.length + 1
      });
    }

    setIsAddingFeedSlide(false);
    setEditingFeedSlideId(null);
  };

  const handleDeleteFeedSlide = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete feed slide "${title}"?`)) {
      marketplaceStore.deleteFeedSlide(id);
    }
  };

  const handleToggleFeedSlide = (id: string) => {
    marketplaceStore.toggleFeedSlideStatus(id);
  };

  const handleMoveFeedSlide = (id: string, direction: 'up' | 'down') => {
    const sorted = [...feedSlides].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex(s => s.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentSlide = sorted[index];
    const targetSlide = sorted[targetIndex];

    const currentOrder = currentSlide.order || index + 1;
    const targetOrder = targetSlide.order || targetIndex + 1;

    marketplaceStore.updateFeedSlide(currentSlide.id, { order: targetOrder });
    marketplaceStore.updateFeedSlide(targetSlide.id, { order: currentOrder });
  };

  const handleResetFeedSlides = () => {
    if (confirm('Are you sure you want to reset all feed slides to default presets?')) {
      marketplaceStore.resetFeedSlides();
    }
  };

  // Category Showcase Section Handlers
  const handleStartAddShowcase = () => {
    setEditingShowcaseId(null);
    setShowcaseForm({
      categoryKey: 'home_service',
      titleBangla: '',
      titleEnglish: '',
      subtitleBangla: '',
      bannerImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=300&q=80',
      bannerTagline: '২০% অগ্রিমে বুকিং',
      themeColor: '#4e20b8',
      iconName: 'Wrench',
      tagGroup: 'HOME_SERVICE',
      viewAllTargetView: 'service_request',
      viewAllButtonTextBangla: 'সব সার্ভিস ও রেট দেখুন',
      isFeatured: false,
      isActive: true,
      order: showcases.length + 1
    });
    setIsAddingShowcase(true);
  };

  const handleStartEditShowcase = (sec: CategoryShowcaseSection) => {
    setEditingShowcaseId(sec.id);
    setShowcaseForm({
      categoryKey: sec.categoryKey || 'home_service',
      titleBangla: sec.titleBangla,
      titleEnglish: sec.titleEnglish,
      subtitleBangla: sec.subtitleBangla || '',
      bannerImage: sec.bannerImage || 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=300&q=80',
      bannerTagline: sec.bannerTagline || '২০% অগ্রিমে বুকিং',
      themeColor: sec.themeColor,
      iconName: sec.iconName,
      tagGroup: sec.tagGroup,
      viewAllTargetView: sec.viewAllTargetView,
      viewAllTargetParams: sec.viewAllTargetParams,
      viewAllButtonTextBangla: sec.viewAllButtonTextBangla,
      isFeatured: sec.isFeatured || false,
      isActive: sec.isActive !== false,
      order: sec.order
    });
    setIsAddingShowcase(true);
  };

  const handleSaveShowcase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseForm.titleBangla.trim() || !showcaseForm.titleEnglish.trim()) return;

    if (editingShowcaseId) {
      marketplaceStore.updateCategoryShowcase(editingShowcaseId, showcaseForm);
    } else {
      marketplaceStore.addCategoryShowcase({
        ...showcaseForm,
        items: [
          {
            id: `item-${Date.now()}-1`,
            title: `${showcaseForm.titleBangla} ১`,
            subtitle: 'অভিজ্ঞ প্রফেশনাল ও দ্রুত সার্ভিস',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
            rating: '4.8',
            reviewCount: '120',
            priceOrSalary: '৫০০',
            unitText: 'শুরু',
            badge: 'জনপ্রিয়',
            ctaText: 'বিস্তারিত দেখুন',
            targetView: showcaseForm.viewAllTargetView,
            targetParams: showcaseForm.viewAllTargetParams,
            description: `${showcaseForm.titleBangla} এর সেরা সেবা। অভিজ্ঞ প্রোভাইডার দ্বারা দ্রুত সমাধান।`,
            features: ['১০০% বিশ্বস্ত সার্ভিস', 'দ্রুত ডেলিভারি', '২৪/৭ গ্রাহক সহায়তা'],
            providerName: 'স্মার্ট সার্ভিস হাব',
            providerRole: 'সার্টিফাইড টিম',
            providerPhone: '01711000000',
            deliveryTime: '২৪-৪৮ ঘন্টা',
            advancePercent: 20
          },
          {
            id: `item-${Date.now()}-2`,
            title: `${showcaseForm.titleBangla} ২`,
            subtitle: '১০০% কোয়ালিটি গ্যারান্টি',
            imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
            rating: '4.9',
            reviewCount: '240',
            priceOrSalary: '৮০০',
            unitText: 'শুরু',
            badge: 'টপ রেটেড',
            ctaText: 'বিস্তারিত দেখুন',
            targetView: showcaseForm.viewAllTargetView,
            targetParams: showcaseForm.viewAllTargetParams,
            description: `প্রিমিয়াম কোয়ালিটির ${showcaseForm.titleBangla} সার্ভিস। সম্পূর্ণ ওয়ারেন্টি সহ।`,
            features: ['প্রিমিয়াম কোয়ালিটি', 'মানি ব্যাক নিশ্চয়তা', 'অভিজ্ঞ টেকনিশিয়ান'],
            providerName: 'এলিট প্রোভাইডার গ্রুপ',
            providerRole: 'সিনিয়র স্পেশালিস্ট',
            providerPhone: '01811000000',
            deliveryTime: '১-২ কার্যদিবস',
            advancePercent: 20
          },
          {
            id: `item-${Date.now()}-3`,
            title: `${showcaseForm.titleBangla} ৩`,
            subtitle: 'জরুরি সেবা ও হোম ডেলিভারি',
            imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
            rating: '4.7',
            reviewCount: '95',
            priceOrSalary: '১,২০০',
            unitText: 'শুরু',
            badge: 'ভেরিফাইড',
            ctaText: 'বিস্তারিত দেখুন',
            targetView: showcaseForm.viewAllTargetView,
            targetParams: showcaseForm.viewAllTargetParams,
            description: `জরুরি ও সরাসরি হোম সাপোর্ট সেবা। যেকোনো সময় যোগাযোগ করুন।`,
            features: ['জরুরি অন-ডিমান্ড সেবা', 'হোম সার্ভিস', 'অফিসিয়াল রিসিপ্ট'],
            providerName: 'দ্রুত সেবা লিমিটেড',
            providerRole: 'সার্ভিস কোঅর্ডিনেটর',
            providerPhone: '01911000000',
            deliveryTime: 'তাৎক্ষণিক / ২ ঘন্টা',
            advancePercent: 20
          }
        ]
      });
    }

    setIsAddingShowcase(false);
    setEditingShowcaseId(null);
  };

  const handleDeleteShowcase = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete Category Showcase "${title}"?`)) {
      marketplaceStore.deleteCategoryShowcase(id);
      if (selectedShowcaseForItems?.id === id) {
        setSelectedShowcaseForItems(null);
      }
    }
  };

  const handleToggleShowcase = (id: string) => {
    marketplaceStore.toggleCategoryShowcase(id);
  };

  const handleMoveShowcase = (id: string, direction: 'up' | 'down') => {
    marketplaceStore.moveCategoryShowcaseOrder(id, direction);
  };

  // Card Item Management Handlers
  const handleOpenItemManager = (sec: CategoryShowcaseSection) => {
    setSelectedShowcaseForItems(sec);
    setIsAddingItem(false);
    setEditingItemId(null);
  };

  const handleStartAddItem = () => {
    setEditingItemId(null);
    setItemForm({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
      rating: '4.8',
      reviewCount: '150',
      priceOrSalary: '৫০০',
      unitText: 'শুরু',
      badge: 'সেরা সেবা',
      ctaText: 'বিস্তারিত দেখুন',
      targetView: selectedShowcaseForItems?.viewAllTargetView || 'service_request',
      targetParams: selectedShowcaseForItems?.viewAllTargetParams || {},
      description: '',
      features: ['১০০% বিশ্বস্ত সেবা', 'অভিজ্ঞ প্রোভাইডার', 'মানসম্মত কাজ'],
      providerName: 'প্রোফেশনাল সার্ভিস এক্সপার্ট',
      providerRole: 'লিড স্পেশালিস্ট',
      providerAvatar: '',
      providerPhone: '01700000000',
      providerExperience: '৪+ বছর অভিজ্ঞতা',
      deliveryTime: '২৪-৪৮ ঘন্টা',
      warrantyOrGuarantee: '১০০% কোয়ালিটি নিশ্চয়তা',
      advancePercent: 20
    });
    setIsAddingItem(true);
  };

  const handleStartEditItem = (item: ShowcaseCardItem) => {
    setEditingItemId(item.id);
    setItemForm({
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      rating: item.rating || '4.8',
      reviewCount: item.reviewCount || '150',
      priceOrSalary: item.priceOrSalary,
      unitText: item.unitText || '',
      badge: item.badge || '',
      ctaText: (item.ctaText === 'ওপেন করুন' || !item.ctaText) ? 'বিস্তারিত দেখুন' : item.ctaText,
      targetView: item.targetView || selectedShowcaseForItems?.viewAllTargetView || 'service_request',
      targetParams: item.targetParams || {},
      description: item.description || '',
      features: item.features || [],
      providerName: item.providerName || '',
      providerRole: item.providerRole || '',
      providerAvatar: item.providerAvatar || '',
      providerPhone: item.providerPhone || '01700000000',
      providerExperience: item.providerExperience || '৩+ বছর অভিজ্ঞতা',
      deliveryTime: item.deliveryTime || '২৪-৪৮ ঘন্টা',
      warrantyOrGuarantee: item.warrantyOrGuarantee || '১০০% কোয়ালিটি গ্যারান্টি',
      advancePercent: item.advancePercent || 20
    });
    setIsAddingItem(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShowcaseForItems || !itemForm.title.trim()) return;

    if (editingItemId) {
      marketplaceStore.updateShowcaseItem(selectedShowcaseForItems.id, editingItemId, itemForm);
    } else {
      marketplaceStore.addShowcaseItem(selectedShowcaseForItems.id, itemForm);
    }

    setIsAddingItem(false);
    setEditingItemId(null);
  };

  const handleDeleteItem = (sectionId: string, itemId: string, itemTitle: string) => {
    if (confirm(`Delete card "${itemTitle}" from this category showcase?`)) {
      marketplaceStore.deleteShowcaseItem(sectionId, itemId);
    }
  };

  const handleMoveItem = (sectionId: string, itemId: string, direction: 'up' | 'down') => {
    marketplaceStore.moveShowcaseItemOrder(sectionId, itemId, direction);
  };

  // Cute Cat Assistant Handlers
  const handleUpdateCatSettings = (updates: Partial<CuteCatAssistantSettings>) => {
    marketplaceStore.updateCuteCatSettings(updates);
  };

  const handleAddCatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatMessage.trim()) return;
    marketplaceStore.addCatMessage(newCatMessage);
    setNewCatMessage('');
  };

  const handleStartEditCatMessage = (idx: number, currentText: string) => {
    setEditingMessageIdx(idx);
    setEditingMessageText(currentText);
  };

  const handleSaveCatMessage = (idx: number) => {
    if (!editingMessageText.trim()) return;
    marketplaceStore.updateCatMessage(idx, editingMessageText);
    setEditingMessageIdx(null);
    setEditingMessageText('');
  };

  const handleDeleteCatMessage = (idx: number) => {
    if (confirm('Delete this message from the cat speech bubble queue?')) {
      marketplaceStore.deleteCatMessage(idx);
      if (editingMessageIdx === idx) {
        setEditingMessageIdx(null);
      }
    }
  };

  const handleMoveCatMessage = (idx: number, direction: 'up' | 'down') => {
    marketplaceStore.moveCatMessageOrder(idx, direction);
  };

  const handleAddCatChip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChipLabel.trim()) return;
    marketplaceStore.addCatQuickChip({
      label: newChipLabel.trim(),
      view: newChipView
    });
    setNewChipLabel('');
  };

  const handleDeleteCatChip = (chipId: string) => {
    marketplaceStore.deleteCatQuickChip(chipId);
  };

  const handleApplyCatSkinPreset = (skinId: typeof CUTE_CAT_SKIN_PRESETS[0]['id']) => {
    marketplaceStore.updateCuteCatSettings({
      catSkin: skinId,
      avatarUrl: ''
    });
  };

  const handleResetCatToDefaults = () => {
    if (confirm('Reset Cute Cat Assistant to factory default settings and messages?')) {
      marketplaceStore.resetCuteCatSettings();
    }
  };

  // Branding & Favicon Management Handlers
  const handleSaveBrandingInfo = (e: React.FormEvent) => {
    e.preventDefault();
    marketplaceStore.updateSiteBranding({
      siteTitle: brandingForm.siteTitle.trim() || DEFAULT_SITE_TITLE,
      siteName: brandingForm.siteName.trim() || DEFAULT_SITE_NAME,
      siteTagline: brandingForm.siteTagline.trim() || DEFAULT_SITE_TAGLINE,
      siteDescription: brandingForm.siteDescription.trim() || DEFAULT_SITE_DESCRIPTION,
      themeColor: brandingForm.themeColor,
      showTaglineInBrowserTitle: brandingForm.showTaglineInBrowserTitle
    });
    setBrandingSuccessMsg("সাইট টাইটেল ও ব্র্যান্ডিং সফলভাবে সেভ হয়েছে! ব্রাউজারের ট্যাবে সরাসরি চেক করুন।");
    setTimeout(() => setBrandingSuccessMsg(null), 4000);
  };

  const handleSetAiStudioTitlePreset = () => {
    const aiTitle = "qaaga.com is Bangladesh's verified multi-service super marketplace .";
    const aiTagline = "Bangladesh's verified multi-service super marketplace";
    setBrandingForm(prev => ({
      ...prev,
      siteTitle: aiTitle,
      siteName: "qaaga.com",
      siteTagline: aiTagline
    }));
    marketplaceStore.updateSiteBranding({
      siteTitle: aiTitle,
      siteName: "qaaga.com",
      siteTagline: aiTagline
    });
    setBrandingSuccessMsg("AI Studio টাইটেল প্রিসেট সেট করা হয়েছে!");
    setTimeout(() => setBrandingSuccessMsg(null), 4000);
  };

  const handleSelectFaviconPreset = (presetId: string) => {
    marketplaceStore.setFaviconPreset(presetId);
    setFaviconUploadPreview('');
    setBrandingSuccessMsg("নতুন ফেভিকন সফলভাবে সিলেক্ট ও অ্যাপ্লাই করা হয়েছে!");
    setTimeout(() => setBrandingSuccessMsg(null), 4000);
  };

  const handleFileUploadFavicon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Favicon file size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setFaviconUploadPreview(base64);
        marketplaceStore.uploadCustomFavicon(base64);
        setBrandingSuccessMsg("কাস্টম ফেভিকন ফাইল সফলভাবে আপলোড ও অ্যাপ্লাই হয়েছে!");
        setTimeout(() => setBrandingSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomFaviconUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFaviconUrlInput.trim()) return;
    marketplaceStore.setCustomFaviconUrl(customFaviconUrlInput.trim());
    setFaviconUploadPreview('');
    setBrandingSuccessMsg("কাস্টম ফেভিকন URL সফলভাবে অ্যাপ্লাই হয়েছে!");
    setTimeout(() => setBrandingSuccessMsg(null), 4000);
  };

  const handleRemoveFavicon = () => {
    if (confirm("কাস্টম ফেভিকন মুছে অফিসিয়াল ডিফল্ট ফেভিকন ফিরিয়ে আনতে চান?")) {
      marketplaceStore.removeCustomFavicon();
      setFaviconUploadPreview('');
      setCustomFaviconUrlInput('');
      setBrandingSuccessMsg("ফেভিকন ডিফল্ট অবস্থায় রিমুভ ও রিসেট করা হয়েছে।");
      setTimeout(() => setBrandingSuccessMsg(null), 4000);
    }
  };

  const handleResetAllBranding = () => {
    if (confirm("পুরো সাইট টাইটেল, ট্যাগলাইন এবং ফেভিকন ডিফল্ট AI Studio প্রিসেটে রিসেট করতে চান?")) {
      marketplaceStore.resetSiteTitleAndBranding();
      setBrandingForm({
        siteTitle: DEFAULT_SITE_TITLE,
        siteName: DEFAULT_SITE_NAME,
        siteTagline: DEFAULT_SITE_TAGLINE,
        siteDescription: DEFAULT_SITE_DESCRIPTION,
        themeColor: '#7c3aed',
        showTaglineInBrowserTitle: true
      });
      setFaviconUploadPreview('');
      setCustomFaviconUrlInput('');
      setBrandingSuccessMsg("সবকিছু ডিফল্ট অবস্থায় রিসেট করা হয়েছে!");
      setTimeout(() => setBrandingSuccessMsg(null), 4000);
    }
  };

  const handleCopyActiveFaviconUri = () => {
    const activeHref = getActiveFaviconHref(settings);
    navigator.clipboard.writeText(activeHref);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 3000);
  };

  // Metrics
  const totalGMV = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalCommission = bookings.reduce((acc, b) => acc + b.platformCommission, 0);
  const totalAdvanceCollected = bookings.reduce((acc, b) => acc + b.advancePaid, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Control Tower Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-rose-400" />
            <h1 className="text-2xl font-black tracking-tight">QAAGA Admin Control Tower</h1>
            <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
              Full Moderation Gate
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Centrally moderate customer requests, vet provider quotations, configure hero banners & dynamic service verticals.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset entire system database to fresh seed state?')) {
              marketplaceStore.resetToFreshSeed();
            }
          }}
          className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={14} />
          <span>Reset Fresh Seed Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{pendingRequests.length}</div>
          <div className="text-[10px] text-slate-500">Awaiting Admin dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Quotations</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{pendingOffers.length}</div>
          <div className="text-[10px] text-slate-500">Quotes awaiting approval</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total GMV Booked</div>
          <div className="text-2xl font-black text-teal-800 mt-1">BDT {totalGMV.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold">20% Escrow Advance: BDT {totalAdvanceCollected.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</div>
          <div className="text-2xl font-black text-slate-900 mt-1">BDT {totalCommission.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Based on {settings.platformCommissionPercent}% commission</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none text-xs font-bold">
        {[
          { id: 'REQUEST_MODERATION', label: `Customer Requests (${pendingRequests.length})`, icon: FileText },
          { id: 'OFFER_MODERATION', label: `Provider Offers (${pendingOffers.length})`, icon: Send },
          { id: 'SELLERS', label: `Merchant Stores (${sellerStores.length}) 🏪`, icon: Store },
          { id: 'SELLER_PAYOUTS', label: `Seller Payouts (${sellerPayouts.filter(p => p.status === 'PENDING').length}) 💳`, icon: CreditCard },
          { id: 'BANNERS', label: `Hero Banners & Slider (${heroBanners.length})`, icon: Sparkles },
          { id: 'FEED_SLIDER', label: `Feed Slider & Live Hub (${feedSlides.length}) 📢`, icon: Sparkles },
          { id: 'CUTE_CAT', label: `Cute Cat Assistant (${cuteCatSettings.isEnabled ? 'Active' : 'Off'}) 🐾`, icon: Smile },
          { id: 'SHOWCASES', label: `Category Showcases & Cards (${showcases.length})`, icon: LayoutGrid },
          { id: 'CATEGORIES', label: `Category Engine (${categories.length})`, icon: Layers },
          { id: 'PROVIDERS', label: `Provider Verification (${providers.length})`, icon: Users },
          { id: 'BRANDING', label: 'Site Title & Favicon 🌐', icon: Globe },
          { id: 'SETTINGS', label: 'Escrow & System Settings', icon: Settings },
          { id: 'FINANCES', label: 'Escrow Ledger & GMV', icon: DollarSign }
        ].map((tab) => {
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

      {/* TAB 1: CUSTOMER REQUESTS MODERATION */}
      {activeTab === 'REQUEST_MODERATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Requests Pending Admin Verification & Dispatch ({pendingRequests.length})
            </h2>
            <span className="text-xs text-slate-500">
              Providers will not see requests until Admin approves and dispatches
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
              All customer requests have been vetted and dispatched to providers!
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-teal-50 text-teal-900 px-2 py-0.5 rounded border border-teal-200">
                        {req.categoryName}
                      </span>
                      <span className="text-xs text-slate-500">{req.subCategory}</span>
                      {req.isUrgent && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{req.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                      ADMIN REVIEW REQUIRED
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">Submitted: {new Date(req.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <div className="font-bold text-slate-900">Customer Details:</div>
                    <div>Name: {req.customerName}</div>
                    <div>Phone: {req.customerPhone} (Visible to Admin Only)</div>
                    <div>Area: {req.area}, {req.thana}, {req.district}</div>
                    <div>Exact Address: {req.address}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900">Service Specs:</div>
                    <div>Schedule: {req.preferredDate} ({req.preferredTime})</div>
                    <div>Budget: {req.budget ? `BDT ${req.budget.toLocaleString()}` : 'Not Specified'}</div>
                    <div>Routing Mode: {req.routingMode}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  <strong>Description:</strong> {req.description}
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleApproveAndDispatchRequest(req)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Dispatch to Area Technicians</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PROVIDER OFFERS MODERATION */}
      {activeTab === 'OFFER_MODERATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Provider Quotations Pending Admin Moderation ({pendingOffers.length})
            </h2>
            <span className="text-xs text-slate-500">
              Customer cannot see quotes until Admin approves pricing & warranty
            </span>
          </div>

          {pendingOffers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
              All technician quotes have been reviewed and forwarded to customers!
            </div>
          ) : (
            pendingOffers.map((offer) => {
              const req = requests.find((r) => r.id === offer.requestId);
              return (
                <div key={offer.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500">
                        Quotation for Request: <strong className="text-slate-800">{req?.title}</strong>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        Quote from {offer.providerName}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-teal-800">BDT {offer.offeredPrice.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-500">Service Fee: BDT {offer.serviceCharge}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <div className="font-bold text-slate-800">{offer.estimatedDuration}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Warranty:</span>
                      <div className="font-bold text-slate-800">{offer.warranty}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Earliest Date:</span>
                      <div className="font-bold text-slate-800">{offer.earliestDate} ({offer.earliestTime})</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Parts Included:</span>
                      <div className="font-bold text-slate-800">{offer.partsIncluded ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                    &ldquo;{offer.offerMessage}&rdquo;
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleApproveOffer(offer.id)}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve & Forward Quote to Customer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: HERO BANNERS & AUTO-SLIDER MANAGER */}
      {activeTab === 'BANNERS' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#4e20b8]" />
                <h2 className="text-lg font-black text-slate-900">Hero Category Banners & Auto-Slider</h2>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  {heroBanners.filter(b => b.isActive !== false).length} Active Slides
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage hero photo slides shown on the homepage. When slides transition, the matching category badge animates in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartAddBanner}
              className="bg-[#4e20b8] hover:bg-[#3d1796] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            >
              <Plus size={15} />
              <span>+ Add New Banner Slide</span>
            </button>
          </div>

          {/* Add / Edit Banner Form */}
          {isAddingBanner && (
            <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 rounded-3xl border-2 border-purple-200 p-6 shadow-md space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-[#4e20b8]" />
                  <h3 className="text-base font-black text-slate-900">
                    {editingBannerId ? 'Edit Hero Banner Slide' : 'Create New Hero Banner Slide'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingBanner(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Category Association */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Associated Category:
                    </label>
                    <select
                      value={bannerForm.categoryKey}
                      onChange={(e) => setBannerForm({ ...bannerForm, categoryKey: e.target.value })}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="repair">রিপেয়ার সার্ভিস (Repair & Technician)</option>
                      <option value="doctor">ডাক্তার বুকিং (Doctor Booking)</option>
                      <option value="home_service">হোম সার্ভিস (Home Cleaning & Services)</option>
                      <option value="hotel">হোটেল বুকিং (Hotel & Resort Booking)</option>
                      <option value="products">প্রোডাক্ট কেনাকাটা (Product Store)</option>
                      <option value="jobs">জবস ও ক্যারিয়ার (Jobs & Career)</option>
                    </select>
                  </div>

                  {/* Title Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banner Title (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={bannerForm.titleBangla}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleBangla: e.target.value })}
                      placeholder="e.g. মোঃ কামরুল হাসান / ডাঃ ফাহমিদা সুলতানা"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Subtitle Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subtitle / Specialty (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={bannerForm.subtitleBangla}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitleBangla: e.target.value })}
                      placeholder="e.g. সার্টিফাইড এসি ও ইলেকট্রিক্যাল স্পেশালিস্ট"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Badge Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Label (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={bannerForm.badgeBangla || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, badgeBangla: e.target.value })}
                      placeholder="e.g. সার্টিফাইড টেকনিশিয়ান (৪.৯৫ ★)"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Rating / Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rating & Reviews Text:
                    </label>
                    <input
                      type="text"
                      value={bannerForm.ratingText || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, ratingText: e.target.value })}
                      placeholder="e.g. ৪.৯৫ ★ (১২০+ রিভিউ সম্পন্ন)"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Target View */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target App View on Click:
                    </label>
                    <select
                      value={bannerForm.targetView || 'service_request'}
                      onChange={(e) => setBannerForm({ ...bannerForm, targetView: e.target.value })}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="service_request">সার্ভিস রিকোয়েস্ট / বুকিং (Service Request)</option>
                      <option value="doctors">ডাক্তার বুকিং পোর্টাল (Doctor Portal)</option>
                      <option value="hotels">হোটেল বুকিং পোর্টাল (Hotel Portal)</option>
                      <option value="products">প্রোডাক্ট মার্কেটপ্লেস (Products Marketplace)</option>
                      <option value="jobs">জবস পোর্টাল (Jobs Portal)</option>
                      <option value="nurses">নার্স ও কেয়ারগিভার (Nurses)</option>
                      <option value="used_products">পুরাতন পণ্য ক্রয়-বিক্রয় (Used Products)</option>
                    </select>
                  </div>

                  {/* Theme Accent Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Theme Accent Color:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bannerForm.themeColor || '#0284c7'}
                        onChange={(e) => setBannerForm({ ...bannerForm, themeColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={bannerForm.themeColor || '#0284c7'}
                        onChange={(e) => setBannerForm({ ...bannerForm, themeColor: e.target.value })}
                        className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Photo Image URL:
                    </label>
                    <input
                      type="url"
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      required
                    />
                    
                    {/* Quick Image Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold">Quick Presets:</span>
                      {[
                        { label: 'Technician', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=750&q=80' },
                        { label: 'Doctor', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&q=80' },
                        { label: 'Home Cleaner', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=750&q=80' },
                        { label: 'Hotel & Resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&h=750&q=80' },
                        { label: 'Shopping', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&h=750&q=80' },
                        { label: 'Professional Career', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, imageUrl: preset.url })}
                          className="text-[10px] bg-white hover:bg-purple-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerForm.isActive !== false}
                      onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                      className="rounded text-[#4e20b8] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Active (Visible in Hero Slider)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBanner(false);
                        setEditingBannerId(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4e20b8] hover:bg-[#3d1796] text-white shadow-md transition-all cursor-pointer"
                    >
                      {editingBannerId ? 'Update Banner Slide' : 'Save & Publish Slide'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Banner Slides List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                All Configured Hero Banner Slides ({heroBanners.length})
              </h3>
              <span className="text-xs text-slate-500">
                Use arrows to reorder slide sequence in carousel
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroBanners.map((banner, index) => {
                const categoryLabels: Record<string, { label: string; color: string }> = {
                  repair: { label: 'রিপেয়ার সার্ভিস', color: 'bg-sky-100 text-sky-800 border-sky-200' },
                  technician: { label: 'রিপেয়ার সার্ভিস', color: 'bg-sky-100 text-sky-800 border-sky-200' },
                  doctor: { label: 'ডাক্তার বুকিং', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  home_service: { label: 'হোম সার্ভিস', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  hotel: { label: 'হোটেল বুকিং', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                  products: { label: 'প্রোডাক্ট কেনাকাটা', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  jobs: { label: 'জবস ও ক্যারিয়ার', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                };

                const catInfo = categoryLabels[banner.categoryKey] || { label: banner.categoryKey, color: 'bg-slate-100 text-slate-800 border-slate-200' };

                return (
                  <div
                    key={banner.id}
                    className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                      banner.isActive !== false
                        ? 'border-slate-200 bg-white hover:shadow-md'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    {/* Top Preview Image & Badges */}
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.titleBangla}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                          #{index + 1}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-2.5 inset-x-3 text-white">
                        <div className="text-xs font-black leading-tight line-clamp-1">{banner.titleBangla}</div>
                        <div className="text-[10px] text-slate-300 line-clamp-1">{banner.subtitleBangla}</div>
                        {banner.ratingText && (
                          <div className="text-[9px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            <span>{banner.ratingText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content & Operations */}
                    <div className="p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Target View:</span>
                        <span className="font-semibold text-[#4e20b8] bg-purple-50 px-2 py-0.5 rounded">
                          {banner.targetView || 'service_request'}
                        </span>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* Order Reorder */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveBanner(banner.id, 'up')}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={index === heroBanners.length - 1}
                            onClick={() => handleMoveBanner(banner.id, 'down')}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Active Toggle, Edit & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleBanner(banner.id)}
                            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                              banner.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={banner.isActive !== false ? 'Slide is Active (Click to Hide)' : 'Slide is Hidden (Click to Activate)'}
                          >
                            {banner.isActive !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditBanner(banner)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Edit Slide"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id, banner.titleBangla)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                            title="Delete Slide"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FEED BANNER SLIDER & LIVE HUB MANAGEMENT */}
      {activeTab === 'FEED_SLIDER' && (
        <div className="space-y-6">
          {/* Top Action Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  কমিউনিটি ফিড স্লাইডার ও লাইভ ব্যানার কন্ট্রোল 📢
                </h2>
                <span className="bg-purple-100 text-[#4e20b8] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  মোট {feedSlides.length}টি স্লাইড ({feedSlides.filter(s => s.isPublished).length}টি লাইভ)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ফিডের শীর্ষের আই-ফ্রেন্ডলি অটো স্লাইডারে প্রদর্শিত ব্যানারসমূহ Add, Edit, Reorder ও কাস্টমাইজ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetFeedSlides}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ডিফল্ট ৫টি স্লাইডারে রিসেট করুন"
              >
                <RefreshCw size={14} />
                <span>রিসেট ডিফল্ট</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('feed')}
                className="bg-purple-50 hover:bg-purple-100 text-[#4e20b8] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>লাইভ ফিড দেখুন</span>
              </button>

              <button
                type="button"
                onClick={handleStartAddFeedSlide}
                className="bg-[#4e20b8] hover:bg-[#3f1999] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>+ নতুন ফিড স্লাইড যুক্ত করুন</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Feed Slide Modal Form */}
          {isAddingFeedSlide && (
            <div className="bg-white rounded-3xl border-2 border-purple-300 p-6 shadow-md space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#4e20b8] flex items-center justify-center font-bold">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFeedSlideId ? 'ফিড স্লাইডার এডিট করুন' : 'নতুন ফিড স্লাইডার যোগ করুন'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingFeedSlide(false);
                    setEditingFeedSlideId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Real-Time Live Preview inside Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  লাইভ প্রিভিউ (স্লাইডার কেমন দেখাবে)
                </label>
                <div
                  className="relative min-h-[220px] rounded-2xl p-5 text-white overflow-hidden shadow-md bg-slate-950 flex flex-col justify-between"
                >
                  {/* Full image in background */}
                  {feedSlideForm.imageUrl && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                      <img
                        src={feedSlideForm.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-center sm:object-right"
                      />
                      {/* Left frosted glass gradient transition to right clear */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          feedSlideForm.bgGradient || 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]'
                        } opacity-95 via-70% sm:via-55% sm:to-transparent pointer-events-none`}
                      />
                      <div className="absolute inset-y-0 left-0 w-full sm:w-3/5 backdrop-blur-md [mask-image:linear-gradient(to_right,black_60%,transparent_100%)] pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-auto">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        {feedSlideForm.badgeBangla && (
                          <span className="bg-black/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-white/20 backdrop-blur-md">
                            {feedSlideForm.badgeBangla}
                          </span>
                        )}
                        {feedSlideForm.highlightTextBangla && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {feedSlideForm.highlightTextBangla}
                          </span>
                        )}
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          LIVE
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white drop-shadow-md">
                        {feedSlideForm.titleBangla || 'স্লাইডার শিরোনাম (বাংলা)'}
                      </h4>
                      <p className="text-xs text-purple-100 line-clamp-2 drop-shadow-xs">
                        {feedSlideForm.subtitleBangla || 'স্লাইডারের বিস্তারিত বিবরণ বা অফার টেক্সট এখানে প্রদর্শিত হবে।'}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                          {feedSlideForm.ctaTextBangla || '+ অ্যাকশন বাটন'}
                        </span>
                        {feedSlideForm.secondaryCtaTextBangla && (
                          <span className="bg-black/40 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md">
                            {feedSlideForm.secondaryCtaTextBangla}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-md border border-white/25 rounded-xl px-3 py-2 text-white shrink-0">
                      <span className="text-[11px] font-bold text-amber-300">
                        {feedSlideForm.themeTag ? feedSlideForm.themeTag.toUpperCase() : 'PREVIEW'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveFeedSlide} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      স্লাইডার শিরোনাম (বাংলা) *
                    </label>
                    <input
                      type="text"
                      required
                      value={feedSlideForm.titleBangla}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, titleBangla: e.target.value }))
                      }
                      placeholder="যেমন: অভিজ্ঞ স্পেশালিস্ট ডাক্তারদের স্বাস্থ্য বুলেটিন"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      উপশিরোনাম বা বিস্তারিত বিবরণ (বাংলা)
                    </label>
                    <textarea
                      rows={2}
                      value={feedSlideForm.subtitleBangla}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, subtitleBangla: e.target.value }))
                      }
                      placeholder="যেমন: বিএমডিসি ভেরিফাইড কার্ডিওলজিস্টদের পরামর্শ পড়ুন এবং চেম্বার সিরিয়াল বুকিং করুন..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Badge Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      টপ ব্যাজ টেক্সট (যেমন: 🌟 লাইভ হাব / 🩺 স্বাস্থ্য সেবা)
                    </label>
                    <input
                      type="text"
                      value={feedSlideForm.badgeBangla}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, badgeBangla: e.target.value }))
                      }
                      placeholder="🌟 লাইভ হাব"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Highlight Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      হাইলাইট ট্যাগ (যেমন: ২০% ফ্ল্যাশ ছাড় / ১০০% ভেরিফাইড)
                    </label>
                    <input
                      type="text"
                      value={feedSlideForm.highlightTextBangla}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, highlightTextBangla: e.target.value }))
                      }
                      placeholder="১০০% ভেরিফাইড"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Theme Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      থিম ক্যাটাগরি
                    </label>
                    <select
                      value={feedSlideForm.themeTag || 'community'}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({
                          ...prev,
                          themeTag: e.target.value as any
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
                    >
                      <option value="community">🌟 কমিউনিটি ও জেনারেল (Community)</option>
                      <option value="health">🩺 ডাক্তার ও স্বাস্থ্য (Health)</option>
                      <option value="service">⚡ হোম ও রিপেয়ার সার্ভিস (Service)</option>
                      <option value="hotel">🏖️ হোটেল ও ট্রাভেল (Hotels)</option>
                      <option value="jobs">💼 জবস ও ক্যারিয়ার (Jobs)</option>
                      <option value="deal">🛍️ স্পেশাল ডিসকাউন্ট ডিল (Deals)</option>
                      <option value="notice">📢 জরুরি নোটিস (Notice)</option>
                    </select>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ইমেজ URL (ডানপাশের প্রিভিউ ফ্রেমের জন্য)
                    </label>
                    <input
                      type="text"
                      value={feedSlideForm.imageUrl}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Background Gradient Presets */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      আই-ফ্রেন্ডলি ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট প্যালেট
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        {
                          name: 'রয়্যাল ইন্ডিগো',
                          gradient: 'from-[#2e1065] via-[#4e20b8] to-[#1e1b4b]',
                          color: 'bg-purple-900'
                        },
                        {
                          name: 'এমেরাল্ড গ্রিন',
                          gradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
                          color: 'bg-emerald-800'
                        },
                        {
                          name: 'সানসেট অরেঞ্জ',
                          gradient: 'from-[#7c2d12] via-[#ea580c] to-[#431407]',
                          color: 'bg-orange-800'
                        },
                        {
                          name: 'ওশান ট্রাভেল',
                          gradient: 'from-[#0c4a6e] via-[#0284c7] to-[#082f49]',
                          color: 'bg-sky-900'
                        },
                        {
                          name: 'কর্পোরেট ব্লু',
                          gradient: 'from-[#1e1b4b] via-[#3730a3] to-[#0f172a]',
                          color: 'bg-indigo-950'
                        },
                        {
                          name: 'রুবি ক্রিমসন',
                          gradient: 'from-[#881337] via-[#e11d48] to-[#4c0519]',
                          color: 'bg-rose-900'
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setFeedSlideForm((prev) => ({
                              ...prev,
                              bgGradient: preset.gradient
                            }))
                          }
                          className={`p-2 rounded-xl text-left border flex items-center gap-2 cursor-pointer transition-all ${
                            feedSlideForm.bgGradient === preset.gradient
                              ? 'border-purple-600 bg-purple-50 font-bold ring-2 ring-purple-300'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-lg shrink-0 bg-gradient-to-r ${preset.gradient}`}
                          />
                          <span className="text-[11px] text-slate-800 truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA Label & Target View */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মূল অ্যাকশন বাটন টেক্সট (Primary CTA)
                    </label>
                    <input
                      type="text"
                      required
                      value={feedSlideForm.ctaTextBangla}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, ctaTextBangla: e.target.value }))
                      }
                      placeholder="যেমন: + নতুন পোস্ট / আপডেট দিন"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বাটনের টার্গেট পেজ / ভিউ (Target View)
                    </label>
                    <select
                      value={feedSlideForm.targetView}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({ ...prev, targetView: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
                    >
                      <option value="create_post">+ নতুন পোস্ট ক্রিয়েট মডেল ওপেন (Create Post Modal)</option>
                      <option value="feed_explore">ফিড: সব ট্রেন্ডিং পোস্ট এক্সপ্লোর</option>
                      <option value="feed_health">ফিড: ডাক্তার ও স্বাস্থ্য পোস্ট ফিল্টার</option>
                      <option value="feed_repair">ফিড: সার্ভিস ও রিপেয়ার পোস্ট ফিল্টার</option>
                      <option value="feed_hotel">ফিড: হোটেল ও ট্রাভেল পোস্ট ফিল্টার</option>
                      <option value="feed_jobs">ফিড: জবস ও নিয়োগ পোস্ট ফিল্টার</option>
                      <option value="doctors">ডাক্তার তালিকা ও অ্যাপয়েন্টমেন্ট (Doctors View)</option>
                      <option value="service_request">সার্ভিস রিকোয়েস্ট ফর্ম (Service Request View)</option>
                      <option value="hotels">হোটেল ও রিসোর্ট বুকিং (Hotels View)</option>
                      <option value="jobs">চাকরি ও সার্কুলার (Jobs View)</option>
                      <option value="products">টুলস ও গ্যাজেট শপ (Products View)</option>
                    </select>
                  </div>

                  {/* Secondary CTA Label & Target View */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      দ্বিতীয় বাটন টেক্সট (Secondary CTA - ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={feedSlideForm.secondaryCtaTextBangla || ''}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({
                          ...prev,
                          secondaryCtaTextBangla: e.target.value
                        }))
                      }
                      placeholder="যেমন: জনপ্রিয় প্রফেশনাল এক্সপ্লোর"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      দ্বিতীয় বাটনের টার্গেট পেজ
                    </label>
                    <select
                      value={feedSlideForm.secondaryTargetView || 'feed_explore'}
                      onChange={(e) =>
                        setFeedSlideForm((prev) => ({
                          ...prev,
                          secondaryTargetView: e.target.value
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
                    >
                      <option value="feed_explore">ফিড: এক্সপ্লোর অল</option>
                      <option value="feed_health">ফিড: স্বাস্থ্য বুলেটিন</option>
                      <option value="feed_repair">ফিড: সার্ভিস প্রোভাইডার</option>
                      <option value="feed_hotel">ফিড: হোটেল নোটিস</option>
                      <option value="feed_jobs">ফিড: নিয়োগ বিজ্ঞপ্তি</option>
                      <option value="doctors">ডাক্তার তালিকা</option>
                      <option value="hotels">হোটেল তালিকা</option>
                      <option value="jobs">জব সার্কুলার</option>
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={feedSlideForm.isPublished}
                        onChange={(e) =>
                          setFeedSlideForm((prev) => ({ ...prev, isPublished: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>এই স্লাইডটি লাইভ ফিডে তাৎক্ষণিক প্রকাশ (Active & Visible) রাখুন</span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingFeedSlide(false);
                      setEditingFeedSlideId(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4e20b8] hover:bg-[#3f1999] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    {editingFeedSlideId ? 'পরিবর্তন সংরক্ষণ করুন' : 'স্লাইড তৈরি করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Existing Feed Slides */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                বর্তমান ফিড স্লাইডার তালিকা ({feedSlides.length}টি)
              </h3>
              <span className="text-xs text-slate-400">
                স্লাইডের ক্রম পরিবর্তন করতে উপরে/নিচে তীর বাটনে ক্লিক করুন
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  {/* Top Preview Banner */}
                  <div
                    className={`bg-gradient-to-r ${slide.bgGradient} p-4 text-white relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-black/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                          #{index + 1}
                        </span>
                        {slide.badgeBangla && (
                          <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[150px]">
                            {slide.badgeBangla}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          slide.isPublished
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {slide.isPublished ? '● LIVE' : '○ HIDDEN'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {slide.titleBangla}
                    </h4>
                    <p className="text-[11px] text-purple-100 line-clamp-2 mt-0.5">
                      {slide.subtitleBangla}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-[11px]">
                      <span className="bg-white text-slate-900 font-bold px-2.5 py-1 rounded-lg">
                        {slide.ctaTextBangla}
                      </span>
                      <span className="text-[10px] text-white/80">
                        ➔ {slide.targetView}
                      </span>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Order buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveFeedSlide(slide.id, 'up')}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                        title="উপরে নিন"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === feedSlides.length - 1}
                        onClick={() => handleMoveFeedSlide(slide.id, 'down')}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                        title="নিচে নিন"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Actions: Toggle status, Edit, Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFeedSlide(slide.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          slide.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={
                          slide.isPublished
                            ? 'স্লাইডটি দৃশ্যমান (হাইড করতে ক্লিক করুন)'
                            : 'স্লাইডটি লুকানো (পাবলিশ করতে ক্লিক করুন)'
                        }
                      >
                        {slide.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditFeedSlide(slide)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFeedSlide(slide.id, slide.titleBangla)}
                        className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CUTE CAT ASSISTANT MANAGER */}
      {activeTab === 'CUTE_CAT' && (
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Smile size={22} className="text-[#ff6d00]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Cute Cat Assistant & Running Track Engine 🐾
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    cuteCatSettings.isEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {cuteCatSettings.isEnabled ? '● Live on Homepage' : '○ Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize the cute animated running cat, its rotating speech bubble messages ("তুমি কি চাও আমাকে বলো?"), speed, floating corner widget, and 1-click service chips.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCatToDefaults}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() =>
                  handleUpdateCatSettings({ isEnabled: !cuteCatSettings.isEnabled })
                }
                className={`text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  cuteCatSettings.isEnabled
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {cuteCatSettings.isEnabled ? 'Disable Cat Assistant' : 'Enable Cat Assistant'}
              </button>
            </div>
          </div>

          {/* LIVE PREVIEW BOX */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-500" />
                <span>Live Homepage Middle-Jump & Mouth Bubble Preview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Message Interval: {cuteCatSettings.speechIntervalSeconds}s | Skin: {cuteCatSettings.catSkin || 'orange-tabby'}
              </span>
            </div>

            {/* Rendered Track Preview */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-b from-purple-50 via-amber-50/50 to-purple-100 p-4 min-h-[190px] flex flex-col justify-between items-center text-center">
              
              {/* Top preview header */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#4e20b8] animate-pulse" />
                  <span className="text-xs font-black text-slate-800">{cuteCatSettings.catName}</span>
                  <span className="text-[9px] bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                    {cuteCatSettings.catSubtitleBangla}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#4e20b8] bg-white/90 px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-2xs">
                  আমাকে জিজ্ঞেস করুন 💬
                </span>
              </div>

              {/* Centered Jumping Cat & Mouth Popping Bubble */}
              <div className="my-2 flex flex-col items-center select-none">
                {/* Popping Speech Bubble from Mouth */}
                <div className="relative mb-1 bg-white border-2 border-[#4e20b8] px-3.5 py-1.5 rounded-2xl shadow-md text-xs font-black text-slate-800 max-w-xs animate-bounce">
                  "{cuteCatSettings.messages[0] || 'তুমি কি চাও আমাকে বলো? 🐾'}"
                  {/* Mouth stream bubbles */}
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-1.5 h-1.5 bg-white border border-[#4e20b8] rounded-full" />
                    <div className="w-1 h-1 bg-[#4e20b8] rounded-full" />
                  </div>
                </div>

                {/* Jumping Cat Avatar */}
                <div className="mt-1">
                  <CuteCatAvatarSvg
                    skin={cuteCatSettings.catSkin || 'orange-tabby'}
                    size={64}
                    isTalking={true}
                    customUrl={cuteCatSettings.avatarUrl}
                  />
                </div>
              </div>

              {/* Chips preview */}
              <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto text-[10px] pt-1 border-t border-purple-200/60">
                <span className="font-bold text-purple-900 shrink-0">কুইক চিপস:</span>
                {cuteCatSettings.quickChips.slice(0, 4).map((c) => (
                  <span key={c.id} className="bg-white border border-purple-200 px-2.5 py-0.5 rounded-lg font-semibold text-slate-700 shrink-0 shadow-2xs">
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GENERAL SETTINGS & SPEED CONTROLS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings size={18} className="text-[#4e20b8]" />
                <h3 className="text-sm font-black text-slate-900">General Assistant & Motion Controls</h3>
              </div>

              <div className="space-y-3.5">
                {/* Cat Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cat Assistant Name:</label>
                  <input
                    type="text"
                    value={cuteCatSettings.catName}
                    onChange={(e) => handleUpdateCatSettings({ catName: e.target.value })}
                    placeholder="e.g. মিউ মিউ হেল্পার (Mew Mew)"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tagline (বাংলা):</label>
                  <input
                    type="text"
                    value={cuteCatSettings.catSubtitleBangla}
                    onChange={(e) => handleUpdateCatSettings({ catSubtitleBangla: e.target.value })}
                    placeholder="e.g. আপনার সার্বক্ষণিক সেবা সহকারী"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                  />
                </div>

                {/* Speech Interval Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Mouth Bubble Message Interval:</label>
                    <span className="text-xs font-mono font-bold text-[#4e20b8]">{cuteCatSettings.speechIntervalSeconds} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={cuteCatSettings.speechIntervalSeconds}
                    onChange={(e) => handleUpdateCatSettings({ speechIntervalSeconds: Number(e.target.value) })}
                    className="w-full accent-[#4e20b8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>দ্রুত কথা বলা (2s)</span>
                    <span>স্বাভাবিক (3.5s)</span>
                    <span>ধীরে ধীরে (10s)</span>
                  </div>
                </div>

                {/* Floating Dock on Scroll */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cuteCatSettings.enableFloatingOnScroll}
                      onChange={(e) => handleUpdateCatSettings({ enableFloatingOnScroll: e.target.checked })}
                      className="rounded text-[#4e20b8] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Enable Docked Mini-Cat on Scroll (নিচের দিকে স্ক্রোল করলে ডানপাশে ভেসে থাকবে)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Smoothly docks as an interactive jumping cat in the bottom corner with mouth-popping speech bubbles.
                      </p>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Floating Position:</label>
                      <select
                        value={cuteCatSettings.floatingPosition}
                        onChange={(e) => handleUpdateCatSettings({ floatingPosition: e.target.value as any })}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                      >
                        <option value="bottom-right">Bottom Right (নিচে ডানপাশে)</option>
                        <option value="bottom-left">Bottom Left (নিচে বামপাশে)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Scroll Threshold (px):</label>
                      <input
                        type="number"
                        min="100"
                        max="1000"
                        step="50"
                        value={cuteCatSettings.scrollThresholdPx}
                        onChange={(e) => handleUpdateCatSettings({ scrollThresholdPx: Number(e.target.value) })}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* AVATAR & HIGH DEFINITION VECTOR SKINS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900">Cute Cat Skin Selection</h3>
              </div>

              {/* 1-Click Vector Skins */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">Choose HD Vector Cat Skin:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CUTE_CAT_SKIN_PRESETS.map((preset) => {
                    const isSelected = (!cuteCatSettings.avatarUrl && (cuteCatSettings.catSkin || 'orange-tabby') === preset.id);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyCatSkinPreset(preset.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#4e20b8] bg-purple-50 ring-2 ring-purple-200 shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-200'
                        }`}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <CuteCatAvatarSvg skin={preset.id} size={42} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 block truncate">
                              {preset.name.split('(')[0]}
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-700 font-semibold block">
                            {preset.badge}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {isSelected ? '✓ বর্তমানে সক্রিয়' : 'সিলেক্ট করতে ট্যাপ করুন'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image / GIF URLs (Optional override) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700">
                  Or use Custom Cat Image/GIF URL (Optional Override):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={cuteCatSettings.avatarUrl}
                    onChange={(e) => handleUpdateCatSettings({ avatarUrl: e.target.value })}
                    placeholder="https://... (Leave blank for 100% reliable Vector skin)"
                    className="flex-1 p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                  {cuteCatSettings.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateCatSettings({ avatarUrl: '' })}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  টিপস: ভেক্টর স্কিন (Vector Skin) ব্যবহার করলে কোনো ইমেজ ব্রোকেন বা লোডিং সমস্যা হবে না।
                </p>
              </div>

            </div>
          </div>

          {/* SPEECH BUBBLE MESSAGES MANAGER (ADD, EDIT, DELETE, REORDER) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#4e20b8]" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Speech Bubble Message Queue ({cuteCatSettings.messages.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Messages rotate automatically above the cat to engage visitors and suggest services.
                  </p>
                </div>
              </div>
            </div>

            {/* Add New Message Form */}
            <form onSubmit={handleAddCatMessage} className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="text"
                value={newCatMessage}
                onChange={(e) => setNewCatMessage(e.target.value)}
                placeholder="নতুন মেসেজ লিখুন (যেমন: তুমি কি চাও আমাকে বলো? আমি সাহায্য করব!)"
                className="flex-1 w-full p-2.5 text-xs bg-white border border-purple-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-200 outline-none"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#4e20b8] hover:bg-[#3d1796] text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>মেসেজ যোগ করুন</span>
              </button>
            </form>

            {/* Quick Template Suggesters */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="font-bold text-slate-500">ক্লিক করে যোগ করুন:</span>
              {[
                'তুমি কি চাও আমাকে বলো? 🐾',
                'ডাক্তার সিরিয়াল নাকি এসি মেরামত? আমাকে বলুন 🩺',
                'আজকের সেরা অফার ও ডিসকাউন্ট জানতে ট্যাপ করুন 🎁',
                'হোটেল বুকিং বা ঘরে বসে অর্ডার — এক ক্লিকে! 🏨'
              ].map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewCatMessage(template)}
                  className="bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-[#4e20b8] px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                >
                  + {template}
                </button>
              ))}
            </div>

            {/* Messages List */}
            <div className="space-y-2 pt-2">
              {cuteCatSettings.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-purple-600 bg-purple-100 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    {editingMessageIdx === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingMessageText}
                          onChange={(e) => setEditingMessageText(e.target.value)}
                          className="flex-1 p-2 text-xs bg-white border border-purple-400 rounded-xl"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCatMessage(idx)}
                          className="px-3 py-1.5 bg-[#4e20b8] text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessageIdx(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-800 leading-snug break-words">
                        "{msg}"
                      </span>
                    )}
                  </div>

                  {editingMessageIdx !== idx && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveCatMessage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveCatMessage(idx, 'down')}
                        disabled={idx === cuteCatSettings.messages.length - 1}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => handleStartEditCatMessage(idx, msg)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        title="Edit Message"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCatMessage(idx)}
                        className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* 1-CLICK POPUP CHIPS MANAGER */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    1-Click Fast Navigation Chips ({cuteCatSettings.quickChips.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shortcut buttons displayed underneath the cat track and inside the cat assistant popup.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Chip Form */}
            <form onSubmit={handleAddCatChip} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="text"
                value={newChipLabel}
                onChange={(e) => setNewChipLabel(e.target.value)}
                placeholder="চিপ লেবেল (যেমন: 🩺 ডেন্টিস্ট বিশেষজ্ঞ)"
                className="flex-1 w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
              />

              <select
                value={newChipView}
                onChange={(e) => setNewChipView(e.target.value)}
                className="w-full sm:w-48 p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
              >
                <option value="doctors">ডাক্তার বুকিং (doctors)</option>
                <option value="service_request">সার্ভিস রিকোয়েস্ট (service_request)</option>
                <option value="hotels">হোটেল ও রিসোর্ট (hotels)</option>
                <option value="nurses">নার্স ও কেয়ারগিভার (nurses)</option>
                <option value="products">প্রোডাক্ট মার্কেটপ্লেস (products)</option>
                <option value="ebooks">ই-বুক লাইব্রেরি (ebooks)</option>
                <option value="used_products">পুরাতন পণ্য ক্রয়-বিক্রয় (used_products)</option>
                <option value="jobs">জবস ও নিয়োগ (jobs)</option>
                <option value="partner_register">পার্টনার রেজিস্ট্রেশন (partner_register)</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>চিপ যোগ করুন</span>
              </button>
            </form>

            {/* Chips List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {cuteCatSettings.quickChips.map((chip) => (
                <div
                  key={chip.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">{chip.label}</span>
                    <span className="text-[10px] text-purple-700 font-mono block">➔ {chip.view}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCatChip(chip.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    title="Delete Chip"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: CATEGORY SHOWCASES & 3-CARD ENGINE */}
      {activeTab === 'SHOWCASES' && (
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={20} className="text-[#4e20b8]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Category Showcases & 3-Card Engine ({showcases.length})
                </h2>
                <span className="text-[10px] bg-purple-100 text-[#4e20b8] font-bold px-2 py-0.5 rounded-full">
                  Live on Homepage
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage all 20+ service categories and their 3 featured cards (Doctor, Hotel, Repair, Tech, Jobs, Products style).
              </p>
            </div>

            <button
              onClick={handleStartAddShowcase}
              className="bg-[#4e20b8] hover:bg-[#3d1796] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Category Showcase</span>
            </button>
          </div>

          {/* Add / Edit Category Showcase Section Form */}
          {isAddingShowcase && (
            <div className="bg-purple-50/70 rounded-3xl border border-purple-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#4e20b8]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingShowcaseId ? 'Edit Category Showcase Section' : 'Create New Category Showcase Section'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddingShowcase(false);
                    setEditingShowcaseId(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleSaveShowcase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Title Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category Title (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={showcaseForm.titleBangla}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, titleBangla: e.target.value })}
                      placeholder="e.g. ওয়েবসাইট ডিজাইন / ডেন্টাল ক্লিনিক"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Title English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category Title (English):
                    </label>
                    <input
                      type="text"
                      value={showcaseForm.titleEnglish}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, titleEnglish: e.target.value })}
                      placeholder="e.g. Website Design / Dental Clinic"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Subtitle Bangla */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tagline / Subtitle (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={showcaseForm.subtitleBangla || ''}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, subtitleBangla: e.target.value })}
                      placeholder="e.g. কাস্টম ওয়েবসাইট ও বিশ্বমানের সফটওয়্যার সার্ভিস"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Tag Group Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tag Group Category:
                    </label>
                    <select
                      value={showcaseForm.tagGroup}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, tagGroup: e.target.value as any })}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="TECH">টেক ও ডিজিটাল (TECH)</option>
                      <option value="HEALTH">স্বাস্থ্য ও চিকিৎসা (HEALTH)</option>
                      <option value="TRAVEL">হোটেল ও ট্রাভেল (TRAVEL)</option>
                      <option value="HOME_SERVICE">হোম সার্ভিস ও রিপেয়ার (HOME_SERVICE)</option>
                      <option value="COMMERCE">মার্কেটপ্লেস ও কেনাকাটা (COMMERCE)</option>
                      <option value="CAREER">চাকরি ও ক্যারিয়ার (CAREER)</option>
                    </select>
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Icon Name (Lucide):
                    </label>
                    <select
                      value={showcaseForm.iconName}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, iconName: e.target.value })}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="Globe">Globe (Website / Internet)</option>
                      <option value="Video">Video (Editing / Production)</option>
                      <option value="Stethoscope">Stethoscope (Doctor / Clinic)</option>
                      <option value="Building2">Building2 (Hotel / Resort)</option>
                      <option value="HeartPulse">HeartPulse (Nurse / Care)</option>
                      <option value="Users">Users (Caregiver / Team)</option>
                      <option value="Wind">Wind (AC Repair)</option>
                      <option value="Tv">Tv (Television Repair)</option>
                      <option value="ThermometerSnowflake">ThermometerSnowflake (Fridge)</option>
                      <option value="Zap">Zap (Electrician)</option>
                      <option value="Droplets">Droplets (Plumber)</option>
                      <option value="Sparkles">Sparkles (Cleaning Service)</option>
                      <option value="ShoppingBag">ShoppingBag (Product Buy)</option>
                      <option value="BookOpen">BookOpen (eBook)</option>
                      <option value="Repeat">Repeat (Used Sell)</option>
                      <option value="FileText">FileText (Job Post)</option>
                      <option value="Briefcase">Briefcase (Job Apply)</option>
                      <option value="UserPlus">UserPlus (Seller Join)</option>
                      <option value="ShieldCheck">ShieldCheck (Provider Join)</option>
                      <option value="Wrench">Wrench (General Technician)</option>
                      <option value="Laptop">Laptop (IT & Software)</option>
                      <option value="Truck">Truck (Delivery & Courier)</option>
                      <option value="Car">Car (Vehicle & Driver)</option>
                      <option value="Grid">Grid (More Services)</option>
                    </select>
                  </div>

                  {/* Theme Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Theme Color:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={showcaseForm.themeColor}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, themeColor: e.target.value })}
                        className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={showcaseForm.themeColor}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, themeColor: e.target.value })}
                        placeholder="#4e20b8"
                        className="flex-1 p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  {/* Category Photo Banner URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category Photo Banner URL:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={showcaseForm.bannerImage || ''}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, bannerImage: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                        required
                      />
                      <img
                        src={showcaseForm.bannerImage}
                        alt="banner preview"
                        className="w-16 h-9 rounded-lg object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=400&h=150&q=80';
                        }}
                      />
                    </div>
                  </div>

                  {/* Banner Tagline Badge */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banner Tagline Badge:
                    </label>
                    <input
                      type="text"
                      value={showcaseForm.bannerTagline || ''}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, bannerTagline: e.target.value })}
                      placeholder="e.g. ২০% অগ্রিমে বুকিং / স্পেশাল অফার"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Target View */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target App View on Click:
                    </label>
                    <select
                      value={showcaseForm.viewAllTargetView}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, viewAllTargetView: e.target.value })}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="service_request">সার্ভিস রিকোয়েস্ট (Service Request)</option>
                      <option value="doctors">ডাক্তার বুকিং (Doctor Portal)</option>
                      <option value="hotels">হোটেল বুকিং (Hotel Portal)</option>
                      <option value="nurses">নার্স ও কেয়ারগিভার (Nurse Portal)</option>
                      <option value="products">প্রোডাক্ট মার্কেটপ্লেস (Products)</option>
                      <option value="ebooks">ই-বুক লাইব্রেরি (eBooks)</option>
                      <option value="used_products">পুরাতন পণ্য ক্রয়-বিক্রয় (Used Products)</option>
                      <option value="jobs">জবস ও ক্যারিয়ার (Jobs Portal)</option>
                      <option value="partner_register">পার্টনার / সেলার রেজিস্ট্রেশন (Partner Register)</option>
                    </select>
                  </div>

                  {/* View All Button Text Bangla */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bottom Button Label (বাংলা):
                    </label>
                    <input
                      type="text"
                      value={showcaseForm.viewAllButtonTextBangla || ''}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, viewAllButtonTextBangla: e.target.value })}
                      placeholder="e.g. সব ডাক্তার সিরিয়াল দেখুন / সব এসি সার্ভিস ও রেট দেখুন"
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showcaseForm.isActive !== false}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, isActive: e.target.checked })}
                      className="rounded text-[#4e20b8] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Active (Visible on Homepage)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingShowcase(false);
                        setEditingShowcaseId(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4e20b8] hover:bg-[#3d1796] text-white shadow-md transition-all cursor-pointer"
                    >
                      {editingShowcaseId ? 'Update Showcase Section' : 'Save & Publish Category'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Showcases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {showcases.map((sec, index) => (
              <div
                key={sec.id}
                className={`bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col justify-between space-y-3 ${
                  sec.isActive ? 'border-slate-200 hover:border-purple-300 hover:shadow-md' : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div>
                  {/* Category Top Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${sec.themeColor}15`, color: sec.themeColor }}
                      >
                        <RenderCategoryIcon iconName={sec.iconName} size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                          <h3 className="text-sm font-black text-slate-900 truncate">{sec.titleBangla}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{sec.titleEnglish}</p>
                      </div>
                    </div>

                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase shrink-0">
                      {sec.tagGroup}
                    </span>
                  </div>

                  {/* Category Photo Banner Thumbnail */}
                  {sec.bannerImage && (
                    <div className="relative aspect-21/9 rounded-xl overflow-hidden my-2 bg-slate-900 border border-slate-100">
                      <img
                        src={sec.bannerImage}
                        alt={sec.titleBangla}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=400&h=150&q=80';
                        }}
                      />
                      {sec.bannerTagline && (
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ff6d00] text-white shadow-xs">
                          {sec.bannerTagline}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 3 Showcase Items Preview */}
                  <div className="space-y-2 my-2">
                    {sec.items.map((it) => (
                      <div key={it.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <img
                          src={it.imageUrl}
                          alt={it.title}
                          className="w-9 h-9 rounded object-cover ring-1 ring-slate-200 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-slate-800 truncate">{it.title}</div>
                          <div className="text-[9px] text-slate-500 truncate">{it.subtitle}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] font-bold text-slate-900">৳ {it.priceOrSalary}</div>
                          <div className="text-[9px] text-amber-500 flex items-center justify-end gap-0.5 font-bold">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            <span>{it.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Management Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleOpenItemManager(sec)}
                    className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] rounded-lg text-xs font-bold transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit3 size={12} />
                    <span>Manage Cards ({sec.items.length})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveShowcase(sec.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleMoveShowcase(sec.id, 'down')}
                      disabled={index === showcases.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => handleToggleShowcase(sec.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        sec.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={sec.isActive ? 'Active (Click to Hide)' : 'Hidden (Click to Activate)'}
                    >
                      {sec.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={() => handleStartEditShowcase(sec)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Edit Category Details"
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteShowcase(sec.id, sec.titleBangla)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ITEM MANAGER MODAL FOR INDIVIDUAL SERVICE CARDS */}
          {selectedShowcaseForItems && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${selectedShowcaseForItems.themeColor}15`, color: selectedShowcaseForItems.themeColor }}
                    >
                      <RenderCategoryIcon iconName={selectedShowcaseForItems.iconName} size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {selectedShowcaseForItems.titleBangla} — Service Cards
                      </h3>
                      <p className="text-xs text-slate-500">
                        Add, edit photos, prices, ratings, and actions for cards in this showcase.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedShowcaseForItems(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Add Card Form Toggle Button */}
                {!isAddingItem && (
                  <button
                    onClick={handleStartAddItem}
                    className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-[#4e20b8] border border-dashed border-purple-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add New Service Card to {selectedShowcaseForItems.titleBangla}</span>
                  </button>
                )}

                {/* Card Item Add/Edit Form */}
                {isAddingItem && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-900">
                        {editingItemId ? 'Edit Service Card' : 'Add New Service Card'}
                      </span>
                      <button
                        onClick={() => {
                          setIsAddingItem(false);
                          setEditingItemId(null);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Title */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Title:</label>
                          <input
                            type="text"
                            value={itemForm.title}
                            onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                            placeholder="e.g. ড. তানভীর হাসান / এসি মাস্টার সার্ভিস"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                            required
                          />
                        </div>

                        {/* Subtitle */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtitle / Specialty:</label>
                          <input
                            type="text"
                            value={itemForm.subtitle}
                            onChange={(e) => setItemForm({ ...itemForm, subtitle: e.target.value })}
                            placeholder="e.g. মেডিসিন বিশেষজ্ঞ / ১.৫ টন স্প্লিট এসি"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                            required
                          />
                        </div>

                        {/* Image URL */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Photo / Image URL:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={itemForm.imageUrl}
                              onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                              required
                            />
                            <img
                              src={itemForm.imageUrl}
                              alt="preview"
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 bg-slate-200 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                          </div>
                        </div>

                        {/* Price / Salary */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Price / Fee (in ৳ BDT):</label>
                          <input
                            type="text"
                            value={itemForm.priceOrSalary}
                            onChange={(e) => setItemForm({ ...itemForm, priceOrSalary: e.target.value })}
                            placeholder="e.g. ৭০০ / ৩,২০০ / ৪৫,০০০"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                            required
                          />
                        </div>

                        {/* Unit Text */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Text (Optional):</label>
                          <input
                            type="text"
                            value={itemForm.unitText || ''}
                            onChange={(e) => setItemForm({ ...itemForm, unitText: e.target.value })}
                            placeholder="e.g. /রাত, /ঘন্টা, শুরু, /মাস"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Rating */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Star Rating:</label>
                          <input
                            type="text"
                            value={itemForm.rating || '4.8'}
                            onChange={(e) => setItemForm({ ...itemForm, rating: e.target.value })}
                            placeholder="4.8"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Reviews Count */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Review Count:</label>
                          <input
                            type="text"
                            value={itemForm.reviewCount || '150'}
                            onChange={(e) => setItemForm({ ...itemForm, reviewCount: e.target.value })}
                            placeholder="320"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Badge */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Badge Label (Optional):</label>
                          <input
                            type="text"
                            value={itemForm.badge || ''}
                            onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })}
                            placeholder="e.g. ভেরিফাইড / টপ রেটেড"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* CTA Text */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Button CTA Text:</label>
                          <input
                            type="text"
                            value={itemForm.ctaText || 'বিস্তারিত দেখুন'}
                            onChange={(e) => setItemForm({ ...itemForm, ctaText: e.target.value })}
                            placeholder="e.g. বিস্তারিত দেখুন / প্রোফাইল দেখুন / বুকিং করুন"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Provider Name */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Provider / Agency Name:</label>
                          <input
                            type="text"
                            value={itemForm.providerName || ''}
                            onChange={(e) => setItemForm({ ...itemForm, providerName: e.target.value })}
                            placeholder="e.g. কোডার্স ল্যাব / ড. তানভীর হাসান"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Provider Role */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Provider Role / Designation:</label>
                          <input
                            type="text"
                            value={itemForm.providerRole || ''}
                            onChange={(e) => setItemForm({ ...itemForm, providerRole: e.target.value })}
                            placeholder="e.g. সিনিয়র ফুলস্ট্যাক টিম / মেডিসিন বিশেষজ্ঞ"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Provider Phone */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Provider Direct Phone / Hotline:</label>
                          <input
                            type="text"
                            value={itemForm.providerPhone || '01700000000'}
                            onChange={(e) => setItemForm({ ...itemForm, providerPhone: e.target.value })}
                            placeholder="01711-000000"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                          />
                        </div>

                        {/* Provider Experience */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Experience / Track Record:</label>
                          <input
                            type="text"
                            value={itemForm.providerExperience || '৩+ বছর অভিজ্ঞতা'}
                            onChange={(e) => setItemForm({ ...itemForm, providerExperience: e.target.value })}
                            placeholder="e.g. ৫+ বছর অভিজ্ঞতা / ১০০+ সফল প্রজেক্ট"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Delivery Time */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Time / Duration:</label>
                          <input
                            type="text"
                            value={itemForm.deliveryTime || '২৪-৪৮ ঘন্টা'}
                            onChange={(e) => setItemForm({ ...itemForm, deliveryTime: e.target.value })}
                            placeholder="e.g. ৩-৫ কার্যদিবস / তাৎক্ষণিক"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Warranty / Guarantee */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Warranty / Money-back Guarantee:</label>
                          <input
                            type="text"
                            value={itemForm.warrantyOrGuarantee || '১০০% কোয়ালিটি গ্যারান্টি'}
                            onChange={(e) => setItemForm({ ...itemForm, warrantyOrGuarantee: e.target.value })}
                            placeholder="e.g. ৩০ দিনের ফ্রি সাপোর্ট / মানি ব্যাক গ্যারান্টি"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Advance Percentage */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Advance Escrow Required (%):</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={itemForm.advancePercent ?? 20}
                            onChange={(e) => setItemForm({ ...itemForm, advancePercent: Number(e.target.value) || 20 })}
                            placeholder="20"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Full Description */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Complete Service / Product Description:</label>
                          <textarea
                            rows={3}
                            value={itemForm.description || ''}
                            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            placeholder="সম্পূর্ণ সার্ভিস বা প্রোডাক্টের বিস্তারিত বিবরণ, অফার এবং টার্মস..."
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        {/* Features List */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Key Features / Deliverables (Comma or Newline separated):</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(itemForm.features) ? itemForm.features.join('\n') : ''}
                            onChange={(e) => setItemForm({
                              ...itemForm,
                              features: e.target.value.split(/[\n,]+/).map(f => f.trim()).filter(Boolean)
                            })}
                            placeholder="কাস্টম রেসপনসিভ ডিজাইন&#10;ফ্রি ডোমেন ও হোস্টিং&#10;১ বছর ফ্রি টেকনিক্যাল সাপোর্ট"
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingItem(false);
                            setEditingItemId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-bold bg-[#4e20b8] hover:bg-[#3d1796] text-white rounded-lg shadow-xs cursor-pointer"
                        >
                          {editingItemId ? 'Update Card' : 'Add Card'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List of existing items */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">
                    Existing Cards in this Category ({selectedShowcaseForItems.items.length})
                  </span>

                  {selectedShowcaseForItems.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-purple-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-900">৳ {item.priceOrSalary}</span>
                            <span className="text-[10px] text-slate-400">{item.unitText}</span>
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                              ★ {item.rating} ({item.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleMoveItem(selectedShowcaseForItems.id, item.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveItem(selectedShowcaseForItems.id, item.id, 'down')}
                          disabled={idx === selectedShowcaseForItems.items.length - 1}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => handleStartEditItem(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(selectedShowcaseForItems.id, item.id, item.title)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedShowcaseForItems(null)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: DYNAMIC CATEGORY ENGINE */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle size={18} className="text-teal-700" />
              <h3 className="text-base font-bold text-slate-900">Add New Marketplace Category (Unlimited)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Create and activate any new service vertical without changing application code.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name (English):</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Electrician & Wiring"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bangla Name:</label>
                  <input
                    type="text"
                    value={newCatBangla}
                    onChange={(e) => setNewCatBangla(e.target.value)}
                    placeholder="e.g. ইলেকট্রিশিয়ান সার্ভিস"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Type:</label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="SERVICE">Standard Service</option>
                    <option value="DOCTOR">Doctor Consultation</option>
                    <option value="NURSE">Nurse Home Care</option>
                    <option value="HOTEL">Hotel & Resort</option>
                    <option value="PRODUCT">Product Store</option>
                    <option value="EBOOK">eBook Digital Store</option>
                    <option value="JOB">Job Postings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategories (Comma separated):</label>
                <input
                  type="text"
                  value={newCatSubcategories}
                  onChange={(e) => setNewCatSubcategories(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
              >
                + Create & Publish Category
              </button>
            </form>
          </div>

          {/* Existing Categories Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Active Marketplace Verticals ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                      {c.categoryType}
                    </span>
                  </div>
                  {c.banglaName && <div className="text-[11px] text-slate-500">{c.banglaName}</div>}
                  <div className="text-[10px] text-slate-400 truncate">{c.subcategories.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROVIDERS KYC VERIFICATION */}
      {activeTab === 'PROVIDERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Provider & Seller KYC Verification Registry</h3>
          <div className="space-y-3">
            {providers.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={p.avatarUrl} alt={p.fullName} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{p.fullName}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        NID: {p.nidNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{p.businessName} &bull; {p.phone}</div>
                    <div className="text-[10px] text-slate-400">Trade License: {p.tradeLicenseNumber || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.verificationStatus === 'VERIFIED' ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => marketplaceStore.updateProviderStatus(p.id, 'VERIFIED')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Approve NID & Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6 max-w-4xl">
          {/* Quick Branding Card */}
          <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold">Site Title & Custom Favicon Manager</h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  Currently: <span className="font-semibold text-white">"{settings.siteTitle || DEFAULT_SITE_TITLE}"</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('BRANDING')}
              className="bg-white text-purple-950 hover:bg-purple-50 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Manage Title & Favicon</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-2xl">
            <h3 className="text-base font-bold text-slate-900">Escrow & Financial System Settings</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Booking Advance Deposit (%):
                </label>
                <input
                  type="number"
                  value={settings.defaultAdvancePercent}
                  onChange={(e) => marketplaceStore.updateSystemSettings({ defaultAdvancePercent: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Required deposit to unlock customer phone & address (Standard: 20%).</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Platform Service Commission (%):
                </label>
                <input
                  type="number"
                  value={settings.platformCommissionPercent}
                  onChange={(e) => marketplaceStore.updateSystemSettings({ platformCommissionPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">QAAGA take rate on completed services (Standard: 10%).</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireAdminRequestReview}
                    onChange={(e) => marketplaceStore.updateSystemSettings({ requireAdminRequestReview: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span className="font-bold text-slate-800">Enforce Admin Review on Customer Requests</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireAdminOfferReview}
                    onChange={(e) => marketplaceStore.updateSystemSettings({ requireAdminOfferReview: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span className="font-bold text-slate-800">Enforce Admin Review on Provider Quotations</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SITE TITLE & FAVICON BRANDING MANAGER */}
      {activeTab === 'BRANDING' && (
        <div className="space-y-6">
          {/* Success Toast Banner */}
          {brandingSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{brandingSuccessMsg}</span>
              </div>
              <button
                onClick={() => setBrandingSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Browser Tab Simulation Preview */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-[11px] font-bold text-slate-400 ml-2">Live Browser Tab Simulation</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                Live DOM Title & Link Rel="Icon"
              </span>
            </div>

            {/* Realistic Chrome Tab Bar */}
            <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-3">
              {/* Tab Item */}
              <div className="bg-slate-900 text-slate-200 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-slate-700 shadow-md min-w-[280px] max-w-full md:max-w-md">
                <img
                  src={getActiveFaviconHref(settings)}
                  alt="Favicon Preview"
                  className="w-4 h-4 rounded-sm shrink-0 object-contain shadow-xs"
                />
                <span className="text-xs font-bold text-slate-100 truncate flex-1">
                  {brandingForm.siteTitle || DEFAULT_SITE_TITLE}
                </span>
                <span className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer">✕</span>
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 w-full bg-slate-900/90 rounded-xl px-3 py-1.5 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <Lock size={12} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold">https://</span>
                <span className="text-slate-200 font-medium">qaaga.com</span>
                <span className="text-slate-500">/</span>
                <span className="text-[10px] text-purple-400 ml-auto font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                  Verified Super Marketplace
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Site Title & SEO Meta Configuration */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={20} className="text-purple-600" />
                    <h3 className="text-base font-bold text-slate-900">Site Title & Name Configuration</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleSetAiStudioTitlePreset}
                    className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    <span>AI Studio Title Preset</span>
                  </button>
                </div>

                <form onSubmit={handleSaveBrandingInfo} className="space-y-4 text-xs">
                  {/* Browser Document Title (Full) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800">
                        Browser Document Title (Window & Tab Name) *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {brandingForm.siteTitle.length} chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={brandingForm.siteTitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, siteTitle: e.target.value })}
                      placeholder="e.g. qaaga.com is Bangladesh's verified multi-service super marketplace ."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This directly sets the <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-mono">&lt;title&gt;</code> tag and the text shown on the browser tab.
                    </p>
                  </div>

                  {/* Brand / Short Site Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Brand Name:
                      </label>
                      <input
                        type="text"
                        value={brandingForm.siteName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                        placeholder="qaaga.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Theme / Accent Color:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandingForm.themeColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, themeColor: e.target.value })}
                          className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={brandingForm.themeColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, themeColor: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Platform Tagline:
                    </label>
                    <input
                      type="text"
                      value={brandingForm.siteTagline}
                      onChange={(e) => setBrandingForm({ ...brandingForm, siteTagline: e.target.value })}
                      placeholder="Bangladesh's verified multi-service super marketplace"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      SEO Meta Description:
                    </label>
                    <textarea
                      rows={3}
                      value={brandingForm.siteDescription}
                      onChange={(e) => setBrandingForm({ ...brandingForm, siteDescription: e.target.value })}
                      placeholder="QAAGA is Bangladesh's 1st verified multi-service super marketplace..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleResetAllBranding}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Reset to Factory Defaults</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-purple-900 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <Check size={15} />
                      <span>Save & Apply Title</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Custom Favicon Hub (Upload, Presets & URL) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">Favicon Management Hub</h3>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Active: {settings.faviconType.toUpperCase()}
                  </span>
                </div>

                {/* Active Favicon Highlight Card */}
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={getActiveFaviconHref(settings)}
                        alt="Current Favicon"
                        className="w-10 h-10 object-contain rounded-md"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Browser Favicon</div>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                        {settings.faviconType === 'preset'
                          ? FAVICON_PRESETS.find(p => p.id === settings.faviconPresetId)?.name || 'QAAGA Official Preset'
                          : settings.faviconType === 'custom_upload'
                          ? 'Uploaded Custom Icon File'
                          : 'Custom External Web Icon'}
                      </h4>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle size={11} />
                        <span>Live in browser head tag</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyActiveFaviconUri}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="Copy Favicon URI"
                    >
                      <Copy size={13} />
                      <span className="hidden sm:inline">{copiedDataUri ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleRemoveFavicon}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="Remove custom favicon"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>

                {/* METHOD 1: Upload Custom Favicon File */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Option 1: Upload Custom Favicon File (PNG, JPG, SVG, ICO)
                  </label>
                  
                  <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.ico,.webp"
                      onChange={handleFileUploadFavicon}
                      className="hidden"
                    />
                    <UploadCloud size={24} className="text-purple-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900">Click or Drag & Drop to Upload Favicon</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Recommended: 64x64 or 128x128 PNG/SVG with transparent background</span>
                  </label>

                  {faviconUploadPreview && (
                    <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={faviconUploadPreview} alt="Upload preview" className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Uploaded File Preview</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">Ready & Applied</div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFavicon}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* METHOD 2: Curated High-Definition Vector Presets */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Option 2: Select from Curated Vector Presets (1-Click Apply)
                    </label>
                    <span className="text-[10px] text-slate-400">7 Custom SVG Icons</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FAVICON_PRESETS.map((preset) => {
                      const isSelected = settings.faviconType === 'preset' && settings.faviconPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectFaviconPreset(preset.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                            <img
                              src={preset.svgDataUri}
                              alt={preset.name}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{preset.name}</h4>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{preset.nameBangla}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* METHOD 3: Direct Web Image URL */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    Option 3: External Favicon Web Image URL
                  </label>
                  <form onSubmit={handleApplyCustomFaviconUrl} className="flex gap-2">
                    <input
                      type="url"
                      value={customFaviconUrlInput}
                      onChange={(e) => setCustomFaviconUrlInput(e.target.value)}
                      placeholder="https://example.com/assets/favicon.png"
                      className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Apply URL
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SELLERS & MERCHANTS MANAGEMENT */}
      {activeTab === 'SELLERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                placeholder="দোকানের নাম, মালিক বা ফোন নম্বর খুঁজুন..."
                className="w-full bg-slate-50 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#4e20b8]"
              />
            </div>

            <button
              onClick={handleStartAddSeller}
              className="px-4 py-2.5 bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <PlusCircle size={15} />
              <span>+ নতুন সেলার / মার্চেন্ট যোগ করুন</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">রেজিস্টার্ড মার্চেন্ট ও শপ তালিকা ({sellerStores.length})</h3>
                <p className="text-xs text-slate-500">ভেরিফিকেশন ব্যাজ, অনুমোদন ও প্রোফাইল ব্যবস্থাপনা</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">মার্চেন্ট ও শপ</th>
                    <th className="p-4">স্বত্বাধিকারী ও যোগাযোগ</th>
                    <th className="p-4">ঠিকানা ও লাইসেন্স</th>
                    <th className="p-4">রেটিং ও ব্যালেন্স</th>
                    <th className="p-4">স্ট্যাটাস ও ব্যাজ</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerStores
                    .filter(s =>
                      s.shopName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
                      (s.ownerName || '').toLowerCase().includes(sellerSearch.toLowerCase()) ||
                      s.phone.includes(sellerSearch)
                    )
                    .map(seller => (
                      <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={seller.shopLogo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                              alt={seller.shopName}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{seller.shopName}</span>
                                {seller.isVerified && (
                                  <span title="ভেরিফাইড মার্চেন্ট">
                                    <BadgeCheck size={14} className="text-amber-500 fill-amber-100 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {seller.shopBio || 'মার্কেটপ্লেস স্টোর'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-900">{seller.ownerName}</div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">{seller.phone}</div>
                        </td>

                        <td className="p-4">
                          <div className="text-slate-800 font-medium">{seller.area || seller.thana || 'মিরপুর'}, {seller.district || 'ঢাকা'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{seller.tradeLicenseNumber || 'N/A'}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-amber-600 flex items-center gap-1">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{seller.rating || 5.0} / ৫.০</span>
                          </div>
                          <div className="text-[11px] font-bold text-purple-700 mt-0.5">
                            ব্যালেন্স: ৳ {(seller.availableBalance || 0).toLocaleString()}
                          </div>
                        </td>

                        <td className="p-4 space-y-1">
                          <button
                            onClick={() => handleToggleSellerVerify(seller.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block cursor-pointer transition-colors ${
                              seller.isVerified
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {seller.isVerified ? '✓ ভেরিফাইড' : 'আন-ভেরিফাইড'}
                          </button>

                          <button
                            onClick={() => handleToggleSellerOfficialBadge(seller.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block cursor-pointer transition-colors ${
                              seller.hasOfficialBadge
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {seller.hasOfficialBadge ? '★ অফিসিয়াল পার্টনার' : '+ পার্টনার ব্যাজ'}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onNavigate('seller_store', { sellerId: seller.id })}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              title="স্টোরফ্রন্ট ভিজিট করুন"
                            >
                              <ExternalLink size={14} />
                            </button>

                            <button
                              onClick={() => handleStartEditSeller(seller)}
                              className="p-2 rounded-xl bg-purple-50 text-[#4e20b8] hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
                              title="তথ্য এডিট করুন"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteSeller(seller.id, seller.shopName)}
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SELLER PAYOUTS MODERATION */}
      {activeTab === 'SELLER_PAYOUTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">মার্চেন্ট উইথড্রয়াল ও পে-আউট অনুমোদন ({sellerPayouts.length})</h3>
                <p className="text-xs text-slate-500">বিকাশ/নগদ/ব্যাংক ট্রান্সফারে টাকা পাঠিয়ে পেমেন্ট কনফার্ম করুন</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">মার্চেন্ট শপ</th>
                    <th className="p-4">পরিমাণ (BDT)</th>
                    <th className="p-4">মেথড ও অ্যাকাউন্ট</th>
                    <th className="p-4">তারিখ</th>
                    <th className="p-4">স্ট্যাটাস & Trx</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        কোনো উইথড্রয়াল রিকোয়েস্ট নেই।
                      </td>
                    </tr>
                  ) : (
                    sellerPayouts.map(payout => (
                      <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{payout.shopName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {payout.sellerId}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-black text-slate-900 text-sm">
                            ৳ {payout.amount.toLocaleString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-purple-700">{payout.method}</div>
                          <div className="text-slate-600 font-mono text-[11px] mt-0.5">{payout.accountDetails}</div>
                          {payout.note && (
                            <div className="text-[10px] text-slate-400 mt-0.5">নোট: {payout.note}</div>
                          )}
                        </td>

                        <td className="p-4 text-slate-500">
                          {new Date(payout.requestedAt).toLocaleDateString('bn-BD')}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            payout.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : payout.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : payout.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {payout.status}
                          </span>
                          {payout.transactionRef && (
                            <div className="text-emerald-700 font-mono text-[10px] mt-1">
                              Trx: {payout.transactionRef}
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {payout.status === 'PENDING' ? (
                            <button
                              onClick={() => handleOpenProcessPayout(payout)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                            >
                              প্রসেস করুন
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenProcessPayout(payout)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                            >
                              হালনাগাদ
                            </button>
                          )}
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

      {/* SELLER ADD / EDIT MODAL */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingSellerId ? 'মার্চেন্ট প্রোফাইল সম্পাদনা (Edit Merchant Store)' : 'নতুন মার্চেন্ট স্টোর যুক্ত করুন (Add Seller Store)'}
                </h3>
                <p className="text-xs text-slate-500">qaaga.com মার্কেটপ্লেসের সকল ফিচার ও স্টোরফ্রন্ট অ্যাক্সেস দেওয়া হবে</p>
              </div>
              <button
                onClick={() => setIsSellerModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSeller} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">দোকান / শপের নাম:</label>
                  <input
                    type="text"
                    value={sellerForm.shopName}
                    onChange={(e) => setSellerForm({ ...sellerForm, shopName: e.target.value })}
                    placeholder="উদা: ঢাকা টেক অ্যান্ড টুলস"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মালিকের নাম:</label>
                  <input
                    type="text"
                    value={sellerForm.ownerName}
                    onChange={(e) => setSellerForm({ ...sellerForm, ownerName: e.target.value })}
                    placeholder="উদা: তারেক মাহমুদ"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ফোন নম্বর (সরাসরি কল):</label>
                  <input
                    type="text"
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর:</label>
                  <input
                    type="text"
                    value={sellerForm.whatsapp}
                    onChange={(e) => setSellerForm({ ...sellerForm, whatsapp: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জেলা ও থানা / এলাকা:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={sellerForm.district}
                      onChange={(e) => setSellerForm({ ...sellerForm, district: e.target.value })}
                      placeholder="জেলা"
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    />
                    <input
                      type="text"
                      value={sellerForm.area}
                      onChange={(e) => setSellerForm({ ...sellerForm, area: e.target.value })}
                      placeholder="এলাকা"
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ট্রেড লাইসেন্স নম্বর:</label>
                  <input
                    type="text"
                    value={sellerForm.tradeLicenseNumber}
                    onChange={(e) => setSellerForm({ ...sellerForm, tradeLicenseNumber: e.target.value })}
                    placeholder="TRAD/DNCC/XXXXX"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শপ লোগো ইমেজ URL:</label>
                <input
                  type="text"
                  value={sellerForm.shopLogo}
                  onChange={(e) => setSellerForm({ ...sellerForm, shopLogo: e.target.value })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শপ কভার ব্যানার URL:</label>
                <input
                  type="text"
                  value={sellerForm.shopBanner}
                  onChange={(e) => setSellerForm({ ...sellerForm, shopBanner: e.target.value })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শপ পরিচিতি ও বায়ো:</label>
                <textarea
                  rows={2}
                  value={sellerForm.shopBio}
                  onChange={(e) => setSellerForm({ ...sellerForm, shopBio: e.target.value })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sellerForm.isVerified}
                    onChange={(e) => setSellerForm({ ...sellerForm, isVerified: e.target.checked })}
                    className="rounded text-[#4e20b8]"
                  />
                  <span>ভেরিফাইড ব্যাজ একটিভ</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sellerForm.hasOfficialBadge}
                    onChange={(e) => setSellerForm({ ...sellerForm, hasOfficialBadge: e.target.checked })}
                    className="rounded text-[#4e20b8]"
                  />
                  <span>অফিসিয়াল পার্টনার ব্যাজ</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSellerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4e20b8] hover:bg-[#3d1696] text-white font-bold cursor-pointer shadow-md"
                >
                  {editingSellerId ? 'সংরক্ষণ করুন' : 'মার্চেন্ট যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT PROCESS MODAL */}
      {selectedPayoutForProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">পে-আউট অনুমোদন ও ট্রানজেকশন</h3>
                <p className="text-xs text-slate-500">
                  মার্চেন্ট: <strong>{selectedPayoutForProcess.shopName}</strong> &bull; পরিমাণ: <strong>৳ {selectedPayoutForProcess.amount.toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPayoutForProcess(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProcessPayout} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">পেমেন্ট মেথড: <strong className="text-purple-700">{selectedPayoutForProcess.method}</strong></div>
                <div className="text-slate-700 font-mono font-bold">{selectedPayoutForProcess.accountDetails}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস আপডেট:</label>
                <select
                  value={payoutProcessStatus}
                  onChange={(e) => setPayoutProcessStatus(e.target.value as any)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="PAID">PAID (টাকা পরিশোধ সম্পন্ন)</option>
                  <option value="APPROVED">APPROVED (অনুমোদিত - অপেক্ষমান)</option>
                  <option value="REJECTED">REJECTED (বাতিল)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ট্রানজেকশন রেফারেন্স / TrxID:</label>
                <input
                  type="text"
                  value={payoutTrxRef}
                  onChange={(e) => setPayoutTrxRef(e.target.value)}
                  placeholder="TXN-XXXXXX"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অ্যাডমিন নোট:</label>
                <input
                  type="text"
                  value={payoutAdminNote}
                  onChange={(e) => setPayoutAdminNote(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayoutForProcess(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: ESCROW RECONCILIATION */}
      {activeTab === 'FINANCES' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Escrow Ledger & Transaction Reconciliation</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Total (BDT)</th>
                  <th className="p-3">20% Escrow</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-bold">{b.bookingReference}</td>
                    <td className="p-3">{b.serviceTitle}</td>
                    <td className="p-3">{b.customerName}</td>
                    <td className="p-3">{b.providerName}</td>
                    <td className="p-3 font-bold">BDT {b.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-teal-800 font-bold">BDT {b.advancePaid.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="bg-teal-50 text-teal-900 px-2 py-0.5 rounded font-semibold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
