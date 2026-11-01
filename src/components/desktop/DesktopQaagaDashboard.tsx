'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  User,
  X,
  Check,
  BedDouble,
  ShieldCheck,
  Minus,
  Send,
  Star,
} from 'lucide-react';

export interface DesktopListing {
  id: string;
  title: string;
  area: string;
  city: string;
  priceFormatted: string;
  oldPriceFormatted?: string;
  image: string;
  section: 'recent' | 'wishlist' | 'popular' | 'offer' | 'more';
  category: 'stay' | 'experiences' | 'services';
  defaultWishlisted?: boolean;
  ratingValue?: string;
  ratingCount?: string;
  discountLabel?: string;
  bedrooms: string;
  hostName: string;
  amenities: string[];
  description: string;
}

const INITIAL_DESKTOP_LISTINGS: DesktopListing[] = [
  // Row 1: Recently Viewed (5 full-proportion square-ish cards matching PDF Page 2)
  {
    id: 'rv-1',
    title: 'Furnished Room, Dhanmondi',
    area: 'Dhanmondi',
    city: 'Dhaka',
    priceFormatted: '৳ 18,000',
    image: '/assets/clean-rooms/room-dhanmondi.jpg',
    section: 'recent',
    category: 'stay',
    bedrooms: '1 Queen Bed · Attached Bath',
    hostName: 'Tanvir Ahmed',
    amenities: ['High-Speed Wi-Fi', 'Split AC', '24/7 Lift & Guard', 'Housekeeping'],
    description:
      'Warm teak-furnished private bedroom in Dhanmondi Road 8A with bedside lamp, quiet workspace, and full generator backup.',
  },
  {
    id: 'rv-2',
    title: 'Studio Apartment, Gulshan',
    area: 'Gulshan',
    city: 'Dhaka',
    priceFormatted: '৳ 28,000',
    image: '/assets/clean-rooms/room-gulshan-studio.jpg',
    section: 'recent',
    category: 'stay',
    bedrooms: 'Studio · Panorama Balcony',
    hostName: 'Nusrat Jahan',
    amenities: ['Skyline Terrace', 'Split AC', 'Smart Lock', 'High-Speed Fiber'],
    description:
      'Sunlit executive studio overlooking Gulshan greenery and skyline with floor-to-ceiling windows, kitchenette, and 24/7 security.',
  },
  {
    id: 'rv-3',
    title: 'Room with Balcony, Uttara',
    area: 'Uttara',
    city: 'Dhaka',
    priceFormatted: '৳ 16,000',
    image: '/assets/clean-rooms/room-uttara-balcony.jpg',
    section: 'recent',
    category: 'experiences',
    bedrooms: '1 King Bed · Green Balcony',
    hostName: 'Farhana Karim',
    amenities: ['Open Balcony', 'AC', 'Wi-Fi Included', 'Metro Proximity'],
    description:
      'Airy contemporary room in Uttara Sector 4 with wide glass doors opening onto a lush garden view, minutes from Uttara North Metro.',
  },
  {
    id: 'rv-4',
    title: 'Private Room, Banani',
    area: 'Banani',
    city: 'Dhaka',
    priceFormatted: '৳ 20,000',
    image: '/assets/clean-rooms/room-banani-private.jpg',
    section: 'recent',
    category: 'experiences',
    bedrooms: '1 Queen Bed · Ensuite Bath',
    hostName: 'Rafiq Hasan',
    amenities: ['High-Speed Wi-Fi', 'AC', 'Weekly Cleaning', 'Lift Access'],
    description:
      'Quiet modern bedroom in Banani Block E within walking distance of Kemal Ataturk Avenue cafes, offices, and lakeside parks.',
  },
  {
    id: 'rv-5',
    title: 'Apartment, Mirpur',
    area: 'Mirpur',
    city: 'Dhaka',
    priceFormatted: '৳ 15,000',
    image: '/assets/clean-rooms/room-mirpur-apt.jpg',
    section: 'recent',
    category: 'services',
    bedrooms: '1 Double Bed · Sunlit Window',
    hostName: 'Mahmudul Islam',
    amenities: ['Wi-Fi Included', 'CCTV Security', '24/7 Water', 'Lift'],
    description:
      'Bright furnished apartment room near Mirpur-10 Metro station with sheer curtains, fast broadband, and quiet residential surroundings.',
  },

  // Row 2: Wishlist (3 large, tall square-proportion cards matching PDF Page 2)
  {
    id: 'wish-1',
    title: 'Furnished Room, Banani',
    area: 'Banani',
    city: 'Dhaka',
    priceFormatted: '৳ 20,000',
    image: '/assets/clean-rooms/wish-banani.jpg',
    section: 'wishlist',
    category: 'stay',
    defaultWishlisted: true,
    bedrooms: '1 King Bed · Balcony View',
    hostName: 'Tariqul Alam',
    amenities: ['High-Speed Wi-Fi', 'Split AC', 'Indoor Plants', 'Housekeeping'],
    description:
      'Designer furnished bedroom in Banani featuring indoor tropical greenery, framed artwork, and hotel-quality bedding.',
  },
  {
    id: 'wish-2',
    title: 'Shared Apartment, Gulshan',
    area: 'Gulshan',
    city: 'Dhaka',
    priceFormatted: '৳ 14,000',
    image: '/assets/clean-rooms/wish-gulshan.jpg',
    section: 'wishlist',
    category: 'experiences',
    defaultWishlisted: true,
    bedrooms: 'Private Room · Shared Lounge',
    hostName: 'Zarin Tasnim',
    amenities: ['Shared Kitchen', 'AC', 'Wi-Fi', '24/7 Guard'],
    description:
      'Spacious private room in a modern Gulshan-1 shared residence with balcony doors, full kitchen access, and friendly professionals.',
  },
  {
    id: 'wish-3',
    title: 'Studio, Dhanmondi',
    area: 'Dhanmondi',
    city: 'Dhaka',
    priceFormatted: '৳ 25,000',
    image: '/assets/clean-rooms/wish-dhanmondi.jpg',
    section: 'wishlist',
    category: 'stay',
    defaultWishlisted: true,
    bedrooms: 'Full Studio · Dining Corner',
    hostName: 'Arman Kabir',
    amenities: ['Private Dining Nook', 'AC', 'Fiber Wi-Fi', 'Generator'],
    description:
      'Open-plan studio in Dhanmondi with panoramic terrace glass, private two-person dining table, and curated contemporary interiors.',
  },

  // Row 3 Left: Popular (2 large tall cards)
  {
    id: 'pop-1',
    title: 'Furnished Room, Gulshan',
    area: 'Gulshan',
    city: 'Dhaka',
    priceFormatted: '৳ 28,000',
    image: '/assets/clean-rooms/pop-gulshan.jpg',
    section: 'popular',
    category: 'stay',
    ratingValue: '4.8',
    ratingCount: '320',
    bedrooms: '1 King Bed · City View',
    hostName: 'Nadia Chowdhury',
    amenities: ['Top Rated Host', 'AC', 'High-Speed Wi-Fi', 'Daily Cleaning'],
    description:
      'One of Dhaka’s highest-rated furnished rooms in Gulshan-2 with 320+ verified stays, warm ambient lighting, and city skyline views.',
  },
  {
    id: 'pop-2',
    title: 'Apartment with Balcony, Uttara',
    area: 'Uttara',
    city: 'Dhaka',
    priceFormatted: '৳ 24,000',
    image: '/assets/clean-rooms/pop-uttara.jpg',
    section: 'popular',
    category: 'experiences',
    ratingValue: '4.7',
    ratingCount: '210',
    bedrooms: '2 Rooms · Private Balcony',
    hostName: 'Kamrul Hasan',
    amenities: ['Private Balcony', 'AC', 'Wi-Fi', 'Covered Parking'],
    description:
      'Highly rated sunlit apartment in Uttara Sector 7 featuring wide balcony windows, lounge seating, and dedicated parking.',
  },

  // Row 3 Right: Offer (2 large tall cards)
  {
    id: 'offer-1',
    title: 'Furnished Room, Mirpur',
    area: 'Mirpur',
    city: 'Dhaka',
    priceFormatted: '৳ 12,750',
    oldPriceFormatted: '৳ 15,000',
    image: '/assets/clean-rooms/offer-mirpur.jpg',
    section: 'offer',
    category: 'services',
    discountLabel: '15% OFF',
    bedrooms: '1 Queen Bed · Serviced',
    hostName: 'Shafiqul Islam',
    amenities: ['15% Monthly Discount', 'Wi-Fi', 'Housekeeping', 'Lift'],
    description:
      'Special 15% monthly move-in offer on a bright, fully furnished bedroom in Mirpur DOHS border with fast broadband and housekeeping.',
  },
  {
    id: 'offer-2',
    title: 'Studio Apartment, Badda',
    area: 'Badda',
    city: 'Dhaka',
    priceFormatted: '৳ 18,000',
    oldPriceFormatted: '৳ 20,000',
    image: '/assets/clean-rooms/offer-badda.jpg',
    section: 'offer',
    category: 'services',
    discountLabel: '10% OFF',
    bedrooms: 'Studio · Lake Link Access',
    hostName: 'Mehedi Hasan',
    amenities: ['10% Offer', 'AC', 'Balcony Terrace', 'Smart TV'],
    description:
      'Modern studio apartment right across the Gulshan-Badda Link Road with open green window views and 10% first-quarter discount.',
  },

  // Extra "See More" items
  {
    id: 'more-1',
    title: 'Executive Suite, Bashundhara',
    area: 'Bashundhara',
    city: 'Dhaka',
    priceFormatted: '৳ 22,000',
    image: '/assets/clean-rooms/room-gulshan-studio.jpg',
    section: 'more',
    category: 'stay',
    ratingValue: '4.9',
    ratingCount: '145',
    bedrooms: '1 King Bed · Block C',
    hostName: 'Imran Kabir',
    amenities: ['High-Speed Wi-Fi', 'AC', 'Generator', '24/7 Gated Security'],
    description:
      'Quiet executive room in Bashundhara R/A near North South University and Evercare Hospital with full power backup.',
  },
  {
    id: 'more-2',
    title: 'Serviced Loft, Mohakhali DOHS',
    area: 'Mohakhali',
    city: 'Dhaka',
    priceFormatted: '৳ 24,500',
    oldPriceFormatted: '৳ 27,000',
    discountLabel: '9% OFF',
    image: '/assets/clean-rooms/room-uttara-balcony.jpg',
    section: 'more',
    category: 'services',
    bedrooms: '1 Queen Bed · DOHS Park',
    hostName: 'Samia Rahman',
    amenities: ['Daily Cleaning', 'AC', 'Wi-Fi', 'DOHS Security'],
    description:
      'Turnkey serviced loft inside gated Mohakhali DOHS with park jogging access and complimentary laundry service.',
  },
  {
    id: 'more-3',
    title: 'Lakeview Room, Baridhara',
    area: 'Baridhara',
    city: 'Dhaka',
    priceFormatted: '৳ 30,000',
    image: '/assets/clean-rooms/room-mirpur-apt.jpg',
    section: 'more',
    category: 'stay',
    ratingValue: '4.9',
    ratingCount: '98',
    bedrooms: '1 King Bed · Diplomatic Zone',
    hostName: 'Faisal Mahmud',
    amenities: ['Lake Walk', 'AC', 'Fiber Internet', 'Concierge'],
    description:
      'Refined quiet room near Baridhara Park Road with embassy-grade neighborhood security and sunlit interiors.',
  },
  {
    id: 'more-4',
    title: 'Garden Flat, Lalmatia',
    area: 'Lalmatia',
    city: 'Dhaka',
    priceFormatted: '৳ 17,500',
    image: '/assets/clean-rooms/pop-uttara.jpg',
    section: 'more',
    category: 'experiences',
    bedrooms: '1 Double Bed · Veranda',
    hostName: 'Rubaiya Sultana',
    amenities: ['Veranda Garden', 'Wi-Fi', 'Quiet Block', 'Filtered Water'],
    description:
      'Classic red-brick Lalmatia neighborhood flat with peaceful tree-lined views, airy veranda, and warm community atmosphere.',
  },
];

