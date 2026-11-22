'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeGuestCount: (type: 'adults' | 'children' | 'infants' | 'pets', val: number) => void;
  onClear: () => void;
  onApply: () => void;
}

export const SearchGuestSelector: React.FC<Props> = ({ adults, childrenCount, infants, pets, onChangeGuestCount }) => {
  const rows = [
    { key: 'adults' as const, title: 'Adults', subtitle: 'Ages 13 or above', value: adults, min: 0, max: 16 },
    { key: 'children' as const, title: 'Children', subtitle: 'Ages 2–12', value: childrenCount, min: 0, max: 10 },
    { key: 'infants' as const, title: 'Infants', subtitle: 'Under 2', value: infants, min: 0, max: 5 },
    { key: 'pets' as const, title: 'Pets', subtitle: 'Bringing a service animal?', value: pets, min: 0, max: 5 },
  ];

  return (
    <section className="w-full px-1 text-left" aria-label="Choose guests">
      <div className="divide-y divide-[#EBEBEB]">
        {rows.map((row) => (
          <div key={row.key} className="flex min-h-[118px] items-center justify-between gap-5 py-5 first:pt-3 last:pb-3">
            <div className="min-w-0">
              <h3 className="text-[18px] font-semibold leading-6 tracking-[-0.015em] text-[#222222]">{row.title}</h3>
              <p className="mt-1 text-[16px] leading-6 text-[#717171]">{row.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                aria-label={`Decrease ${row.title}`}
                disabled={row.value <= row.min}
                onClick={() => onChangeGuestCount(row.key, Math.max(row.min, row.value - 1))}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F7F7F7] text-[#717171] transition hover:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-40"
              ><Minus size={18} strokeWidth={1.8} /></button>
              <span className="w-5 text-center text-[17px] font-medium tabular-nums text-[#222222]" aria-live="polite">{row.value}</span>
              <button
                type="button"
                aria-label={`Increase ${row.title}`}
                disabled={row.value >= row.max}
                onClick={() => onChangeGuestCount(row.key, Math.min(row.max, row.value + 1))}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F7F7F7] text-[#222222] transition hover:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:opacity-40"
              ><Plus size={18} strokeWidth={2} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
