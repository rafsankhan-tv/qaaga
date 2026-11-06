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
  title: string;
  area: string;
  image: string;
  checkInLabel: string;
  nights: number;
  guests: number;
  totalUsd: number;
  hostName: string;
  status: 'Confirmed' | 'Upcoming';
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
  role?: 'guest' | 'host' | 'admin';
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  joinedDate?: string;
  status?: 'active' | 'suspended';
}

export const INITIAL_USERS: GuestProfile[] = [
  {
    fullName: 'Amina Rahman',
    email: 'amina@qaaga.com',
    city: 'Kuala Lumpur',
    verified: true,
    role: 'admin',
    phone: '+60 12-345 6789',
    avatarUrl: '',
    bio: 'QAAGA superhost & community admin in Kuala Lumpur.',
    joinedDate: 'Jan 2026',
    status: 'active',
  },
  {
    fullName: 'Rafsan Khan',
    email: 'rafsankhan.tv@gmail.com',
    city: 'Dhaka',
    verified: true,
    role: 'admin',
    phone: '+880 1711-000000',
    avatarUrl: '',
    bio: 'Lead developer & administrator for qaaga.com platform.',
    joinedDate: 'Nov 2026',
    status: 'active',
  },
  {
    fullName: 'Sarah Chen',
    email: 'sarah.c@gmail.com',
    city: 'Penang',
    verified: true,
    role: 'host',
    phone: '+60 16-987 6543',
    avatarUrl: '',
    bio: 'Designer & boutique villa host.',
    joinedDate: 'Feb 2026',
    status: 'active',
  },
  {
    fullName: 'Zainab Al-Farsi',
    email: 'zainab@traveler.com',
    city: 'Dubai',
    verified: true,
    role: 'guest',
    phone: '+971 50 123 4567',
    avatarUrl: '',
    bio: 'Frequent traveler exploring Southeast Asia.',
    joinedDate: 'Mar 2026',
    status: 'active',
  },
];

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
  { name: 'All Kuala Lumpur', subtitle: 'Explore all skyline neighborhoods in KL' },
  { name: 'Bukit Bintang', subtitle: 'Luxury suites, shopping & rooftop dining' },
  { name: 'Kampung Bahru', subtitle: 'Twin Towers views & culinary heritage' },
  { name: 'KLCC', subtitle: 'Iconic city center & parkfront residences' },
  { name: 'Mont Kiara', subtitle: 'Leafy upscale condos & artisanal cafes' },
  { name: 'Bangsar', subtitle: 'Boutique studios & direct transit links' },
];

export const DATE_OPTIONS = [
  { id: 'default-2', label: 'Add dates', display: '', nights: 2, tag: '2 nights (Standard)' },
  { id: 'nov-14-16', label: 'Nov 14 – 16', display: 'Nov 14 – 16', nights: 2, tag: 'Weekend · 2 nights' },
  { id: 'nov-20-23', label: 'Nov 20 – 23', display: 'Nov 20 – 23', nights: 3, tag: '3 nights getaway' },
  { id: 'dec-01-06', label: 'Dec 1 – 6', display: 'Dec 1 – 6', nights: 5, tag: '5 nights stay' },
  { id: 'dec-12-19', label: 'Dec 12 – 19', display: 'Dec 12 – 19', nights: 7, tag: '1 week · 7 nights' },
  { id: 'monthly-30', label: 'Monthly (30 nights)', display: '30 nights', nights: 30, tag: 'Monthly · 30 nights' },
];

export const DEFAULT_REVIEWS: ListingReview[] = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    date: 'October 2026',
    rating: 5,
    comment:
      'Spotless residence with breathtaking Kuala Lumpur skyline views. Smart-lock check-in took under a minute and Wi-Fi was blazing fast.',
  },
  {
    id: 'rev-2',
    author: 'Tariq Al-Mansoor',
    date: 'September 2026',
    rating: 5,
    comment:
      'Exactly like the photos. Walking distance to MRT and great local dining. Host responded within 2 minutes.',
  },
];