const DHAKA_DESTINATIONS = [
  'All Dhaka',
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Badda',
  'Bashundhara',
];

const MOVE_IN_DATES = ['Anytime', 'This Week', 'Next Month', '1st of Next Month', 'Flexible'];

const SafeRoomImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-orange-50 via-amber-50/70 to-slate-100 flex flex-col items-center justify-center text-slate-500 p-4 ${className}`}
      >
        <BedDouble size={28} className="text-[#FF5500] mb-1.5" />
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
  const [listings, setListings] = useState<DesktopListing[]>(INITIAL_DESKTOP_LISTINGS);
  const [activeTab, setActiveTab] = useState<'all' | 'stay' | 'experiences' | 'services'>('all');
  const [recentOffset, setRecentOffset] = useState<number>(0);
  const [showMore, setShowMore] = useState<boolean>(false);

  const [savedMap, setSavedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INITIAL_DESKTOP_LISTINGS.forEach((item) => {
      if (item.defaultWishlisted) initial[item.id] = true;
    });
    return initial;
  });

  // Search Bar state
  const [whereValue, setWhereValue] = useState<string>('');
  const [whenValue, setWhenValue] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(0);
  const [openSearchModal, setOpenSearchModal] = useState<'where' | 'when' | 'who' | null>(null);

  // Header & Quick Action modals
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [activeCollectionModal, setActiveCollectionModal] = useState<
    'wishlist' | 'popular' | 'offer' | null
  >(null);
  const [selectedListing, setSelectedListing] = useState<DesktopListing | null>(null);
  const [reservedIds, setReservedIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  // Host form state
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomArea, setNewRoomArea] = useState('Gulshan');
  const [newRoomPrice, setNewRoomPrice] = useState('22,000');

  // Inbox reply state
  const [inboxReply, setInboxReply] = useState('');
  const [inboxMessages, setInboxMessages] = useState<
    { id: string; sender: 'host' | 'me'; text: string; time: string }[]
  >([
    {
      id: 'm1',
      sender: 'host',
      text: 'Hi! Studio Apartment, Gulshan is available for viewing tomorrow at 5:00 PM. Let me know if that works for you.',
      time: '10m ago',
    },
  ]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const toggleWishlist = (e: React.MouseEvent, item: DesktopListing) => {
    e.stopPropagation();
    setSavedMap((prev) => {
      const next = !prev[item.id];
      triggerToast(next ? `Added "${item.title}" to Wishlist` : `Removed from Wishlist`);
      return { ...prev, [item.id]: next };
    });
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (whereValue && whereValue !== 'All Dhaka') {
        if (
          !item.area.toLowerCase().includes(whereValue.toLowerCase()) &&
          !item.title.toLowerCase().includes(whereValue.toLowerCase())
        ) {
          return false;
        }
      }
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }
      return true;
    });
  }, [listings, whereValue, activeTab]);

  const recentItems = useMemo(() => {
    const base = filteredListings.filter((i) => i.section === 'recent');
    const source = base.length > 0 ? base : listings.filter((i) => i.section === 'recent');
    if (recentOffset === 0 || source.length <= 1) return source.slice(0, 5);
    const rotated = [
      ...source.slice(recentOffset % source.length),
      ...source.slice(0, recentOffset % source.length),
    ];
    return rotated.slice(0, 5);
  }, [filteredListings, listings, recentOffset]);

  const wishlistItems = useMemo(() => {
    const base = filteredListings.filter((i) => i.section === 'wishlist');
    return (base.length > 0 ? base : listings.filter((i) => i.section === 'wishlist')).slice(0, 3);
  }, [filteredListings, listings]);

  const popularItems = useMemo(() => {
    const base = filteredListings.filter((i) => i.section === 'popular');
    return (base.length > 0 ? base : listings.filter((i) => i.section === 'popular')).slice(0, 2);
  }, [filteredListings, listings]);

  const offerItems = useMemo(() => {
    const base = filteredListings.filter((i) => i.section === 'offer');
    return (base.length > 0 ? base : listings.filter((i) => i.section === 'offer')).slice(0, 2);
  }, [filteredListings, listings]);

  const moreItems = useMemo(() => {
    return listings.filter((i) => i.section === 'more');
  }, [listings]);

  const handlePublishListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    const created: DesktopListing = {
      id: `custom-${Date.now()}`,
      title: `${newRoomTitle.trim()}, ${newRoomArea}`,
      area: newRoomArea,
      city: 'Dhaka',
      priceFormatted: `৳ ${newRoomPrice.trim() || '20,000'}`,
      image: '/assets/clean-rooms/room-dhanmondi.jpg',
      section: 'more',
      category: 'stay',
      bedrooms: '1 Queen Bed · Verified Host',
      hostName: 'You (Host)',
      amenities: ['Wi-Fi Included', 'AC', 'Verified Listing'],
      description: 'Newly listed verified room in Dhaka on qaaga.com.',
    };
    setListings((prev) => [created, ...prev]);
    setNewRoomTitle('');
    setIsHostModalOpen(false);
    setShowMore(true);
    triggerToast('Your room listing is now live!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboxReply.trim()) return;
    setInboxMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, sender: 'me', text: inboxReply.trim(), time: 'Just now' },
    ]);
    setInboxReply('');
  };

  const renderCard = (
    item: DesktopListing,
    photoAspectClass: string,
    variant: 'recent' | 'wishlist' | 'popular' | 'offer' | 'more'
  ) => {
    const isSaved = Boolean(savedMap[item.id]);
    const isLargeCard = variant === 'wishlist' || variant === 'popular' || variant === 'offer';

    return (
      <div
        key={item.id}
        onClick={() => setSelectedListing(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedListing(item);
          }
        }}
        className="group bg-white rounded-[22px] overflow-hidden border border-slate-200/85 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.11)] hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col text-left"
      >
        {/* Full-Proportion Tall Room Photo matching PDF Scale */}
        <div className={`relative w-full ${photoAspectClass} overflow-hidden bg-slate-100`}>
          <SafeRoomImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Top-Left Rating Pill (Popular) */}
          {item.ratingValue && (
            <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-xs text-slate-950 text-[13px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 tabular-nums">
              <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
              <span>{item.ratingValue}</span>
              {item.ratingCount && (
                <span className="font-normal text-slate-600">({item.ratingCount})</span>
              )}
            </span>
          )}

          {/* Top-Left Discount Pill (Offer) */}
          {item.discountLabel && (
            <span className="absolute top-3.5 left-3.5 bg-[#FF5500] text-white border-[1.5px] border-white text-[13px] font-bold px-3.5 py-1 rounded-full shadow-sm tabular-nums">
              {item.discountLabel}
            </span>
          )}

          {/* Top-Right Heart Button */}
          <button
            type="button"
            aria-label={
              isSaved ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`
            }
            onClick={(e) => toggleWishlist(e, item)}
            className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full cursor-pointer z-10"
          >
            {isSaved ? (
              <span className="px-2.5 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90">
                <Heart size={18} className="fill-[#FF5500] text-[#FF5500] stroke-[2]" />
              </span>
            ) : (
              <span className="w-9 h-9 rounded-full bg-black/25 hover:bg-black/35 backdrop-blur-xs flex items-center justify-center text-white transition-transform active:scale-90">
                <Heart size={19} className="text-white stroke-[2]" />
              </span>
            )}
          </button>
        </div>

        {/* Bottom Room Info Area */}
        <div
          className={
            variant === 'wishlist'
              ? 'px-5 pt-4 pb-5 space-y-1'
              : isLargeCard
              ? 'px-4 pt-3.5 pb-4 space-y-1'
              : 'px-4 pt-3 pb-3.5 space-y-0.5'
          }
        >
          <h3
            className={`${
              variant === 'wishlist'
                ? 'text-[17px]'
                : isLargeCard
                ? 'text-[16px]'
                : 'text-[15px]'
            } font-bold text-slate-950 leading-snug truncate`}
          >
            {item.title}
          </h3>

          <div className="flex items-center gap-1.5 text-[13px] text-slate-600">
            <MapPin size={13} className="text-slate-500 shrink-0 stroke-[2]" />
            <span className="truncate">{item.city}</span>
          </div>

          <div className="pt-1 flex items-baseline gap-2.5 flex-wrap tabular-nums">
            <span
              className={`${
                variant === 'wishlist' ? 'text-[17px]' : 'text-[15.5px]'
              } font-extrabold text-[#FF5500] whitespace-nowrap`}
            >
              {item.priceFormatted} / month
            </span>
            {item.oldPriceFormatted && (
              <span className="text-[13.5px] font-medium text-slate-500 line-through whitespace-nowrap">
                {item.oldPriceFormatted}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 select-none">
      <div className="w-full max-w-[1480px] mx-auto px-6 lg:px-12 pt-7 pb-14 space-y-10">
        {/* ================================================================= */}
        {/* 1. TOP BAR + CATEGORY TABS (PDF Page 2 Scale)                     */}
        {/* ================================================================= */}
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left Brand Wordmark matching PDF Page 2 */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setWhereValue('');
                setWhenValue('');
                setGuestsCount(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-baseline text-[#FF5500] font-extrabold tracking-[-0.03em] leading-none cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="text-[40px] lg:text-[46px]">qaaga</span>
              <span className="text-[28px] lg:text-[32px]">.com</span>
            </button>

            {/* Right Host & Utility Controls */}
            <div className="flex items-center gap-5 shrink-0">
              <button
                type="button"
                onClick={() => setIsHostModalOpen(true)}
                className="h-12 px-7 rounded-full bg-white border-[1.5px] border-[#FF6B2B] text-slate-600 hover:text-[#FF5500] hover:border-[#FF5500] font-semibold text-[15.5px] tracking-[-0.01em] flex items-center justify-center whitespace-nowrap transition-colors cursor-pointer"
              >
                Become a host
              </button>

              {/* Bookings Icon with '2' Badge */}
              <button
                type="button"
                aria-label="Bookings"
                onClick={() => setIsBookingsOpen(true)}
                className="relative w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <Calendar size={26} className="stroke-[1.8] text-slate-500" />
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5500] text-white text-[11px] font-bold flex items-center justify-center leading-none tabular-nums">
                  {2 + Object.keys(reservedIds).length}
                </span>
              </button>

              {/* Messages Envelope Icon with '1' Badge */}
              <button
                type="button"
                aria-label="Messages"
                onClick={() => setIsInboxOpen(true)}
                className="relative w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <Mail size={26} className="stroke-[1.8] text-slate-500" />
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5500] text-white text-[11px] font-bold flex items-center justify-center leading-none tabular-nums">
                  1
                </span>
              </button>

              {/* User Profile Avatar Circle */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  onClick={() => setIsAccountMenuOpen((v) => !v)}
                  className="w-11 h-11 rounded-full bg-slate-300/80 hover:bg-slate-300 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <User size={23} className="fill-white text-white" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-left">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">Qaaga Account</p>
                      <p className="text-[11px] text-slate-500 truncate">Dhaka, Bangladesh</p>
                    </div>
                    <div className="p-1.5 space-y-0.5 text-xs font-medium text-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsBookingsOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        My Bookings & Visits
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setActiveCollectionModal('wishlist');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Saved Wishlist
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('customer_dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Customer Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('partner_register');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-[#FF5500] font-semibold cursor-pointer"
                      >
                        Host & Partner Portal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigate('admin_portal');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer"
                      >
                        Admin Control Tower
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Centered 4 Category Filter Pills */}
          <div className="flex items-center justify-center gap-4">
            {(
              [
                { id: 'all', label: 'all' },
                { id: 'stay', label: 'stay' },
                { id: 'experiences', label: 'experiences' },
                { id: 'services', label: 'services' },
              ] as const
            ).map((pill) => {
              const active = activeTab === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveTab(pill.id)}
                  className={`min-w-[122px] h-[44px] px-7 rounded-full text-[15.5px] tracking-[-0.01em] flex items-center justify-center whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'bg-[#FF5500] text-white font-semibold border-[1.5px] border-[#FF5500] shadow-[0_4px_12px_rgba(255,85,0,0.24)]'
                      : 'bg-white text-slate-700 font-semibold border-[1.5px] border-[#FF6B2B] hover:bg-orange-50/40'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* ================================================================= */}
        {/* 2. LARGE 3-COLUMN SEARCH PILL + ADJACENT '+' CIRCLE BUTTON        */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center gap-5">
          <div className="w-full max-w-[850px] min-h-[82px] rounded-full bg-white shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-slate-200/90 pl-8 pr-2.5 py-2.5 flex items-center">
            {/* Segment 1: where */}
            <button
              type="button"
              onClick={() => setOpenSearchModal('where')}
              className="flex-1 min-w-0 flex items-center justify-center gap-3.5 text-left py-1.5 px-3 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <MapPin size={24} className="text-[#FF5500] stroke-[2] shrink-0" />
              <div className="min-w-0">
                <div className="text-[18px] font-bold text-slate-800 leading-tight">
                  where
                </div>
                <div className="text-[13.5px] text-slate-400 leading-tight truncate mt-0.5">
                  {whereValue || 'search destination'}
                </div>
              </div>
            </button>

            <div className="h-9 w-px bg-slate-200 mx-3 shrink-0" aria-hidden="true" />

            {/* Segment 2: when */}
            <button
              type="button"
              onClick={() => setOpenSearchModal('when')}
              className="w-[30%] min-w-0 flex items-center justify-center gap-3.5 text-left py-1.5 px-3 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <Calendar size={23} className="text-[#FF5500] stroke-[2] shrink-0" />
              <div className="min-w-0">
                <div className="text-[18px] font-bold text-slate-800 leading-tight">
                  when
                </div>
                <div className="text-[13.5px] text-slate-400 leading-tight truncate mt-0.5">
                  {whenValue || 'add dates'}
                </div>
              </div>
            </button>

            <div className="h-9 w-px bg-slate-200 mx-3 shrink-0" aria-hidden="true" />

            {/* Segment 3: who */}
            <button
              type="button"
              onClick={() => setOpenSearchModal('who')}
              className="w-[28%] min-w-0 flex items-center justify-center gap-3.5 text-left py-1.5 px-3 rounded-full hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <Users size={24} className="text-[#FF5500] stroke-[2] shrink-0" />
              <div className="min-w-0">
                <div className="text-[18px] font-bold text-slate-800 leading-tight">
                  who
                </div>
                <div className="text-[13.5px] text-slate-400 leading-tight truncate mt-0.5 tabular-nums">
                  {guestsCount > 0
                    ? `${guestsCount} guest${guestsCount > 1 ? 's' : ''}`
                    : 'add guests'}
                </div>
              </div>
            </button>

            {/* Right Solid Orange Search Button */}
            <button
              type="button"
              aria-label="Search destinations"
              onClick={() => setOpenSearchModal('where')}
              className="w-[62px] h-[62px] rounded-full bg-[#FF5500] hover:bg-[#e64d00] active:scale-95 text-white flex items-center justify-center shrink-0 ml-3 shadow-[0_4px_14px_rgba(255,85,0,0.3)] transition-all cursor-pointer"
            >
              <Search size={28} strokeWidth={2.6} />
            </button>
          </div>

          {/* Large Adjacent '+' Circle Button */}
          <button
            type="button"
            aria-label="Add new room listing"
            onClick={() => setIsHostModalOpen(true)}
            className="w-[62px] h-[62px] rounded-full bg-white border-[1.5px] border-slate-300 hover:border-[#FF5500] shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex items-center justify-center text-[#FF5500] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus size={30} strokeWidth={2.3} />
          </button>
        </div>

        {/* Active Filter Indicator */}
        {(whereValue || whenValue || guestsCount > 0 || activeTab !== 'all') && (
          <div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-orange-50/70 border border-orange-100 text-xs text-slate-700 max-w-[850px] mx-auto">
            <span>
              Filter active:{' '}
              <strong className="text-slate-900 capitalize">{activeTab}</strong>
              {whereValue ? ` · ${whereValue}` : ''}
              {whenValue ? ` · ${whenValue}` : ''}
              {guestsCount > 0 ? ` · ${guestsCount} guests` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setWhereValue('');
                setWhenValue('');
                setGuestsCount(0);
              }}
              className="text-[#FF5500] font-bold hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. SECTION 1: recently viewed (5 Large Square-ish Cards — PDF p2) */}
        {/* ================================================================= */}
        <section className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-extrabold text-slate-900 tracking-[-0.02em]">
              recently viewed
            </h2>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Previous recently viewed"
                onClick={() => setRecentOffset((prev) => (prev - 1 + 5) % 5)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} strokeWidth={2.1} />
              </button>
              <button
                type="button"
                aria-label="Next recently viewed"
                onClick={() => setRecentOffset((prev) => (prev + 1) % 5)}
                className="w-10 h-10 rounded-full bg-white border-[1.5px] border-[#FF5500] hover:bg-orange-50/50 text-[#FF5500] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentItems.map((item) =>
              renderCard(item, 'aspect-[1.15/1]', 'recent')
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. SECTION 2: Wishlist (3 Large Square-ish Cards — PDF Page 2)    */}
        {/* ================================================================= */}
        <section className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-extrabold text-slate-900 tracking-[-0.02em]">
              Wishlist
            </h2>

            <button
              type="button"
              aria-label="View all wishlist items"
              onClick={() => setActiveCollectionModal('wishlist')}
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:border-[#FF5500] text-[#FF5500] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={20} strokeWidth={2.4} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {wishlistItems.map((item) =>
              renderCard(item, 'aspect-[1.18/1]', 'wishlist')
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. SECTION 3 & 4: Popular (Left 2) + Offer (Right 2) — Full Size  */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 pt-2">
          {/* Left Half: Popular */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-extrabold text-slate-900 tracking-[-0.02em]">
                Popular
              </h2>
              <button
                type="button"
                aria-label="View all popular listings"
                onClick={() => setActiveCollectionModal('popular')}
                className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:border-[#FF5500] text-[#FF5500] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {popularItems.map((item) =>
                renderCard(item, 'aspect-[1.22/1]', 'popular')
              )}
            </div>
          </section>

          {/* Right Half: Offer */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-extrabold text-slate-900 tracking-[-0.02em]">
                Offer
              </h2>
              <button
                type="button"
                aria-label="View all special offers"
                onClick={() => setActiveCollectionModal('offer')}
                className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:border-[#FF5500] text-[#FF5500] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offerItems.map((item) =>
                renderCard(item, 'aspect-[1.22/1]', 'offer')
              )}
            </div>
          </section>
        </div>

        {/* Expanded Extra Stays when "See More" is clicked */}
        {showMore && (
          <section className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold text-slate-900 tracking-[-0.02em]">
                More Verified Stays in Dhaka
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('hotels')}
                className="text-sm font-bold text-[#FF5500] hover:underline cursor-pointer"
              >
                Explore All Hotels & Stays →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreItems.map((item) =>
                renderCard(item, 'aspect-[1.22/1]', 'more')
              )}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* 6. FULL-WIDTH BOTTOM PRIMARY CTA: See More                        */}
        {/* ================================================================= */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="w-full h-[62px] rounded-full bg-[#FF5500] hover:bg-[#e64d00] active:scale-[0.995] text-white font-bold text-[20px] tracking-[-0.01em] flex items-center justify-center shadow-[0_8px_24px_rgba(255,85,0,0.26)] transition-all duration-150 cursor-pointer"
          >
            {showMore ? 'Show Less' : 'See More'}
          </button>
        </div>
      </div>

      {/* Subtle Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: SEARCH FILTER MODAL (Where / When / Who)                   */}
      {/* =================================================================== */}
      {openSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-950">
                Search Dhaka Accommodations
              </h3>
              <button
                type="button"
                aria-label="Close search modal"
                onClick={() => setOpenSearchModal(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Destination */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#FF5500]" />
                <span>Where in Dhaka</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DHAKA_DESTINATIONS.map((dest) => {
                  const selected =
                    (dest === 'All Dhaka' && !whereValue) || whereValue === dest;
                  return (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setWhereValue(dest === 'All Dhaka' ? '' : dest)}
                      className={`h-9 px-4 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#FF5500] text-white border-[#FF5500]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#FF5500]'
                      }`}
                    >
                      {dest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#FF5500]" />
                <span>Move-in Dates</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MOVE_IN_DATES.map((d) => {
                  const selected = whenValue === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setWhenValue(selected ? '' : d)}
                      className={`h-9 px-4 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users size={14} className="text-[#FF5500]" />
                  <span>Guests / Occupants</span>
                </div>
                <p className="text-[11px] text-slate-500">Monthly or short-term residents</p>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                <button
                  type="button"
                  onClick={() => setGuestsCount((c) => Math.max(0, c - 1))}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold">{guestsCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestsCount((c) => Math.min(8, c + 1))}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setWhereValue('');
                  setWhenValue('');
                  setGuestsCount(0);
                }}
                className="h-11 px-5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpenSearchModal(null)}
                className="flex-1 h-11 rounded-full bg-[#FF5500] hover:bg-[#e64d00] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={16} />
                <span>Apply Search</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: BECOME A HOST / ADD NEW LISTING MODAL                      */}
      {/* =================================================================== */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-950">
                List Your Room on qaaga.com
              </h3>
              <button
                type="button"
                onClick={() => setIsHostModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishListing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="e.g. Sunlit Studio Apartment"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dhaka Area
                  </label>
                  <select
                    value={newRoomArea}
                    onChange={(e) => setNewRoomArea(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#FF5500]"
                  >
                    {DHAKA_DESTINATIONS.filter((a) => a !== 'All Dhaka').map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Rent (৳)
                  </label>
                  <input
                    type="text"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(e.target.value)}
                    placeholder="20,000"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm cursor-pointer"
              >
                Publish Room Listing
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsHostModalOpen(false);
                  onNavigate('partner_register');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-[#FF5500] cursor-pointer"
              >
                Want to register as a verified Partner / Hotel? Open Partner Portal →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: BOOKINGS CALENDAR DRAWER ('2' Badge)                       */}
      {/* =================================================================== */}
      {isBookingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-950">
                Upcoming Visits & Bookings
              </h3>
              <button
                type="button"
                onClick={() => setIsBookingsOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Studio Apartment, Gulshan</p>
                  <p className="text-slate-500 mt-0.5">Viewing · Tomorrow, 5:00 PM</p>
                </div>
                <span className="text-[#FF5500] font-bold">Confirmed</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Furnished Room, Dhanmondi</p>
                  <p className="text-slate-500 mt-0.5">Move-in Hold · ৳ 18,000 / month</p>
                </div>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsBookingsOpen(false);
                onNavigate('customer_dashboard');
              }}
              className="w-full h-11 rounded-full bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm cursor-pointer"
            >
              Open Full Bookings Dashboard
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: INBOX MESSAGES MODAL ('1' Badge)                           */}
      {/* =================================================================== */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">Host Inbox</h3>
                <p className="text-xs text-slate-500">Nusrat Jahan · Studio Apartment, Gulshan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInboxOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto py-1">
              {inboxMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'me'
                      ? 'bg-[#FF5500] text-white ml-8'
                      : 'bg-slate-100 text-slate-800 mr-8'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === 'me' ? 'text-orange-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={inboxReply}
                onChange={(e) => setInboxReply(e.target.value)}
                placeholder="Reply to host..."
                className="flex-1 h-10 px-3.5 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-[#FF5500]"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="w-10 h-10 rounded-full bg-[#FF5500] text-white flex items-center justify-center cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: COLLECTION DRAWER (Wishlist / Popular / Offer '>' Buttons) */}
      {/* =================================================================== */}
      {activeCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl p-6 space-y-5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-950 capitalize">
                {activeCollectionModal} Stays in Dhaka
              </h3>
              <button
                type="button"
                onClick={() => setActiveCollectionModal(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeCollectionModal === 'wishlist'
                ? listings.filter((i) => savedMap[i.id])
                : listings.filter(
                    (i) => i.section === activeCollectionModal || i.section === 'more'
                  )
              ).map((item) => renderCard(item, 'aspect-[1.22/1]', 'more'))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: ROOM DETAIL & INSTANT RESERVATION                          */}
      {/* =================================================================== */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden">
            <div className="relative h-72 bg-slate-100">
              <SafeRoomImage
                src={selectedListing.image}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                aria-label="Close room details"
                onClick={() => setSelectedListing(null)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950">
                    {selectedListing.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedListing.area} · {selectedListing.city} · {selectedListing.bedrooms}
                  </p>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <div className="text-lg font-extrabold text-[#FF5500]">
                    {selectedListing.priceFormatted}
                  </div>
                  <div className="text-xs text-slate-500">per month</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedListing.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                {selectedListing.amenities.map((am) => (
                  <div key={am} className="flex items-center gap-2">
                    <Check size={14} className="text-[#FF5500] shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#FF5500]" />
                  Hosted by <strong className="text-slate-900">{selectedListing.hostName}</strong>
                </span>
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, selectedListing)}
                  className="flex items-center gap-1.5 font-semibold text-[#FF5500] cursor-pointer"
                >
                  <Heart
                    size={15}
                    className={
                      savedMap[selectedListing.id]
                        ? 'fill-[#FF5500] text-[#FF5500]'
                        : 'text-[#FF5500]'
                    }
                  />
                  <span>
                    {savedMap[selectedListing.id] ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  </span>
                </button>
              </div>

              {reservedIds[selectedListing.id] ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-sm">Booking Hold Confirmed!</p>
                    <p className="text-emerald-800 mt-0.5">
                      {selectedListing.hostName} has been notified of your reservation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedListing(null);
                      onNavigate('customer_dashboard');
                    }}
                    className="px-4 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    View Bookings
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setReservedIds((prev) => ({ ...prev, [selectedListing.id]: true }));
                    triggerToast(`Reserved ${selectedListing.title}!`);
                  }}
                  className="w-full h-12 rounded-full bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm shadow-[0_4px_14px_rgba(255,85,0,0.28)] cursor-pointer"
                >
                  Reserve Room · {selectedListing.priceFormatted} / month
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
