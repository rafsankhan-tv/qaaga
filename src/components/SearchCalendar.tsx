'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export interface CalendarRange {
  checkIn: string | null; // e.g. "2026-11-14"
  checkOut: string | null; // e.g. "2026-11-18"
  display: string; // e.g. "Nov 14 – 18"
  nights: number;
}

interface SearchCalendarProps {
  checkInDate: string | null;
  checkOutDate: string | null;
  onSelectRange: (checkIn: string | null, checkOut: string | null, display: string, nights: number) => void;
  onClear: () => void;
  onClose: () => void;
  onNext?: () => void;
  isMobileSheet?: boolean;
}

// Preset options for fast selection
interface DatePreset {
  id: string;
  label: string;
  tag: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  display: string;
}

const PRESETS: DatePreset[] = [
  {
    id: 'weekend',
    label: 'This weekend',
    tag: 'Nov 14 – 16 · 2 nights',
    checkIn: '2026-11-14',
    checkOut: '2026-11-16',
    nights: 2,
    display: 'Nov 14 – 16',
  },
  {
    id: 'next-week',
    label: 'Next weekend',
    tag: 'Nov 20 – 23 · 3 nights',
    checkIn: '2026-11-20',
    checkOut: '2026-11-23',
    nights: 3,
    display: 'Nov 20 – 23',
  },
  {
    id: '5-nights',
    label: '5 nights stay',
    tag: 'Dec 1 – 6 · 5 nights',
    checkIn: '2026-12-01',
    checkOut: '2026-12-06',
    nights: 5,
    display: 'Dec 1 – 6',
  },
  {
    id: '1-week',
    label: '1 week getaway',
    tag: 'Dec 12 – 19 · 7 nights',
    checkIn: '2026-12-12',
    checkOut: '2026-12-19',
    nights: 7,
    display: 'Dec 12 – 19',
  },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Today's anchor in app: Nov 8, 2026
const TODAY_STR = '2026-11-08';

function formatIso(year: number, monthZeroIdx: number, day: number): string {
  const m = String(monthZeroIdx + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseIso(isoStr: string) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function formatDisplayRange(inIso: string, outIso: string): { display: string; nights: number } {
  const start = parseIso(inIso);
  const end = parseIso(outIso);

  const startDate = new Date(start.year, start.month, start.day);
  const endDate = new Date(end.year, end.month, end.day);
  const diffTime = endDate.getTime() - startDate.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  let display = '';
  if (start.month === end.month) {
    display = `${SHORT_MONTHS[start.month]} ${start.day} – ${end.day}`;
  } else {
    display = `${SHORT_MONTHS[start.month]} ${start.day} – ${SHORT_MONTHS[end.month]} ${end.day}`;
  }

  return { display, nights };
}

export const SearchCalendar: React.FC<SearchCalendarProps> = ({
  checkInDate,
  checkOutDate,
  onSelectRange,
  onClear,
  onClose,
  onNext,
  isMobileSheet = false,
}) => {
  // Month offset relative to November 2026 (index 0 = Nov 2026, 1 = Dec 2026, etc.)
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Determine current viewing months
  const leftMonthData = useMemo(() => {
    // base: November 2026
    const base = new Date(2026, 10, 1);
    const target = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const monthName = MONTH_NAMES[month];
    const firstDay = target.getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { year, month, monthName, firstDay, totalDays };
  }, [monthOffset]);

  const rightMonthData = useMemo(() => {
    const base = new Date(2026, 10, 1);
    const target = new Date(base.getFullYear(), base.getMonth() + monthOffset + 1, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const monthName = MONTH_NAMES[month];
    const firstDay = target.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { year, month, monthName, firstDay, totalDays };
  }, [monthOffset]);

  const handlePrevMonth = () => {
    if (monthOffset > 0) {
      setMonthOffset((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setMonthOffset((prev) => prev + 1);
  };

  const handleDayClick = (isoString: string) => {
    // If no check-in, or already have both check-in and check-out: start fresh with check-in
    if (!checkInDate || (checkInDate && checkOutDate)) {
      const { display, nights } = formatDisplayRange(isoString, isoString);
      onSelectRange(isoString, null, `${SHORT_MONTHS[parseIso(isoString).month]} ${parseIso(isoString).day}`, 1);
      return;
    }

    // If checkIn exists and no checkOut:
    if (checkInDate && !checkOutDate) {
      if (isoString > checkInDate) {
        // Valid checkout after checkin
        const { display, nights } = formatDisplayRange(checkInDate, isoString);
        onSelectRange(checkInDate, isoString, display, nights);
        if (onNext) {
          onNext();
        }
      } else if (isoString < checkInDate) {
        // Prevent checkout earlier than check-in: reset check-in to this earlier date
        const parsed = parseIso(isoString);
        onSelectRange(isoString, null, `${SHORT_MONTHS[parsed.month]} ${parsed.day}`, 1);
      } else {
        // Clicked same day: toggle or keep check-in
        onSelectRange(isoString, null, `${SHORT_MONTHS[parseIso(isoString).month]} ${parseIso(isoString).day}`, 1);
      }
    }
  };

  const handleApplyPreset = (preset: DatePreset) => {
    onSelectRange(preset.checkIn, preset.checkOut, preset.display, preset.nights);
    if (onNext) {
      onNext();
    }
  };

  const renderMonthGrid = (data: typeof leftMonthData) => {
    const { year, month, firstDay, totalDays } = data;
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
          {DAY_NAMES.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center tabular-nums">
          {blanksArray.map((b) => (
            <div key={`blank-${b}`} className="h-9 w-full" aria-hidden="true" />
          ))}

          {daysArray.map((day) => {
            const dateStr = formatIso(year, month, day);
            const isPast = dateStr < TODAY_STR;
            const isToday = dateStr === TODAY_STR;
            const isCheckIn = checkInDate === dateStr;
            const isCheckOut = checkOutDate === dateStr;
            const inRange =
              checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;
            const inHoverRange =
              checkInDate &&
              !checkOutDate &&
              hoveredDate &&
              dateStr > checkInDate &&
              dateStr <= hoveredDate;

            let cellClass =
              'h-9 w-full rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ';

            if (isPast) {
              cellClass =
                'h-9 w-full rounded-full text-xs font-normal text-slate-300 flex items-center justify-center cursor-not-allowed pointer-events-none';
            } else if (isCheckIn || isCheckOut) {
              cellClass += 'bg-[#C72B62] text-white shadow-sm z-10 scale-100 font-bold';
            } else if (inRange || inHoverRange) {
              cellClass += 'bg-[#C72B62]/12 text-[#C72B62] font-semibold rounded-none';
            } else {
              cellClass += 'text-slate-800 hover:bg-slate-100 hover:text-slate-950';
            }

            return (
              <div
                key={dateStr}
                className="relative py-0.5 flex items-center justify-center"
                onMouseEnter={() => !isPast && checkInDate && !checkOutDate && setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Visual strip connector for in-range days */}
                {(inRange || inHoverRange) && (
                  <div
                    className={`absolute inset-y-0.5 bg-[#C72B62]/10 pointer-events-none ${
                      isCheckIn
                        ? 'left-1/2 right-0'
                        : isCheckOut
                        ? 'left-0 right-1/2'
                        : 'inset-x-0'
                    }`}
                  />
                )}

                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(dateStr)}
                  className={cellClass}
                  aria-label={`${MONTH_NAMES[month]} ${day}, ${year}`}
                >
                  <span>{day}</span>
                  {isToday && !isCheckIn && !isCheckOut && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C72B62]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-left space-y-4">
      {/* Top Header: Navigation & Month Indicators */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            disabled={monthOffset <= 0}
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CalendarIcon size={14} className="text-[#C72B62]" />
            <span>Select check-in & check-out dates</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checkInDate && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-[#C72B62] hover:underline cursor-pointer"
            >
              Clear dates
            </button>
          )}
          <button
            type="button"
            aria-label="Next month"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Calendar View: Two Months on Desktop, One Month on Mobile */}
      <div className={`grid gap-8 ${isMobileSheet ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Left Month */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 text-center">
            {leftMonthData.monthName} {leftMonthData.year}
          </h4>
          {renderMonthGrid(leftMonthData)}
        </div>

        {/* Right Month (visible on Desktop) */}
        {!isMobileSheet && (
          <div className="space-y-3 hidden md:block border-l border-slate-100 pl-8">
            <h4 className="text-sm font-bold text-slate-900 text-center">
              {rightMonthData.monthName} {rightMonthData.year}
            </h4>
            {renderMonthGrid(rightMonthData)}
          </div>
        )}
      </div>

      {/* Status banner */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          {checkInDate && checkOutDate ? (
            <span className="font-semibold text-slate-900">
              Selected:{' '}
              <span className="text-[#C72B62]">
                {formatDisplayRange(checkInDate, checkOutDate).display}
              </span>{' '}
              ({formatDisplayRange(checkInDate, checkOutDate).nights} night
              {formatDisplayRange(checkInDate, checkOutDate).nights > 1 ? 's' : ''})
            </span>
          ) : checkInDate ? (
            <span className="font-medium text-slate-700">
              Check-in set for{' '}
              <strong className="text-slate-900">
                {SHORT_MONTHS[parseIso(checkInDate).month]} {parseIso(checkInDate).day}
              </strong>
              . Now select check-out.
            </span>
          ) : (
            <span className="text-slate-400">Click any available day to begin selection.</span>
          )}
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => {
            const isActive = checkInDate === p.checkIn && checkOutDate === p.checkOut;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C72B62] text-white border-[#C72B62]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
