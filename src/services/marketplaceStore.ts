import {
  ServiceRequest,
  ProviderOffer,
  Booking,
  DoctorProfile,
  DoctorAppointment,
  NurseProfile,
  CaregiverProfile,
  HotelProfile,
  HotelBooking,
  Product,
  ProductOrder,
  ProductOrderItem,
  EBook,
  EBookPurchase,
  UsedProductListing,
  JobPost,
  JobApplication,
  ChatMessage,
  NotificationItem,
  PlatformSystemSettings,
  ServiceCategory,
  ProviderProfile,
  UserProfile,
  UserRole,
  ServiceRequestStatus,
  ProviderOfferStatus,
  HeroBannerSlide,
  CategoryShowcaseSection,
  ShowcaseCardItem,
  CuteCatAssistantSettings,
  CatQuickChip,
  FeedPost,
  FeedComment,
  UserFollow,
  FeedBannerSlide
} from '../types';

import {
  INITIAL_SYSTEM_SETTINGS,
  SEED_USERS,
  SEED_PROVIDERS,
  SEED_DOCTORS,
  SEED_NURSES,
  SEED_CAREGIVERS,
  SEED_HOTELS,
  SEED_PRODUCTS,
  SEED_EBOOKS,
  SEED_USED_PRODUCTS,
  SEED_JOBS,
  SEED_SERVICE_REQUESTS,
  SEED_OFFERS,
  SEED_BOOKINGS
} from '../data/mockSeedData';

import { applyFaviconAndTitle, FAVICON_PRESETS, DEFAULT_SITE_TITLE } from '../data/faviconPresets';
import { SEED_FEED_POSTS, SEED_FOLLOWS, INITIAL_FEED_BANNER_SLIDES } from '../data/mockFeedData';
import { MARKETPLACE_CATEGORIES } from '../data/categoriesData';
import { INITIAL_CATEGORY_SHOWCASES } from '../data/categoryShowcasesData';
import { INITIAL_CUTE_CAT_SETTINGS } from '../data/cuteCatData';

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: 'banner-repair',
    categoryKey: 'repair',
    titleBangla: 'মোঃ কামরুল হাসান',
    subtitleBangla: 'সার্টিফাইড এসি ও ইলেকট্রিক্যাল স্পেশালিস্ট',
    badgeBangla: 'সার্টিফাইড টেকনিশিয়ান (৪.৯৫ ★)',
    ratingText: '৪.৯৫ ★ (১২০+ রিভিউ)',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'service_request',
    themeColor: '#0284c7',
    accentGradient: 'from-sky-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 1
  },
  {
    id: 'banner-doctor',
    categoryKey: 'doctor',
    titleBangla: 'ডাঃ ফাহমিদা সুলতানা',
    subtitleBangla: 'এমবিবিএস, এফসিপিএস (মেডিসিন ও কার্ডিওলজি বিশেষজ্ঞ)',
    badgeBangla: 'বিএমডিসি ভেরিফাইড (৪.৯ ★)',
    ratingText: '৪.৯ ★ (১৮০+ রোগী দেখেছেন)',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'doctors',
    themeColor: '#10b981',
    accentGradient: 'from-emerald-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 2
  },
  {
    id: 'banner-home-service',
    categoryKey: 'home_service',
    titleBangla: 'হোম সার্ভিস ও ডিপ ক্লিনিং',
    subtitleBangla: 'প্লাম্বিং, স্যানিটারি, হোম ক্লিনিং ও হাইজিন কেয়ার',
    badgeBangla: '১০০% ভেরিফাইড ওয়ারেন্টি',
    ratingText: '৪.৮৫ ★ (৩৫০+ সার্ভিস ডেলিভারি)',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'service_request',
    themeColor: '#2563eb',
    accentGradient: 'from-blue-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 3
  },
  {
    id: 'banner-hotel',
    categoryKey: 'hotel',
    titleBangla: 'লাক্সারি হোটেল ও রিসোর্ট',
    subtitleBangla: 'কক্সবাজার, সিলেট, সাজেক ও কুয়াকাটায় সেরা রুম রেট',
    badgeBangla: 'ইনস্ট্যান্ট কনফার্মেশন ও ক্যাশব্যাক',
    ratingText: '৪.৯ ★ (প্রিমিয়াম পার্টনার)',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'hotels',
    themeColor: '#4f46e5',
    accentGradient: 'from-indigo-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 4
  },
  {
    id: 'banner-products',
    categoryKey: 'products',
    titleBangla: 'জেনুইন টুলস ও হোম গ্যাজেট',
    subtitleBangla: 'সরাসরি অফিসিয়াল ডিলার থেকে ক্যাশ অন ডেলিভারিতে',
    badgeBangla: '১ বছরের অফিসিয়াল ওয়ারেন্টি',
    ratingText: '৪.৮ ★ (ফ্রি ঢাকা ডেলিভারি)',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'products',
    themeColor: '#ff6d00',
    accentGradient: 'from-amber-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 5
  },
  {
    id: 'banner-jobs',
    categoryKey: 'jobs',
    titleBangla: 'টপ কোম্পানি জবস ও নিয়োগ',
    subtitleBangla: 'আইটি, ইঞ্জিনিয়ারিং, সেলস ও টেকনিশিয়ান ক্যারিয়ার',
    badgeBangla: 'সরাসরি ইন্টারভিউ কল',
    ratingText: '১০০+ সক্রিয় নিয়োগ বিজ্ঞপ্তি',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&h=750&q=80',
    targetView: 'jobs',
    themeColor: '#9333ea',
    accentGradient: 'from-purple-900/90 via-slate-900/80 to-slate-950/95',
    isActive: true,
    order: 6
  }
];

type Listener = () => void;

