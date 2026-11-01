'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Search,
  ArrowRight,
  MapPin,
  X,
  Calendar,
  Users,
  Check,
  Building2,
  BedDouble,
  Wifi,
  Wind,
  ShieldCheck,
  Minus,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

export interface MobileRoomListing {
  id: string;
  title: string;
  area: string;
  city: string;
  priceFormatted: string;
  priceNumeric: number;
  oldPriceFormatted?: string;
  discountBadge?: string;
  hasBakedBadge?: boolean;
  image: string;
  section: 'sponsored' | 'popular' | 'offer' | 'more';
  category: 'stay' | 'experiences' | 'services';
  bedrooms: string;
  amenities: string[];
  hostName: string;
  description: string;
}

const RECENTLY_VIEWED_ITEMS: {
  id: string;
  title: string;
  image: string;
  listingId: string;
}[] = [
  {
    id: 'rv-1',
    title: 'Warm Timber Bedroom, Dhanmondi',
    image: '/assets/rooms/recent-1.jpg',
    listingId: 'sponsored-dhanmondi',
  },
  {
    id: 'rv-2',
    title: 'Panoramic Parkview Room, Gulshan',
    image: '/assets/rooms/recent-2.jpg',
    listingId: 'sponsored-gulshan',
  },
  {
    id: 'rv-3',
    title: 'Sunlit Balcony Suite, Banani',
    image: '/assets/rooms/recent-3.jpg',
    listingId: 'popular-banani',
  },
  {
    id: 'rv-4',
    title: 'Modern Studio Suite, Uttara',
    image: '/assets/rooms/sponsored-gulshan.jpg',
    listingId: 'popular-uttara',
  },
];

