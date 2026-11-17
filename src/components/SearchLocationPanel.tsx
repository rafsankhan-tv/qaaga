'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Search,
  X,
  Check,
  Building2,
  Sparkles,
  ShoppingBag,
  Coffee,
  Trees,
  Utensils,
  Home,
  Compass,
} from 'lucide-react';

export interface LocationItem {
  id: string;
  name: string;
  subtitle: string;
  category: 'all' | 'city' | 'lifestyle' | 'heritage' | 'suburb';
  iconType: 'city' | 'landmark' | 'shopping' | 'cafe' | 'nature' | 'food' | 'home' | 'culture';
}

export const POPULAR_LOCATIONS: LocationItem[] = [
  {
    id: 'all-dhaka',
    name: 'All Dhaka',
    subtitle: 'Explore furnished stays across Dhaka',
    category: 'all',
    iconType: 'city',
  },
  {
    id: 'gulshan',
    name: 'Gulshan',
    subtitle: 'Furnished apartments, business stays and city dining',
    category: 'city',
    iconType: 'landmark',
  },
  {
    id: 'banani',
    name: 'Banani',
    subtitle: 'Serviced apartments, cafes and convenient city access',
    category: 'lifestyle',
    iconType: 'cafe',
  },
  {
    id: 'dhanmondi',
    name: 'Dhanmondi',
    subtitle: 'Residential apartments and local neighbourhood amenities',
    category: 'suburb',
    iconType: 'home',
  },
  {
    id: 'uttara',
    name: 'Uttara',
    subtitle: 'Family-friendly stays and airport-area accommodation',
    category: 'suburb',
    iconType: 'nature',
  },
  {
    id: 'mirpur',
    name: 'Mirpur',
    subtitle: 'Residential stays with access to local shopping and transit',
    category: 'suburb',
    iconType: 'home',
  },
  {
    id: 'bashundhara',
    name: 'Bashundhara',
    subtitle: 'Modern residential stays and shopping access',
    category: 'lifestyle',
    iconType: 'shopping',
  },
  {
    id: 'old-dhaka',
    name: 'Old Dhaka',
    subtitle: 'Historic streets, culture and traditional food',
    category: 'heritage',
    iconType: 'food',
  },
];

const STORAGE_KEY = 'qaaga_recent_destinations';

interface SearchLocationPanelProps {
  whereQuery: string;
  onSelectLocation: (name: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const SearchLocationPanel: React.FC<SearchLocationPanelProps> = ({
  whereQuery,
  onSelectLocation,
  onClear,
  onClose,
}) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>(whereQuery);

  useEffect(() => {
    setSearchInput(whereQuery);
  }, [whereQuery]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item) => !/kuala lumpur|bukit bintang|kampung bahru|klcc|mont kiara|bangsar/i.test(String(item))).slice(0, 4));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToRecent = (destName: string) => {
    if (!destName || destName === 'All Dhaka') return;
    try {
      const updated = [destName, ...recentSearches.filter((item) => item !== destName)].slice(0, 4);
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelect = (name: string) => {
    const chosen = name === 'All Dhaka' ? '' : name;
    if (chosen) {
      saveToRecent(chosen);
    }
    onSelectLocation(chosen);
  };

  const handleRemoveRecent = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const filteredLocations = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return POPULAR_LOCATIONS;
    return POPULAR_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.subtitle.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q)
    );
  }, [searchInput]);

  const renderIcon = (type: LocationItem['iconType']) => {
    switch (type) {
      case 'city':
        return <Building2 size={18} className="text-[#C72B62]" />;
      case 'landmark':
        return <Sparkles size={18} className="text-[#C72B62]" />;
      case 'shopping':
        return <ShoppingBag size={18} className="text-[#C72B62]" />;
      case 'cafe':
        return <Coffee size={18} className="text-[#C72B62]" />;
      case 'nature':
        return <Trees size={18} className="text-[#C72B62]" />;
      case 'food':
        return <Utensils size={18} className="text-[#C72B62]" />;
      case 'home':
        return <Home size={18} className="text-[#C72B62]" />;
      case 'culture':
        return <Compass size={18} className="text-[#C72B62]" />;
      default:
        return <MapPin size={18} className="text-[#C72B62]" />;
    }
  };

  return (
    <div className="w-full text-left space-y-4">
      {/* Search Bar Input inside panel */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            const val = e.target.value;
            setSearchInput(val);
            onSelectLocation(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSelectLocation(searchInput);
              onClose();
            }
          }}
          placeholder="Search destinations in Dhaka"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C72B62] focus:bg-white transition-all shadow-inner"
          autoFocus
        />
        {searchInput && (
          <button
            type="button"
            aria-label="Clear destination input"
            onClick={() => {
              setSearchInput('');
              onClear();
            }}
            className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Recent Searches (if available and no active typing query) */}
      {!searchInput.trim() && recentSearches.length > 0 && (
        <div className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recent searches
            </span>
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Clear recent
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {recentSearches.map((term) => (
              <div
                key={`recent-${term}`}
                onClick={() => handleSelect(term)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#C72B62]/5 border border-slate-100 hover:border-[#C72B62]/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={14} className="text-slate-400 group-hover:text-[#C72B62] shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">{term}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${term}`}
                  onClick={(e) => handleRemoveRecent(e, term)}
                  className="w-5 h-5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shrink-0 transition-colors ml-2"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular destinations in Dhaka */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {searchInput.trim() ? `Matching destinations (${filteredLocations.length})` : 'Popular destinations in Dhaka'}
          </span>
          {whereQuery && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
            >
              Reset to all
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-[300px] sm:max-h-[340px] overflow-y-auto scrollbar-none pr-0.5">
          {filteredLocations.map((loc) => {
            const isSelected =
              (whereQuery === '' && loc.name === 'All Dhaka') ||
              whereQuery.toLowerCase() === loc.name.toLowerCase();

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc.name)}
                data-testid={`destination-option-${loc.id}`}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-colors text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-[#C72B62]/10 border border-[#C72B62]/30 text-slate-900'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#C72B62] text-white' : 'bg-slate-100 group-hover:bg-[#C72B62]/10'
                    }`}
                  >
                    {renderIcon(loc.iconType)}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isSelected ? 'text-[#C72B62]' : 'text-slate-900'
                      }`}
                    >
                      {loc.name}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">{loc.subtitle}</p>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-[#C72B62] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check size={13} strokeWidth={2.8} />
                  </span>
                )}
              </button>
            );
          })}

          {filteredLocations.length === 0 && (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-bold text-slate-700">No destination matching "{searchInput}"</p>
              <p className="text-[11px] text-slate-400">
                Search for a property by name or explore all available stays in Dhaka.
              </p>
              <button
                type="button"
                onClick={() => handleSelect('All Dhaka')}
                className="mt-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Explore All Dhaka
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