class MarketplaceStore {
  private users: UserProfile[] = [...SEED_USERS];
  private providers: ProviderProfile[] = [...SEED_PROVIDERS];
  private categories: ServiceCategory[] = [...MARKETPLACE_CATEGORIES];
  private heroBanners: HeroBannerSlide[] = [...DEFAULT_HERO_BANNERS];
  private categoryShowcases: CategoryShowcaseSection[] = [...INITIAL_CATEGORY_SHOWCASES];
  private cuteCatSettings: CuteCatAssistantSettings = { ...INITIAL_CUTE_CAT_SETTINGS };
  private requests: ServiceRequest[] = [...SEED_SERVICE_REQUESTS];
  private offers: ProviderOffer[] = [...SEED_OFFERS];
  private bookings: Booking[] = [...SEED_BOOKINGS];
  private doctors: DoctorProfile[] = [...SEED_DOCTORS];
  private appointments: DoctorAppointment[] = [];
  private nurses: NurseProfile[] = [...SEED_NURSES];
  private caregivers: CaregiverProfile[] = [...SEED_CAREGIVERS];
  private hotels: HotelProfile[] = [...SEED_HOTELS];
  private hotelBookings: HotelBooking[] = [];
  private products: Product[] = [...SEED_PRODUCTS];
  private orders: ProductOrder[] = [];
  private ebooks: EBook[] = [...SEED_EBOOKS];
  private ebookPurchases: EBookPurchase[] = [];
  private usedProducts: UsedProductListing[] = [...SEED_USED_PRODUCTS];
  private jobs: JobPost[] = [...SEED_JOBS];
  private jobApplications: JobApplication[] = [];
  private feedPosts: FeedPost[] = [...SEED_FEED_POSTS];
  private follows: UserFollow[] = [...SEED_FOLLOWS];
  private feedSlides: FeedBannerSlide[] = [...INITIAL_FEED_BANNER_SLIDES];
  private cartItems: { product: Product; quantity: number }[] = [
    {
      product: SEED_PRODUCTS[0],
      quantity: 1
    }
  ];
  private supportConversations: {
    id: string;
    channelName: string;
    avatar: string;
    role: string;
    online: boolean;
    messages: {
      id: string;
      senderId: string;
      senderName: string;
      senderRole: string;
      text: string;
      createdAt: string;
      attachmentUrl?: string;
      isSupport?: boolean;
    }[];
  }[] = [
    {
      id: 'support-main',
      channelName: 'qaaga.com লাইভ সাপোর্ট (24/7 Helpline)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Official Help Desk',
      online: true,
      messages: [
        {
          id: 's-msg-1',
          senderId: 'support-bot',
          senderName: 'সাদিয়া ইসলাম (Customer Support)',
          senderRole: 'SUPPORT',
          text: 'আসসালামু আলাইকুম! qaaga.com-এ স্বাগতম। আপনার যেকোনো সেবা, ডাক্তার অ্যাপয়েন্টমেন্ট, হোটেল বা পণ্য অর্ডারে আমি কীভাবে সাহায্য করতে পারি?',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          isSupport: true
        }
      ]
    },
    {
      id: 'support-provider-ac',
      channelName: 'Engr. Kamrul Hasan (AC Specialist)',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      role: 'Verified Service Provider',
      online: true,
      messages: [
        {
          id: 'p-msg-1',
          senderId: 'provider-kamrul',
          senderName: 'Engr. Kamrul Hasan',
          senderRole: 'PROVIDER',
          text: 'হ্যালো স্যার! আপনার এসি সার্ভিসের রিকোয়েস্ট দেখেছি। আগামীকাল সকাল ১০টায় কি ভিজিট করতে পারব?',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          isSupport: false
        }
      ]
    },
    {
      id: 'support-seller-tech',
      channelName: 'Tech Mart BD (Official Seller)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'Marketplace Seller',
      online: true,
      messages: [
        {
          id: 'sm-msg-1',
          senderId: 'seller-tech',
          senderName: 'Tech Mart BD',
          senderRole: 'SELLER',
          text: 'আমাদের সব প্রোডাক্টে ১ বছরের অফিসিয়াল ওয়ারেন্টি এবং ঢাকা সিটির ভেতর ১ দিনে ফ্রি হোম ডেলিভারি রয়েছে।',
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          isSupport: false
        }
      ]
    }
  ];
  private chatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      bookingId: 'book-901',
      senderId: 'user-provider-1',
      senderName: 'Kamrul AC Care',
      senderRole: 'PROVIDER',
      text: 'Salam! I have departed with the high pressure jet wash tools. ETA is approximately 25 minutes.',
      createdAt: '2026-08-24T03:35:00Z',
      readByReceiver: true
    }
  ];
  private notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'user-customer-1',
      title: 'Provider is On The Way',
      message: 'Engr. Kamrul Hasan has started his journey to your Dhanmondi address.',
      type: 'PROVIDER_ON_THE_WAY',
      isRead: false,
      createdAt: '2026-08-24T03:30:00Z'
    },
    {
      id: 'notif-2',
      userId: 'user-customer-1',
      title: 'Quotation Approved by Admin',
      message: 'New verified quote received for your AC servicing request.',
      type: 'OFFER_RECEIVED',
      isRead: true,
      createdAt: '2026-08-24T03:15:00Z'
    }
  ];
  private settings: PlatformSystemSettings = { ...INITIAL_SYSTEM_SETTINGS };
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
    applyFaviconAndTitle(this.settings);
  }

  private saveToStorage() {
    try {
      const data = {
        requests: this.requests,
        offers: this.offers,
        bookings: this.bookings,
        appointments: this.appointments,
        hotelBookings: this.hotelBookings,
        orders: this.orders,
        ebookPurchases: this.ebookPurchases,
        usedProducts: this.usedProducts,
        jobs: this.jobs,
        jobApplications: this.jobApplications,
        chatMessages: this.chatMessages,
        notifications: this.notifications,
        settings: this.settings,
        providers: this.providers,
        products: this.products,
        categories: this.categories,
        heroBanners: this.heroBanners,
        categoryShowcases: this.categoryShowcases,
        cartItems: this.cartItems,
        supportConversations: this.supportConversations
      };
      localStorage.setItem('qaaga_db_cache', JSON.stringify(data));
    } catch (e) {
      // Storage quota or iframe sandbox safe
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('qaaga_db_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.requests) this.requests = parsed.requests;
        if (parsed.offers) this.offers = parsed.offers;
        if (parsed.bookings) this.bookings = parsed.bookings;
        if (parsed.appointments) this.appointments = parsed.appointments;
        if (parsed.hotelBookings) this.hotelBookings = parsed.hotelBookings;
        if (parsed.orders) this.orders = parsed.orders;
        if (parsed.ebookPurchases) this.ebookPurchases = parsed.ebookPurchases;
        if (parsed.usedProducts) this.usedProducts = parsed.usedProducts;
        if (parsed.jobs) this.jobs = parsed.jobs;
        if (parsed.jobApplications) this.jobApplications = parsed.jobApplications;
        if (parsed.chatMessages) this.chatMessages = parsed.chatMessages;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.settings) {
          this.settings = {
            ...INITIAL_SYSTEM_SETTINGS,
            ...parsed.settings
          };
        }
        if (parsed.providers) this.providers = parsed.providers;
        if (parsed.products) this.products = parsed.products;
        if (parsed.categories) this.categories = parsed.categories;
        if (parsed.heroBanners) this.heroBanners = parsed.heroBanners;
        if (parsed.categoryShowcases && Array.isArray(parsed.categoryShowcases) && parsed.categoryShowcases.length > 0) {
          this.categoryShowcases = parsed.categoryShowcases;
        }
        if (parsed.cartItems) this.cartItems = parsed.cartItems;
        if (parsed.supportConversations) this.supportConversations = parsed.supportConversations;
      }
    } catch (e) {
      // Fallback
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    applyFaviconAndTitle(this.settings);
    this.listeners.forEach((l) => l());
  }

  public resetToFreshSeed() {
    this.users = [...SEED_USERS];
    this.providers = [...SEED_PROVIDERS];
    this.categories = [...MARKETPLACE_CATEGORIES];
    this.heroBanners = [...DEFAULT_HERO_BANNERS];
    this.categoryShowcases = [...INITIAL_CATEGORY_SHOWCASES];
    this.requests = [...SEED_SERVICE_REQUESTS];
    this.offers = [...SEED_OFFERS];
    this.bookings = [...SEED_BOOKINGS];
    this.doctors = [...SEED_DOCTORS];
    this.appointments = [];
    this.nurses = [...SEED_NURSES];
    this.caregivers = [...SEED_CAREGIVERS];
    this.hotels = [...SEED_HOTELS];
    this.hotelBookings = [];
    this.products = [...SEED_PRODUCTS];
    this.orders = [];
    this.ebooks = [...SEED_EBOOKS];
    this.ebookPurchases = [];
    this.usedProducts = [...SEED_USED_PRODUCTS];
    this.jobs = [...SEED_JOBS];
    this.jobApplications = [];
    this.settings = { ...INITIAL_SYSTEM_SETTINGS };
    try {
      localStorage.removeItem('qaaga_db_cache');
    } catch (e) {}
    this.notify();
  }

  // --- GETTERS ---
  public getCategories() { return this.categories; }
  public getHeroBanners() { return this.heroBanners.sort((a, b) => a.order - b.order); }
  public getActiveHeroBanners() { return this.heroBanners.filter(b => b.isActive).sort((a, b) => a.order - b.order); }
  public getProviders() { return this.providers; }
  public getRequests() { return this.requests; }
  public getOffers() { return this.offers; }
  public getBookings() { return this.bookings; }
  public getDoctors() { return this.doctors; }
  public getAppointments() { return this.appointments; }
  public getNurses() { return this.nurses; }
  public getCaregivers() { return this.caregivers; }
  public getHotels() { return this.hotels; }
  public getHotelBookings() { return this.hotelBookings; }
  public getProducts() { return this.products; }
  public getOrders() { return this.orders; }
  public getEbooks() { return this.ebooks; }
  public getEbookPurchases() { return this.ebookPurchases; }
  public getUsedProducts() { return this.usedProducts; }
  public getJobs() { return this.jobs; }
  public getJobApplications() { return this.jobApplications; }
  public getChatMessages(bookingId: string) { return this.chatMessages.filter(m => m.bookingId === bookingId); }
  public getNotifications(userId?: string) {
    if (!userId) return this.notifications;
    return this.notifications.filter(n => n.userId === userId || n.userId === 'user-customer-1');
  }
  public getSettings() { return this.settings; }
  public getUsers() { return this.users; }

  // --- CART MANAGEMENT ---
  public getCartItems() {
    return this.cartItems;
  }

  public getCartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  public getCartSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  }

  public addToCart(product: Product, quantity: number = 1) {
    const existingIndex = this.cartItems.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      this.cartItems[existingIndex].quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }
    this.notify();
  }

  public updateCartQuantity(productId: string, delta: number) {
    const item = this.cartItems.find(i => i.product.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      this.notify();
    }
  }

  public removeFromCart(productId: string) {
    this.cartItems = this.cartItems.filter(i => i.product.id !== productId);
    this.notify();
  }

  public clearCart() {
    this.cartItems = [];
    this.notify();
  }

  // --- HERO BANNERS & SLIDER MANAGEMENT (Admin & Live Sync) ---
  public addHeroBanner(banner: Omit<HeroBannerSlide, 'id'>): HeroBannerSlide {
    const id = `banner-${Date.now().toString(36)}`;
    const newBanner: HeroBannerSlide = {
      ...banner,
      id,
      order: banner.order || (this.heroBanners.length + 1)
    };
    this.heroBanners.push(newBanner);
    this.notify();
    return newBanner;
  }

  public updateHeroBanner(id: string, updates: Partial<HeroBannerSlide>) {
    const index = this.heroBanners.findIndex(b => b.id === id);
    if (index > -1) {
      this.heroBanners[index] = {
        ...this.heroBanners[index],
        ...updates
      };
      this.notify();
    }
  }

  public deleteHeroBanner(id: string) {
    this.heroBanners = this.heroBanners.filter(b => b.id !== id);
    this.notify();
  }

  public toggleHeroBanner(id: string) {
    const banner = this.heroBanners.find(b => b.id === id);
    if (banner) {
      banner.isActive = !banner.isActive;
      this.notify();
    }
  }

  public moveHeroBannerOrder(id: string, direction: 'up' | 'down') {
    const sorted = [...this.heroBanners].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(b => b.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const current = sorted[index];
      const tempOrder = prev.order;
      prev.order = current.order;
      current.order = tempOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const current = sorted[index];
      const tempOrder = next.order;
      next.order = current.order;
      current.order = tempOrder;
    }
    this.heroBanners = sorted;
    this.notify();
  }

  // --- CATEGORY SHOWCASE SECTIONS (All 20+ Categories with Cards & Admin CRUD) ---
  public getCategoryShowcases(): CategoryShowcaseSection[] {
    return [...this.categoryShowcases].sort((a, b) => a.order - b.order);
  }

  public addCategoryShowcase(sec: Omit<CategoryShowcaseSection, 'id' | 'order'>): CategoryShowcaseSection {
    const id = `sec-${Date.now().toString(36)}`;
    const newSec: CategoryShowcaseSection = {
      ...sec,
      id,
      order: this.categoryShowcases.length + 1,
      items: sec.items || []
    };
    this.categoryShowcases.push(newSec);
    this.notify();
    return newSec;
  }

  public updateCategoryShowcase(id: string, updates: Partial<CategoryShowcaseSection>) {
    const index = this.categoryShowcases.findIndex(s => s.id === id);
    if (index > -1) {
      this.categoryShowcases[index] = {
        ...this.categoryShowcases[index],
        ...updates
      };
      this.notify();
    }
  }

  public deleteCategoryShowcase(id: string) {
    this.categoryShowcases = this.categoryShowcases.filter(s => s.id !== id);
    this.notify();
  }

  public toggleCategoryShowcase(id: string) {
    const sec = this.categoryShowcases.find(s => s.id === id);
    if (sec) {
      sec.isActive = !sec.isActive;
      this.notify();
    }
  }

  public moveCategoryShowcaseOrder(id: string, direction: 'up' | 'down') {
    const sorted = [...this.categoryShowcases].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const current = sorted[index];
      const tempOrder = prev.order;
      prev.order = current.order;
      current.order = tempOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const current = sorted[index];
      const tempOrder = next.order;
      next.order = current.order;
      current.order = tempOrder;
    }
    this.categoryShowcases = sorted;
    this.notify();
  }

  public addShowcaseItem(sectionId: string, item: Omit<ShowcaseCardItem, 'id'>): ShowcaseCardItem | null {
    const sec = this.categoryShowcases.find(s => s.id === sectionId);
    if (!sec) return null;
    const newItem: ShowcaseCardItem = {
      ...item,
      id: `item-${Date.now().toString(36)}`
    };
    if (!sec.items) sec.items = [];
    sec.items.push(newItem);
    this.notify();
    return newItem;
  }

  public updateShowcaseItem(sectionId: string, itemId: string, updates: Partial<ShowcaseCardItem>) {
    const sec = this.categoryShowcases.find(s => s.id === sectionId);
    if (!sec || !sec.items) return;
    const itemIndex = sec.items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      sec.items[itemIndex] = {
        ...sec.items[itemIndex],
        ...updates
      };
      this.notify();
    }
  }

  public deleteShowcaseItem(sectionId: string, itemId: string) {
    const sec = this.categoryShowcases.find(s => s.id === sectionId);
    if (!sec || !sec.items) return;
    sec.items = sec.items.filter(i => i.id !== itemId);
    this.notify();
  }

  public moveShowcaseItemOrder(sectionId: string, itemId: string, direction: 'up' | 'down') {
    const sec = this.categoryShowcases.find(s => s.id === sectionId);
    if (!sec || !sec.items) return;
    const index = sec.items.findIndex(i => i.id === itemId);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const temp = sec.items[index - 1];
      sec.items[index - 1] = sec.items[index];
      sec.items[index] = temp;
    } else if (direction === 'down' && index < sec.items.length - 1) {
      const temp = sec.items[index + 1];
      sec.items[index + 1] = sec.items[index];
      sec.items[index] = temp;
    }
    this.notify();
  }

  // --- SUPPORT & CHAT CHANNELS ---
  public getSupportConversations() {
    return this.supportConversations;
  }

  public sendSupportMessage(channelId: string, text: string, senderName: string = 'রাকিব হাসান', attachmentUrl?: string) {
    const conv = this.supportConversations.find(c => c.id === channelId);
    if (!conv) return;

    const userMsg = {
      id: `smsg-${Date.now().toString(36)}`,
      senderId: 'user-current',
      senderName,
      senderRole: 'CUSTOMER',
      text,
      createdAt: new Date().toISOString(),
      attachmentUrl,
      isSupport: false
    };

    conv.messages.push(userMsg);
    this.notify();

    // Auto simulated assistant reply after 800ms
    setTimeout(() => {
      let replyText = 'ধন্যবাদ আপনার বার্তার জন্য! আমাদের একজন বিশেষজ্ঞ সাপোর্ট এক্সিকিউটিভ বিষয়টি পর্যালোচনা করছেন এবং অতি দ্রুত সমাধান দেবেন।';
      if (text.toLowerCase().includes('এসি') || text.toLowerCase().includes('ac') || text.toLowerCase().includes('সার্ভিস')) {
        replyText = 'আপনার এসি সার্ভিসিং রিকোয়েস্ট ও এরিয়া লোকেশন কনফার্ম হয়েছে। নিকটস্থ অভিজ্ঞ টেকনিশিয়ান শিডিউল অনুযায়ী উপস্থিত হবেন।';
      } else if (text.toLowerCase().includes('ডাক্তার') || text.toLowerCase().includes('doctor') || text.toLowerCase().includes('সিরিয়াল')) {
        replyText = 'ডাক্তার অ্যাপয়েন্টমেন্ট সিরিয়াল qaaga.com স্বাস্থ্য হেল্পডেস্কে ভেরিফাই করা হচ্ছে। আপনার ফোনে এসএমএস কনফার্মেশন পাঠানো হবে।';
      } else if (text.toLowerCase().includes('ডেলিভারি') || text.toLowerCase().includes('অর্ডার') || text.toLowerCase().includes('order')) {
        replyText = 'আপনার প্রোডাক্ট অর্ডারটি প্যাকেজিং সম্পন্ন হয়ে কুরিয়ারে হ্যান্ডওভার করা হয়েছে। ঢাকা সিটির মধ্যে ২৪ ঘণ্টার ভেতর ক্যাশ অন ডেলিভারিতে পৌঁছাবে।';
      }

      conv.messages.push({
        id: `smsg-rep-${Date.now().toString(36)}`,
        senderId: conv.id === 'support-main' ? 'support-bot' : 'provider-agent',
        senderName: conv.channelName.split('(')[0].trim(),
        senderRole: 'SUPPORT',
        text: replyText,
        createdAt: new Date().toISOString(),
        isSupport: true
      });
      this.notify();
    }, 1000);
  }

  public markNotificationAsRead(notifId: string) {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  // --- SERVICE REQUEST WORKFLOW ---

  /**
   * 1. Customer Submits Service Request
   */
  public createServiceRequest(params: {
    customer: UserProfile;
    categoryId: string;
    subCategory: string;
    title: string;
    description: string;
    budget?: number;
    isUrgent: boolean;
    preferredDate: string;
    preferredTime: string;
    district: string;
    thana: string;
    area: string;
    address: string;
    images: string[];
    routingMode: 'ALL_ELIGIBLE' | 'SELECTED_PROVIDERS';
    targetProviderIds?: string[];
  }): ServiceRequest {
    const category = this.categories.find(c => c.id === params.categoryId);
    const id = `req-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const initialStatus: ServiceRequestStatus = this.settings.requireAdminRequestReview
      ? 'ADMIN_REVIEW'
      : 'SENT_TO_PROVIDERS';

    const newRequest: ServiceRequest = {
      id,
      customerId: params.customer.id,
      customerName: params.customer.fullName,
      customerPhone: params.customer.phone,
      customerAvatar: params.customer.avatarUrl,
      categoryId: params.categoryId,
      categoryName: category?.name || 'General Service',
      subCategory: params.subCategory,
      title: params.title,
      description: params.description,
      budget: params.budget,
      isUrgent: params.isUrgent,
      preferredDate: params.preferredDate,
      preferredTime: params.preferredTime,
      district: params.district,
      thana: params.thana,
      area: params.area,
      address: params.address,
      images: params.images,
      routingMode: params.routingMode,
      targetProviderIds: params.targetProviderIds || [],
      status: initialStatus,
      statusAuditLog: [
        { status: 'SUBMITTED', timestamp: now, note: 'Service request created by customer', changedBy: params.customer.fullName },
        ...(this.settings.requireAdminRequestReview ? [
          { status: 'ADMIN_REVIEW' as ServiceRequestStatus, timestamp: now, note: 'Awaiting QAAGA Admin verification & dispatch', changedBy: 'System' }
        ] : [])
      ],
      createdAt: now,
      updatedAt: now
    };

    this.requests.unshift(newRequest);

    // Notify Admin
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'New Service Request for Moderation',
      message: `${params.customer.fullName} submitted a request: "${params.title}" in ${params.area}`,
      type: 'REQUEST_SUBMITTED',
      isRead: false,
      createdAt: now
    });

    this.notify();
    return newRequest;
  }

  /**
   * 2. Admin Reviews and Dispatches Request to Providers
   */
  public adminApproveAndDispatchRequest(requestId: string, selectedProviderIds: string[], adminName: string) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const now = new Date().toISOString();
    req.status = 'SENT_TO_PROVIDERS';
    req.targetProviderIds = selectedProviderIds.length ? selectedProviderIds : req.targetProviderIds;
    req.statusAuditLog.push({
      status: 'SENT_TO_PROVIDERS',
      timestamp: now,
      note: `Admin approved request and dispatched to ${selectedProviderIds.length || 'eligible'} providers.`,
      changedBy: adminName
    });
    req.updatedAt = now;

    // Notify target providers
    selectedProviderIds.forEach(pId => {
      const prov = this.providers.find(p => p.id === pId);
      if (prov) {
        this.notifications.unshift({
          id: `notif-${Date.now()}-${pId}`,
          userId: prov.userId,
          title: 'New Job Opportunity Available',
          message: `New request "${req.title}" in ${req.area}. Submit your quotation now!`,
          type: 'REQUEST_SUBMITTED',
          isRead: false,
          createdAt: now
        });
      }
    });

    this.notify();
  }

  /**
   * 3. Provider Submits Price Quotation / Offer
   */
  public submitProviderOffer(params: {
    requestId: string;
    provider: ProviderProfile;
    offeredPrice: number;
    serviceCharge: number;
    partsIncluded: boolean;
    estimatedDuration: string;
    earliestDate: string;
    earliestTime: string;
    offerMessage: string;
    warranty: string;
    offerExpiryDays?: number;
  }): ProviderOffer {
    const id = `off-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const expiry = new Date(Date.now() + (params.offerExpiryDays || 3) * 86400000).toISOString();

    const initialStatus: ProviderOfferStatus = this.settings.requireAdminOfferReview
      ? 'ADMIN_REVIEW'
      : 'SENT_TO_CUSTOMER';

    const newOffer: ProviderOffer = {
      id,
      requestId: params.requestId,
      providerId: params.provider.id,
      providerName: params.provider.fullName,
      providerAvatar: params.provider.avatarUrl,
      providerPhone: params.provider.phone,
      providerRating: params.provider.rating,
      providerReviewCount: params.provider.reviewCount,
      providerCompletedJobs: params.provider.completedJobs,
      providerExperience: params.provider.experienceYears,
      offeredPrice: params.offeredPrice,
      serviceCharge: params.serviceCharge,
      partsIncluded: params.partsIncluded,
      estimatedDuration: params.estimatedDuration,
      earliestDate: params.earliestDate,
      earliestTime: params.earliestTime,
      offerMessage: params.offerMessage,
      warranty: params.warranty,
      offerExpiry: expiry,
      status: initialStatus,
      createdAt: now,
      updatedAt: now
    };

    this.offers.unshift(newOffer);

    // Update request state
    const req = this.requests.find(r => r.id === params.requestId);
    if (req) {
      req.status = 'OFFER_RECEIVED';
      req.statusAuditLog.push({
        status: 'OFFER_RECEIVED',
        timestamp: now,
        note: `Quotation submitted by ${params.provider.fullName} (BDT ${params.offeredPrice})`,
        changedBy: params.provider.fullName
      });
      req.updatedAt = now;
    }

    // Notify Admin
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'Provider Offer Pending Moderation',
      message: `${params.provider.fullName} sent offer of BDT ${params.offeredPrice} for "${req?.title}"`,
      type: 'OFFER_RECEIVED',
      isRead: false,
      createdAt: now
    });

    this.notify();
    return newOffer;
  }

  /**
   * 4. Admin Approves and Forwards Provider Offer to Customer
   */
  public adminApproveOffer(offerId: string, adminName: string, adminNote?: string) {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer) return;

    const now = new Date().toISOString();
    offer.status = 'SENT_TO_CUSTOMER';
    offer.adminNote = adminNote;
    offer.updatedAt = now;

    const req = this.requests.find(r => r.id === offer.requestId);
    if (req) {
      req.status = 'OFFERS_SENT_TO_CUSTOMER';
      req.statusAuditLog.push({
        status: 'OFFERS_SENT_TO_CUSTOMER',
        timestamp: now,
        note: `Admin approved quotation from ${offer.providerName}`,
        changedBy: adminName
      });
      req.updatedAt = now;

      // Notify Customer
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: req.customerId,
        title: 'New Verified Offer Received!',
        message: `${offer.providerName} sent an offer for BDT ${offer.offeredPrice}. Compare and book now.`,
        type: 'OFFER_RECEIVED',
        isRead: false,
        createdAt: now
      });
    }

    this.notify();
  }

  /**
   * 5. Customer Accepts Offer and Pays 20% Advance -> Confirms Booking & Unlocks Privacy
   */
  public acceptOfferAndCreateBooking(params: {
    requestId: string;
    offerId: string;
    paymentGateway: string; // 'bKash' | 'Nagad' | 'SSLCommerz' | 'Card'
    transactionId: string;
  }): Booking {
    const req = this.requests.find(r => r.id === params.requestId);
    const offer = this.offers.find(o => o.id === params.offerId);
    if (!req || !offer) throw new Error('Request or Offer not found');

    const now = new Date().toISOString();
    const totalAmount = offer.offeredPrice;
    const advanceRate = (this.settings.defaultAdvancePercent || 20) / 100;
    const advancePaid = Math.round(totalAmount * advanceRate);
    const remainingAmount = totalAmount - advancePaid;
    const platformCommission = Math.round(totalAmount * ((this.settings.platformCommissionPercent || 10) / 100));

    // Update statuses
    offer.status = 'ACCEPTED';
    offer.updatedAt = now;

    // Decline other offers for this request
    this.offers
      .filter(o => o.requestId === params.requestId && o.id !== params.offerId)
      .forEach(o => {
        o.status = 'DECLINED';
        o.updatedAt = now;
      });

    const bookingId = `book-${Date.now().toString(36)}`;
    const otpStartCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: bookingId,
      bookingReference: `QAAGA-BK-${Math.floor(10000 + Math.random() * 90000)}`,
      requestId: req.id,
      offerId: offer.id,
      customerId: req.customerId,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerAddress: `${req.address}, ${req.area}, ${req.thana}, ${req.district}`,
      providerId: offer.providerId,
      providerName: offer.providerName,
      providerPhone: offer.providerPhone,
      serviceTitle: req.title,
      categoryName: req.categoryName,
      totalAmount,
      advanceRate,
      advancePaid,
      remainingAmount,
      remainingCollected: false,
      platformCommission,
      isPaid: true,
      privacyUnlocked: true, // Unlocked only after verified payment
      paymentGateway: params.paymentGateway,
      transactionId: params.transactionId,
      status: 'BOOKED',
      otpStartCode,
      createdAt: now,
      updatedAt: now
    };

    this.bookings.unshift(newBooking);

    // Update Request status
    req.status = 'BOOKED';
    req.assignedProviderId = offer.providerId;
    req.selectedOfferId = offer.id;
    req.bookingId = bookingId;
    req.statusAuditLog.push({
      status: 'BOOKED',
      timestamp: now,
      note: `Customer paid 20% advance (BDT ${advancePaid}) via ${params.paymentGateway}. Privacy unlocked.`,
      changedBy: req.customerName
    });
    req.updatedAt = now;

    // Send notifications to Customer and Provider
    const prov = this.providers.find(p => p.id === offer.providerId);
    if (prov) {
      this.notifications.unshift({
        id: `notif-${Date.now()}-prov`,
        userId: prov.userId,
        title: 'Booking Confirmed! Contact Details Unlocked',
        message: `Customer ${req.customerName} accepted your offer and paid advance. View exact address and contact info now.`,
        type: 'BOOKING_CONFIRMED' as any,
        isRead: false,
        createdAt: now
      });
    }

    this.notifications.unshift({
      id: `notif-${Date.now()}-cust`,
      userId: req.customerId,
      title: 'Booking Confirmed!',
      message: `Your booking for "${req.title}" is confirmed with ${offer.providerName}. Start code: ${otpStartCode}`,
      type: 'PAYMENT_SUCCESS',
      isRead: false,
      createdAt: now
    });

    this.notify();
    return newBooking;
  }

  /**
   * 6. Provider Updates Job Milestones: On The Way -> Arrived -> Start Work -> Request Completion
   */
  public updateBookingMilestone(
    bookingId: string,
    newStatus: 'PROVIDER_ON_THE_WAY' | 'ARRIVED' | 'WORK_STARTED' | 'COMPLETION_REQUESTED',
    providerName: string,
    customerOtpCodeInput?: string
  ) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const now = new Date().toISOString();

    if (newStatus === 'WORK_STARTED') {
      if (booking.otpStartCode && customerOtpCodeInput && booking.otpStartCode !== customerOtpCodeInput) {
        throw new Error('Invalid Job Start OTP code provided by customer.');
      }
      booking.workStartedAt = now;
    } else if (newStatus === 'ARRIVED') {
      booking.arrivedAt = now;
    } else if (newStatus === 'COMPLETION_REQUESTED') {
      booking.completedAt = now;
    }

    booking.status = newStatus as ServiceRequestStatus;
    booking.updatedAt = now;

    // Sync with service request
    const req = this.requests.find(r => r.id === booking.requestId);
    if (req) {
      req.status = newStatus as ServiceRequestStatus;
      req.statusAuditLog.push({
        status: newStatus as ServiceRequestStatus,
        timestamp: now,
        note: `Status updated by ${providerName} to: ${newStatus}`,
        changedBy: providerName
      });
      req.updatedAt = now;
    }

    // Notify Customer
    const notifMessages: Record<string, string> = {
      PROVIDER_ON_THE_WAY: `${providerName} is now on the way to your service location.`,
      ARRIVED: `${providerName} has arrived at your address.`,
      WORK_STARTED: `Work has officially started. Job is in progress.`,
      COMPLETION_REQUESTED: `${providerName} has completed the service. Please review and confirm completion.`
    };

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: booking.customerId,
      title: `Service Update: ${newStatus.replace(/_/g, ' ')}`,
      message: notifMessages[newStatus] || `Status changed to ${newStatus}`,
      type: newStatus as any,
      isRead: false,
      createdAt: now
    });

    this.notify();
  }

  /**
   * 7. Customer Confirms Completion, Submits Review & Rating
   */
  public customerConfirmCompletion(
    bookingId: string,
    rating: number,
    reviewText: string,
    customerName: string
  ) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const now = new Date().toISOString();
    booking.status = 'COMPLETED';
    booking.completionConfirmedAt = now;
    booking.updatedAt = now;

    const req = this.requests.find(r => r.id === booking.requestId);
    if (req) {
      req.status = 'COMPLETED';
      req.statusAuditLog.push({
        status: 'COMPLETED',
        timestamp: now,
        note: `Customer confirmed satisfactory completion. Rating: ${rating}/5 stars.`,
        changedBy: customerName
      });
      req.updatedAt = now;
    }

    // Update Provider Stats
    const prov = this.providers.find(p => p.id === booking.providerId);
    if (prov) {
      prov.completedJobs += 1;
      prov.reviewCount += 1;
      prov.rating = Number(((prov.rating * (prov.reviewCount - 1) + rating) / prov.reviewCount).toFixed(2));
      
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: prov.userId,
        title: 'Job Completed & Rated!',
        message: `${customerName} confirmed job completion and gave you ${rating} stars.`,
        type: 'WORK_COMPLETED',
        isRead: false,
        createdAt: now
      });
    }

    this.notify();
  }

  /**
   * Mark remaining cash payment collected by provider
   */
  public toggleRemainingPaymentCollected(bookingId: string, collected: boolean) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.remainingCollected = collected;
      booking.updatedAt = new Date().toISOString();
      this.notify();
    }
  }

  // --- DOCTOR APPOINTMENTS ---
  public bookDoctorAppointment(params: {
    doctorId: string;
    customerId: string;
    patientName: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    patientPhone: string;
    problemSummary: string;
    appointmentDate: string;
    timeSlot: string;
    transactionId: string;
  }): DoctorAppointment {
    const doc = this.doctors.find(d => d.id === params.doctorId);
    if (!doc) throw new Error('Doctor not found');

    const serialNumber = this.appointments.filter(
      a => a.doctorId === params.doctorId && a.appointmentDate === params.appointmentDate
    ).length + 1;

    const id = `apt-${Date.now().toString(36)}`;
    const newAppointment: DoctorAppointment = {
      id,
      doctorId: doc.id,
      doctorName: doc.name,
      specialization: doc.specialization,
      hospitalChamber: doc.hospitalChamber,
      customerId: params.customerId,
      patientName: params.patientName,
      patientAge: params.patientAge,
      patientGender: params.patientGender,
      patientPhone: params.patientPhone,
      problemSummary: params.problemSummary,
      reportUrls: [],
      appointmentDate: params.appointmentDate,
      timeSlot: params.timeSlot,
      serialNumber,
      consultationFee: doc.consultationFee,
      isPaidOnline: true,
      transactionId: params.transactionId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    this.appointments.unshift(newAppointment);

    // Notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: params.customerId,
      title: 'Doctor Appointment Confirmed',
      message: `Serial #${serialNumber} booked with ${doc.name} on ${params.appointmentDate} at ${params.timeSlot}`,
      type: 'APPOINTMENT_CONFIRMED',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.notify();
    return newAppointment;
  }

  // --- HOTEL BOOKING ---
  public bookHotelRoom(params: {
    hotelId: string;
    roomId: string;
    customerId: string;
    guestName: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    roomCount: number;
    adultCount: number;
    paymentMode: 'FULL_ONLINE' | 'ADVANCE_ONLY' | 'PAY_AT_HOTEL';
    paidAmount: number;
  }): HotelBooking {
    const hotel = this.hotels.find(h => h.id === params.hotelId);
    const room = hotel?.rooms.find(r => r.id === params.roomId);
    if (!hotel || !room) throw new Error('Hotel or room not found');

    if (room.availableRooms < params.roomCount) {
      throw new Error('Not enough rooms available for the selected dates');
    }

    room.availableRooms -= params.roomCount;
    const totalPrice = room.pricePerNight * params.nights * params.roomCount;

    const id = `hbook-${Date.now().toString(36)}`;
    const newBooking: HotelBooking = {
      id,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomTitle: room.title,
      customerId: params.customerId,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights: params.nights,
      roomCount: params.roomCount,
      adultCount: params.adultCount,
      totalPrice,
      paymentMode: params.paymentMode,
      paidAmount: params.paidAmount,
      paymentStatus: params.paymentMode === 'FULL_ONLINE' ? 'PAID' : params.paymentMode === 'ADVANCE_ONLY' ? 'PARTIALLY_PAID' : 'PAY_AT_CHECKIN',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    this.hotelBookings.unshift(newBooking);
    this.notify();
    return newBooking;
  }

  // --- PRODUCT CHECKOUT & SELLER MANAGEMENT ---
  public createProductOrder(params: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    district: string;
    thana: string;
    area: string;
    items: ProductOrderItem[];
    paymentMethod: 'COD' | 'ONLINE_BKASH' | 'ONLINE_CARD';
  }): ProductOrder {
    const subtotal = params.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = params.district.toLowerCase() === 'dhaka' ? 80 : 130;
    const totalAmount = subtotal + deliveryFee;

    const id = `ord-${Date.now().toString(36)}`;
    const orderNumber = `QAAGA-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: ProductOrder = {
      id,
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryAddress: params.deliveryAddress,
      district: params.district,
      thana: params.thana,
      area: params.area,
      items: params.items,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: params.paymentMethod,
      orderStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct stock
    params.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    this.orders.unshift(newOrder);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: params.customerId,
      title: 'Order Placed Successfully',
      message: `Order #${orderNumber} for BDT ${totalAmount} placed via ${params.paymentMethod}.`,
      type: 'ORDER_STATUS_UPDATE',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.notify();
    return newOrder;
  }

  // --- EBOOK PURCHASES ---
  public purchaseEbook(ebookId: string, userId: string, transactionId: string): EBookPurchase {
    const ebook = this.ebooks.find(e => e.id === ebookId);
    if (!ebook) throw new Error('EBook not found');

    const secureToken = `AUTH_TOKEN_${Buffer.from(`${userId}:${ebookId}:${Date.now()}`).toString('base64')}`;
    const newPurchase: EBookPurchase = {
      id: `ebp-${Date.now().toString(36)}`,
      ebookId: ebook.id,
      ebookTitle: ebook.title,
      ebookCover: ebook.coverImage,
      userId,
      amountPaid: ebook.price,
      transactionId,
      purchaseDate: new Date().toISOString(),
      secureDownloadToken: secureToken
    };

    ebook.downloadCount += 1;
    this.ebookPurchases.unshift(newPurchase);
    this.notify();
    return newPurchase;
  }

  // --- USED PRODUCTS ---
  public postUsedProduct(params: Omit<UsedProductListing, 'id' | 'isApproved' | 'status' | 'inquiryCount' | 'createdAt'>): UsedProductListing {
    const newUsed: UsedProductListing = {
      ...params,
      id: `used-${Date.now().toString(36)}`,
      isApproved: true,
      status: 'ACTIVE',
      inquiryCount: 0,
      createdAt: new Date().toISOString()
    };
    this.usedProducts.unshift(newUsed);
    this.notify();
    return newUsed;
  }

  // --- JOBS & APPLICATIONS ---
  public postJob(params: Omit<JobPost, 'id' | 'isApproved' | 'applicationCount' | 'createdAt'>): JobPost {
    const newJob: JobPost = {
      ...params,
      id: `job-${Date.now().toString(36)}`,
      isApproved: true,
      applicationCount: 0,
      createdAt: new Date().toISOString()
    };
    this.jobs.unshift(newJob);
    this.notify();
    return newJob;
  }

  public applyToJob(params: Omit<JobApplication, 'id' | 'status' | 'appliedAt'>): JobApplication {
    const newApp: JobApplication = {
      ...params,
      id: `app-${Date.now().toString(36)}`,
      status: 'APPLIED',
      appliedAt: new Date().toISOString()
    };
    this.jobApplications.unshift(newApp);

    const job = this.jobs.find(j => j.id === params.jobId);
    if (job) {
      job.applicationCount += 1;
    }

    this.notify();
    return newApp;
  }

  // --- CHAT MESSAGING ---
  public sendChatMessage(params: {
    bookingId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    text: string;
    attachmentUrl?: string;
  }): ChatMessage {
    const booking = this.bookings.find(b => b.id === params.bookingId);
    if (!booking || !booking.privacyUnlocked) {
      throw new Error('Chat is locked until booking deposit payment is completed.');
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      bookingId: params.bookingId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      text: params.text,
      attachmentUrl: params.attachmentUrl,
      attachmentType: params.attachmentUrl ? 'image' : undefined,
      createdAt: new Date().toISOString(),
      readByReceiver: false
    };

    this.chatMessages.push(newMsg);
    this.notify();
    return newMsg;
  }

  // --- ADMIN SYSTEM CONTROLS & BRANDING ---
  public updateSystemSettings(newSettings: Partial<PlatformSystemSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
  }

  public updateSiteBranding(updates: {
    siteTitle?: string;
    siteName?: string;
    siteTagline?: string;
    siteDescription?: string;
    showTaglineInBrowserTitle?: boolean;
    themeColor?: string;
  }) {
    this.settings = {
      ...this.settings,
      ...updates
    };
    this.notify();
  }

  public setFaviconPreset(presetId: string) {
    const preset = FAVICON_PRESETS.find(p => p.id === presetId) || FAVICON_PRESETS[0];
    this.settings = {
      ...this.settings,
      faviconType: 'preset',
      faviconPresetId: preset.id,
      faviconUrl: preset.svgDataUri,
      customFaviconUpload: ''
    };
    this.notify();
  }

  public uploadCustomFavicon(base64DataUrl: string) {
    this.settings = {
      ...this.settings,
      faviconType: 'custom_upload',
      customFaviconUpload: base64DataUrl,
      faviconUrl: base64DataUrl
    };
    this.notify();
  }

  public setCustomFaviconUrl(url: string) {
    this.settings = {
      ...this.settings,
      faviconType: 'custom_url',
      faviconUrl: url,
      customFaviconUpload: ''
    };
    this.notify();
  }

  public removeCustomFavicon() {
    this.settings = {
      ...this.settings,
      faviconType: 'preset',
      faviconPresetId: 'qaaga-purple-q',
      faviconUrl: FAVICON_PRESETS[0].svgDataUri,
      customFaviconUpload: ''
    };
    this.notify();
  }

  public resetSiteTitleAndBranding() {
    this.settings = {
      ...this.settings,
      siteTitle: DEFAULT_SITE_TITLE,
      siteTagline: DEFAULT_SITE_TITLE,
      faviconType: 'preset',
      faviconPresetId: 'qaaga-purple-q',
      faviconUrl: FAVICON_PRESETS[0].svgDataUri,
      customFaviconUpload: ''
    };
    this.notify();
  }

  public addCategory(cat: ServiceCategory) {
    this.categories.push(cat);
    this.notify();
  }

  public updateProviderStatus(providerId: string, status: 'VERIFIED' | 'REJECTED') {
    const prov = this.providers.find(p => p.id === providerId);
    if (prov) {
      prov.verificationStatus = status;
      prov.hasVerificationBadge = status === 'VERIFIED';
      this.notify();
    }
  }

  public updateProductApproval(productId: string, isApproved: boolean) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.isApproved = isApproved;
      this.notify();
    }
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now().toString(36)}`,
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProd);
    this.notify();
    return newProd;
  }

  public addProvider(profile: Omit<ProviderProfile, 'id' | 'completedJobs' | 'rating' | 'reviewCount' | 'createdAt'>): ProviderProfile {
    const newProv: ProviderProfile = {
      ...profile,
      id: `prov-${Date.now().toString(36)}`,
      completedJobs: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    this.providers.unshift(newProv);
    this.notify();
    return newProv;
  }

  // --- CUTE CAT ASSISTANT CONTROLS ---
  public getCuteCatSettings(): CuteCatAssistantSettings {
    return { ...this.cuteCatSettings };
  }

  public updateCuteCatSettings(updates: Partial<CuteCatAssistantSettings>): void {
    this.cuteCatSettings = { ...this.cuteCatSettings, ...updates };
    this.notify();
  }

  public addCatMessage(message: string): void {
    if (!message.trim()) return;
    this.cuteCatSettings.messages.push(message.trim());
    this.notify();
  }

  public updateCatMessage(index: number, newMessage: string): void {
    if (index >= 0 && index < this.cuteCatSettings.messages.length && newMessage.trim()) {
      this.cuteCatSettings.messages[index] = newMessage.trim();
      this.notify();
    }
  }

  public deleteCatMessage(index: number): void {
    if (index >= 0 && index < this.cuteCatSettings.messages.length) {
      this.cuteCatSettings.messages.splice(index, 1);
      // Ensure at least 1 message exists
      if (this.cuteCatSettings.messages.length === 0) {
        this.cuteCatSettings.messages.push('তুমি কি চাও আমাকে বলো? আমি খুঁজে দিচ্ছি! 🐾');
      }
      this.notify();
    }
  }

  public moveCatMessageOrder(index: number, direction: 'up' | 'down'): void {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < this.cuteCatSettings.messages.length) {
      const temp = this.cuteCatSettings.messages[index];
      this.cuteCatSettings.messages[index] = this.cuteCatSettings.messages[targetIdx];
      this.cuteCatSettings.messages[targetIdx] = temp;
      this.notify();
    }
  }

  public addCatQuickChip(chip: Omit<CatQuickChip, 'id'>): void {
    const newChip: CatQuickChip = {
      ...chip,
      id: `chip-${Date.now().toString(36)}`
    };
    this.cuteCatSettings.quickChips.push(newChip);
    this.notify();
  }

  public deleteCatQuickChip(chipId: string): void {
    this.cuteCatSettings.quickChips = this.cuteCatSettings.quickChips.filter(c => c.id !== chipId);
    this.notify();
  }

  public resetCuteCatSettings(): void {
    this.cuteCatSettings = { ...INITIAL_CUTE_CAT_SETTINGS };
    this.notify();
  }

  // ==========================================
  // FEED & FOLLOW SYSTEM METHODS
  // ==========================================

  public getFeedPosts(filter: 'following' | 'all' = 'all', categoryKey?: string, currentUserId: string = 'user-admin'): FeedPost[] {
    let posts = [...this.feedPosts];

    if (filter === 'following') {
      const followedTargetIds = this.follows
        .filter(f => f.followerId === currentUserId)
        .map(f => f.targetId);
      // Include posts from followed profiles AND user's own posts
      posts = posts.filter(p => followedTargetIds.includes(p.authorId) || p.authorId === currentUserId);
    }

    if (categoryKey && categoryKey !== 'all') {
      posts = posts.filter(p => p.categoryKey === categoryKey);
    }

    // Sort pinned posts first, then newest first
    return posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getFeedPostById(postId: string): FeedPost | undefined {
    return this.feedPosts.find(p => p.id === postId);
  }

  public getPostsByAuthor(authorId: string): FeedPost[] {
    return this.feedPosts
      .filter(p => p.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createFeedPost(data: Omit<FeedPost, 'id' | 'likesCount' | 'likedBy' | 'comments' | 'sharesCount' | 'createdAt' | 'updatedAt'> & { id?: string }): FeedPost {
    const newPost: FeedPost = {
      id: data.id || `feed-post-${Date.now().toString(36)}`,
      authorId: data.authorId,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      authorRole: data.authorRole,
      authorBadge: data.authorBadge,
      authorRating: data.authorRating,
      authorDistrict: data.authorDistrict,
      authorThana: data.authorThana,
      postType: data.postType || 'UPDATE',
      title: data.title,
      content: data.content,
      images: data.images || [],
      tags: data.tags || [],
      categoryKey: data.categoryKey || 'general',
      likesCount: 0,
      likedBy: [],
      comments: [],
      sharesCount: 0,
      isPinned: data.isPinned || false,
      actionCta: data.actionCta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feedPosts.unshift(newPost);
    this.notify();
    return newPost;
  }

  public toggleLikeFeedPost(postId: string, userId: string): boolean {
    const post = this.feedPosts.find(p => p.id === postId);
    if (!post) return false;

    const likedIndex = post.likedBy.indexOf(userId);
    if (likedIndex >= 0) {
      post.likedBy.splice(likedIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;
    }
    this.notify();
    return true;
  }

  public addCommentToFeedPost(postId: string, comment: {
    userId: string;
    userName: string;
    userAvatar: string;
    userRole?: string;
    text: string;
  }): FeedComment | undefined {
    const post = this.feedPosts.find(p => p.id === postId);
    if (!post || !comment.text.trim()) return undefined;

    const newComment: FeedComment = {
      id: `comment-${Date.now().toString(36)}`,
      postId,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      userRole: comment.userRole,
      text: comment.text.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    this.notify();
    return newComment;
  }

  public deleteFeedPost(postId: string): boolean {
    const idx = this.feedPosts.findIndex(p => p.id === postId);
    if (idx >= 0) {
      this.feedPosts.splice(idx, 1);
      this.notify();
      return true;
    }
    return false;
  }

  // Follow Management
  public isFollowing(followerId: string, targetId: string): boolean {
    return this.follows.some(f => f.followerId === followerId && f.targetId === targetId);
  }

  public toggleFollow(
    followerId: string,
    target: {
      id: string;
      name: string;
      avatar: string;
      role: string;
      badge?: string;
      category?: string;
      rating?: number;
    }
  ): boolean {
    const existingIndex = this.follows.findIndex(
      f => f.followerId === followerId && f.targetId === target.id
    );

    if (existingIndex >= 0) {
      // Unfollow
      this.follows.splice(existingIndex, 1);
      this.notify();
      return false; // Now unfollowed
    } else {
      // Follow
      const newFollow: UserFollow = {
        id: `follow-${Date.now().toString(36)}`,
        followerId,
        targetId: target.id,
        targetName: target.name,
        targetAvatar: target.avatar,
        targetRole: target.role,
        targetBadge: target.badge,
        targetCategory: target.category,
        targetRating: target.rating,
        createdAt: new Date().toISOString()
      };
      this.follows.push(newFollow);
      this.notify();
      return true; // Now followed
    }
  }

  public getFollowedProfiles(followerId: string): UserFollow[] {
    return this.follows.filter(f => f.followerId === followerId);
  }

  public getFollowerCount(targetId: string): number {
    return this.follows.filter(f => f.targetId === targetId).length;
  }

  public getAllFollows(): UserFollow[] {
    return [...this.follows];
  }

  // ==========================================
  // FEED BANNER SLIDER (CRUD & ORDERING)
  // ==========================================
  public getFeedSlides(onlyPublished = true): FeedBannerSlide[] {
    let slides = [...this.feedSlides];
    if (onlyPublished) {
      slides = slides.filter(s => s.isPublished);
    }
    return slides.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getAllFeedSlides(): FeedBannerSlide[] {
    return [...this.feedSlides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getFeedSlideById(id: string): FeedBannerSlide | undefined {
    return this.feedSlides.find(s => s.id === id);
  }

  public createFeedSlide(slideData: Omit<FeedBannerSlide, 'id'> & { id?: string }): FeedBannerSlide {
    const newSlide: FeedBannerSlide = {
      ...slideData,
      id: slideData.id || `feed-slide-${Date.now().toString(36)}`,
      order: slideData.order ?? this.feedSlides.length + 1,
      isPublished: slideData.isPublished ?? true,
      createdAt: new Date().toISOString()
    };
    this.feedSlides.push(newSlide);
    this.notify();
    return newSlide;
  }

  public updateFeedSlide(id: string, updates: Partial<FeedBannerSlide>): boolean {
    const idx = this.feedSlides.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.feedSlides[idx] = {
      ...this.feedSlides[idx],
      ...updates
    };
    this.notify();
    return true;
  }

  public deleteFeedSlide(id: string): boolean {
    const idx = this.feedSlides.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.feedSlides.splice(idx, 1);
    this.notify();
    return true;
  }

  public toggleFeedSlideStatus(id: string): boolean {
    const slide = this.feedSlides.find(s => s.id === id);
    if (!slide) return false;
    slide.isPublished = !slide.isPublished;
    this.notify();
    return slide.isPublished;
  }

  public reorderFeedSlides(slideIds: string[]): boolean {
    slideIds.forEach((id, index) => {
      const slide = this.feedSlides.find(s => s.id === id);
      if (slide) {
        slide.order = index + 1;
      }
    });
    this.notify();
    return true;
  }

  public resetFeedSlides(): void {
    this.feedSlides = [...INITIAL_FEED_BANNER_SLIDES];
    this.notify();
  }
}

export const marketplaceStore = new MarketplaceStore();
