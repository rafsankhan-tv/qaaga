export type QaagaCategory = 'all' | 'stay' | 'experiences' | 'services';
export type CurrencyCode = 'USD' | 'MYR' | 'EUR' | 'BDT';

export interface ListingReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface QaagaListing {
  id: string;
  hostEmail?: string;
  title: string;
  area: string;
  city: string;
  subType: string;
  twoNightPriceUsd: number;
  rating: string;
  reviewsCount: number;
  guestFavorite: boolean;
  image: string;
  gallery: string[];
  category: 'stay' | 'experiences' | 'services';
  maxGuests: number;
  bedrooms: string;
  hostName: string;
  hostYears: number;
  amenities: string[];
  description: string;
  inInitialRecent?: boolean;
  inInitialWishlist?: boolean;
  inPopularKL?: boolean;
}

export interface BookingRecord {
  id: string;
  confirmationCode: string;
  listingId: string;
  checkInDate?: string;
  checkOutDate?: string;
  title: string;
  area: string;
  image: string;
  checkInLabel: string;
  nights: number;
  guests: number;
  totalUsd: number;
  hostName: string;
  status: 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed' | 'Upcoming';
}

export interface HostThread {
  id: string;
  hostName: string;
  listingTitle: string;
  listingImage: string;
  unread: boolean;
  messages: {
    id: string;
    sender: 'host' | 'guest';
    text: string;
    time: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  actionType: 'trips' | 'messages' | 'wishlist';
}

export interface GuestProfile {
  fullName: string;
  email: string;
  city: string;
  verified: boolean;
  role?: 'customer' | 'guest' | 'host' | 'admin';
  identity_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  joinedDate?: string;
  status?: 'active' | 'suspended';
}

// Admin access is granted only through trusted Supabase Auth app_metadata.
export const SUPER_ADMIN_EMAIL = '';

export const INITIAL_USERS: GuestProfile[] = []; 

export const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { symbol: string; rate: number; label: string }
> = {
  USD: { symbol: '$', rate: 1, label: '$ USD' },
  MYR: { symbol: 'RM', rate: 4.45, label: 'RM MYR' },
  EUR: { symbol: '€', rate: 0.92, label: '€ EUR' },
  BDT: { symbol: '৳', rate: 120, label: '৳ BDT' },
};

export type LogoSizePreset = 'sm' | 'md' | 'lg' | 'xl';

export interface SiteBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  altText: string;
  fallbackText: string;
  fallbackDomain: string;
  showTextWhenRemoved: boolean;
  size: LogoSizePreset;
  blendMultiply: boolean;
  revision: number;
  updatedAt: string;
}

export const DEFAULT_SITE_LOGO_URL =
  '/assets/aistudio/Screenshot_2026-11-04_at_2.55.29_AM_bd5ef49c.png';

export const DEFAULT_FAVICON_URL =
  '/assets/aistudio/Screenshot_2026-11-04_at_3.36.38_AM_8097a68e.png';

export const DEFAULT_BRANDING: SiteBranding = {
  logoUrl: DEFAULT_SITE_LOGO_URL,
  faviconUrl: DEFAULT_FAVICON_URL,
  altText: 'qaaga.com',
  fallbackText: 'qaaga',
  fallbackDomain: '.com',
  showTextWhenRemoved: true,
  size: 'md',
  blendMultiply: true,
  revision: 0,
  updatedAt: '2026-11-04T00:00:00.000Z',
};

export const STORAGE_KEYS = {
  wishlist: 'qaaga_v3_wishlist',
  bookings: 'qaaga_v3_bookings',
  threads: 'qaaga_v3_threads',
  notifications: 'qaaga_v3_notifications',
  customListings: 'qaaga_v3_custom_listings',
  currency: 'qaaga_v3_currency',
  profile: 'qaaga_v3_profile',
  branding: 'qaaga_v3_branding',
};

export const CATEGORY_TABS: { id: QaagaCategory; label: string; iconSrc: string }[] = [
  { id: 'all', label: 'All', iconSrc: '/assets/kl-ui/icon-all.png' },
  { id: 'stay', label: 'Stay', iconSrc: '/assets/kl-ui/icon-stay.png' },
  { id: 'experiences', label: 'Experiences', iconSrc: '/assets/kl-ui/icon-experiences.png' },
  { id: 'services', label: 'Services', iconSrc: '/assets/kl-ui/icon-services.png' },
];

export const KL_DESTINATIONS = [
  { name: 'Dhaka', subtitle: 'Explore stays across Dhaka' },
  { name: 'Gulshan', subtitle: 'Apartments and furnished rooms' },
  { name: 'Banani', subtitle: 'Serviced apartments and city stays' },
  { name: 'Dhanmondi', subtitle: 'Residential stays near city amenities' },
  { name: 'Uttara', subtitle: 'Apartments and family accommodation' },
  { name: 'Mirpur', subtitle: 'Budget-friendly city accommodation' },
];

export const DATE_OPTIONS = [
  { id: 'default-2', label: 'Add dates', display: '', nights: 2, tag: 'Choose check-in and check-out' },
  { id: 'two-nights', label: '2 nights', display: '', nights: 2, tag: '2-night stay' },
  { id: 'three-nights', label: '3 nights', display: '', nights: 3, tag: '3-night stay' },
  { id: 'five-nights', label: '5 nights', display: '', nights: 5, tag: '5-night stay' },
  { id: 'weekly', label: '1 week', display: '', nights: 7, tag: '7-night stay' },
  { id: 'monthly', label: '30 nights', display: '', nights: 30, tag: 'Monthly stay' },
];

export const DEFAULT_REVIEWS: ListingReview[] = []; 

export const INITIAL_LISTINGS: QaagaListing[] = []; 

export const INITIAL_BOOKINGS: BookingRecord[] = []; 

export const INITIAL_THREADS: HostThread[] = []; 

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