const MOBILE_LISTINGS: MobileRoomListing[] = [
  {
    id: 'sponsored-dhanmondi',
    title: 'Furnished Room, Dhanmondi',
    area: 'Dhanmondi',
    city: 'Dhaka',
    priceFormatted: '৳ 18,000',
    priceNumeric: 18000,
    image: '/assets/rooms/sponsored-dhanmondi.jpg',
    section: 'sponsored',
    category: 'stay',
    bedrooms: '1 Queen Bed · Attached Bath',
    amenities: ['High-Speed Wi-Fi', 'AC', '24/7 Lift & Guard', 'Housekeeping'],
    hostName: 'Tanvir Ahmed',
    description:
      'Bright, fully furnished private bedroom near Dhanmondi Lake (Road 8A) with quiet study corner, high-speed fiber internet, and generator backup.',
  },
  {
    id: 'sponsored-gulshan',
    title: 'Studio Apartment, Gulshan',
    area: 'Gulshan',
    city: 'Dhaka',
    priceFormatted: '৳ 28,000',
    priceNumeric: 28000,
    image: '/assets/rooms/sponsored-gulshan.jpg',
    section: 'sponsored',
    category: 'stay',
    bedrooms: 'Studio · Private Kitchenette',
    amenities: ['High-Speed Wi-Fi', 'Split AC', 'Smart Lock', 'Gym Access'],
    hostName: 'Nusrat Jahan',
    description:
      'Executive studio apartment in Gulshan-2 featuring floor-to-ceiling city views, modern kitchenette, hotel-grade linen, and dedicated security.',
  },
  {
    id: 'popular-banani',
    title: 'Private Room, Banani',
    area: 'Banani',
    city: 'Dhaka',
    priceFormatted: '৳ 20,000',
    priceNumeric: 20000,
    image: '/assets/rooms/popular-banani.jpg',
    section: 'popular',
    category: 'experiences',
    bedrooms: '1 King Bed · Ensuite Bath',
    amenities: ['High-Speed Wi-Fi', 'AC', 'Rooftop Lounge', 'Weekly Cleaning'],
    hostName: 'Rafiq Hasan',
    description:
      'Calm contemporary bedroom in Banani Block E, walking distance to cafes and Kemal Ataturk Avenue, ideal for professionals and remote creatives.',
  },
  {
    id: 'popular-uttara',
    title: 'Room with Balcony, Uttara',
    area: 'Uttara',
    city: 'Dhaka',
    priceFormatted: '৳ 16,000',
    priceNumeric: 16000,
    image: '/assets/rooms/popular-uttara.jpg',
    section: 'popular',
    category: 'experiences',
    bedrooms: '1 Double Bed · Open Balcony',
    amenities: ['High-Speed Wi-Fi', 'AC', 'Green View Balcony', 'Filtered Water'],
    hostName: 'Farhana Karim',
    description:
      'Airy sunlit room in Uttara Sector 4 with wide sliding glass balcony overlooking greenery, 10 minutes from Airport & Metro station.',
  },
  {
    id: 'offer-mirpur',
    title: 'Furnished Room, Mirpur',
    area: 'Mirpur',
    city: 'Dhaka',
    priceFormatted: '৳ 15,300',
    priceNumeric: 15300,
    oldPriceFormatted: '৳ 17,000',
    discountBadge: '10% OFF',
    hasBakedBadge: true,
    image: '/assets/rooms/offer-mirpur.jpg',
    section: 'offer',
    category: 'services',
    bedrooms: '1 Queen Bed · Furnished',
    amenities: ['Wi-Fi Included', 'Metro Access', '24/7 Water', 'CCTV Security'],
    hostName: 'Mahmudul Islam',
    description:
      'Solid teak-furnished bedroom 4 minutes from Mirpur-10 Metro Rail station. Includes monthly housekeeping and high-speed broadband.',
  },
  {
    id: 'offer-badda',
    title: 'Shared Apartment, Badda',
    area: 'Badda',
    city: 'Dhaka',
    priceFormatted: '৳ 12,750',
    priceNumeric: 12750,
    oldPriceFormatted: '৳ 15,000',
    discountBadge: '15% OFF',
    hasBakedBadge: true,
    image: '/assets/rooms/offer-badda.jpg',
    section: 'offer',
    category: 'services',
    bedrooms: 'Private Bedroom · Shared Living',
    amenities: ['Wi-Fi Included', 'Shared Kitchen', 'Lift', 'Meal Option'],
    hostName: 'Sabbir Chowdhury',
    description:
      'Spacious sunlit room inside a clean 3-bedroom apartment near Badda Link Road & Gulshan-1 lake bridge, with full kitchen access.',
  },
  {
    id: 'more-bashundhara',
    title: 'Executive Suite, Bashundhara',
    area: 'Bashundhara',
    city: 'Dhaka',
    priceFormatted: '৳ 22,500',
    priceNumeric: 22500,
    image: '/assets/rooms/recent-2.jpg',
    section: 'more',
    category: 'stay',
    bedrooms: '1 King Bed · Balcony',
    amenities: ['High-Speed Wi-Fi', 'AC', 'Generator', 'Parking'],
    hostName: 'Imran Kabir',
    description:
      'Quiet residential suite in Bashundhara R/A Block C near NSU & Evercare Hospital with full power backup and modern furnishings.',
  },
  {
    id: 'more-mohakhali',
    title: 'Serviced Loft, Mohakhali DOHS',
    area: 'Mohakhali',
    city: 'Dhaka',
    priceFormatted: '৳ 24,000',
    priceNumeric: 24000,
    oldPriceFormatted: '৳ 27,000',
    discountBadge: '11% OFF',
    hasBakedBadge: false,
    image: '/assets/rooms/recent-3.jpg',
    section: 'more',
    category: 'services',
    bedrooms: '1 Queen Bed · Serviced Stay',
    amenities: ['Daily Cleaning', 'AC', 'Wi-Fi', 'Gated DOHS Security'],
    hostName: 'Samia Rahman',
    description:
      'Turnkey serviced room in gated Mohakhali DOHS with park walkway access, daily housekeeping, and laundry service included.',
  },
];

