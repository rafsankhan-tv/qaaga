'use client';

import React from 'react';
import { Minus, Plus, Users, Dog, Baby } from 'lucide-react';

interface SearchGuestSelectorProps {
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeGuestCount: (type: 'adults' | 'children' | 'infants' | 'pets', val: number) => void;
  onClear: () => void;
  onApply: () => void;
}

export const SearchGuestSelector: React.FC<SearchGuestSelectorProps> = ({
  adults,
  childrenCount,
  infants,
  pets,
  onChangeGuestCount,
  onClear,
  onApply,
}) => {
  const GUEST_ROWS = [
    {
      key: 'adults' as const,
      title: 'Adults',
      sub: 'Age 13+',
      val: adults,
      min: 1, // Rule: Adults cannot be less than 1
      max: 16,
      icon: Users,
    },
    {
      key: 'children' as const,
      title: 'Children',
      sub: 'Ages 2–12',
      val: childrenCount,
      min: 0,
      max: 10,
      icon: Users,
    },
    {
      key: 'infants' as const,
      title: 'Infants',
      sub: 'Under 2',
      val: infants,
      min: 0,
      max: 5,
      icon: Baby,
    },
    {
      key: 'pets' as const,
      title: 'Pets',
      sub: 'Bringing a service animal?',
      val: pets,
      min: 0,
      max: 5,
      icon: Dog,
    },
  ];

  const totalGuests = adults + childrenCount;
  const isDefault = adults === 1 && childrenCount === 0 && infants === 0 && pets === 0;

  return (
    <div className="w-full text-left space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Guests & Travelers</h4>
          <p className="text-xs text-slate-500">
            {totalGuests} guest{totalGuests > 1 ? 's' : ''}
            {infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : ''}
            {pets > 0 ? `, ${pets} pet${pets > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {!isDefault && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {GUEST_ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.key} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500">{row.sub}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 tabular-nums shrink-0">
                <button
                  type="button"
                  aria-label={`Decrease ${row.title}`}
                  disabled={row.val <= row.min}
                  onClick={() => onChangeGuestCount(row.key, Math.max(row.min, row.val - 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                >
                  <Minus size={14} />
                </button>

                <span className="w-6 text-center text-sm font-bold text-slate-900">{row.val}</span>

                <button
                  type="button"
                  aria-label={`Increase ${row.title}`}
                  disabled={row.val >= row.max}
                  onClick={() => onChangeGuestCount(row.key, Math.min(row.max, row.val + 1))}
                  className="w-8 h-8 rounded-full border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-900 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">Pets must be verified with property host</p>
        <button
          type="button"
          onClick={onApply}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
