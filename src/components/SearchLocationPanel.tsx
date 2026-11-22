'use client';

import React, { useMemo } from 'react';
import { Building2, Compass, Navigation, Trees, Landmark, MapPin } from 'lucide-react';

export interface LocationItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  tone: string;
}

const LOCATIONS: LocationItem[] = [
  { id: 'nearby', name: 'Nearby', subtitle: "Find what's around you", icon: Navigation, tone: 'bg-sky-50 text-sky-600' },
  { id: 'dhaka', name: 'Dhaka, Bangladesh', subtitle: 'Near you', icon: Building2, tone: 'bg-blue-50 text-blue-600' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur, Malaysia', subtitle: 'For sights like Petronas Twin Towers', icon: Landmark, tone: 'bg-amber-50 text-amber-700' },
  { id: 'bangkok', name: 'Bangkok, Thailand', subtitle: 'Family friendly', icon: Landmark, tone: 'bg-emerald-50 text-emerald-700' },
  { id: 'dubai', name: 'Dubai, United Arab Emirates', subtitle: 'Popular beach destination', icon: Building2, tone: 'bg-lime-50 text-lime-700' },
  { id: 'chattogram', name: 'Chattogram, Bangladesh', subtitle: 'For a trip abroad', icon: Trees, tone: 'bg-green-50 text-green-700' },
  { id: 'cox-bazar', name: "Cox's Bazar, Bangladesh", subtitle: 'Beachfront stays and coastal escapes', icon: Compass, tone: 'bg-cyan-50 text-cyan-700' },
];

interface Props {
  whereQuery: string;
  onSelectLocation: (name: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const SearchLocationPanel: React.FC<Props> = ({ whereQuery, onSelectLocation, onClear }) => {
  const filtered = useMemo(() => {
    const value = whereQuery.trim().toLowerCase();
    return value ? LOCATIONS.filter((item) => item.name.toLowerCase().includes(value) || item.subtitle.toLowerCase().includes(value)) : LOCATIONS;
  }, [whereQuery]);

  return (
    <section className="w-full text-left" aria-label="Suggested destinations">
      <div className="flex items-center justify-between px-1 pb-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#222222]">
          {whereQuery ? 'Matching destinations' : 'Suggested destinations'}
        </h3>
        {whereQuery && (
          <button type="button" onClick={() => { setQuery(''); onClear(); }} className="text-xs font-medium text-slate-500 hover:text-slate-900">
            Clear
          </button>
        )}
      </div>
      <div className="max-h-[min(62vh,620px)] overflow-y-auto overscroll-contain pr-1 scrollbar-none">
        {filtered.map((item) => {
          const Icon = item.icon;
          const selected = whereQuery.toLowerCase() === item.name.toLowerCase();
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectLocation(item.name === 'Nearby' ? 'Nearby' : item.name.replace(/, Bangladesh|, Malaysia|, Thailand|, United Arab Emirates/g, ''))}
              className="group flex w-full items-center gap-5 rounded-2xl px-1 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
              data-testid={`destination-option-${item.id}`}
            >
              <span className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon size={29} strokeWidth={1.65} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold leading-6 text-[#222222]">{item.name}</span>
                <span className="mt-0.5 block truncate text-[15px] leading-6 text-[#717171]">{item.subtitle}</span>
              </span>
              {selected && <MapPin size={17} className="mr-2 text-[#222222]" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-2 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No destinations found</p>
            <p className="mt-1 text-xs text-slate-500">Try another city or destination.</p>
          </div>
        )}
      </div>
    </section>
  );
};