const DHAKA_AREAS = ['All Dhaka', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Badda', 'Bashundhara'];
const DATE_PRESETS = ['Anytime', 'This Week', 'Next Month', 'May 1 Move-in', 'Flexible'];

const RoomPhoto: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-orange-50 via-amber-50/70 to-slate-100 flex flex-col items-center justify-center text-slate-500 p-2 ${className}`}
      >
        <BedDouble size={20} className="text-[#FF5500] mb-1" />
        <span className="text-[10px] font-medium text-center line-clamp-1">{alt}</span>
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

interface MobileQaagaHomeProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MobileQaagaHome: React.FC<MobileQaagaHomeProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'stay' | 'experiences' | 'services'>('all');
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [showMoreExpanded, setShowMoreExpanded] = useState(false);

  // Search filter state
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'where' | 'when' | 'who'>('where');

  // Interactive drawers
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MobileRoomListing | null>(null);
  const [activeSectionDrawer, setActiveSectionDrawer] = useState<'sponsored' | 'popular' | 'offer' | null>(null);
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const toggleSave = (e: React.MouseEvent, room: MobileRoomListing) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const nextState = !prev[room.id];
      showToast(nextState ? `Saved "${room.title}"` : `Removed from saved`);
      return {
        ...prev,
        [room.id]: nextState,
      };
    });
  };

  const savedListings = useMemo(
    () => MOBILE_LISTINGS.filter((item) => savedIds[item.id]),
    [savedIds]
  );

  // Filter logic for search criteria + active pill
  const filteredListings = useMemo(() => {
    return MOBILE_LISTINGS.filter((item) => {
      if (selectedArea && selectedArea !== 'All Dhaka') {
        if (item.area.toLowerCase() !== selectedArea.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedArea, searchQuery]);

  const sponsoredItems = useMemo(() => {
    const base = filteredListings.filter((i) => i.section === 'sponsored');
    return base;
  }, [filteredListings]);

  const popularItems = useMemo(() => {
    return filteredListings.filter((i) => i.section === 'popular');
  }, [filteredListings]);

  const offerItems = useMemo(() => {
    return filteredListings.filter((i) => i.section === 'offer');
  }, [filteredListings]);

  const moreItems = useMemo(() => {
    return filteredListings.filter((i) => i.section === 'more');
  }, [filteredListings]);

  const hasActiveFilter = Boolean(
    (selectedArea && selectedArea !== 'All Dhaka') ||
      selectedDate ||
      guestCount > 0 ||
      searchQuery.trim()
  );

  const clearAllFilters = () => {
    setSelectedArea('');
    setSelectedDate('');
    setGuestCount(0);
    setSearchQuery('');
    setActiveCategory('all');
  };

  const handleCategoryClick = (cat: 'all' | 'stay' | 'experiences' | 'services') => {
    setActiveCategory(cat);
  };

  const renderRoomCard = (room: MobileRoomListing) => {
    const isSaved = Boolean(savedIds[room.id]);

    return (
      <div
        key={room.id}
        onClick={() => {
          setBookingConfirmedId(null);
          setSelectedRoom(room);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setBookingConfirmedId(null);
            setSelectedRoom(room);
          }
        }}
        className="group bg-white rounded-[16px] overflow-hidden shadow-[0_3px_14px_rgba(15,23,42,0.07)] border border-slate-100/90 flex flex-col text-left transition-transform duration-150 active:scale-[0.985] cursor-pointer"
      >
        {/* Wide Room Photo matching mockup aspect ratio */}
        <div className="relative w-full aspect-[2.68/1] overflow-hidden bg-slate-100">
          <RoomPhoto
            src={room.image}
            alt={room.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {room.discountBadge && !room.hasBakedBadge && (
            <span className="absolute top-2 left-2 bg-white text-[#FF5500] border border-[#FF7A33]/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {room.discountBadge}
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="px-2.5 pt-2 pb-2.5 flex items-end justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-[12.5px] font-bold text-slate-900 leading-snug truncate">
              {room.title}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin size={11} className="text-slate-400 shrink-0 stroke-[2]" />
              <span className="truncate">{room.city}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap tabular-nums">
              <span className="text-[12.5px] font-extrabold text-[#FF5500] whitespace-nowrap">
                {room.priceFormatted}{' '}
                <span className="font-bold text-[11px]">/ month</span>
              </span>
              {room.oldPriceFormatted && (
                <span className="text-[10.5px] text-slate-400 line-through font-medium whitespace-nowrap">
                  {room.oldPriceFormatted}
                </span>
              )}
            </div>
          </div>

          {/* Outline / Filled Heart Button with >=44px touch area via negative margin */}
          <button
            type="button"
            aria-label={isSaved ? `Remove ${room.title} from saved` : `Save ${room.title}`}
            onClick={(e) => toggleSave(e, room)}
            className="-mr-2 -mb-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-600 hover:text-[#FF5500] active:scale-90 transition-transform cursor-pointer shrink-0"
          >
            <Heart
              size={17}
              className={
                isSaved
                  ? 'fill-[#FF5500] text-[#FF5500] stroke-[2]'
                  : 'text-slate-600 stroke-[1.75]'
              }
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-6 select-none">
      {/* Main Mobile Container */}
      <div className="max-w-[480px] mx-auto px-4 pt-3.5 pb-4 space-y-4">
        {/* 1. Top Brand & Favorites Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              clearAllFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[28px] font-extrabold tracking-[-0.03em] text-[#FF5500] leading-none py-1 text-left cursor-pointer whitespace-nowrap"
          >
            qaaga.com
          </button>

          <button
            type="button"
            aria-label="Saved rooms"
            onClick={() => setIsFavoritesOpen(true)}
            className="relative -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full active:scale-95 transition-transform cursor-pointer"
          >
            <Heart size={27} className="fill-[#FF5500] text-[#FF5500]" />
            {savedListings.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {savedListings.length}
              </span>
            )}
          </button>
        </div>

        {/* 2. 4 Category Filter Pills Row */}
        <div className="grid grid-cols-4 gap-2 pt-0.5">
          {(
            [
              { id: 'all', label: 'all' },
              { id: 'stay', label: 'stay' },
              { id: 'experiences', label: 'experiences' },
              { id: 'services', label: 'services' },
            ] as const
          ).map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategoryClick(tab.id)}
                className={`min-h-[40px] px-2 rounded-full text-[13px] tracking-[-0.01em] flex items-center justify-center whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5500] text-white font-semibold border border-[#FF5500] shadow-[0_3px_10px_rgba(255,85,0,0.24)]'
                    : 'bg-white text-slate-900 font-medium border border-[#FF7A33] hover:bg-orange-50/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. Elevated 3-Column Pill Search Bar */}
        <div className="rounded-full bg-white shadow-[0_5px_24px_rgba(15,23,42,0.09)] border border-slate-100/90 pl-4 pr-1.5 py-1.5 flex items-center justify-between gap-1">
          {/* Column 1: where */}
          <button
            type="button"
            onClick={() => {
              setActiveSearchField('where');
              setIsSearchSheetOpen(true);
            }}
            className="flex-1 min-w-0 min-h-[44px] flex flex-col items-center justify-center text-center px-1 rounded-l-full active:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-[12.5px] font-bold text-slate-950 leading-tight">
              where
            </span>
            <span className="text-[10.5px] text-slate-500 leading-tight truncate max-w-full mt-0.5">
              {selectedArea || searchQuery || 'search destination'}
            </span>
          </button>

          <div className="w-px h-7 bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Column 2: when */}
          <button
            type="button"
            onClick={() => {
              setActiveSearchField('when');
              setIsSearchSheetOpen(true);
            }}
            className="w-[27%] min-w-0 min-h-[44px] flex flex-col items-center justify-center text-center px-1 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-[12.5px] font-bold text-slate-950 leading-tight">
              when
            </span>
            <span className="text-[10.5px] text-slate-500 leading-tight truncate max-w-full mt-0.5">
              {selectedDate || 'add dates'}
            </span>
          </button>

          <div className="w-px h-7 bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Column 3: who */}
          <button
            type="button"
            onClick={() => {
              setActiveSearchField('who');
              setIsSearchSheetOpen(true);
            }}
            className="w-[25%] min-w-0 min-h-[44px] flex flex-col items-center justify-center text-center px-1 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-[12.5px] font-bold text-slate-950 leading-tight">
              who
            </span>
            <span className="text-[10.5px] text-slate-500 leading-tight truncate max-w-full mt-0.5 tabular-nums">
              {guestCount > 0 ? `${guestCount} guest${guestCount > 1 ? 's' : ''}` : 'add guests'}
            </span>
          </button>

          {/* Search Submit Circle Button */}
          <button
            type="button"
            aria-label="Search rooms"
            onClick={() => {
              setActiveSearchField('where');
              setIsSearchSheetOpen(true);
            }}
            className="w-11 h-11 rounded-full bg-[#FF5500] hover:bg-[#e64d00] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(255,85,0,0.32)] transition-transform cursor-pointer"
          >
            <Search size={19} strokeWidth={2.5} />
          </button>
        </div>

        {/* Optional Active Filter Reset Strip (only shown if user filtered) */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="truncate">
              Showing {filteredListings.length} verified stays
              {selectedArea ? ` in ${selectedArea}` : ''}
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[#FF5500] font-semibold underline underline-offset-2 ml-2 shrink-0 min-h-[32px] px-1 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Quick Context Banner when switching category tabs */}
        {activeCategory !== 'all' && (
          <div className="flex items-center justify-between py-1.5 px-3 rounded-2xl bg-orange-50/70 border border-orange-100 text-xs text-slate-700">
            <span>
              {activeCategory === 'stay' && 'Showing verified monthly rooms & studio stays in Dhaka'}
              {activeCategory === 'experiences' && 'Curated neighborhood stays & local Dhaka experiences'}
              {activeCategory === 'services' && 'Serviced apartments, home care & on-demand room services'}
            </span>
            {activeCategory === 'services' && (
              <button
                type="button"
                onClick={() => onNavigate('service_request')}
                className="text-[#FF5500] font-bold whitespace-nowrap ml-2 py-1 cursor-pointer"
              >
                All Services →
              </button>
            )}
          </div>
        )}

        {/* 4. Section: recently viewed */}
        <section className="space-y-2.5 pt-0.5">
          <h2 className="text-[17px] font-bold text-slate-950 tracking-[-0.015em]">
            recently viewed
          </h2>

          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-0.5">
            {RECENTLY_VIEWED_ITEMS.map((item) => {
              const linkedListing =
                MOBILE_LISTINGS.find((l) => l.id === item.listingId) || MOBILE_LISTINGS[0];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setBookingConfirmedId(null);
                    setSelectedRoom(linkedListing);
                  }}
                  className="w-[106px] h-[76px] sm:w-[114px] sm:h-[82px] rounded-[14px] overflow-hidden shrink-0 bg-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)] active:scale-95 transition-transform cursor-pointer"
                >
                  <RoomPhoto
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Empty Search State */}
        {filteredListings.length === 0 && (
          <div className="py-10 text-center space-y-3 border border-slate-100 rounded-2xl p-6">
            <p className="text-sm font-semibold text-slate-800">
              No rooms matched your exact filter
            </p>
            <p className="text-xs text-slate-500">
              Try clearing your destination filter to browse all verified Dhaka rooms.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-full bg-[#FF5500] text-white text-xs font-bold cursor-pointer"
            >
              Show all Dhaka rooms
            </button>
          </div>
        )}

        {/* 5. Section: sponsored */}
        {(activeCategory === 'all' || activeCategory === 'stay') && sponsoredItems.length > 0 && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-slate-950 tracking-[-0.015em]">
                sponsored
              </h2>
              <button
                type="button"
                aria-label="View all sponsored rooms"
                onClick={() => setActiveSectionDrawer('sponsored')}
                className="-mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group"
              >
                <span className="w-7 h-7 rounded-full bg-[#FFF0E6] group-hover:bg-[#FFE2CF] flex items-center justify-center transition-colors">
                  <ArrowRight size={14} className="text-[#FF5500] stroke-[2.25]" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sponsoredItems.map(renderRoomCard)}
            </div>
          </section>
        )}

        {/* 6. Section: popular */}
        {(activeCategory === 'all' ||
          activeCategory === 'stay' ||
          activeCategory === 'experiences') &&
          popularItems.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-slate-950 tracking-[-0.015em]">
                  popular
                </h2>
                <button
                  type="button"
                  aria-label="View all popular rooms"
                  onClick={() => setActiveSectionDrawer('popular')}
                  className="-mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FFF0E6] group-hover:bg-[#FFE2CF] flex items-center justify-center transition-colors">
                    <ArrowRight size={14} className="text-[#FF5500] stroke-[2.25]" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {popularItems.map(renderRoomCard)}
              </div>
            </section>
          )}

        {/* 7. Section: offer */}
        {(activeCategory === 'all' ||
          activeCategory === 'stay' ||
          activeCategory === 'services') &&
          offerItems.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-slate-950 tracking-[-0.015em]">
                  offer
                </h2>
                <button
                  type="button"
                  aria-label="View all special offers"
                  onClick={() => setActiveSectionDrawer('offer')}
                  className="-mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FFF0E6] group-hover:bg-[#FFE2CF] flex items-center justify-center transition-colors">
                    <ArrowRight size={14} className="text-[#FF5500] stroke-[2.25]" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {offerItems.map(renderRoomCard)}
              </div>
            </section>
          )}

        {/* Extra Expanded Listings when "see more" is clicked */}
        {showMoreExpanded && moreItems.length > 0 && (
          <section className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-slate-950 tracking-[-0.015em]">
                more stays in dhaka
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('hotels')}
                className="text-xs font-semibold text-[#FF5500] min-h-[36px] px-2 cursor-pointer"
              >
                Explore Hotels →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map(renderRoomCard)}
            </div>
          </section>
        )}

        {/* 8. Bottom Full-Width Primary CTA: see more */}
        <div className="pt-1.5">
          <button
            type="button"
            onClick={() => setShowMoreExpanded((prev) => !prev)}
            className="w-full min-h-[48px] rounded-full bg-[#FF5500] hover:bg-[#e64d00] active:scale-[0.99] text-white font-bold text-[16px] tracking-[-0.01em] flex items-center justify-center shadow-[0_6px_18px_rgba(255,85,0,0.26)] transition-all duration-150 cursor-pointer"
          >
            {showMoreExpanded ? 'show less' : 'see more'}
          </button>
        </div>
      </div>

      {/* Subtle Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* ===================================================================== */}
      {/* INTERACTIVE SHEET 1: SEARCH & FILTER DRAWER (where / when / who)      */}
      {/* ===================================================================== */}
      {isSearchSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setIsSearchSheetOpen(false)} />
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Search Dhaka Stays</h3>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsSearchSheetOpen(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Segmented Focus Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'where', label: 'Where' },
                  { id: 'when', label: 'When' },
                  { id: 'who', label: 'Who' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveSearchField(t.id)}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeSearchField === t.id
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Where Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Destination or Neighborhood
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Dhanmondi, Gulshan, Banani, Uttara..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {DHAKA_AREAS.map((area) => {
                  const selected =
                    (area === 'All Dhaka' && !selectedArea) || selectedArea === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedArea(area === 'All Dhaka' ? '' : area)}
                      className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#FF5500] text-white border-[#FF5500]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#FF7A33]'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* When Section */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Calendar size={14} className="text-[#FF5500]" />
                <span>Move-in / Stay Dates</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => {
                  const selected = selectedDate === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSelectedDate(selected ? '' : preset)}
                      className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Who Section */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Users size={14} className="text-[#FF5500]" />
                  <span>Guests / Tenants</span>
                </div>
                <p className="text-[11px] text-slate-500">Number of occupants</p>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                <button
                  type="button"
                  aria-label="Decrease guests"
                  onClick={() => setGuestCount((c) => Math.max(0, c - 1))}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100 cursor-pointer"
                >
                  <Minus size={15} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">
                  {guestCount}
                </span>
                <button
                  type="button"
                  aria-label="Increase guests"
                  onClick={() => setGuestCount((c) => Math.min(8, c + 1))}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100 cursor-pointer"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="min-h-[46px] px-5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsSearchSheetOpen(false)}
                className="flex-1 min-h-[46px] rounded-full bg-[#FF5500] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,85,0,0.28)] cursor-pointer"
              >
                <Search size={16} />
                <span>Show {filteredListings.length} rooms</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* INTERACTIVE SHEET 2: SAVED FAVORITES DRAWER (Top-Right Heart)         */}
      {/* ===================================================================== */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setIsFavoritesOpen(false)} />
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[82vh] overflow-y-auto space-y-4">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={20} className="fill-[#FF5500] text-[#FF5500]" />
                <h3 className="text-base font-bold text-slate-950">
                  Saved Stays ({savedListings.length})
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close saved stays"
                onClick={() => setIsFavoritesOpen(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {savedListings.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-800">No saved rooms yet</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tap the heart icon on any room card to shortlist your favorite Dhaka apartments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedListings.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setIsFavoritesOpen(false);
                      setSelectedRoom(room);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 hover:border-orange-200 cursor-pointer"
                  >
                    <RoomPhoto
                      src={room.image}
                      alt={room.title}
                      className="w-20 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{room.title}</h4>
                      <p className="text-[11px] text-slate-500">{room.area}, {room.city}</p>
                      <p className="text-xs font-extrabold text-[#FF5500] mt-0.5 tabular-nums">
                        {room.priceFormatted} / month
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove saved room"
                      onClick={(e) => toggleSave(e, room)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#FF5500] cursor-pointer"
                    >
                      <Heart size={18} className="fill-[#FF5500] text-[#FF5500]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* INTERACTIVE SHEET 3: SECTION COLLECTION DRAWER (Arrow Buttons)        */}
      {/* ===================================================================== */}
      {activeSectionDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setActiveSectionDrawer(null)} />
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 capitalize">
                  {activeSectionDrawer} stays in Dhaka
                </h3>
                <p className="text-xs text-slate-500">
                  Verified monthly rentals with instant booking
                </p>
              </div>
              <button
                type="button"
                aria-label="Close collection"
                onClick={() => setActiveSectionDrawer(null)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOBILE_LISTINGS.filter(
                (r) => r.section === activeSectionDrawer || r.section === 'more'
              ).map(renderRoomCard)}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSectionDrawer(null);
                onNavigate('hotels');
              }}
              className="w-full min-h-[46px] rounded-full bg-[#FF5500] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 size={16} />
              <span>Browse Full Stays & Hotels Directory</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* INTERACTIVE SHEET 4: ROOM DETAIL & INSTANT RESERVATION MODAL          */}
      {/* ===================================================================== */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/55 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setSelectedRoom(null)} />
          <div className="bg-white rounded-t-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col">
            {/* Hero Room Image */}
            <div className="relative w-full h-52 bg-slate-100 shrink-0">
              <RoomPhoto
                src={selectedRoom.image}
                alt={selectedRoom.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedRoom(null)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-md cursor-pointer"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                aria-label="Save listing"
                onClick={(e) => toggleSave(e, selectedRoom)}
                className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-md cursor-pointer"
              >
                <Heart
                  size={18}
                  className={
                    savedIds[selectedRoom.id]
                      ? 'fill-[#FF5500] text-[#FF5500]'
                      : 'text-slate-700'
                  }
                />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 leading-snug">
                    {selectedRoom.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin size={13} className="text-[#FF5500]" />
                    <span>
                      {selectedRoom.area} · {selectedRoom.city}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedRoom.bedrooms}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <div className="text-base font-extrabold text-[#FF5500]">
                    {selectedRoom.priceFormatted}
                  </div>
                  <div className="text-[11px] text-slate-500">per month</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedRoom.description}
              </p>

              {/* Unboxed Amenities List */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Included Amenities</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  {selectedRoom.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Check size={14} className="text-[#FF5500] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Host Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck size={16} className="text-[#FF5500]" />
                  <span>
                    Hosted by <strong className="text-slate-900">{selectedRoom.hostName}</strong> · Verified ID
                  </span>
                </div>
              </div>

              {/* Confirmation State or Primary Booking CTA */}
              {bookingConfirmedId === selectedRoom.id ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Check size={18} className="text-emerald-600" />
                    <span>Visit & Booking Request Sent!</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    {selectedRoom.hostName} has received your request for {selectedRoom.title}. Track status anytime in Bookings.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      onNavigate('customer_dashboard');
                    }}
                    className="w-full min-h-[44px] mt-1 rounded-full bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    View in My Bookings
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingConfirmedId(selectedRoom.id)}
                    className="flex-1 min-h-[48px] rounded-full bg-[#FF5500] hover:bg-[#e64d00] text-white font-bold text-sm shadow-[0_5px_16px_rgba(255,85,0,0.28)] cursor-pointer"
                  >
                    Reserve Room · {selectedRoom.priceFormatted}/mo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
