'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart,
  Mail,
  Luggage,
  User,
  Star,
  X,
  Check,
  MapPin,
  Calendar,
  Users,
  Minus,
  Send,
  ShieldCheck,
  Wifi,
  Wind,
  Waves,
  KeyRound,
  Building2,
  Sparkles,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';

export type QaagaCategory = 'all' | 'stay' | 'experiences' | 'services';
export type CurrencyCode = 'USD' | 'MYR' | 'BDT';

export interface QaagaListing {
  id: string;
  title: string;
  area: string;
  city: string;
  twoNightPriceUsd: number;
  rating: string;
  reviewsCount: number;
  guestFavorite: boolean;
  image: string;
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

export interface MessageThread {
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

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: '$ USD' },
  MYR: { symbol: 'RM', rate: 4.45, label: 'RM MYR' },
  BDT: { symbol: '৳', rate: 120, label: '৳ BDT' },
};

// Exact 6 Core Listings from qaaga_d3ef7a3c.png + Extra Carousel / Category Items
const INITIAL_LISTINGS: QaagaListing[] = [
  {
    id: 'kl-1',
    title: 'Apartment in Bukit Bintang',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 370,
    rating: '5.0',
    reviewsCount: 128,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-1.jpg',
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
    twoNightPriceUsd: 61,
    rating: '5.0',
    reviewsCount: 94,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-2.jpg',
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
    twoNightPriceUsd: 51,
    rating: '4.9',
    reviewsCount: 76,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-3.jpg',
    category: 'stay',
    maxGuests: 2,
    bedrooms: '1 single bed · Shared modern bath',
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
    twoNightPriceUsd: 99,
    rating: '4.76',
    reviewsCount: 142,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
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
    twoNightPriceUsd: 163,
    rating: '5.0',
    reviewsCount: 215,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-5.jpg',
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
    twoNightPriceUsd: 51,
    rating: '4.91',
    reviewsCount: 112,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-6.jpg',
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

  // Extra Popular Kuala Lumpur Stays (for < > carousel pagination!)
  {
    id: 'kl-7',
    title: 'Sky Penthouse in KLCC',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 290,
    rating: '4.98',
    reviewsCount: 89,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-1.jpg',
    category: 'stay',
    maxGuests: 6,
    bedrooms: '3 bedrooms · 3 baths · Private lift',
    hostName: 'Zulkifli Ahmad',
    hostYears: 8,
    amenities: ['Twin Towers View', 'Infinity Pool', 'Wi-Fi', 'Private Parking'],
    description:
      'Duplex sky penthouse overlooking KLCC Fountain Park with floor-to-ceiling windows and private elevator lobby.',
    inPopularKL: true,
  },
  {
    id: 'kl-8',
    title: 'Designer Loft in Bangsar',
    area: 'Bangsar',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 118,
    rating: '4.94',
    reviewsCount: 64,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
    category: 'stay',
    maxGuests: 3,
    bedrooms: '1 loft bedroom · Balcony',
    hostName: 'Hannah Lim',
    hostYears: 5,
    amenities: ['Artisanal Coffee Bar', 'Fast Wi-Fi', 'Pool', 'LRT Link Bridge'],
    description:
      'Sun-drenched architectural loft in Bangsar South connected directly to LRT Kerinchi and specialty cafes.',
    inPopularKL: true,
  },
  {
    id: 'kl-9',
    title: 'Twin Towers View Suite',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 145,
    rating: '4.96',
    reviewsCount: 173,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-5.jpg',
    category: 'stay',
    maxGuests: 4,
    bedrooms: '1 king bed · Sky pool access',
    hostName: 'Rizal Mansor',
    hostYears: 6,
    amenities: ['51st Floor Infinity Pool', 'Wi-Fi', 'Kitchen', 'Self Check-in'],
    description:
      'Unobstructed KLCC skyline panorama from both your bedroom balcony and the 51st-floor rooftop infinity pool.',
    inPopularKL: true,
  },

  // Curated Experiences (shown when "Experiences" tab is clicked)
  {
    id: 'exp-1',
    title: 'Petronas Skyline Rooftop Tour',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 78,
    rating: '5.0',
    reviewsCount: 156,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-5.jpg',
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
    twoNightPriceUsd: 64,
    rating: '4.97',
    reviewsCount: 204,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
    category: 'experiences',
    maxGuests: 10,
    bedrooms: '12 authentic tastings · 3.5 hours',
    hostName: 'Chef Siti Rahmah',
    hostYears: 7,
    amenities: ['12 Heritage Dishes', 'Small Group', 'Vegetarian Friendly'],
    description:
      'Taste authentic Nasi Lemak Antarabangsa, charcoal satay, and artisanal kuih with a third-generation Kampung Bahru culinary host.',
  },
  {
    id: 'exp-3',
    title: 'Bukit Bintang Hidden Speakeasy Walk',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 85,
    rating: '4.92',
    reviewsCount: 83,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-1.jpg',
    category: 'experiences',
    maxGuests: 6,
    bedrooms: 'Evening social experience · 3 venues',
    hostName: 'Jason Yap',
    hostYears: 4,
    amenities: ['3 Curated Rooftops & Lounges', 'Mocktail & Craft Options', 'VIP Priority Entry'],
    description:
      'Explore Chinatown and Bukit Bintang’s tucked-away rooftop lounges with skyline views and live Malaysian jazz.',
  },
  {
    id: 'exp-4',
    title: 'Malaysian Tea & Batik Studio',
    area: 'Bangsar',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 55,
    rating: '4.95',
    reviewsCount: 91,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-2.jpg',
    category: 'experiences',
    maxGuests: 6,
    bedrooms: '2.5-hour hands-on studio · Take-home art',
    hostName: 'Liyana Craft',
    hostYears: 6,
    amenities: ['All Wax & Silk Provided', 'Teh Tarik Pairing', 'Gift Packaging'],
    description:
      'Hand-paint your own traditional Malaysian silk batik motif in a sunlit Bangsar studio accompanied by artisanal Cameron Highlands tea.',
  },
  {
    id: 'exp-5',
    title: 'Morning Wellness & Pool Yoga',
    area: 'Mont Kiara',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 46,
    rating: '4.89',
    reviewsCount: 49,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-6.jpg',
    category: 'experiences',
    maxGuests: 8,
    bedrooms: '90-minute rooftop session · Breakfast bowl',
    hostName: 'Nadia Wellness',
    hostYears: 3,
    amenities: ['Mats & Towels Included', 'Cold-Pressed Juice', 'Skyline Terrace'],
    description:
      'Start your morning above the city haze with guided vinyasa flow beside a tranquil infinity terrace.',
  },
  {
    id: 'exp-6',
    title: 'Minimalist Interior Architecture Tour',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 70,
    rating: '4.93',
    reviewsCount: 37,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-3.jpg',
    category: 'experiences',
    maxGuests: 5,
    bedrooms: 'Half-day curated studio visits',
    hostName: ' Studio KLA',
    hostYears: 5,
    amenities: ['Architect Host', 'Private Transport', 'Espresso Stop'],
    description:
      'Step inside adaptive-reuse townhouses and modern sky residences across central Kuala Lumpur with a practicing architect.',
  },

  // Curated Services (shown when "Services" tab is clicked)
  {
    id: 'srv-1',
    title: 'Private Chef Nyonya Dinner',
    area: 'Bukit Bintang',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 120,
    rating: '5.0',
    reviewsCount: 118,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-1.jpg',
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
    title: 'Executive KLIA Airport Transfer',
    area: 'KLCC',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 58,
    rating: '4.99',
    reviewsCount: 310,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-5.jpg',
    category: 'services',
    maxGuests: 6,
    bedrooms: 'Door-to-door MPV · Flight tracking',
    hostName: 'KL Premier Chauffeur',
    hostYears: 6,
    amenities: ['Meet & Greet Gate Sign', '60-Min Wait Buffer', 'Wi-Fi Onboard'],
    description:
      'Seamless luxury MPV airport pickup or drop-off between KLIA Terminal 1/2 and any Bukit Bintang or KLCC residence.',
  },
  {
    id: 'srv-3',
    title: 'Hotel-Grade Suite Refresh',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 42,
    rating: '4.95',
    reviewsCount: 87,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-2.jpg',
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
    twoNightPriceUsd: 88,
    rating: '4.97',
    reviewsCount: 144,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-6.jpg',
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
    twoNightPriceUsd: 35,
    rating: '4.91',
    reviewsCount: 62,
    guestFavorite: false,
    image: '/assets/kl-ui/kl-3.jpg',
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
    title: 'Personal Skyline Photo Concierge',
    area: 'Kampung Bahru',
    city: 'Kuala Lumpur',
    twoNightPriceUsd: 75,
    rating: '4.96',
    reviewsCount: 79,
    guestFavorite: true,
    image: '/assets/kl-ui/kl-4.jpg',
    category: 'services',
    maxGuests: 6,
    bedrooms: '90-min private shoot · 40 edited hi-res photos',
    hostName: 'Hafiz Lens',
    hostYears: 5,
    amenities: ['48-Hour Delivery', 'Couples & Families', 'Location Styling'],
    description:
      'Capture effortless travel portraits at your infinity pool or KLCC park with a published lifestyle photographer.',
  },
];

const KL_DESTINATIONS = [
  { name: 'All Kuala Lumpur', subtitle: 'Show all neighborhoods in KL' },
  { name: 'Bukit Bintang', subtitle: 'Skyline suites, shopping & dining' },
  { name: 'Kampung Bahru', subtitle: 'Twin Towers views & heritage charm' },
  { name: 'KLCC', subtitle: 'Iconic city center & parkfront condos' },
  { name: 'Mont Kiara', subtitle: 'Quiet upscale residences & cafes' },
  { name: 'Bangsar', subtitle: 'Boutique lofts & connected transit' },
];

const DATE_OPTIONS = [
  { id: 'default-2', label: 'Add dates', display: '', nights: 2, tag: '2 nights (Standard)' },
  { id: 'nov-14-16', label: 'Nov 14 – 16', display: 'Nov 14 – 16', nights: 2, tag: 'Weekend · 2 nights' },
  { id: 'nov-20-23', label: 'Nov 20 – 23', display: 'Nov 20 – 23', nights: 3, tag: '3 nights getaway' },
  { id: 'dec-01-06', label: 'Dec 1 – 6', display: 'Dec 1 – 6', nights: 5, tag: '5 nights stay' },
  { id: 'dec-12-19', label: 'Dec 12 – 19', display: 'Dec 12 – 19', nights: 7, tag: '1 week · 7 nights' },
];

const CATEGORY_TABS: { id: QaagaCategory; label: string; iconSrc: string }[] = [
  { id: 'all', label: 'All', iconSrc: '/assets/kl-ui/icon-all.png' },
  { id: 'stay', label: 'Stay', iconSrc: '/assets/kl-ui/icon-stay.png' },
  { id: 'experiences', label: 'Experiences', iconSrc: '/assets/kl-ui/icon-experiences.png' },
  { id: 'services', label: 'Services', iconSrc: '/assets/kl-ui/icon-services.png' },
];

const ListingImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 via-orange-50/40 to-slate-200 flex flex-col items-center justify-center text-slate-500 p-4 ${className}`}
      >
        <Building2 size={26} className="text-[#FF6610] mb-1.5" />
        <span className="text-xs font-medium text-center line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface DesktopQaagaDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const DesktopQaagaDashboard: React.FC<DesktopQaagaDashboardProps> = ({ onNavigate }) => {
  const [listings, setListings] = useState<QaagaListing[]>(INITIAL_LISTINGS);
  const [activeCategory, setActiveCategory] = useState<QaagaCategory>('all');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Search state
  const [whereQuery, setWhereQuery] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<(typeof DATE_OPTIONS)[number]>(
    DATE_OPTIONS[0]
  );
  const [customCheckInDay, setCustomCheckInDay] = useState<number | null>(14);
  const [customCheckOutDay, setCustomCheckOutDay] = useState<number | null>(16);
  const [adults, setAdults] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);

  const [activePopover, setActivePopover] = useState<'where' | 'when' | 'who' | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);

  // Recently viewed order & Wishlist IDs
  const [recentIds, setRecentIds] = useState<string[]>([
    'kl-1',
    'kl-2',
    'kl-3',
    'kl-4',
    'kl-5',
    'kl-6',
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    'kl-1',
    'kl-2',
    'kl-3',
    'kl-4',
    'kl-5',
    'kl-6',
  ]);
  // Track hearts explicitly clicked by user during session for vibrant highlight
  const [highlightedHearts, setHighlightedHearts] = useState<Record<string, boolean>>({});

  // Carousel pagination for "Popular homes in Kuala Lumpur"
  const [popularOffset, setPopularOffset] = useState<number>(0);

  // Interactive Modals & Drawers
  const [selectedListing, setSelectedListing] = useState<QaagaListing | null>(null);
  const [modalNights, setModalNights] = useState<number>(2);
  const [modalGuests, setModalGuests] = useState<number>(2);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);

  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [replyDraft, setReplyDraft] = useState<string>('');

  const [isTripsOpen, setIsTripsOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isCollectionExplorerOpen, setIsCollectionExplorerOpen] = useState<boolean>(false);
  const [explorerSort, setExplorerSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [onlyGuestFavorites, setOnlyGuestFavorites] = useState<boolean>(false);

  const [toast, setToast] = useState<string | null>(null);

  // Pre-populated Bookings ("2" badge in top-right matching screenshot)
  const [bookings, setBookings] = useState<BookingRecord[]>([
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
  ]);

  // Pre-populated Messages ("1" unread badge in top-right matching screenshot)
  const [threads, setThreads] = useState<MessageThread[]>([
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
          text: 'Welcome to Kuala Lumpur! Self check-in smart lock code will be active from 2:00 PM, and you have full access to the 48th-floor infinity pool.',
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
          text: 'Hi! Looking forward to hosting you. Let me know if you need airport MPV pickup from KLIA.',
          time: 'Yesterday',
        },
      ],
    },
  ]);

  // Become a Host form state
  const [hostTitle, setHostTitle] = useState('');
  const [hostArea, setHostArea] = useState('Bukit Bintang');
  const [hostCategory, setHostCategory] = useState<'stay' | 'experiences' | 'services'>('stay');
  const [hostTwoNightUsd, setHostTwoNightUsd] = useState('120');
  const [hostPhoto, setHostPhoto] = useState('/assets/kl-ui/kl-1.jpg');
  const [hostGuestFav, setHostGuestFav] = useState(true);

  // Close search popover when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const totalGuests = adults + childrenCount;
  const activeNights = selectedDates.nights || 2;
  const unreadMessagesCount = threads.filter((t) => t.unread).length;

  const formatStayPrice = (twoNightUsd: number, nightsOverride?: number) => {
    const n = nightsOverride ?? activeNights;
    const perNight = twoNightUsd / 2;
    const rawTotal = n === 2 ? twoNightUsd : Math.round(perNight * n);
    const { symbol, rate } = CURRENCY_CONFIG[currency];
    const converted = Math.round(rawTotal * rate);
    return `${symbol}${converted.toLocaleString()}`;
  };

  const matchesSearch = (item: QaagaListing) => {
    if (whereQuery.trim() && whereQuery !== 'All Kuala Lumpur') {
      const q = whereQuery.toLowerCase().trim();
      const hit =
        item.title.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (totalGuests > 0 && item.maxGuests < totalGuests) {
      return false;
    }
    return true;
  };

  const recentListings = useMemo(() => {
    const mapped = recentIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is QaagaListing => Boolean(l));
    const filtered = mapped.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      return matchesSearch(item);
    });
    return filtered.slice(0, 6);
  }, [recentIds, listings, activeCategory, whereQuery, totalGuests]);

  const wishlistListings = useMemo(() => {
    const mapped = wishlistIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is QaagaListing => Boolean(l));
    return mapped.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      return matchesSearch(item);
    });
  }, [wishlistIds, listings, activeCategory, whereQuery, totalGuests]);

  const popularSource = useMemo(() => {
    return listings.filter((item) => {
      if (activeCategory === 'all') {
        return item.inPopularKL && matchesSearch(item);
      }
      return item.category === activeCategory && matchesSearch(item);
    });
  }, [listings, activeCategory, whereQuery, totalGuests]);

  const visiblePopularListings = useMemo(() => {
    if (popularSource.length <= 6) return popularSource;
    const safeOffset = popularOffset % popularSource.length;
    return [
      ...popularSource.slice(safeOffset),
      ...popularSource.slice(0, safeOffset),
    ].slice(0, 6);
  }, [popularSource, popularOffset]);

  const categorySpecificListings = useMemo(() => {
    return listings.filter(
      (item) => item.category === activeCategory && matchesSearch(item)
    );
  }, [listings, activeCategory, whereQuery, totalGuests]);

  const explorerListings = useMemo(() => {
    let base = listings.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (onlyGuestFavorites && !item.guestFavorite) return false;
      return matchesSearch(item);
    });
    if (explorerSort === 'price-asc') {
      base = [...base].sort((a, b) => a.twoNightPriceUsd - b.twoNightPriceUsd);
    } else if (explorerSort === 'price-desc') {
      base = [...base].sort((a, b) => b.twoNightPriceUsd - a.twoNightPriceUsd);
    } else if (explorerSort === 'rating') {
      base = [...base].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    return base;
  }, [listings, activeCategory, onlyGuestFavorites, explorerSort, whereQuery, totalGuests]);

  const hasActiveFilters =
    Boolean(whereQuery.trim() && whereQuery !== 'All Kuala Lumpur') ||
    Boolean(selectedDates.display) ||
    totalGuests > 0 ||
    infants > 0 ||
    pets > 0;

  const resetAllFilters = () => {
    setWhereQuery('');
    setSelectedDates(DATE_OPTIONS[0]);
    setAdults(0);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
    setActiveCategory('all');
    setActivePopover(null);
  };

  const handleToggleWishlist = (
    e: React.MouseEvent,
    item: QaagaListing,
    fromWishlistRow = false
  ) => {
    e.stopPropagation();
    const isCurrentlyInWishlist = wishlistIds.includes(item.id);

    if (fromWishlistRow || (isCurrentlyInWishlist && highlightedHearts[item.id])) {
      setWishlistIds((prev) => prev.filter((id) => id !== item.id));
      setHighlightedHearts((prev) => ({ ...prev, [item.id]: false }));
      showToast(`Removed "${item.title}" from Wishlist`);
    } else if (!isCurrentlyInWishlist) {
      setWishlistIds((prev) => [item.id, ...prev]);
      setHighlightedHearts((prev) => ({ ...prev, [item.id]: true }));
      showToast(`Saved "${item.title}" to Wishlist`);
    } else {
      // Already in default 6 Wishlist: first click highlights active saved state, second removes
      setHighlightedHearts((prev) => ({ ...prev, [item.id]: true }));
      showToast(`"${item.title}" is saved in your Wishlist`);
    }
  };

  const handleOpenListing = (item: QaagaListing) => {
    setSelectedListing(item);
    setModalNights(activeNights);
    setModalGuests(Math.max(1, totalGuests || 2));
    setBookingSuccessCode(null);
    // Promote to Recently viewed
    setRecentIds((prev) => [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 8));
  };

  const handleConfirmBooking = () => {
    if (!selectedListing) return;
    const code = `QG-KL${Math.floor(1000 + Math.random() * 9000)}`;
    const perNight = selectedListing.twoNightPriceUsd / 2;
    const totalUsd =
      modalNights === 2 ? selectedListing.twoNightPriceUsd : Math.round(perNight * modalNights);

    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      confirmationCode: code,
      listingId: selectedListing.id,
      title: selectedListing.title,
      area: `${selectedListing.area}, ${selectedListing.city}`,
      image: selectedListing.image,
      checkInLabel: selectedDates.display || `Nov 14 – Nov ${14 + modalNights}`,
      nights: modalNights,
      guests: modalGuests,
      totalUsd,
      hostName: selectedListing.hostName,
      status: 'Confirmed',
    };
    setBookings((prev) => [newBooking, ...prev]);
    setBookingSuccessCode(code);
    showToast(`Reservation confirmed (${code})!`);
  };

  const handleMessageHostFromListing = (item: QaagaListing) => {
    const existing = threads.find((t) => t.hostName === item.hostName);
    if (existing) {
      setActiveThreadId(existing.id);
      setThreads((prev) =>
        prev.map((t) => (t.id === existing.id ? { ...t, unread: false } : t))
      );
    } else {
      const createdId = `thread-${Date.now()}`;
      const newThread: MessageThread = {
        id: createdId,
        hostName: item.hostName,
        listingTitle: item.title,
        listingImage: item.image,
        unread: false,
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: 'host',
            text: `Hi! Feel free to ask me anything about "${item.title}" in ${item.area}.`,
            time: 'Just now',
          },
        ],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(createdId);
    }
    setSelectedListing(null);
    setIsInboxOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    const text = replyDraft.trim();
    const targetId = activeThreadId;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              unread: false,
              messages: [
                ...t.messages,
                { id: `g-${Date.now()}`, sender: 'guest', text, time: 'Just now' },
              ],
            }
          : t
      )
    );
    setReplyDraft('');

    // Helpful instant host acknowledgement
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `h-${Date.now()}`,
                    sender: 'host',
                    text: 'Thanks for your message! Those dates are available and early luggage drop-off is welcome.',
                    time: 'Just now',
                  },
                ],
              }
            : t
        )
      );
    }, 850);
  };

  const handleSelectCustomCalendarDay = (day: number) => {
    if (!customCheckInDay || (customCheckInDay && customCheckOutDay)) {
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
    } else if (day > customCheckInDay) {
      const nights = day - customCheckInDay;
      setCustomCheckOutDay(day);
      setSelectedDates({
        id: `custom-${customCheckInDay}-${day}`,
        label: `Nov ${customCheckInDay} – ${day}`,
        display: `Nov ${customCheckInDay} – ${day}`,
        nights,
        tag: `${nights} night${nights > 1 ? 's' : ''}`,
      });
    } else {
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
    }
  };

  const handlePublishHostListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostTitle.trim()) return;
    const parsedPrice = Math.max(20, parseInt(hostTwoNightUsd.replace(/\D/g, ''), 10) || 120);
    const created: QaagaListing = {
      id: `host-${Date.now()}`,
      title: hostTitle.trim(),
      area: hostArea,
      city: 'Kuala Lumpur',
      twoNightPriceUsd: parsedPrice,
      rating: '5.0',
      reviewsCount: 1,
      guestFavorite: hostGuestFav,
      image: hostPhoto,
      category: hostCategory,
      maxGuests: 4,
      bedrooms:
        hostCategory === 'stay'
          ? '1 queen bed · Private bath'
          : 'Hosted session · Instant confirmation',
      hostName: 'You (Host)',
      hostYears: 1,
      amenities: ['Verified Host', 'High-Speed Wi-Fi', 'Instant Book', 'Air Conditioning'],
      description: `Newly listed ${hostCategory} in ${hostArea}, Kuala Lumpur with flexible check-in and verified amenities.`,
      inPopularKL: true,
    };

    setListings((prev) => [created, ...prev]);
    setRecentIds((prev) => [created.id, ...prev.slice(0, 5)]);
    setWishlistIds((prev) => [created.id, ...prev]);
    setHighlightedHearts((prev) => ({ ...prev, [created.id]: true }));
    setActiveCategory(hostCategory === 'stay' ? 'all' : hostCategory);
    setHostTitle('');
    setIsHostModalOpen(false);
    showToast(`Published "${created.title}" live on qaaga!`);
  };

  const renderCard = (item: QaagaListing, inWishlistSection = false) => {
    const isHighlighted = Boolean(highlightedHearts[item.id]);
    const isInWishlist = wishlistIds.includes(item.id);
    const nightsText =
      item.category === 'stay'
        ? `for ${activeNights} night${activeNights > 1 ? 's' : ''}`
        : 'per session';

    return (
      <div
        key={`${inWishlistSection ? 'wish' : 'card'}-${item.id}`}
        onClick={() => handleOpenListing(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenListing(item);
          }
        }}
        className="group flex flex-col text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6610] rounded-[20px]"
      >
        {/* Rounded Square Photo Frame matching qaaga_d3ef7a3c.png */}
        <div className="relative w-full aspect-[1.05/1] rounded-[20px] overflow-hidden bg-slate-100">
          <ListingImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center scale-[1.035] group-hover:scale-[1.075] transition-transform duration-300"
          />

          {/* Top-Left "Guest favorite" Pill (only on items marked guestFavorite) */}
          {item.guestFavorite && (
            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-900 text-[12px] font-semibold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] leading-tight">
              Guest favorite
            </span>
          )}

          {/* Top-Right Interactive Heart Button */}
          <button
            type="button"
            aria-label={
              isInWishlist ? `Manage ${item.title} in wishlist` : `Save ${item.title} to wishlist`
            }
            onClick={(e) => handleToggleWishlist(e, item, inWishlistSection)}
            className="absolute top-2 right-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full z-10 cursor-pointer active:scale-90 transition-transform"
          >
            <Heart
              size={22}
              className={
                isHighlighted
                  ? 'fill-[#FF6610] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                  : 'fill-black/50 hover:fill-black/65 text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)]'
              }
            />
          </button>
        </div>

        {/* Clean Unboxed Metadata Underneath Photo */}
        <div className="pt-2.5 px-0.5 space-y-0.5">
          <h3 className="text-[14.5px] font-semibold text-slate-900 leading-snug truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-[13px] text-slate-500 tabular-nums leading-snug">
            <span>
              {formatStayPrice(item.twoNightPriceUsd)} {nightsText}
            </span>
            <span aria-hidden="true">·</span>
            <Star size={11} className="fill-slate-500 text-slate-500 shrink-0 -mt-px" />
            <span>{item.rating}</span>
          </div>
        </div>
      </div>
    );
  };

  const guestSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    if (infants > 0) parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    if (pets > 0) parts.push(`${pets} pet${pets > 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [totalGuests, infants, pets]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16 md:pb-14">
      {/* ===================================================================== */}
      {/* TOP HEADER + SEARCH SECTION + BOTTOM HAIRLINE DIVIDER                 */}
      {/* ===================================================================== */}
      <div className="border-b border-slate-200/90 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 sm:pt-5 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
          {/* Row 1: Brand Wordmark — 4 Illustrated Category Tabs — Host & Utilities */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            {/* Zone 1: Left Brand Wordmark ("qaaga") */}
            <button
              type="button"
              onClick={() => {
                resetAllFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[26px] sm:text-[28px] font-bold tracking-[-0.035em] text-[#FF6610] leading-none cursor-pointer whitespace-nowrap shrink-0"
            >
              qaaga
            </button>

            {/* Zone 2: Center 4 Category Tabs with Exact 3D Icons & Active Bottom Line */}
            <nav
              aria-label="Listing categories"
              className="order-3 md:order-2 w-full md:w-auto flex items-center justify-around sm:justify-center gap-5 sm:gap-9 lg:gap-11 overflow-x-auto scrollbar-none border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setPopularOffset(0);
                    }}
                    className={`relative flex items-center gap-2 sm:gap-2.5 pb-2.5 pt-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-slate-950 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 font-semibold'
                    }`}
                  >
                    <img
                      src={tab.iconSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className={`w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-150 ${
                        isActive ? 'scale-105' : 'opacity-90 hover:opacity-100'
                      }`}
                    />
                    <span className="text-[14px] sm:text-[14.5px] tracking-[-0.01em]">
                      {tab.label}
                    </span>

                    {/* Exact Active Bottom Underline */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Right "become a host" + Messages(1) + Trips(2) + Avatar */}
            <div className="order-2 md:order-3 flex items-center gap-3.5 sm:gap-5 shrink-0">
              <button
                type="button"
                onClick={() => setIsHostModalOpen(true)}
                className="hidden sm:inline-flex items-center text-[15px] text-slate-800 hover:text-slate-950 font-normal px-2.5 py-1.5 rounded-full hover:bg-slate-100/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                become a host
              </button>

              {/* Messages Envelope Icon + Orange Superscript Count */}
              <button
                type="button"
                aria-label="Messages"
                onClick={() => {
                  setIsInboxOpen(true);
                  setThreads((prev) =>
                    prev.map((t, idx) => (idx === 0 ? { ...t, unread: false } : t))
                  );
                }}
                className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Mail
                  size={23}
                  className="fill-slate-400/85 text-white stroke-[1.6]"
                />
                <span className="absolute top-0.5 right-0.5 text-[14px] font-bold text-[#FF6610] leading-none tabular-nums">
                  {unreadMessagesCount > 0 ? unreadMessagesCount : 1}
                </span>
              </button>

              {/* Trips / Bookings Icon + Orange Superscript Count */}
              <button
                type="button"
                aria-label="Trips and bookings"
                onClick={() => setIsTripsOpen(true)}
                className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Luggage
                  size={23}
                  className="fill-slate-400/85 text-white stroke-[1.6]"
                />
                <span className="absolute top-0.5 right-0.5 text-[14px] font-bold text-[#FF6610] leading-none tabular-nums">
                  {bookings.length}
                </span>
              </button>

              {/* User Profile Avatar Menu */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-slate-400/80 hover:bg-slate-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <User size={20} className="fill-white text-white" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.14)] border border-slate-200/90 py-2 z-50 text-left">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">Qaaga Traveler</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Kuala Lumpur · Verified Guest
                      </p>
                    </div>

                    <div className="p-1.5 space-y-0.5 text-[13px] text-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsInboxOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <span>Messages</span>
                        <span className="text-xs font-bold text-[#FF6610] tabular-nums">
                          {unreadMessagesCount || 1}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsTripsOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <span>Trips & Reservations</span>
                        <span className="text-xs font-bold text-[#FF6610] tabular-nums">
                          {bookings.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsCollectionExplorerOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <span>Saved Wishlist</span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          {wishlistIds.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsHostModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        Become a host
                      </button>
                    </div>

                    {/* Currency Switcher */}
                    <div className="px-3.5 py-2.5 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        Display currency
                      </p>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                        {(['USD', 'MYR', 'BDT'] as CurrencyCode[]).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setCurrency(code);
                              showToast(`Prices switched to ${CURRENCY_CONFIG[code].label}`);
                            }}
                            className={`py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              currency === code
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {CURRENCY_CONFIG[code].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-1.5 border-t border-slate-100 space-y-0.5 text-xs text-slate-600">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('customer_dashboard');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Customer Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('admin_portal');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Admin Control Tower
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Row 2: Centered 3-Segment Search Pill + Adjacent '+' Circle Button */}
          <div
            ref={searchAreaRef}
            className="relative flex items-center justify-center gap-3 sm:gap-3.5"
          >
            <div className="w-full max-w-[780px] min-h-[60px] sm:min-h-[64px] rounded-full bg-white border border-slate-300/90 shadow-[0_3px_14px_rgba(15,23,42,0.06)] pl-5 sm:pl-7 pr-2 py-1.5 flex items-center">
              {/* Segment 1: Where */}
              <div
                onClick={() => setActivePopover('where')}
                className={`flex-1 min-w-0 py-1 pr-3 rounded-full cursor-pointer transition-colors ${
                  activePopover === 'where' ? 'bg-slate-50/90 px-3 -ml-2' : ''
                }`}
              >
                <label
                  htmlFor="qaaga-where-input"
                  className="block text-[12px] font-bold text-slate-950 leading-tight cursor-pointer"
                >
                  Where
                </label>
                <input
                  id="qaaga-where-input"
                  type="text"
                  value={whereQuery}
                  onFocus={() => setActivePopover('where')}
                  onChange={(e) => setWhereQuery(e.target.value)}
                  placeholder="Search destination"
                  className="w-full bg-transparent text-[13.5px] sm:text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none truncate mt-0.5"
                />
              </div>

              {/* Crisp Dark Vertical Divider */}
              <div className="h-7 w-[1.5px] bg-slate-800/80 mx-2 sm:mx-4 shrink-0" aria-hidden="true" />

              {/* Segment 2: When */}
              <button
                type="button"
                onClick={() =>
                  setActivePopover((prev) => (prev === 'when' ? null : 'when'))
                }
                className={`w-[27%] sm:w-[30%] min-w-0 text-left py-1 px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  activePopover === 'when' ? 'bg-slate-100/80' : ''
                }`}
              >
                <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                  When
                </span>
                <span
                  className={`block text-[13.5px] sm:text-[14px] leading-tight truncate mt-0.5 ${
                    selectedDates.display ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {selectedDates.display || 'Add dates'}
                </span>
              </button>

              {/* Crisp Dark Vertical Divider */}
              <div className="h-7 w-[1.5px] bg-slate-800/80 mx-2 sm:mx-4 shrink-0" aria-hidden="true" />

              {/* Segment 3: Who */}
              <button
                type="button"
                onClick={() =>
                  setActivePopover((prev) => (prev === 'who' ? null : 'who'))
                }
                className={`w-[24%] sm:w-[25%] min-w-0 text-left py-1 px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  activePopover === 'who' ? 'bg-slate-100/80' : ''
                }`}
              >
                <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                  Who
                </span>
                <span
                  className={`block text-[13.5px] sm:text-[14px] leading-tight truncate mt-0.5 tabular-nums ${
                    guestSummaryText ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {guestSummaryText || 'Add guests'}
                </span>
              </button>

              {/* Orange Search Circle Button */}
              <button
                type="button"
                aria-label="Search listings"
                onClick={() => {
                  setActivePopover(null);
                  showToast(
                    whereQuery
                      ? `Showing stays in ${whereQuery}`
                      : `Showing ${popularSource.length} Kuala Lumpur listings`
                  );
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF6610] hover:bg-[#eb5907] active:scale-95 text-white flex items-center justify-center shrink-0 ml-2 shadow-[0_3px_10px_rgba(255,102,16,0.3)] transition-all cursor-pointer"
              >
                <Search size={19} strokeWidth={2.5} />
              </button>
            </div>

            {/* Adjacent '+' Circle Button matching qaaga_d3ef7a3c.png */}
            <button
              type="button"
              aria-label="Create new listing"
              onClick={() => setIsHostModalOpen(true)}
              className="w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full bg-white border border-slate-300 hover:border-slate-400 flex items-center justify-center text-[#FF6610] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus size={25} strokeWidth={2.4} />
            </button>

            {/* =============================================================== */}
            {/* POPOVER 1: WHERE (Destination Suggestions)                      */}
            {/* =============================================================== */}
            {activePopover === 'where' && (
              <div className="absolute top-[74px] left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-4 z-40 text-left">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-xs font-bold text-slate-500">
                    Suggested destinations in Kuala Lumpur
                  </span>
                  {whereQuery && (
                    <button
                      type="button"
                      onClick={() => setWhereQuery('')}
                      className="text-xs font-semibold text-[#FF6610] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {KL_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        setWhereQuery(dest.name === 'All Kuala Lumpur' ? '' : dest.name);
                        setActivePopover('when');
                      }}
                      className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        <MapPin size={18} className="text-[#FF6610]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{dest.name}</p>
                        <p className="text-xs text-slate-500 truncate">{dest.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* POPOVER 2: WHEN (Interactive Calendar + Quick Stay Presets)     */}
            {/* =============================================================== */}
            {activePopover === 'when' && (
              <div className="absolute top-[74px] left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      November 2026 · Select check-in & check-out
                    </h4>
                    <p className="text-xs text-slate-500">
                      Card prices dynamically adjust to your selected nights
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Interactive November 2026 Calendar Grid */}
                <div>
                  <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-1.5">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center tabular-nums">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                      const isStart = customCheckInDay === day;
                      const isEnd = customCheckOutDay === day;
                      const inRange =
                        customCheckInDay !== null &&
                        customCheckOutDay !== null &&
                        day > customCheckInDay &&
                        day < customCheckOutDay;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleSelectCustomCalendarDay(day)}
                          className={`h-9 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isStart || isEnd
                              ? 'bg-slate-900 text-white'
                              : inRange
                              ? 'bg-orange-50 text-[#FF6610]'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Stay Presets */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {DATE_OPTIONS.map((opt) => {
                    const active = selectedDates.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedDates(opt);
                          setActivePopover('who');
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                        }`}
                      >
                        {opt.tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* POPOVER 3: WHO (Airbnb-Style Guests Stepper)                    */}
            {/* =============================================================== */}
            {activePopover === 'who' && (
              <div className="absolute top-[74px] right-4 sm:right-20 w-full max-w-[380px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left divide-y divide-slate-100">
                {[
                  {
                    title: 'Adults',
                    sub: 'Ages 13 or above',
                    val: adults,
                    setVal: setAdults,
                    min: 0,
                    max: 8,
                  },
                  {
                    title: 'Children',
                    sub: 'Ages 2 – 12',
                    val: childrenCount,
                    setVal: setChildrenCount,
                    min: 0,
                    max: 6,
                  },
                  {
                    title: 'Infants',
                    sub: 'Under 2',
                    val: infants,
                    setVal: setInfants,
                    min: 0,
                    max: 4,
                  },
                  {
                    title: 'Pets',
                    sub: 'Bringing a service animal?',
                    val: pets,
                    setVal: setPets,
                    min: 0,
                    max: 3,
                  },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                      <p className="text-xs text-slate-500">{row.sub}</p>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <button
                        type="button"
                        aria-label={`Decrease ${row.title}`}
                        disabled={row.val <= row.min}
                        onClick={() => row.setVal(Math.max(row.min, row.val - 1))}
                        className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-35 hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-slate-900">
                        {row.val}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${row.title}`}
                        disabled={row.val >= row.max}
                        onClick={() => row.setVal(Math.min(row.max, row.val + 1))}
                        className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-35 hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN LISTINGS CANVAS                                                  */}
      {/* ===================================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-7 pb-10 space-y-10">
        {/* Active Search Filter Strip (only shown when user applies filters) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">Active search:</span>
              <span>{whereQuery || 'All Kuala Lumpur'}</span>
              <span aria-hidden="true">·</span>
              <span>
                {selectedDates.display
                  ? `${selectedDates.display} (${activeNights} nights)`
                  : `${activeNights} nights`}
              </span>
              {guestSummaryText && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{guestSummaryText}</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[#FF6610] font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Dedicated Category View for Experiences or Services */}
        {(activeCategory === 'experiences' || activeCategory === 'services') && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em] capitalize">
                  {activeCategory === 'experiences'
                    ? 'Popular experiences in Kuala Lumpur'
                    : 'Hospitality services in Kuala Lumpur'}
                </h2>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  {activeCategory === 'experiences'
                    ? 'Hosted cultural walks, skyline photography, and culinary trails'
                    : 'On-demand private chefs, airport chauffeurs, spa, and suite care'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="text-xs font-semibold text-[#FF6610] hover:underline whitespace-nowrap cursor-pointer"
              >
                Back to All
              </button>
            </div>

            {categorySpecificListings.length === 0 ? (
              <div className="py-12 text-center border border-slate-200/80 rounded-3xl space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  No {activeCategory} matched &ldquo;{whereQuery}&rdquo; for {totalGuests} guests
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {categorySpecificListings.map((item) => renderCard(item, false))}
              </div>
            )}
          </section>
        )}

        {/* Default "All" & "Stay" 3-Row Layout Matching qaaga_d3ef7a3c.png */}
        {(activeCategory === 'all' || activeCategory === 'stay') && (
          <>
            {/* ============================================================= */}
            {/* ROW 1: Recently viewed                                        */}
            {/* ============================================================= */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em]">
                  Recently viewed
                </h2>
              </div>

              {recentListings.length === 0 ? (
                <div className="py-8 px-5 rounded-2xl bg-slate-50 text-sm text-slate-600 flex items-center justify-between">
                  <span>No recently viewed homes match your current destination filter.</span>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[#FF6610] font-semibold hover:underline cursor-pointer"
                  >
                    Show all
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                  {recentListings.map((item) => renderCard(item, false))}
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* ROW 2: Wishlist                                               */}
            {/* ============================================================= */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em]">
                  Wishlist
                </h2>
                {wishlistIds.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setWishlistIds(['kl-1', 'kl-2', 'kl-3', 'kl-4', 'kl-5', 'kl-6']);
                      showToast('Restored all 6 saved homes in Wishlist');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Restore default 6
                  </button>
                )}
              </div>

              {wishlistListings.length === 0 ? (
                <div className="py-8 px-5 rounded-2xl border border-slate-200/80 text-sm text-slate-600 flex items-center justify-between">
                  <span>
                    Your wishlist is empty for this filter. Tap any heart icon to shortlist homes.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWishlistIds(['kl-1', 'kl-2', 'kl-3', 'kl-4', 'kl-5', 'kl-6'])
                    }
                    className="text-[#FF6610] font-semibold hover:underline cursor-pointer"
                  >
                    Restore saved
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                  {wishlistListings.slice(0, 6).map((item) => renderCard(item, true))}
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* ROW 3: Popular homes in Kuala Lumpur (-> + subtitle + < >)    */}
            {/* ============================================================= */}
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsCollectionExplorerOpen(true)}
                    className="inline-flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em] group-hover:underline">
                      Popular homes in Kuala Lumpur
                    </h2>
                    <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors shrink-0">
                      <ArrowRight size={15} strokeWidth={2.2} />
                    </span>
                  </button>
                  <p className="text-[14px] text-slate-500 mt-0.5">
                    Malaysian capital with skyline views
                  </p>
                </div>

                {/* Right Circular < > Pagination Controls matching qaaga_d3ef7a3c.png */}
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    type="button"
                    aria-label="Previous Kuala Lumpur homes"
                    onClick={() =>
                      setPopularOffset(
                        (prev) =>
                          (prev - 1 + Math.max(1, popularSource.length)) %
                          Math.max(1, popularSource.length)
                      )
                    }
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next Kuala Lumpur homes"
                    onClick={() =>
                      setPopularOffset(
                        (prev) => (prev + 1) % Math.max(1, popularSource.length)
                      )
                    }
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {visiblePopularListings.length === 0 ? (
                <div className="py-10 text-center border border-slate-200/80 rounded-2xl space-y-2">
                  <p className="text-sm font-semibold text-slate-800">
                    No homes matched your filter criteria
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2 rounded-full bg-[#FF6610] text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                  {visiblePopularListings.map((item) => renderCard(item, false))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Subtle Floating Toast Feedback */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: LISTING DETAIL & INSTANT RESERVATION CALCULATOR              */}
      {/* ===================================================================== */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Top Modal Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-950 truncate">
                  {selectedListing.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 tabular-nums mt-0.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                    <Star size={12} className="fill-slate-900 text-slate-900" />
                    {selectedListing.rating}
                  </span>
                  <span>·</span>
                  <span>{selectedListing.reviewsCount} reviews</span>
                  <span>·</span>
                  <span>
                    {selectedListing.area}, {selectedListing.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href).catch(() => {});
                    }
                    showToast('Listing link copied to clipboard');
                  }}
                  className="px-3 py-2 rounded-full hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={15} />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(e, selectedListing)}
                  className="px-3 py-2 rounded-full hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart
                    size={15}
                    className={
                      wishlistIds.includes(selectedListing.id)
                        ? 'fill-[#FF6610] text-[#FF6610]'
                        : 'text-slate-700'
                    }
                  />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setSelectedListing(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
              {/* Left 7 Columns: Photo, Host, Description, Amenities */}
              <div className="lg:col-span-7 space-y-5">
                <div className="relative aspect-[1.35/1] rounded-2xl overflow-hidden bg-slate-100">
                  <ListingImage
                    src={selectedListing.image}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover scale-[1.03]"
                  />
                  {selectedListing.guestFavorite && (
                    <span className="absolute top-3.5 left-3.5 bg-white/95 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                      Guest favorite · Top 5% of homes
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Hosted by {selectedListing.hostName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedListing.bedrooms} · Superhost ({selectedListing.hostYears} years hosting)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMessageHostFromListing(selectedListing)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-900 text-xs font-semibold text-slate-800 whitespace-nowrap cursor-pointer"
                  >
                    Message host
                  </button>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedListing.description}
                </p>

                <div className="space-y-2.5 pt-1">
                  <h4 className="text-sm font-bold text-slate-900">What this place offers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedListing.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2.5 text-xs text-slate-700 py-1.5 px-3 rounded-xl bg-slate-50"
                      >
                        <Check size={14} className="text-[#FF6610] shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Contiguous Reservation Module */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 shadow-[0_8px_28px_rgba(15,23,42,0.08)] p-5 space-y-4 sticky top-20">
                  <div className="flex items-baseline justify-between gap-2 tabular-nums">
                    <div>
                      <span className="text-2xl font-bold text-slate-950">
                        {formatStayPrice(selectedListing.twoNightPriceUsd, modalNights)}
                      </span>{' '}
                      <span className="text-xs text-slate-500">
                        total for {modalNights} night{modalNights > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Star size={12} className="fill-slate-900 text-slate-900" />
                      {selectedListing.rating}
                    </span>
                  </div>

                  {/* Nights & Guests Interactive Controls */}
                  <div className="rounded-xl border border-slate-300 divide-y divide-slate-200 text-xs">
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-900">Stay length</span>
                        <span className="text-slate-500">
                          {selectedDates.display || `Nov 14 – Nov ${14 + modalNights}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <button
                          type="button"
                          onClick={() => setModalNights((n) => Math.max(1, n - 1))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-slate-900 w-14 text-center">
                          {modalNights} night{modalNights > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setModalNights((n) => Math.min(30, n + 1))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-900">Guests</span>
                        <span className="text-slate-500">
                          Max {selectedListing.maxGuests} guests
                        </span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <button
                          type="button"
                          onClick={() => setModalGuests((g) => Math.max(1, g - 1))}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-slate-900 w-14 text-center">
                          {modalGuests} guest{modalGuests > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setModalGuests((g) => Math.min(selectedListing.maxGuests, g + 1))
                          }
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-900 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-xs text-slate-600 pt-1 tabular-nums">
                    <div className="flex justify-between">
                      <span>
                        {formatStayPrice(selectedListing.twoNightPriceUsd, 1)} × {modalNights}{' '}
                        night{modalNights > 1 ? 's' : ''}
                      </span>
                      <span>
                        {formatStayPrice(selectedListing.twoNightPriceUsd, modalNights)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qaaga guest protection & taxes</span>
                      <span className="text-emerald-700 font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-950">
                      <span>Total</span>
                      <span>
                        {formatStayPrice(selectedListing.twoNightPriceUsd, modalNights)}
                      </span>
                    </div>
                  </div>

                  {bookingSuccessCode ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5 text-center">
                      <p className="text-xs font-bold text-emerald-900">
                        Reservation Confirmed · {bookingSuccessCode}
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Added to your Trips ({bookings.length}). Check-in instructions sent to
                        Messages.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedListing(null);
                          setIsTripsOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        View in My Trips
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="w-full h-12 rounded-xl bg-[#FF6610] hover:bg-[#eb5907] active:scale-[0.99] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(255,102,16,0.3)] transition-all cursor-pointer"
                    >
                      Reserve
                    </button>
                  )}

                  <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck size={13} className="text-slate-400" />
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: BECOME A HOST / '+' QUICK ADD LISTING MODAL                  */}
      {/* ===================================================================== */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Become a host on qaaga</h3>
                <p className="text-xs text-slate-500">
                  Publish a stay, experience, or hospitality service in Kuala Lumpur
                </p>
              </div>
              <button
                type="button"
                aria-label="Close host modal"
                onClick={() => setIsHostModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishHostListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['stay', 'experiences', 'services'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHostCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                        hostCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Listing title
                </label>
                <input
                  type="text"
                  required
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="e.g. Skyline Studio in Bukit Bintang"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF6610]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Neighborhood
                  </label>
                  <select
                    value={hostArea}
                    onChange={(e) => setHostArea(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#FF6610]"
                  >
                    {['Bukit Bintang', 'Kampung Bahru', 'KLCC', 'Mont Kiara', 'Bangsar'].map(
                      (area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2-night price ($ USD)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    required
                    value={hostTwoNightUsd}
                    onChange={(e) => setHostTwoNightUsd(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 tabular-nums focus:outline-none focus:border-[#FF6610]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select cover photo
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const path = `/assets/kl-ui/kl-${num}.jpg`;
                    const selected = hostPhoto === path;
                    return (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setHostPhoto(path)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selected ? 'border-[#FF6610] scale-105' : 'border-transparent opacity-75'
                        }`}
                      >
                        <img
                          src={path}
                          alt={`Cover ${num}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hostGuestFav}
                  onChange={(e) => setHostGuestFav(e.target.checked)}
                  className="rounded accent-[#FF6610] w-4 h-4"
                />
                <span>Highlight with &ldquo;Guest favorite&rdquo; badge</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF6610] hover:bg-[#eb5907] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Publish listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: MESSAGES / HOST INBOX DRAWER (Top-Right Envelope '1')        */}
      {/* ===================================================================== */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[540px] max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Messages</h3>
              <button
                type="button"
                aria-label="Close inbox"
                onClick={() => setIsInboxOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-0">
              {/* Thread List */}
              <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-slate-100 overflow-y-auto p-2 space-y-1">
                {threads.map((t) => {
                  const selected = t.id === activeThread?.id;
                  const lastMsg = t.messages[t.messages.length - 1];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveThreadId(t.id);
                        setThreads((prev) =>
                          prev.map((item) =>
                            item.id === t.id ? { ...item, unread: false } : item
                          )
                        );
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors cursor-pointer ${
                        selected ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={t.listingImage}
                        alt={t.listingTitle}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {t.hostName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {lastMsg?.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{t.listingTitle}</p>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {lastMsg?.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Conversation */}
              {activeThread && (
                <div className="sm:col-span-7 flex flex-col min-h-0">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-xs font-bold text-slate-900">{activeThread.hostName}</p>
                    <p className="text-[11px] text-slate-500">{activeThread.listingTitle}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeThread.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.sender === 'guest' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'guest'
                              ? 'bg-[#FF6610] text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-t border-slate-100 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="Write a message to host..."
                      className="flex-1 h-10 px-3.5 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-[#FF6610]"
                    />
                    <button
                      type="submit"
                      aria-label="Send message"
                      className="w-10 h-10 rounded-full bg-[#FF6610] hover:bg-[#eb5907] text-white flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: TRIPS & BOOKINGS DRAWER (Top-Right Luggage '2')              */}
      {/* ===================================================================== */}
      {isTripsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Trips & Reservations ({bookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Your confirmed Kuala Lumpur stays and booking codes
                </p>
              </div>
              <button
                type="button"
                aria-label="Close trips"
                onClick={() => setIsTripsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5">
              {bookings.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-800">No upcoming trips</p>
                  <p className="text-xs text-slate-500">
                    Click any Kuala Lumpur home card to reserve your next stay.
                  </p>
                </div>
              ) : (
                bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={bk.image}
                        alt={bk.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                          <span>{bk.status}</span>
                          <span>·</span>
                          <span className="font-mono">{bk.confirmationCode}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{bk.title}</h4>
                        <p className="text-xs text-slate-500">
                          {bk.checkInLabel} · {bk.nights} nights · {bk.guests} guests
                        </p>
                        <p className="text-xs font-semibold text-slate-900 tabular-nums">
                          Total paid: {formatStayPrice(bk.totalUsd, 2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const found = listings.find((l) => l.id === bk.listingId);
                          if (found) {
                            setIsTripsOpen(false);
                            handleOpenListing(found);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        View stay
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookings((prev) => prev.filter((item) => item.id !== bk.id));
                          showToast(`Cancelled booking ${bk.confirmationCode}`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 text-xs font-semibold text-rose-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: POPULAR KL COLLECTION EXPLORER (Triggered by Heading ->)     */}
      {/* ===================================================================== */}
      {isCollectionExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Kuala Lumpur Stays & Collection ({explorerListings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Malaysian capital with skyline views · Instant reservation
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setOnlyGuestFavorites((v) => !v)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    onlyGuestFavorites
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Guest favorites only
                </button>

                <select
                  value={explorerSort}
                  onChange={(e) => setExplorerSort(e.target.value as typeof explorerSort)}
                  className="h-8 px-3 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <button
                  type="button"
                  aria-label="Close explorer"
                  onClick={() => setIsCollectionExplorerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {explorerListings.map((item) => (
                <div
                  key={`exp-${item.id}`}
                  onClick={() => {
                    setIsCollectionExplorerOpen(false);
                    handleOpenListing(item);
                  }}
                >
                  {renderCard(item, false)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
