'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Minus,
  Send,
  ShieldCheck,
  Building2,
  Share2,
  Stethoscope,
  Wrench,
  ShoppingBag,
  Briefcase,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type QaagaCategory = 'all' | 'stay' | 'experiences' | 'services';
export type CurrencyCode = 'USD' | 'MYR' | 'BDT';

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
  offerPercent?: number;
  originalTwoNightUsd?: number;
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

const STORAGE_KEYS = {
  wishlist: 'qaaga_kl_wishlist_v2',
  bookings: 'qaaga_kl_bookings_v2',
  threads: 'qaaga_kl_threads_v2',
  customListings: 'qaaga_kl_custom_listings_v2',
  currency: 'qaaga_kl_currency_v2',
};

// Exact 6 Core Screenshot Listings + Unique Extra Carousel & Category Listings
const INITIAL_LISTINGS: QaagaListing[] = [
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
    offerPercent: 15,
    originalTwoNightUsd: 60,
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
    offerPercent: 12,
    originalTwoNightUsd: 112,
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
    offerPercent: 15,
    originalTwoNightUsd: 60,
  },

  // Extra Unique Carousel Stays (each using distinct clean-rooms photography!)
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
    offerPercent: 20,
    originalTwoNightUsd: 148,
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
    offerPercent: 18,
    originalTwoNightUsd: 176,
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
    offerPercent: 10,
    originalTwoNightUsd: 82,
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
      'Taste authentic Nasi Lemak Antarabangsa, charcoal satay, and artisanal kuih with a third-generation Kampung Bahru culinary host.',
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
      'Hand-paint your own traditional Malaysian silk batik motif in a sunlit Bangsar studio accompanied by artisanal Cameron Highlands tea.',
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
      'Start your morning above the city haze with guided vinyasa flow beside a tranquil open terrace.',
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

  // Curated Services (6 unique items)
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

const KL_DESTINATIONS = [
  { name: 'All Kuala Lumpur', subtitle: 'Explore all neighborhoods in KL' },
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
  { id: 'monthly-30', label: 'Monthly (30 nights)', display: '30 nights', nights: 30, tag: 'Monthly · 30 nights' },
];

const CATEGORY_TABS: { id: QaagaCategory; label: string; iconSrc: string }[] = [
  { id: 'all', label: 'All', iconSrc: '/assets/kl-ui/icon-all.png' },
  { id: 'stay', label: 'Stay', iconSrc: '/assets/kl-ui/icon-stay.png' },
  { id: 'experiences', label: 'Experiences', iconSrc: '/assets/kl-ui/icon-experiences.png' },
  { id: 'services', label: 'Services', iconSrc: '/assets/kl-ui/icon-services.png' },
];

const DEFAULT_REVIEWS: ListingReview[] = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    date: 'October 2026',
    rating: 5,
    comment:
      'Spotless apartment with breathtaking Kuala Lumpur skyline views. Self check-in took under a minute and Wi-Fi was super fast.',
  },
  {
    id: 'rev-2',
    author: 'Tariq Al-Mansoor',
    date: 'September 2026',
    rating: 5,
    comment:
      'Exactly like the photos! Walking distance to MRT and great local food. Host responded within 2 minutes.',
  },
];

const ListingImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

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
  const { currentUser } = useAuth();

  const [listings, setListings] = useState<QaagaListing[]>(INITIAL_LISTINGS);
  const [activeCategory, setActiveCategory] = useState<QaagaCategory>('all');
  const [staySubFilter, setStaySubFilter] = useState<string>('all');
  const [expSubFilter, setExpSubFilter] = useState<string>('all');
  const [srvSubFilter, setSrvSubFilter] = useState<string>('all');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Search state
  const [whereQuery, setWhereQuery] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<(typeof DATE_OPTIONS)[number]>(
    DATE_OPTIONS[0]
  );
  const [calendarMonth, setCalendarMonth] = useState<'Nov' | 'Dec'>('Nov');
  const [customCheckInDay, setCustomCheckInDay] = useState<number | null>(14);
  const [customCheckOutDay, setCustomCheckOutDay] = useState<number | null>(16);
  const [adults, setAdults] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [isSearchResultsMode, setIsSearchResultsMode] = useState<boolean>(false);

  const [activePopover, setActivePopover] = useState<'where' | 'when' | 'who' | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const whereInputRef = useRef<HTMLInputElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  // Horizontal scroll refs for desktop & mobile carousels
  const recentRowRef = useRef<HTMLDivElement | null>(null);
  const wishlistRowRef = useRef<HTMLDivElement | null>(null);
  const popularRowRef = useRef<HTMLDivElement | null>(null);

  const mobileRecentRowRef = useRef<HTMLDivElement | null>(null);
  const mobileWishlistRowRef = useRef<HTMLDivElement | null>(null);
  const mobilePopularRowRef = useRef<HTMLDivElement | null>(null);
  const mobileOfferRowRef = useRef<HTMLDivElement | null>(null);
  const [showMoreMobile, setShowMoreMobile] = useState<boolean>(false);

  // Recently viewed order & Honest 1-click Wishlist IDs
  const [recentIds, setRecentIds] = useState<string[]>([
    'kl-1',
    'kl-2',
    'kl-3',
    'kl-4',
    'kl-5',
    'kl-6',
    'kl-7',
    'kl-8',
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    'kl-1',
    'kl-2',
    'kl-3',
    'kl-4',
    'kl-5',
    'kl-6',
  ]);
  const [userToggledHeartIds, setUserToggledHeartIds] = useState<Record<string, boolean>>({});
  const [lastRemovedWishlistId, setLastRemovedWishlistId] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedListing, setSelectedListing] = useState<QaagaListing | null>(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string>('');
  const [modalNights, setModalNights] = useState<number>(2);
  const [modalGuests, setModalGuests] = useState<number>(2);
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);
  const [customReviewsByListing, setCustomReviewsByListing] = useState<
    Record<string, ListingReview[]>
  >({});
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [replyDraft, setReplyDraft] = useState<string>('');

  const [isTripsOpen, setIsTripsOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isCollectionExplorerOpen, setIsCollectionExplorerOpen] = useState<boolean>(false);
  const [explorerTitle, setExplorerTitle] = useState<string>('Popular homes in Kuala Lumpur');
  const [explorerSort, setExplorerSort] = useState<
    'recommended' | 'price-asc' | 'price-desc' | 'rating'
  >('recommended');
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

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Hydrate persisted state safely on client mount
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const savedWish = localStorage.getItem(STORAGE_KEYS.wishlist);
      if (savedWish) {
        const parsed = JSON.parse(savedWish);
        if (Array.isArray(parsed)) setWishlistIds(parsed);
      }
      const savedBookings = localStorage.getItem(STORAGE_KEYS.bookings);
      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        if (Array.isArray(parsed)) setBookings(parsed);
      }
      const savedThreads = localStorage.getItem(STORAGE_KEYS.threads);
      if (savedThreads) {
        const parsed = JSON.parse(savedThreads);
        if (Array.isArray(parsed) && parsed.length > 0) setThreads(parsed);
      }
      const savedCustom = localStorage.getItem(STORAGE_KEYS.customListings);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setListings([...parsed, ...INITIAL_LISTINGS]);
        }
      }
      const savedCurr = localStorage.getItem(STORAGE_KEYS.currency) as CurrencyCode | null;
      if (savedCurr && CURRENCY_CONFIG[savedCurr]) {
        setCurrency(savedCurr);
      }
    } catch {
      // ignore storage errors in restricted environments
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    } catch {}
  }, [bookings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
    } catch {}
  }, [threads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.currency, currency);
    } catch {}
  }, [currency, hydrated]);

  const resetAllFilters = useCallback(() => {
    setWhereQuery('');
    setSelectedDates(DATE_OPTIONS[0]);
    setAdults(0);
    setChildrenCount(0);
    setInfants(0);
    setPets(0);
    setIsSearchResultsMode(false);
    setStaySubFilter('all');
    setExpSubFilter('all');
    setSrvSubFilter('all');
    setActiveCategory('all');
    setActivePopover(null);
  }, []);

  // Outside click & Escape key listeners + MobileNav event bridge
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePopover(null);
        setIsAccountMenuOpen(false);
        setSelectedListing(null);
        setIsHostModalOpen(false);
        setIsInboxOpen(false);
        setIsTripsOpen(false);
        setIsCollectionExplorerOpen(false);
      }
    };
    const onHomeReset = () => resetAllFilters();
    const onOpenInbox = () => setIsInboxOpen(true);
    const onOpenHost = () => setIsHostModalOpen(true);
    const onOpenTrips = () => setIsTripsOpen(true);

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('qaaga:home-reset', onHomeReset);
    window.addEventListener('qaaga:open-inbox', onOpenInbox);
    window.addEventListener('qaaga:open-host', onOpenHost);
    window.addEventListener('qaaga:open-trips', onOpenTrips);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('qaaga:home-reset', onHomeReset);
      window.removeEventListener('qaaga:open-inbox', onOpenInbox);
      window.removeEventListener('qaaga:open-host', onOpenHost);
      window.removeEventListener('qaaga:open-trips', onOpenTrips);
    };
  }, [resetAllFilters]);

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

  const matchesSearch = useCallback(
    (item: QaagaListing) => {
      if (whereQuery.trim() && whereQuery !== 'All Kuala Lumpur') {
        const q = whereQuery.toLowerCase().trim();
        const hit =
          item.title.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.subType.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (totalGuests > 0 && item.maxGuests < totalGuests) {
        return false;
      }
      return true;
    },
    [whereQuery, totalGuests]
  );

  const recentListings = useMemo(() => {
    const mapped = recentIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is QaagaListing => Boolean(l));
    return mapped.filter(matchesSearch);
  }, [recentIds, listings, matchesSearch]);

  const wishlistListings = useMemo(() => {
    const mapped = wishlistIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is QaagaListing => Boolean(l));
    return mapped.filter(matchesSearch);
  }, [wishlistIds, listings, matchesSearch]);

  const popularKLListings = useMemo(() => {
    return listings.filter((item) => item.inPopularKL && matchesSearch(item));
  }, [listings, matchesSearch]);

  const offerListings = useMemo(() => {
    return listings.filter((item) => Boolean(item.offerPercent) && matchesSearch(item));
  }, [listings, matchesSearch]);

  const stayTabListings = useMemo(() => {
    let base = listings.filter((item) => item.category === 'stay' && matchesSearch(item));
    if (staySubFilter === 'apartments') base = base.filter((i) => i.subType === 'apartments');
    if (staySubFilter === 'rooms') base = base.filter((i) => i.subType === 'rooms');
    if (staySubFilter === 'condos') base = base.filter((i) => i.subType === 'condos');
    if (staySubFilter === 'favorites') base = base.filter((i) => i.guestFavorite);
    if (staySubFilter === 'under100') base = base.filter((i) => i.twoNightPriceUsd <= 100);
    return base;
  }, [listings, staySubFilter, matchesSearch]);

  const experiencesTabListings = useMemo(() => {
    let base = listings.filter((item) => item.category === 'experiences' && matchesSearch(item));
    if (expSubFilter !== 'all') base = base.filter((i) => i.subType === expSubFilter);
    return base;
  }, [listings, expSubFilter, matchesSearch]);

  const servicesTabListings = useMemo(() => {
    let base = listings.filter((item) => item.category === 'services' && matchesSearch(item));
    if (srvSubFilter !== 'all') base = base.filter((i) => i.subType === srvSubFilter);
    return base;
  }, [listings, srvSubFilter, matchesSearch]);

  const allMatchingSearchListings = useMemo(() => {
    return listings.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      return matchesSearch(item);
    });
  }, [listings, activeCategory, matchesSearch]);

  const explorerListings = useMemo(() => {
    let base = listings.filter((item) => {
      if (explorerTitle === 'Saved Wishlist') {
        return wishlistIds.includes(item.id);
      }
      if (explorerTitle === 'Special Offers') {
        return Boolean(item.offerPercent);
      }
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
  }, [
    listings,
    explorerTitle,
    wishlistIds,
    activeCategory,
    onlyGuestFavorites,
    explorerSort,
    matchesSearch,
  ]);

  const hasActiveFilters =
    Boolean(whereQuery.trim() && whereQuery !== 'All Kuala Lumpur') ||
    Boolean(selectedDates.display) ||
    totalGuests > 0 ||
    infants > 0 ||
    pets > 0;

  // Smooth horizontal scroll helper for any carousel row
  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.68));
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === 'right') {
      if (el.scrollLeft >= maxScroll - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 12) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  // Immediate 1-click Wishlist toggle
  const handleToggleWishlist = (e: React.MouseEvent, item: QaagaListing) => {
    e.stopPropagation();
    const exists = wishlistIds.includes(item.id);
    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => id !== item.id));
      setUserToggledHeartIds((prev) => ({ ...prev, [item.id]: false }));
      setLastRemovedWishlistId(item.id);
      showToast(`Removed "${item.title}" from Wishlist`);
    } else {
      setWishlistIds((prev) => [item.id, ...prev]);
      setUserToggledHeartIds((prev) => ({ ...prev, [item.id]: true }));
      setLastRemovedWishlistId(null);
      showToast(`Saved "${item.title}" to Wishlist`);
    }
  };

  const handleUndoRemoveWishlist = () => {
    if (!lastRemovedWishlistId) return;
    setWishlistIds((prev) =>
      prev.includes(lastRemovedWishlistId) ? prev : [lastRemovedWishlistId, ...prev]
    );
    setUserToggledHeartIds((prev) => ({ ...prev, [lastRemovedWishlistId]: true }));
    setLastRemovedWishlistId(null);
    setToast(null);
  };

  const handleOpenListing = (item: QaagaListing) => {
    setSelectedListing(item);
    setActiveGalleryImg(item.image);
    setModalNights(activeNights);
    setModalGuests(Math.max(1, Math.min(item.maxGuests, totalGuests || 2)));
    setBookingSuccessCode(null);
    setNewReviewText('');
    setRecentIds((prev) => [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 10));
  };

  const handleExecuteSearch = () => {
    if (!hasActiveFilters && activePopover === null) {
      setActivePopover('where');
      setTimeout(() => whereInputRef.current?.focus(), 40);
      return;
    }
    setActivePopover(null);
    if (hasActiveFilters) {
      setIsSearchResultsMode(true);
      showToast(
        `Found ${allMatchingSearchListings.length} matching listing${
          allMatchingSearchListings.length === 1 ? '' : 's'
        }`
      );
    } else {
      setIsSearchResultsMode(false);
    }
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
      checkInLabel: selectedDates.display || `${calendarMonth} 14 – ${calendarMonth} ${14 + modalNights}`,
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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !newReviewText.trim()) return;
    const created: ListingReview = {
      id: `rev-${Date.now()}`,
      author: currentUser?.fullName || 'Verified Guest',
      date: 'Just now',
      rating: newReviewRating,
      comment: newReviewText.trim(),
    };
    setCustomReviewsByListing((prev) => ({
      ...prev,
      [selectedListing.id]: [created, ...(prev[selectedListing.id] || [])],
    }));
    setListings((prev) =>
      prev.map((l) =>
        l.id === selectedListing.id ? { ...l, reviewsCount: l.reviewsCount + 1 } : l
      )
    );
    setSelectedListing((prev) =>
      prev ? { ...prev, reviewsCount: prev.reviewsCount + 1 } : null
    );
    setNewReviewText('');
    showToast('Your review has been posted!');
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
                    text: 'Thanks for reaching out! Those dates are open and self check-in details will be sent right after booking.',
                    time: 'Just now',
                  },
                ],
              }
            : t
        )
      );
    }, 700);
  };

  const handleSelectCustomCalendarDay = (day: number) => {
    if (!customCheckInDay || (customCheckInDay && customCheckOutDay)) {
      setCustomCheckInDay(day);
      setCustomCheckOutDay(null);
    } else if (day > customCheckInDay) {
      const nights = day - customCheckInDay;
      setCustomCheckOutDay(day);
      setSelectedDates({
        id: `custom-${calendarMonth}-${customCheckInDay}-${day}`,
        label: `${calendarMonth} ${customCheckInDay} – ${day}`,
        display: `${calendarMonth} ${customCheckInDay} – ${day}`,
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
      subType: hostCategory === 'stay' ? 'apartments' : hostCategory === 'experiences' ? 'skyline' : 'care',
      twoNightPriceUsd: parsedPrice,
      rating: '5.0',
      reviewsCount: 1,
      guestFavorite: hostGuestFav,
      image: hostPhoto,
      gallery: [hostPhoto, '/assets/kl-ui/kl-1.jpg'],
      category: hostCategory,
      maxGuests: 4,
      bedrooms:
        hostCategory === 'stay'
          ? '1 queen bed · Private bath'
          : 'Hosted session · Instant confirmation',
      hostName: currentUser?.fullName || 'You (Host)',
      hostYears: 1,
      amenities: ['Verified Host', 'High-Speed Wi-Fi', 'Instant Book', 'Air Conditioning'],
      description: `Newly published ${hostCategory} in ${hostArea}, Kuala Lumpur with flexible check-in and verified amenities.`,
      inPopularKL: true,
    };

    setListings((prev) => {
      const updated = [created, ...prev];
      try {
        const customOnly = updated.filter((i) => i.id.startsWith('host-'));
        localStorage.setItem(STORAGE_KEYS.customListings, JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
    setRecentIds((prev) => [created.id, ...prev]);
    setWishlistIds((prev) => [created.id, ...prev]);
    setUserToggledHeartIds((prev) => ({ ...prev, [created.id]: true }));
    setActiveCategory(hostCategory);
    setHostTitle('');
    setIsHostModalOpen(false);
    showToast(`Published "${created.title}" live on qaaga!`);
  };

  const renderCard = (
    item: QaagaListing,
    contextKey: string,
    carouselItem = false,
    closeExplorerFirst = false
  ) => {
    const isSaved = wishlistIds.includes(item.id);
    const isVividHeart =
      isSaved &&
      (Boolean(userToggledHeartIds[item.id]) ||
        contextKey === 'stay' ||
        contextKey === 'search' ||
        contextKey === 'explorer');
    const nightsText =
      item.category === 'stay'
        ? `for ${activeNights} night${activeNights > 1 ? 's' : ''}`
        : 'per booking';

    const openCard = () => {
      if (closeExplorerFirst) {
        setIsCollectionExplorerOpen(false);
      }
      handleOpenListing(item);
    };

    return (
      <article
        key={`${contextKey}-${item.id}`}
        className={`group relative flex flex-col text-left rounded-[20px] ${
          carouselItem
            ? 'snap-start shrink-0 w-[46%] sm:w-[31%] lg:w-[calc((100%-100px)/6)]'
            : ''
        }`}
      >
        {/* Rounded Square Photo Frame matching qaaga_d3ef7a3c.png */}
        <div className="relative w-full aspect-[1.05/1] rounded-[20px] overflow-hidden bg-slate-100">
          <button
            type="button"
            aria-label={`View details for ${item.title}`}
            onClick={openCard}
            className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF6610]"
          >
            <ListingImage
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center scale-[1.035] group-hover:scale-[1.075] transition-transform duration-300"
            />
          </button>

          {/* Top-Left "Guest favorite" Pill */}
          {item.guestFavorite && (
            <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs text-slate-900 text-[12px] font-semibold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] leading-tight pointer-events-none">
              Guest favorite
            </span>
          )}

          {/* Top-Right 1-Click Interactive Heart Button */}
          <button
            type="button"
            title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={
              isSaved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`
            }
            onClick={(e) => handleToggleWishlist(e, item)}
            className="absolute top-2 right-2 z-20 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full cursor-pointer hover:scale-110 active:scale-90 transition-transform"
          >
            <Heart
              size={22}
              className={
                isVividHeart
                  ? 'fill-[#FF6610] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                  : isSaved
                  ? 'fill-black/50 hover:fill-[#FF6610] text-white stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)]'
                  : 'fill-black/20 hover:fill-[#FF6610] text-white/95 stroke-[2] drop-shadow-[0_1px_4px_rgba(0,0,0,0.28)]'
              }
            />
          </button>
        </div>

        {/* Clean Unboxed Metadata Underneath Photo */}
        <div onClick={openCard} className="pt-2.5 px-0.5 space-y-0.5 cursor-pointer">
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
      </article>
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
  const activeModalReviews = selectedListing
    ? [...(customReviewsByListing[selectedListing.id] || []), ...DEFAULT_REVIEWS]
    : [];

  const renderMobileWideCard = (
    item: QaagaListing,
    contextKey: string,
    showOfferBadge = false,
    gridItem = false
  ) => {
    const isSaved = wishlistIds.includes(item.id);
    const isVividHeart = isSaved && Boolean(userToggledHeartIds[item.id]);

    return (
      <article
        key={`mob-${contextKey}-${item.id}`}
        className={`group relative flex flex-col text-left rounded-[16px] ${
          gridItem ? 'w-full' : 'snap-start shrink-0 w-[calc(50%-6px)]'
        }`}
      >
        <div className="relative w-full aspect-[1.48/1] rounded-[16px] overflow-hidden bg-slate-100">
          <button
            type="button"
            aria-label={`View details for ${item.title}`}
            onClick={() => handleOpenListing(item)}
            className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF6B18]"
          >
            <ListingImage
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center scale-[1.035] transition-transform duration-300"
            />
          </button>

          {showOfferBadge && item.offerPercent ? (
            <span className="absolute top-2 left-2 z-10 bg-white/95 text-[#FF6B18] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs leading-tight pointer-events-none">
              {item.offerPercent}% OFF
            </span>
          ) : item.guestFavorite ? (
            <span className="absolute top-2 left-2 z-10 bg-white/95 text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs leading-tight pointer-events-none">
              Guest favorite
            </span>
          ) : null}

          <button
            type="button"
            title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={
              isSaved ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`
            }
            onClick={(e) => handleToggleWishlist(e, item)}
            className="absolute top-1.5 right-1.5 z-20 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          >
            <Heart
              size={19}
              className={
                isVividHeart
                  ? 'fill-[#FF6B18] text-white stroke-[2] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                  : isSaved
                  ? 'fill-black/50 text-white stroke-[2] drop-shadow-[0_1px_3px_rgba(0,0,0,0.28)]'
                  : 'fill-black/20 text-white/95 stroke-[2] drop-shadow-[0_1px_3px_rgba(0,0,0,0.28)]'
              }
            />
          </button>
        </div>

        <div
          onClick={() => handleOpenListing(item)}
          className="pt-1.5 px-0.5 space-y-0.5 cursor-pointer"
        >
          <h3 className="text-[12.5px] font-semibold text-slate-900 leading-tight truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 tabular-nums leading-tight">
            <span className={showOfferBadge && item.offerPercent ? 'text-[#FF6B18] font-semibold' : ''}>
              {formatStayPrice(item.twoNightPriceUsd)}
            </span>
            {showOfferBadge && item.originalTwoNightUsd ? (
              <span className="line-through text-slate-400">
                {formatStayPrice(item.originalTwoNightUsd)}
              </span>
            ) : (
              <span>
                {item.category === 'stay' ? `for ${activeNights}n` : 'booking'}
              </span>
            )}
            <span aria-hidden="true">·</span>
            <Star size={10} className="fill-slate-500 text-slate-500 shrink-0 -mt-px" />
            <span>{item.rating}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 md:pb-14">
      {/* ===================================================================== */}
      {/* TOP HEADER + SEARCH SECTION (Mobile: final_design | Desktop: kl-ui)   */}
      {/* ===================================================================== */}
      <div className="md:border-b md:border-slate-200/90 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 md:pt-5 pb-2 md:pb-6 space-y-3.5 md:space-y-5">
          {/* Row 1: Brand Wordmark — Centered 4 Category Tabs — Desktop Host & Utilities */}
          <header className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-3 md:gap-4">
            {/* Zone 1: Left Brand Wordmark ("qaaga.com" on Mobile, "qaaga" on Desktop) */}
            <div className="flex items-center justify-start md:justify-self-start">
              <button
                type="button"
                onClick={() => {
                  resetAllFilters();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="leading-none cursor-pointer whitespace-nowrap shrink-0 text-left"
              >
                <span className="md:hidden inline-flex items-baseline">
                  <span className="text-[31px] font-bold tracking-[-0.035em] text-[#FF6B18]">
                    qaaga
                  </span>
                  <span className="text-[21px] font-bold tracking-[-0.02em] text-[#FF6B18]">
                    .com
                  </span>
                </span>
                <span className="hidden md:inline text-[28px] font-bold tracking-[-0.035em] text-[#FF6610]">
                  qaaga
                </span>
              </button>
            </div>

            {/* Zone 2: Mathematically Centered 4 Category Tabs (Mobile & Desktop) */}
            <nav
              aria-label="Listing categories"
              className="w-full md:w-auto md:justify-self-center flex items-center justify-center gap-3.5 min-[400px]:gap-5 sm:gap-8 md:gap-8 lg:gap-11 overflow-x-auto scrollbar-none pt-0.5 md:pt-0"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setIsSearchResultsMode(false);
                      setActivePopover(null);
                    }}
                    className={`relative flex items-center gap-1.5 sm:gap-2.5 pb-2 md:pb-2.5 pt-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-slate-950 font-bold md:font-semibold'
                        : 'text-[#666666] md:text-slate-500 hover:text-slate-900 font-bold md:font-semibold'
                    }`}
                  >
                    <img
                      src={tab.iconSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className={`w-8 h-8 md:w-9 md:h-9 object-contain transition-transform duration-150 ${
                        isActive ? 'scale-105' : 'opacity-95 hover:opacity-100'
                      }`}
                    />
                    <span className="text-[12.5px] sm:text-[14px] md:text-[14.5px] tracking-[-0.01em]">
                      {tab.label}
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Desktop Right Messages(1) + Trips(2) + Avatar */}
            <div className="hidden md:flex md:justify-self-end items-center gap-3.5 lg:gap-4 shrink-0">
              {/* Messages Envelope Icon + Crisp Orange Count Badge */}
              <button
                type="button"
                aria-label="Messages"
                onClick={() => {
                  setIsInboxOpen(true);
                  setThreads((prev) =>
                    prev.map((t, idx) => (idx === 0 ? { ...t, unread: false } : t))
                  );
                }}
                className="group relative min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <Mail
                  size={22}
                  strokeWidth={2.2}
                  className="text-slate-700 group-hover:text-[#FF6610] transition-colors"
                />
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#FF6610] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white leading-none tabular-nums">
                  {unreadMessagesCount > 0 ? unreadMessagesCount : threads.length}
                </span>
              </button>

              {/* Trips / Bookings Icon + Crisp Orange Count Badge */}
              <button
                type="button"
                aria-label="Trips and bookings"
                onClick={() => setIsTripsOpen(true)}
                className="group relative min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <Luggage
                  size={22}
                  strokeWidth={2.2}
                  className="text-slate-700 group-hover:text-[#FF6610] transition-colors"
                />
                <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#FF6610] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white leading-none tabular-nums">
                  {bookings.length}
                </span>
              </button>

              {/* User Profile Avatar Menu */}
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <User size={20} strokeWidth={2.2} className="text-white" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.16)] border border-slate-200/90 py-2 z-50 text-left">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.fullName || 'Qaaga Verified Guest'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {currentUser?.email || 'Kuala Lumpur · Super Marketplace'}
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
                          {threads.length}
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
                          setExplorerTitle('Saved Wishlist');
                          setIsCollectionExplorerOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <span>Wishlist</span>
                        <span className="text-xs font-semibold text-slate-500 tabular-nums">
                          {wishlistIds.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsHostModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 text-[#FF6610] font-semibold cursor-pointer"
                      >
                        <span>Become a host</span>
                        <Plus size={15} strokeWidth={2.4} />
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
                              showToast(`Currency updated to ${CURRENCY_CONFIG[code].label}`);
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

                    {/* Full QAAGA Platform Modules */}
                    <div className="p-1.5 border-t border-slate-100 space-y-0.5 text-xs text-slate-700">
                      <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold text-slate-400">
                        Qaaga Ecosystem
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('hotels');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Building2 size={14} className="text-[#FF6610]" />
                        <span>Hotels & Resorts Directory</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('service_request');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Wrench size={14} className="text-[#FF6610]" />
                        <span>On-Demand Home Services</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('doctors');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Stethoscope size={14} className="text-[#FF6610]" />
                        <span>Doctors & Consultations</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('products');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <ShoppingBag size={14} className="text-[#FF6610]" />
                        <span>Marketplace Shop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('feed');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Compass size={14} className="text-[#FF6610]" />
                        <span>Community Feed</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('jobs');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <Briefcase size={14} className="text-[#FF6610]" />
                        <span>Verified Jobs</span>
                      </button>
                      <div className="pt-1 mt-1 border-t border-slate-100 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onNavigate('customer_dashboard');
                          }}
                          className="flex-1 text-center py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 cursor-pointer"
                        >
                          Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onNavigate('partner_register');
                          }}
                          className="flex-1 text-center py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 font-semibold text-[#FF6610] cursor-pointer"
                        >
                          Partner Hub
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onNavigate('admin_portal');
                          }}
                          className="flex-1 text-center py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Row 2: 3-Segment Search Pill (+ Desktop '+' Circle Button) */}
          <div
            ref={searchAreaRef}
            className="relative flex items-center justify-center gap-3.5"
          >
            <div className="w-full md:max-w-[780px] min-h-[52px] md:min-h-[64px] rounded-full bg-white border border-[#D4D4D4] md:border-slate-300/90 md:shadow-[0_3px_14px_rgba(15,23,42,0.06)] pl-4 md:pl-7 pr-1.5 md:pr-2 py-1 md:py-1.5 flex items-center">
              {/* Segment 1: Where */}
              <div
                onClick={() => {
                  setActivePopover('where');
                  whereInputRef.current?.focus();
                }}
                className={`flex-1 min-w-0 py-0.5 md:py-1 pr-1 md:pr-2 rounded-full flex items-center justify-between gap-1 cursor-pointer transition-colors ${
                  activePopover === 'where' ? 'bg-slate-50/90 px-2 md:px-3 -ml-1 md:-ml-2' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="qaaga-where-input"
                    className="block text-[12px] font-bold text-slate-950 leading-tight cursor-pointer"
                  >
                    Where
                  </label>
                  <input
                    ref={whereInputRef}
                    id="qaaga-where-input"
                    type="text"
                    value={whereQuery}
                    onFocus={() => setActivePopover('where')}
                    onChange={(e) => {
                      setWhereQuery(e.target.value);
                      if (!e.target.value.trim()) setIsSearchResultsMode(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExecuteSearch();
                      }
                    }}
                    placeholder="Search destination"
                    className="w-full bg-transparent text-[10.5px] md:text-[14px] text-slate-800 placeholder:text-[#9A9A9A] md:placeholder:text-slate-400 focus:outline-none truncate mt-0.5"
                  />
                </div>
                {whereQuery && (
                  <button
                    type="button"
                    aria-label="Clear destination"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWhereQuery('');
                      setIsSearchResultsMode(false);
                    }}
                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Crisp Dark Vertical Divider */}
              <div
                className="h-6 md:h-7 w-[1.5px] bg-slate-900/85 mx-2 md:mx-4 shrink-0"
                aria-hidden="true"
              />

              {/* Segment 2: When */}
              <button
                type="button"
                onClick={() =>
                  setActivePopover((prev) => (prev === 'when' ? null : 'when'))
                }
                className={`w-[25%] md:w-[30%] min-w-0 text-left py-0.5 md:py-1 px-1 md:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  activePopover === 'when' ? 'bg-slate-100/80' : ''
                }`}
              >
                <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                  When
                </span>
                <span
                  className={`block text-[10.5px] md:text-[14px] leading-tight truncate mt-0.5 ${
                    selectedDates.display
                      ? 'text-slate-900 font-medium'
                      : 'text-[#9A9A9A] md:text-slate-400'
                  }`}
                >
                  {selectedDates.display || 'Add dates'}
                </span>
              </button>

              {/* Crisp Dark Vertical Divider */}
              <div
                className="h-6 md:h-7 w-[1.5px] bg-slate-900/85 mx-2 md:mx-4 shrink-0"
                aria-hidden="true"
              />

              {/* Segment 3: Who */}
              <button
                type="button"
                onClick={() =>
                  setActivePopover((prev) => (prev === 'who' ? null : 'who'))
                }
                className={`w-[22%] md:w-[25%] min-w-0 text-left py-0.5 md:py-1 px-1 md:px-2 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  activePopover === 'who' ? 'bg-slate-100/80' : ''
                }`}
              >
                <span className="block text-[12px] font-bold text-slate-950 leading-tight">
                  Who
                </span>
                <span
                  className={`block text-[10.5px] md:text-[14px] leading-tight truncate mt-0.5 tabular-nums ${
                    guestSummaryText
                      ? 'text-slate-900 font-medium'
                      : 'text-[#9A9A9A] md:text-slate-400'
                  }`}
                >
                  {guestSummaryText || 'Add guests'}
                </span>
              </button>

              {/* Orange Search Circle Button */}
              <button
                type="button"
                aria-label="Search listings"
                onClick={handleExecuteSearch}
                className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-[#FF6B18] md:bg-[#FF6610] hover:bg-[#eb5907] active:scale-95 text-white flex items-center justify-center shrink-0 ml-1.5 md:ml-2 shadow-[0_2px_8px_rgba(255,107,24,0.28)] transition-all cursor-pointer"
              >
                <Search size={16} strokeWidth={2.5} className="md:hidden" />
                <Search size={19} strokeWidth={2.5} className="hidden md:block" />
              </button>
            </div>

            {/* Adjacent '+' Circle Button on Desktop matching qaaga_d3ef7a3c.png */}
            <button
              type="button"
              aria-label="Create new listing"
              onClick={() => setIsHostModalOpen(true)}
              className="hidden md:flex w-[50px] h-[50px] rounded-full bg-white border border-slate-300 hover:border-slate-400 items-center justify-center text-[#FF6610] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus size={25} strokeWidth={2.4} />
            </button>

            {/* =============================================================== */}
            {/* POPOVER 1: WHERE (Destination Suggestions)                      */}
            {/* =============================================================== */}
            {activePopover === 'where' && (
              <div className="absolute top-[60px] md:top-[74px] left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[440px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-4 z-40 text-left">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-xs font-bold text-slate-500">
                    Suggested destinations in Kuala Lumpur
                  </span>
                  {whereQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setWhereQuery('');
                        setIsSearchResultsMode(false);
                      }}
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
                        const chosen = dest.name === 'All Kuala Lumpur' ? '' : dest.name;
                        setWhereQuery(chosen);
                        setIsSearchResultsMode(Boolean(chosen));
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
            {/* POPOVER 2: WHEN (2-Month Calendar + Quick Stay Presets)         */}
            {/* =============================================================== */}
            {activePopover === 'when' && (
              <div className="absolute top-[60px] md:top-[74px] left-0 right-0 mx-auto md:left-1/2 md:-translate-x-1/2 md:mx-0 w-full max-w-[500px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous month"
                      onClick={() => setCalendarMonth((m) => (m === 'Dec' ? 'Nov' : 'Dec'))}
                      className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h4 className="text-sm font-bold text-slate-900">
                      {calendarMonth === 'Nov' ? 'November 2026' : 'December 2026'}
                    </h4>
                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() => setCalendarMonth((m) => (m === 'Nov' ? 'Dec' : 'Nov'))}
                      className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Close calendar"
                    onClick={() => setActivePopover(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-1.5">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center tabular-nums">
                    {Array.from(
                      { length: calendarMonth === 'Nov' ? 30 : 31 },
                      (_, i) => i + 1
                    ).map((day) => {
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
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
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
            {/* POPOVER 3: WHO (Airbnb-Style Guests Stepper + Apply)            */}
            {/* =============================================================== */}
            {activePopover === 'who' && (
              <div className="absolute top-[60px] md:top-[74px] left-0 right-0 mx-auto md:left-auto md:mx-0 md:right-20 w-full max-w-[380px] bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border border-slate-200 p-5 z-40 text-left">
                <div className="divide-y divide-slate-100">
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
                      className="py-3 first:pt-0 flex items-center justify-between gap-4"
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

                <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAdults(0);
                      setChildrenCount(0);
                      setInfants(0);
                      setPets(0);
                    }}
                    className="text-xs font-semibold text-slate-600 hover:underline cursor-pointer"
                  >
                    Clear guests
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePopover(null);
                      if (totalGuests > 0 || whereQuery.trim() || selectedDates.display) {
                        setIsSearchResultsMode(true);
                      }
                    }}
                    className="px-5 py-2 rounded-full bg-[#FF6610] hover:bg-[#eb5907] text-white text-xs font-semibold cursor-pointer"
                  >
                    Apply ({allMatchingSearchListings.length} matches)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN LISTINGS CANVAS                                                  */}
      {/* ===================================================================== */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-3 md:pt-7 pb-6 md:pb-10 space-y-6 md:space-y-10">
        {/* Active Search Results Banner + Dedicated Search Grid */}
        {(hasActiveFilters || isSearchResultsMode) && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">
                  {allMatchingSearchListings.length} result
                  {allMatchingSearchListings.length === 1 ? '' : 's'}:
                </span>
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
                Clear search
              </button>
            </div>

            {isSearchResultsMode && (
              <section className="space-y-4 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em]">
                    Search results in {whereQuery || 'Kuala Lumpur'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsSearchResultsMode(false)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-950 cursor-pointer"
                  >
                    Show all sections
                  </button>
                </div>
                {allMatchingSearchListings.length === 0 ? (
                  <div className="py-10 text-center border border-slate-200/80 rounded-2xl space-y-3">
                    <p className="text-sm font-semibold text-slate-800">
                      No listings matched your exact search filters
                    </p>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="px-5 py-2 rounded-full bg-[#FF6610] text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                    {allMatchingSearchListings.map((item) => renderCard(item, 'search', false))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: DEDICATED "STAY" EXPLORER VIEW                             */}
        {/* ================================================================= */}
        {activeCategory === 'stay' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-slate-950 tracking-[-0.015em]">
                  Stays in Kuala Lumpur ({stayTabListings.length})
                </h2>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  Verified skyline apartments, private rooms, and infinity-pool condos
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Stays' },
                  { id: 'apartments', label: 'Apartments' },
                  { id: 'rooms', label: 'Private Rooms' },
                  { id: 'condos', label: 'Sky Condos' },
                  { id: 'favorites', label: 'Guest Favorites' },
                  { id: 'under100', label: 'Under $100' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStaySubFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                      staySubFilter === f.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {stayTabListings.map((item) => renderCard(item, 'stay', false))}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DEDICATED "EXPERIENCES" EXPLORER VIEW                      */}
        {/* ================================================================= */}
        {activeCategory === 'experiences' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-slate-950 tracking-[-0.015em]">
                  Experiences in Kuala Lumpur ({experiencesTabListings.length})
                </h2>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  Hosted skyline walks, Kampung Bahru street food trails, and studio workshops
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Experiences' },
                  { id: 'skyline', label: 'Skyline & Photo' },
                  { id: 'food', label: 'Food & Nightlife' },
                  { id: 'culture', label: 'Culture & Wellness' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setExpSubFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                      expSubFilter === f.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {experiencesTabListings.map((item) => renderCard(item, 'exp', false))}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 4: DEDICATED "SERVICES" EXPLORER VIEW                         */}
        {/* ================================================================= */}
        {activeCategory === 'services' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-slate-950 tracking-[-0.015em]">
                  Hospitality & In-Stay Services ({servicesTabListings.length})
                </h2>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  On-demand private chefs, KLIA airport transfers, housekeeping, and spa
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'chef', label: 'Private Chef' },
                  { id: 'chauffeur', label: 'Chauffeur & KLIA' },
                  { id: 'care', label: 'Suite Care & Spa' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSrvSubFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                      srvSubFilter === f.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => onNavigate('service_request')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF6610] hover:bg-[#eb5907] text-white whitespace-nowrap cursor-pointer"
                >
                  Request Custom Service
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {servicesTabListings.map((item) => renderCard(item, 'srv', false))}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 1 ("ALL") — MOBILE VIEW (Matched 1:1 to final_design.png)     */}
        {/* ================================================================= */}
        {activeCategory === 'all' && (
          <div className="md:hidden space-y-5">
            {/* 1. recently viewed (3 full rounded squares + 4th peeking) */}
            <section className="space-y-2.5">
              <h2 className="text-[14px] font-bold text-[#9E9E9E] tracking-[-0.01em]">
                recently viewed
              </h2>
              {recentListings.length === 0 ? (
                <div className="py-5 px-4 rounded-2xl bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                  <span>No recent stays match your filter.</span>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[#FF6B18] font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div
                  ref={mobileRecentRowRef}
                  className="flex items-center gap-3 overflow-x-auto scroll-smooth snap-x scrollbar-none -mr-4 pr-4"
                >
                  {recentListings.map((item) => (
                    <button
                      key={`mob-recent-${item.id}`}
                      type="button"
                      aria-label={`View ${item.title}`}
                      onClick={() => handleOpenListing(item)}
                      className="snap-start shrink-0 w-[28.5%] aspect-square rounded-[18px] overflow-hidden bg-slate-100 relative cursor-pointer active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B18]"
                    >
                      <ListingImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center scale-[1.04]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Wishlist + Right Grey Circle '->' Button */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setExplorerTitle('Saved Wishlist');
                    setIsCollectionExplorerOpen(true);
                  }}
                  className="text-[14px] font-bold text-[#9E9E9E] tracking-[-0.01em] cursor-pointer"
                >
                  Wishlist
                </button>
                <div className="flex items-center gap-2">
                  {wishlistIds.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWishlistIds(['kl-1', 'kl-2', 'kl-3', 'kl-4', 'kl-5', 'kl-6']);
                        showToast('Restored 6 saved homes');
                      }}
                      className="text-[11px] font-semibold text-[#FF6B18] cursor-pointer"
                    >
                      Restore
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Scroll mobile wishlist"
                    onClick={() => scrollCarousel(mobileWishlistRowRef, 'right')}
                    className="w-7 h-7 rounded-full bg-[#D4D4D4] active:bg-slate-400 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {wishlistListings.length === 0 ? (
                <div className="py-6 px-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <span>Tap any heart icon to save homes here.</span>
                  <button
                    type="button"
                    onClick={() =>
                      setWishlistIds(['kl-1', 'kl-2', 'kl-3', 'kl-4', 'kl-5', 'kl-6'])
                    }
                    className="text-[#FF6B18] font-semibold cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              ) : (
                <div
                  ref={mobileWishlistRowRef}
                  className="flex items-start gap-3 overflow-x-auto scroll-smooth snap-x scrollbar-none"
                >
                  {wishlistListings.map((item) =>
                    renderMobileWideCard(item, 'wishlist', false, false)
                  )}
                </div>
              )}
            </section>

            {/* 3. popular + Right Grey Circle '->' Button */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setExplorerTitle('Popular homes in Kuala Lumpur');
                    setIsCollectionExplorerOpen(true);
                  }}
                  className="text-[14px] font-bold text-[#9E9E9E] tracking-[-0.01em] cursor-pointer"
                >
                  popular
                </button>
                <button
                  type="button"
                  aria-label="Scroll mobile popular"
                  onClick={() => scrollCarousel(mobilePopularRowRef, 'right')}
                  className="w-7 h-7 rounded-full bg-[#D4D4D4] active:bg-slate-400 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              {popularKLListings.length === 0 ? (
                <div className="py-6 px-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <span>No popular homes match your current search.</span>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[#FF6B18] font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div
                  ref={mobilePopularRowRef}
                  className="flex items-start gap-3 overflow-x-auto scroll-smooth snap-x scrollbar-none"
                >
                  {[
                    ...popularKLListings.filter((i) =>
                      ['kl-5', 'kl-7', 'kl-8', 'kl-9', 'kl-10'].includes(i.id)
                    ),
                    ...popularKLListings.filter(
                      (i) => !['kl-5', 'kl-7', 'kl-8', 'kl-9', 'kl-10'].includes(i.id)
                    ),
                  ].map((item) => renderMobileWideCard(item, 'popular', false, false))}
                </div>
              )}
            </section>

            {/* 4. offer + Right Grey Circle '->' Button */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setExplorerTitle('Special Offers');
                    setIsCollectionExplorerOpen(true);
                  }}
                  className="text-[14px] font-bold text-[#9E9E9E] tracking-[-0.01em] cursor-pointer"
                >
                  offer
                </button>
                <button
                  type="button"
                  aria-label="Scroll mobile offer"
                  onClick={() => scrollCarousel(mobileOfferRowRef, 'right')}
                  className="w-7 h-7 rounded-full bg-[#D4D4D4] active:bg-slate-400 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              {offerListings.length === 0 ? (
                <div className="py-6 px-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <span>No discounted offers match your current filter.</span>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[#FF6B18] font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div
                  ref={mobileOfferRowRef}
                  className="flex items-start gap-3 overflow-x-auto scroll-smooth snap-x scrollbar-none"
                >
                  {offerListings.map((item) =>
                    renderMobileWideCard(item, 'offer', true, false)
                  )}
                </div>
              )}
            </section>

            {/* 5. Full-Width Orange 'see more' Pill Button */}
            <div className="pt-1 space-y-5">
              <button
                type="button"
                onClick={() => setShowMoreMobile((v) => !v)}
                className="w-full h-[46px] rounded-full bg-[#FF6B18] hover:bg-[#eb5907] active:scale-[0.99] text-white text-[15.5px] font-bold tracking-[-0.01em] flex items-center justify-center shadow-[0_4px_14px_rgba(255,107,24,0.26)] transition-all cursor-pointer"
              >
                {showMoreMobile ? 'show less' : 'see more'}
              </button>

              {showMoreMobile && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-slate-800">
                      more stays, experiences & services
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setExplorerTitle('Popular homes in Kuala Lumpur');
                        setIsCollectionExplorerOpen(true);
                      }}
                      className="text-xs font-semibold text-[#FF6B18] cursor-pointer"
                    >
                      Filter & Sort
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ...stayTabListings.slice(4),
                      ...experiencesTabListings.slice(0, 4),
                      ...servicesTabListings.slice(0, 4),
                    ].map((item) => renderMobileWideCard(item, 'more', false, true))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1 ("ALL") — DESKTOP VIEW (Matched 1:1 to qaaga_d3ef7a3c.png)  */}
        {/* ================================================================= */}
        {activeCategory === 'all' && (
          <div className="hidden md:block space-y-10">
            {/* ROW 1: Recently viewed */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em]">
                  Recently viewed
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label="Scroll recently viewed left"
                    onClick={() => scrollCarousel(recentRowRef, 'left')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll recently viewed right"
                    onClick={() => scrollCarousel(recentRowRef, 'right')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {recentListings.length === 0 ? (
                <div className="py-8 px-5 rounded-2xl bg-slate-50 text-sm text-slate-600 flex items-center justify-between">
                  <span>No recently viewed homes match your current filter.</span>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[#FF6610] font-semibold hover:underline cursor-pointer"
                  >
                    Show all
                  </button>
                </div>
              ) : (
                <div
                  ref={recentRowRef}
                  className="flex items-start gap-5 overflow-x-auto scroll-smooth snap-x scrollbar-none pb-1"
                >
                  {recentListings.map((item) => renderCard(item, 'recent', true))}
                </div>
              )}
            </section>

            {/* ROW 2: Wishlist */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setExplorerTitle('Saved Wishlist');
                      setIsCollectionExplorerOpen(true);
                    }}
                    className="text-[21px] font-bold text-slate-950 tracking-[-0.015em] hover:underline cursor-pointer"
                  >
                    Wishlist
                  </button>
                  <span className="text-xs text-slate-400 tabular-nums">
                    ({wishlistListings.length})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {wishlistIds.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWishlistIds(['kl-1', 'kl-2', 'kl-3', 'kl-4', 'kl-5', 'kl-6']);
                        showToast('Restored all 6 saved homes in Wishlist');
                      }}
                      className="text-xs font-semibold text-[#FF6610] hover:underline mr-2 cursor-pointer"
                    >
                      Restore 6
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Scroll wishlist left"
                    onClick={() => scrollCarousel(wishlistRowRef, 'left')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll wishlist right"
                    onClick={() => scrollCarousel(wishlistRowRef, 'right')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {wishlistListings.length === 0 ? (
                <div className="py-8 px-5 rounded-2xl border border-slate-200/80 text-sm text-slate-600 flex items-center justify-between">
                  <span>
                    Your wishlist is empty. Tap the heart icon on any card to save favorites.
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
                <div
                  ref={wishlistRowRef}
                  className="flex items-start gap-5 overflow-x-auto scroll-smooth snap-x scrollbar-none pb-1"
                >
                  {wishlistListings.map((item) => renderCard(item, 'wishlist', true))}
                </div>
              )}
            </section>

            {/* ROW 3: Popular homes in Kuala Lumpur (-> + subtitle + < >) */}
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setExplorerTitle('Popular homes in Kuala Lumpur');
                      setIsCollectionExplorerOpen(true);
                    }}
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
                    onClick={() => scrollCarousel(popularRowRef, 'left')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next Kuala Lumpur homes"
                    onClick={() => scrollCarousel(popularRowRef, 'right')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {popularKLListings.length === 0 ? (
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
                <div
                  ref={popularRowRef}
                  className="flex items-start gap-5 overflow-x-auto scroll-smooth snap-x scrollbar-none pb-1"
                >
                  {popularKLListings.map((item) => renderCard(item, 'popular', true))}
                </div>
              )}
            </section>

            {/* ROW 4 (Below the fold): Experiences & Services Preview */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('experiences')}
                    className="inline-flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <h2 className="text-[21px] font-bold text-slate-950 tracking-[-0.015em] group-hover:underline">
                      Top experiences & services in Kuala Lumpur
                    </h2>
                    <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors shrink-0">
                      <ArrowRight size={15} strokeWidth={2.2} />
                    </span>
                  </button>
                  <p className="text-[14px] text-slate-500 mt-0.5">
                    Curated culinary walks, skyline photography, private chefs, and airport transfers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {[...experiencesTabListings.slice(0, 3), ...servicesTabListings.slice(0, 3)].map(
                  (item) => renderCard(item, 'featured-extra', false)
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Interactive Toast Banner (with Undo support for Wishlist removal) */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3 whitespace-nowrap">
          <span>{toast}</span>
          {lastRemovedWishlistId && (
            <button
              type="button"
              onClick={handleUndoRemoveWishlist}
              className="text-[#FF8540] hover:underline font-bold cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: LISTING DETAIL, GALLERY, REVIEWS & INSTANT RESERVATION       */}
      {/* ===================================================================== */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
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
                  <span className="hidden sm:inline">
                    {wishlistIds.includes(selectedListing.id) ? 'Saved' : 'Save'}
                  </span>
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
              {/* Left 7 Columns: Interactive Gallery, Host, Description, Amenities, Reviews */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2.5">
                  <div className="relative aspect-[1.35/1] rounded-2xl overflow-hidden bg-slate-100">
                    <ListingImage
                      src={activeGalleryImg || selectedListing.image}
                      alt={selectedListing.title}
                      className="w-full h-full object-cover scale-[1.03]"
                    />
                    {selectedListing.guestFavorite && (
                      <span className="absolute top-3.5 left-3.5 bg-white/95 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                        Guest favorite · Top 5% of homes
                      </span>
                    )}
                  </div>

                  {selectedListing.gallery.length > 1 && (
                    <div className="flex items-center gap-2.5">
                      {selectedListing.gallery.map((gImg, idx) => (
                        <button
                          key={`${gImg}-${idx}`}
                          type="button"
                          onClick={() => setActiveGalleryImg(gImg)}
                          className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            (activeGalleryImg || selectedListing.image) === gImg
                              ? 'border-[#FF6610]'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <ListingImage
                            src={gImg}
                            alt={`View ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Hosted by {selectedListing.hostName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedListing.bedrooms} · Superhost ({selectedListing.hostYears} years
                      hosting)
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

                {/* Guest Reviews + Post Review Form */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Guest Reviews ({selectedListing.reviewsCount})
                  </h4>
                  <div className="space-y-2.5">
                    {activeModalReviews.slice(0, 4).map((rev) => (
                      <div key={rev.id} className="p-3 rounded-xl bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{rev.author}</span>
                          <span className="text-slate-400">{rev.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddReview} className="flex items-center gap-2 pt-1">
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="h-9 px-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      {[5, 4, 3].map((r) => (
                        <option key={r} value={r}>
                          ★ {r}.0
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your stay experience..."
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#FF6610]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 h-9 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Post
                    </button>
                  </form>
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

                  <div className="rounded-xl border border-slate-300 divide-y divide-slate-200 text-xs">
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-900">Stay length</span>
                        <span className="text-slate-500">
                          {selectedDates.display ||
                            `${calendarMonth} 14 – ${calendarMonth} ${14 + modalNights}`}
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
        <div
          onClick={() => setIsHostModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
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
                  {[
                    '/assets/kl-ui/kl-1.jpg',
                    '/assets/kl-ui/kl-2.jpg',
                    '/assets/kl-ui/kl-3.jpg',
                    '/assets/kl-ui/kl-4.jpg',
                    '/assets/kl-ui/kl-5.jpg',
                    '/assets/kl-ui/kl-6.jpg',
                  ].map((path, idx) => {
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
                          alt={`Cover ${idx + 1}`}
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

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsHostModalOpen(false);
                    onNavigate('partner_register');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-[#FF6610] cursor-pointer"
                >
                  Full Partner Registration →
                </button>

                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: MESSAGES / HOST INBOX DRAWER                                 */}
      {/* ===================================================================== */}
      {isInboxOpen && (
        <div
          onClick={() => setIsInboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[540px] max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Messages ({threads.length})</h3>
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
      {/* MODAL 4: TRIPS & BOOKINGS DRAWER                                      */}
      {/* ===================================================================== */}
      {isTripsOpen && (
        <div
          onClick={() => setIsTripsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Trips & Reservations ({bookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Your confirmed Kuala Lumpur stays and booking codes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTripsOpen(false);
                    onNavigate('customer_dashboard');
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Full Dashboard
                </button>
                <button
                  type="button"
                  aria-label="Close trips"
                  onClick={() => setIsTripsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
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
      {/* MODAL 5: COLLECTION / WISHLIST EXPLORER MODAL                         */}
      {/* ===================================================================== */}
      {isCollectionExplorerOpen && (
        <div
          onClick={() => setIsCollectionExplorerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {explorerTitle} ({explorerListings.length})
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
              {explorerListings.map((item) => renderCard(item, 'explorer', false, true))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