export const INITIAL_LISTINGS: QaagaListing[] = [
  // Exact 6 Core Screenshot Listings matching Screenshot_2026-11-04_at_2.23.12_AM_ec851fb8.png
  {
    id: 'kl-1',
    title: 'Apartment in Bukit Bintang',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'apartments',
    twoNightPriceUsd: 370,
    rating: '5.0',
    reviewsCount: 128,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-1.jpg',
    gallery: [
      '/assets/kl-ui/kl-1.jpg',
      '/assets/clean-rooms/room-gulshan-studio.jpg',
      '/assets/clean-rooms/wish-dhanmondi.jpg',
    ],
    category: 'stay',
    maxGuests: 6,
    bedrooms: '2 bedrooms · 3 beds · 2 baths',
    hostName: 'Amirul Hakim',
    hostYears: 6,
    amenities: [
      'Panoramic KL Skyline Windows',
      'Infinity Sky Pool',
      'Fast Fiber Wi-Fi (500 Mbps)',
      'Central Air Conditioning',
      'Self Check-in Smart Lock',
      'Free Covered Parking',
    ],
    description:
      'High-floor corner luxury residence in the heart of Bukit Bintang featuring wrap-around floor-to-ceiling skyline glass, plush leather lounge, and direct walkability to Pavilion KL.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },
  {
    id: 'kl-2',
    title: 'Room in Kuala Lumpur',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'rooms',
    twoNightPriceUsd: 61,
    rating: '5.0',
    reviewsCount: 94,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-2.jpg',
    gallery: [
      '/assets/kl-ui/kl-2.jpg',
      '/assets/clean-rooms/room-mirpur-apt.jpg',
      '/assets/clean-rooms/room-dhanmondi.jpg',
    ],
    category: 'stay',
    maxGuests: 2,
    bedrooms: '1 queen bed · Dedicated bath',
    hostName: 'Mei Ling Tan',
    hostYears: 4,
    amenities: [
      'Floor-to-Ceiling Sheer Curtains',
      'High-Speed Wi-Fi',
      'Split Air Conditioning',
      'Swimming Pool & Gym',
      '24/7 Concierge Security',
    ],
    description:
      'Serene, sunlit private master bedroom with olive-linen bedding, polished marble floors, and peaceful city views just 6 minutes from KLCC Park.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },
  {
    id: 'kl-3',
    title: 'Room in Kuala Lumpur',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'rooms',
    twoNightPriceUsd: 51,
    rating: '4.9',
    reviewsCount: 76,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-3.jpg',
    gallery: [
      '/assets/kl-ui/kl-3.jpg',
      '/assets/clean-rooms/offer-badda.jpg',
      '/assets/clean-rooms/room-banani-private.jpg',
    ],
    category: 'stay',
    maxGuests: 2,
    bedrooms: '1 single bed · Modern bath',
    hostName: 'Daniel Wong',
    hostYears: 5,
    amenities: [
      'Hotel-Grade Fresh Towels',
      'Fast Wi-Fi',
      'Air Conditioning',
      'Self Check-in',
      'Washer & Dryer Access',
    ],
    description:
      'Spotless minimalist room tailored for solo travelers and digital nomads, steps from MRT Bukit Bintang and Jalan Alor culinary street.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },
  {
    id: 'kl-4',
    title: 'Apartment in Kampung Bahru',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    subType: 'apartments',
    twoNightPriceUsd: 99,
    rating: '4.76',
    reviewsCount: 142,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
    gallery: [
      '/assets/kl-ui/kl-4.jpg',
      '/assets/clean-rooms/room-uttara-balcony.jpg',
      '/assets/clean-rooms/pop-uttara.jpg',
    ],
    category: 'stay',
    maxGuests: 4,
    bedrooms: '1 king bed · Sofa lounge · Balcony',
    hostName: 'Nurul Izzah',
    hostYears: 3,
    amenities: [
      'Private City Balcony',
      'Lounge Sofa & Tea Table',
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Rooftop Sky Deck',
    ],
    description:
      'Warm boutique studio suite in Kampung Bahru combining a king sleeper, tailored sofa lounge, and private balcony overlooking Kuala Lumpur’s skyline.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },
  {
    id: 'kl-5',
    title: 'Condo in Kampung Bahru',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    subType: 'condos',
    twoNightPriceUsd: 163,
    rating: '5.0',
    reviewsCount: 215,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-5.jpg',
    gallery: [
      '/assets/kl-ui/kl-5.jpg',
      '/assets/clean-rooms/wish-gulshan.jpg',
      '/assets/clean-rooms/wish-banani.jpg',
    ],
    category: 'stay',
    maxGuests: 4,
    bedrooms: '1 bedroom · 2 beds · Infinity pool access',
    hostName: 'Farid Rahman',
    hostYears: 7,
    amenities: [
      'Direct Petronas Twin Towers Pool View',
      'Sky Gym & Sauna',
      'Fast Fiber Wi-Fi',
      'Full Kitchenette',
      'Smart Keyless Entry',
    ],
    description:
      'Iconic Kuala Lumpur sky-condo with direct infinity pool views framing the Petronas Twin Towers and Saloma Link walkability.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },
  {
    id: 'kl-6',
    title: 'Room in Kuala Lumpur',
    area: 'Mont Kiara',
    city: 'Kuala Lumpur',
    subType: 'rooms',
    twoNightPriceUsd: 51,
    rating: '4.91',
    reviewsCount: 112,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-6.jpg',
    gallery: [
      '/assets/kl-ui/kl-6.jpg',
      '/assets/clean-rooms/pop-gulshan.jpg',
      '/assets/clean-rooms/offer-mirpur.jpg',
    ],
    category: 'stay',
    maxGuests: 2,
    bedrooms: '1 queen bed · Ensuite bath',
    hostName: 'Aisha Sofea',
    hostYears: 4,
    amenities: [
      'Warm Ambient Headboard Lighting',
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Welcome Tea & Tray',
      '24-Hour Security',
    ],
    description:
      'Cozy, hotel-crafted bedroom featuring warm recessed lighting, crisp cotton linens, and sunlit city-view window in central Kuala Lumpur.',
    inInitialRecent: true,
    inInitialWishlist: true,
    inPopularKL: true,
  },

  // Additional Unique Carousel & Stay Catalog Homes
  {
    id: 'kl-7',
    title: 'Sky Studio in KLCC Park',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'apartments',
    twoNightPriceUsd: 210,
    rating: '4.98',
    reviewsCount: 89,
    guestFavorite: true,
    image: '/assets/clean-rooms/room-gulshan-studio.jpg',
    gallery: ['/assets/clean-rooms/room-gulshan-studio.jpg', '/assets/kl-ui/kl-1.jpg'],
    category: 'stay',
    maxGuests: 4,
    bedrooms: 'Studio · Panorama terrace · 1 bath',
    hostName: 'Zulkifli Ahmad',
    hostYears: 8,
    amenities: ['Park & Skyline View', 'Infinity Pool', 'Fast Wi-Fi', 'Private Parking'],
    description:
      'Sunlit executive sky-studio overlooking KLCC greenery and towers with floor-to-ceiling windows and private balcony.',
    inInitialRecent: true,
    inPopularKL: true,
  },
  {
    id: 'kl-8',
    title: 'Balcony Suite in Bangsar',
    area: 'Bangsar',
    city: 'Kuala Lumpur',
    subType: 'apartments',
    twoNightPriceUsd: 118,
    rating: '4.94',
    reviewsCount: 64,
    guestFavorite: true,
    image: '/assets/clean-rooms/room-uttara-balcony.jpg',
    gallery: ['/assets/clean-rooms/room-uttara-balcony.jpg', '/assets/kl-ui/kl-4.jpg'],
    category: 'stay',
    maxGuests: 3,
    bedrooms: '1 king bed · Open garden balcony',
    hostName: 'Hannah Lim',
    hostYears: 5,
    amenities: ['Artisanal Coffee Bar', 'Fast Wi-Fi', 'Pool', 'LRT Link Bridge'],
    description:
      'Sun-drenched architectural suite in Bangsar South with wide sliding glass balcony overlooking lush tropical greenery.',
    inInitialRecent: true,
    inPopularKL: true,
  },
  {
    id: 'kl-9',
    title: 'Condo in Mont Kiara',
    area: 'Mont Kiara',
    city: 'Kuala Lumpur',
    subType: 'condos',
    twoNightPriceUsd: 145,
    rating: '4.96',
    reviewsCount: 173,
    guestFavorite: true,
    image: '/assets/clean-rooms/wish-dhanmondi.jpg',
    gallery: ['/assets/clean-rooms/wish-dhanmondi.jpg', '/assets/kl-ui/kl-5.jpg'],
    category: 'stay',
    maxGuests: 4,
    bedrooms: '1 bedroom · Private dining nook · Sky pool',
    hostName: 'Rizal Mansor',
    hostYears: 6,
    amenities: ['Rooftop Pool', 'Wi-Fi', 'Dining Corner', 'Self Check-in'],
    description:
      'Open-plan designer residence in Mont Kiara featuring panoramic terrace glass, private dining nook, and resort facilities.',
    inPopularKL: true,
  },
  {
    id: 'kl-10',
    title: 'Boutique Room in Bukit Ceylon',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'rooms',
    twoNightPriceUsd: 74,
    rating: '4.93',
    reviewsCount: 108,
    guestFavorite: false,
    image: '/assets/clean-rooms/pop-gulshan.jpg',
    gallery: ['/assets/clean-rooms/pop-gulshan.jpg', '/assets/kl-ui/kl-2.jpg'],
    category: 'stay',
    maxGuests: 2,
    bedrooms: '1 king bed · Ensuite rain shower',
    hostName: 'Evelyn Khoo',
    hostYears: 4,
    amenities: ['Warm Timber Interiors', 'Fast Wi-Fi', 'AC', 'Quiet Hillside Street'],
    description:
      'Tucked on leafy Bukit Ceylon just 5 minutes from Changkat cafes, offering hotel-grade tranquility and warm lighting.',
    inPopularKL: true,
  },
  {
    id: 'kl-11',
    title: 'Penthouse Loft in KLCC',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'condos',
    twoNightPriceUsd: 265,
    rating: '4.99',
    reviewsCount: 141,
    guestFavorite: true,
    image: '/assets/clean-rooms/wish-gulshan.jpg',
    gallery: ['/assets/clean-rooms/wish-gulshan.jpg', '/assets/kl-ui/kl-1.jpg'],
    category: 'stay',
    maxGuests: 5,
    bedrooms: '2 bedrooms · Private terrace · 2 baths',
    hostName: 'Imran Iskandar',
    hostYears: 7,
    amenities: ['Private Terrace', 'Sky Pool', 'Dedicated Workspace', 'Free Parking'],
    description:
      'Duplex sky loft steps from Suria KLCC with uninterrupted skyline views and designer furnishings.',
    inPopularKL: true,
  },
  {
    id: 'kl-12',
    title: 'Garden Residence in Bangsar',
    area: 'Bangsar',
    city: 'Kuala Lumpur',
    subType: 'apartments',
    twoNightPriceUsd: 89,
    rating: '4.88',
    reviewsCount: 53,
    guestFavorite: false,
    image: '/assets/clean-rooms/room-dhanmondi.jpg',
    gallery: ['/assets/clean-rooms/room-dhanmondi.jpg', '/assets/kl-ui/kl-6.jpg'],
    category: 'stay',
    maxGuests: 3,
    bedrooms: '1 bedroom · Quiet courtyard view',
    hostName: 'Nadia Razak',
    hostYears: 3,
    amenities: ['Courtyard View', 'Kitchenette', 'Fast Wi-Fi', 'Self Check-in'],
    description:
      'Calm residential sanctuary in Bangsar Telawi surrounded by specialty coffee roasters and neighborhood bakeries.',
    inPopularKL: true,
  },

  // Curated Experiences (6 unique items)
  {
    id: 'exp-1',
    title: 'Petronas Skyline Rooftop Tour',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'skyline',
    twoNightPriceUsd: 78,
    rating: '5.0',
    reviewsCount: 156,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-5.jpg',
    gallery: ['/assets/kl-ui/kl-5.jpg', '/assets/kl-ui/kl-1.jpg'],
    category: 'experiences',
    maxGuests: 8,
    bedrooms: '3-hour guided sunset walk · Drinks included',
    hostName: 'Arif Photographer',
    hostYears: 5,
    amenities: ['Professional Portrait Photos', 'Skybar Entry', 'Local Historian Guide'],
    description:
      'Golden-hour architectural walk and sky-deck photography session across Kuala Lumpur’s iconic Twin Towers and Saloma Bridge.',
  },
  {
    id: 'exp-2',
    title: 'Kampung Bahru Night Food Trail',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    subType: 'food',
    twoNightPriceUsd: 64,
    rating: '4.97',
    reviewsCount: 204,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
    gallery: ['/assets/kl-ui/kl-4.jpg', '/assets/clean-rooms/wish-banani.jpg'],
    category: 'experiences',
    maxGuests: 10,
    bedrooms: '12 authentic tastings · 3.5 hours',
    hostName: 'Chef Siti Rahmah',
    hostYears: 7,
    amenities: ['12 Heritage Dishes', 'Small Group', 'Vegetarian Friendly'],
    description:
      'Taste authentic Nasi Lemak, charcoal satay, and artisanal kuih with a third-generation Kampung Bahru culinary host.',
  },
  {
    id: 'exp-3',
    title: 'Bukit Bintang Speakeasy Walk',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'food',
    twoNightPriceUsd: 85,
    rating: '4.92',
    reviewsCount: 83,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-1.jpg',
    gallery: ['/assets/kl-ui/kl-1.jpg'],
    category: 'experiences',
    maxGuests: 6,
    bedrooms: 'Evening social experience · 3 venues',
    hostName: 'Jason Yap',
    hostYears: 4,
    amenities: ['3 Curated Rooftops & Lounges', 'Craft Mocktail Options', 'Priority Entry'],
    description:
      'Explore Chinatown and Bukit Bintang’s tucked-away rooftop lounges with skyline views and live Malaysian jazz.',
  },
  {
    id: 'exp-4',
    title: 'Malaysian Tea & Batik Studio',
    area: 'Bangsar',
    city: 'Kuala Lumpur',
    subType: 'culture',
    twoNightPriceUsd: 55,
    rating: '4.95',
    reviewsCount: 91,
    guestFavorite: true,
    image: '/assets/clean-rooms/wish-banani.jpg',
    gallery: ['/assets/clean-rooms/wish-banani.jpg'],
    category: 'experiences',
    maxGuests: 6,
    bedrooms: '2.5-hour hands-on studio · Take-home art',
    hostName: 'Liyana Craft',
    hostYears: 6,
    amenities: ['All Wax & Silk Provided', 'Teh Tarik Pairing', 'Gift Packaging'],
    description:
      'Hand-paint your own traditional Malaysian silk batik motif in a sunlit Bangsar studio accompanied by Cameron Highlands tea.',
  },
  {
    id: 'exp-5',
    title: 'Morning Terrace Yoga & Brunch',
    area: 'Mont Kiara',
    city: 'Kuala Lumpur',
    subType: 'culture',
    twoNightPriceUsd: 46,
    rating: '4.89',
    reviewsCount: 49,
    guestFavorite: true,
    image: '/assets/clean-rooms/room-uttara-balcony.jpg',
    gallery: ['/assets/clean-rooms/room-uttara-balcony.jpg'],
    category: 'experiences',
    maxGuests: 8,
    bedrooms: '90-minute rooftop session · Breakfast bowl',
    hostName: 'Nadia Wellness',
    hostYears: 3,
    amenities: ['Mats & Towels Included', 'Cold-Pressed Juice', 'Skyline Terrace'],
    description:
      'Start your morning above the city with guided vinyasa flow beside a tranquil open terrace.',
  },
  {
    id: 'exp-6',
    title: 'Tropical Modernism Architecture Tour',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'skyline',
    twoNightPriceUsd: 70,
    rating: '4.93',
    reviewsCount: 37,
    guestFavorite: false,
    image: '/assets/clean-rooms/wish-gulshan.jpg',
    gallery: ['/assets/clean-rooms/wish-gulshan.jpg'],
    category: 'experiences',
    maxGuests: 5,
    bedrooms: 'Half-day curated studio visits',
    hostName: 'Studio KLA',
    hostYears: 5,
    amenities: ['Architect Host', 'Private Transport', 'Specialty Espresso Stop'],
    description:
      'Step inside adaptive-reuse townhouses and modern sky residences across central Kuala Lumpur with a practicing architect.',
  },

  // Curated Hospitality Services (6 unique items)
  {
    id: 'srv-1',
    title: 'Private Chef Nyonya Dinner',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'chef',
    twoNightPriceUsd: 120,
    rating: '5.0',
    reviewsCount: 118,
    guestFavorite: true,
    image: '/assets/clean-rooms/wish-dhanmondi.jpg',
    gallery: ['/assets/clean-rooms/wish-dhanmondi.jpg'],
    category: 'services',
    maxGuests: 8,
    bedrooms: '4-course in-apartment dining · Full cleanup',
    hostName: 'Chef Raymond Lim',
    hostYears: 9,
    amenities: ['Fresh Market Ingredients', 'Table Styling', 'Spotless Kitchen Cleanup'],
    description:
      'Enjoy a restaurant-caliber Peranakan Nyonya dinner cooked and plated right inside your Kuala Lumpur apartment.',
  },
  {
    id: 'srv-2',
    title: 'Executive KLIA Airport Chauffeur',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    subType: 'chauffeur',
    twoNightPriceUsd: 58,
    rating: '4.99',
    reviewsCount: 310,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-5.jpg',
    gallery: ['/assets/kl-ui/kl-5.jpg'],
    category: 'services',
    maxGuests: 6,
    bedrooms: 'Door-to-door MPV · Real-time flight tracking',
    hostName: 'KL Premier Chauffeur',
    hostYears: 6,
    amenities: ['Meet & Greet Gate Sign', '60-Min Wait Buffer', 'Wi-Fi Onboard'],
    description:
      'Seamless luxury MPV airport pickup or drop-off between KLIA Terminal 1/2 and any Bukit Bintang or KLCC residence.',
  },
  {
    id: 'srv-3',
    title: 'Hotel-Grade Suite Housekeeping',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    subType: 'care',
    twoNightPriceUsd: 42,
    rating: '4.95',
    reviewsCount: 87,
    guestFavorite: true,
    image: '/assets/clean-rooms/room-banani-private.jpg',
    gallery: ['/assets/clean-rooms/room-banani-private.jpg'],
    category: 'services',
    maxGuests: 4,
    bedrooms: 'Full linen change · Eco sanitization',
    hostName: 'Qaaga Care Team',
    hostYears: 4,
    amenities: ['Fresh 400TC Cotton Sheets', 'Towel Replacement', 'Organic Amenities'],
    description:
      'On-demand mid-stay housekeeping, fresh hotel towel replacement, and bed turn-down service by verified hospitality pros.',
  },
  {
    id: 'srv-4',
    title: 'In-Room Balinese & Malay Spa',
    area: 'Mont Kiara',
    city: 'Kuala Lumpur',
    subType: 'care',
    twoNightPriceUsd: 88,
    rating: '4.97',
    reviewsCount: 144,
    guestFavorite: true,
    image: '/assets/clean-rooms/offer-mirpur.jpg',
    gallery: ['/assets/clean-rooms/offer-mirpur.jpg'],
    category: 'services',
    maxGuests: 2,
    bedrooms: '90-min couples or solo massage',
    hostName: 'Serai Spa Collective',
    hostYears: 5,
    amenities: ['Portable Spa Table', 'Lemongrass Essential Oils', 'Certified Therapists'],
    description:
      'Unwind after your flight with a certified in-residence aromatherapy massage complete with warm herbal compresses.',
  },
  {
    id: 'srv-5',
    title: 'Same-Day Express Wardrobe Care',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    subType: 'care',
    twoNightPriceUsd: 35,
    rating: '4.91',
    reviewsCount: 62,
    guestFavorite: false,
    image: '/assets/clean-rooms/offer-badda.jpg',
    gallery: ['/assets/clean-rooms/offer-badda.jpg'],
    category: 'services',
    maxGuests: 4,
    bedrooms: 'Pickup & pressed delivery in 6 hours',
    hostName: 'Press & Fold KL',
    hostYears: 4,
    amenities: ['Doorstep Concierge', 'Delicate Steam Press', 'Eco Detergent'],
    description:
      'Doorstep laundry wash, fold, and business-attire steam pressing delivered back to your condo lobby the same evening.',
  },
  {
    id: 'srv-6',
    title: 'Private City Chauffeur (Full Day)',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    subType: 'chauffeur',
    twoNightPriceUsd: 95,
    rating: '4.96',
    reviewsCount: 79,
    guestFavorite: true,
    image: '/assets/clean-rooms/pop-uttara.jpg',
    gallery: ['/assets/clean-rooms/pop-uttara.jpg'],
    category: 'services',
    maxGuests: 6,
    bedrooms: '8-hour private vehicle & bilingual driver',
    hostName: 'Executive Mobility KL',
    hostYears: 5,
    amenities: ['Fuel & Tolls Included', 'Flexible Stops', 'Child Seat Available'],
    description:
      'Dedicated private vehicle and local driver for effortless meetings, Batu Caves visits, or shopping across Kuala Lumpur.',
  },
];

export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk-1',
    confirmationCode: 'QG-KL9041',
    listingId: 'kl-1',
    title: 'Apartment in Bukit Bintang',
    area: 'Bukit Bintang, Kuala Lumpur',
    image: '/assets/kl-ui/kl-1.jpg',
    checkInLabel: 'Nov 14 – Nov 16',
    nights: 2,
    guests: 2,
    totalUsd: 370,
    hostName: 'Amirul Hakim',
    status: 'Upcoming',
  },
  {
    id: 'bk-2',
    confirmationCode: 'QG-KL7728',
    listingId: 'kl-5',
    title: 'Condo in Kampung Bahru',
    area: 'Kampung Bahru, Kuala Lumpur',
    image: '/assets/kl-ui/kl-5.jpg',
    checkInLabel: 'Dec 05 – Dec 07',
    nights: 2,
    guests: 2,
    totalUsd: 163,
    hostName: 'Farid Rahman',
    status: 'Confirmed',
  },
];

export const INITIAL_THREADS: HostThread[] = [
  {
    id: 'thread-1',
    hostName: 'Amirul Hakim',
    listingTitle: 'Apartment in Bukit Bintang',
    listingImage: '/assets/kl-ui/kl-1.jpg',
    unread: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'host',
        text: 'Welcome to Kuala Lumpur! Your smart-lock code is active from 2:00 PM and includes 48th-floor sky pool access.',
        time: '12m ago',
      },
    ],
  },
  {
    id: 'thread-2',
    hostName: 'Farid Rahman',
    listingTitle: 'Condo in Kampung Bahru',
    listingImage: '/assets/kl-ui/kl-5.jpg',
    unread: false,
    messages: [
      {
        id: 'msg-2',
        sender: 'host',
        text: 'Looking forward to hosting you in Kampung Bahru. Let me know if you need KLIA airport pickup.',
        time: 'Yesterday',
      },
    ],
  },
];

// Initial 2 unread notifications matching the Bell "2" badge in Screenshot_2026-11-04_at_2.23.12_AM_ec851fb8.png
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Check-in details ready · QG-KL9041',
    body: 'Amirul Hakim sent smart-lock instructions for Apartment in Bukit Bintang.',
    time: '12m ago',
    unread: true,
    actionType: 'messages',
  },
  {
    id: 'notif-2',
    title: 'Reservation confirmed · QG-KL7728',
    body: 'Your 2-night stay at Condo in Kampung Bahru (Dec 05 – Dec 07) is confirmed.',
    time: '2h ago',
    unread: true,
    actionType: 'trips',
  },
];
