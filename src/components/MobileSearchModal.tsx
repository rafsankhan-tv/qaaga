'use client';

import React, { useState } from 'react';
import { X, Search, RotateCcw, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { SearchLocationPanel } from './SearchLocationPanel';
import { SearchCalendar } from './SearchCalendar';
import { SearchGuestSelector } from './SearchGuestSelector';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  whereQuery: string;
  onSelectLocation: (name: string) => void;
  onClearLocation: () => void;
  checkInDate: string | null;
  checkOutDate: string | null;
  onSelectDateRange: (checkIn: string | null, checkOut: string | null, display: string, nights: number) => void;
  onClearDates: () => void;
  selectedDatesDisplay: string;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeGuestCount: (type: 'adults' | 'children' | 'infants' | 'pets', val: number) => void;
  onClearGuests: () => void;
  guestSummaryText: string;
  onExecuteSearch: () => void;
  matchingCount: number;
  initialTab?: 'where' | 'when' | 'who';
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  whereQuery,
  onSelectLocation,
  onClearLocation,
  checkInDate,
  checkOutDate,
  onSelectDateRange,
  onClearDates,
  selectedDatesDisplay,
  adults,
  childrenCount,
  infants,
  pets,
  onChangeGuestCount,
  onClearGuests,
  guestSummaryText,
  onExecuteSearch,
  matchingCount,
  initialTab = 'where',
}) => {
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who'>(initialTab);

  if (!isOpen) return null;

  const handleResetAll = () => {
    onClearLocation();
    onClearDates();
    onClearGuests();
  };

  const handleSearchSubmit = () => {
    onClose();
    onExecuteSearch();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl max-w-lg mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0">
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            <X size={20} />
          </button>

          <span className="text-sm font-bold text-slate-900">Search QAAGA Stays</span>

          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Clear all
          </button>
        </div>

        {/* Tab Selector Pills */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('where')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeTab === 'where'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin size={13} className={activeTab === 'where' ? 'text-[#C72B62]' : 'text-slate-400'} />
            <span className="truncate">{whereQuery || 'Where'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('when')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeTab === 'when'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={13} className={activeTab === 'when' ? 'text-[#C72B62]' : 'text-slate-400'} />
            <span className="truncate">{selectedDatesDisplay || 'When'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('who')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeTab === 'who'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={13} className={activeTab === 'who' ? 'text-[#C72B62]' : 'text-slate-400'} />
            <span className="truncate">{guestSummaryText || 'Who'}</span>
          </button>
        </div>

        {/* Active Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
          {activeTab === 'where' && (
            <SearchLocationPanel
              whereQuery={whereQuery}
              onSelectLocation={(chosen) => {
                onSelectLocation(chosen);
                setActiveTab('when');
              }}
              onClear={onClearLocation}
              onClose={() => setActiveTab('when')}
            />
          )}

          {activeTab === 'when' && (
            <SearchCalendar
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onSelectRange={(start, end, display, nights) => {
                onSelectDateRange(start, end, display, nights);
              }}
              onClear={onClearDates}
              onClose={() => setActiveTab('who')}
              onNext={() => setActiveTab('who')}
              isMobileSheet={true}
            />
          )}

          {activeTab === 'who' && (
            <SearchGuestSelector
              adults={adults}
              childrenCount={childrenCount}
              infants={infants}
              pets={pets}
              onChangeGuestCount={onChangeGuestCount}
              onClear={onClearGuests}
              onApply={() => {}}
            />
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs font-semibold text-slate-600 hover:underline px-2 py-1.5 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Reset filters</span>
          </button>

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="search-button flex-1 py-3 px-5 rounded-full flex items-center justify-center gap-2 text-white text-sm font-semibold shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Search size={16} strokeWidth={2.5} className="text-white" />
            <span>Search {matchingCount > 0 ? `(${matchingCount} stays)` : 'stays'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
