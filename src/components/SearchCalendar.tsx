'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  checkInDate: string | null;
  checkOutDate: string | null;
  onSelectRange: (checkIn: string | null, checkOut: string | null, display: string, nights: number) => void;
  onClear: () => void;
  onClose: () => void;
  onNext?: () => void;
  isMobileSheet?: boolean;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEK = ['S','M','T','W','T','F','S'];

function dhakaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(get('year'), get('month') - 1, get('day'));
}
function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function parse(value: string) { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); }
function nightsBetween(start: string, end: string) { return Math.max(1, Math.round((parse(end).getTime() - parse(start).getTime()) / 86400000)); }
function displayRange(start: string, end: string) {
  const a = parse(start), b = parse(end);
  return a.getMonth() === b.getMonth() ? `${SHORT[a.getMonth()]} ${a.getDate()} – ${b.getDate()}` : `${SHORT[a.getMonth()]} ${a.getDate()} – ${SHORT[b.getMonth()]} ${b.getDate()}`;
}

export const SearchCalendar: React.FC<Props> = ({ checkInDate, checkOutDate, onSelectRange, onClear, onNext, isMobileSheet = false }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [mode, setMode] = useState<'dates' | 'flexible'>('dates');
  const [flexibility, setFlexibility] = useState('Exact dates');
  const today = useMemo(() => dhakaToday(), []);
  const left = useMemo(() => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1), [today, monthOffset]);
  const right = useMemo(() => new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 1), [today, monthOffset]);
  const todayIso = iso(today);

  const chooseDay = (day: number, month: Date) => {
    const chosen = iso(new Date(month.getFullYear(), month.getMonth(), day));
    if (!checkInDate || checkOutDate) {
      onSelectRange(chosen, null, `${SHORT[month.getMonth()]} ${day}`, 1);
      return;
    }
    if (chosen > checkInDate) {
      const count = nightsBetween(checkInDate, chosen);
      onSelectRange(checkInDate, chosen, displayRange(checkInDate, chosen), count);
      onNext?.();
    } else {
      onSelectRange(chosen, null, `${SHORT[month.getMonth()]} ${day}`, 1);
    }
  };

  const renderMonth = (month: Date) => {
    const year = month.getFullYear(), monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const count = new Date(year, monthIndex + 1, 0).getDate();
    const cells = Array.from({ length: firstDay + count }, (_, index) => index < firstDay ? null : index - firstDay + 1);
    while (cells.length % 7) cells.push(null);
    return (
      <div className="min-w-0">
        <h3 className="mb-5 text-center text-[20px] font-semibold tracking-[-0.02em] text-[#222222]">{MONTHS[monthIndex]} {year}</h3>
        <div className="mb-3 grid grid-cols-7">
          {WEEK.map((day, index) => <span key={`${day}-${index}`} className="flex h-8 items-center justify-center text-[13px] font-semibold text-[#717171]">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, index) => {
            if (!day) return <span key={`blank-${index}`} className="h-11" />;
            const date = iso(new Date(year, monthIndex, day));
            const past = date < todayIso;
            const start = date === checkInDate, end = date === checkOutDate;
            const inRange = Boolean(checkInDate && checkOutDate && date > checkInDate && date < checkOutDate);
            return (
              <div key={date} className={`relative flex h-11 items-center justify-center ${inRange ? 'bg-[#F7F7F7]' : ''}`}>
                <button
                  type="button"
                  disabled={past}
                  onClick={() => chooseDay(day, month)}
                  aria-label={`${MONTHS[monthIndex]} ${day}, ${year}`}
                  aria-pressed={start || end}
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-medium transition-colors ${past ? 'cursor-not-allowed text-[#D0D0D0]' : start || end ? 'bg-[#222222] text-white' : 'text-[#222222] hover:border hover:border-[#222222]'}`}
                >{day}</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const chips = ['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days', '± 14 days'];

  return (
    <section className="w-full text-left" aria-label="Choose travel dates">
      <div className="mx-auto mb-7 flex h-[58px] w-full max-w-[406px] items-center rounded-full bg-[#EBEBEB] p-1">
        {(['dates', 'flexible'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setMode(item)} className={`h-[48px] flex-1 rounded-full text-[16px] font-semibold transition-all ${mode === item ? 'bg-white text-[#222222] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-[#222222] hover:bg-white/40'}`}>
            {item === 'dates' ? 'Dates' : 'Flexible'}
          </button>
        ))}
      </div>

      {mode === 'dates' ? (
        <>
          <div className={`grid items-start gap-7 ${isMobileSheet ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 md:gap-12'}`}>
            <div className="relative">
              <button type="button" aria-label="Previous month" disabled={monthOffset === 0} onClick={() => setMonthOffset((value) => Math.max(0, value - 1))} className="absolute -left-1 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#222222] hover:bg-slate-100 disabled:opacity-20"><ChevronLeft size={21} /></button>
              {renderMonth(left)}
            </div>
            {!isMobileSheet && (
              <div className="relative md:border-l md:border-[#EBEBEB] md:pl-8">
                <button type="button" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)} className="absolute -right-1 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#222222] hover:bg-slate-100"><ChevronRight size={21} /></button>
                {renderMonth(right)}
              </div>
            )}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-[#EBEBEB] pt-5">
            {chips.map((chip) => <button key={chip} type="button" onClick={() => setFlexibility(chip)} className={`rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors ${flexibility === chip ? 'border-[#222222] text-[#222222]' : 'border-[#DDDDDD] text-[#484848] hover:border-[#222222]'}`}>{chip}</button>)}
            {checkInDate && <button type="button" onClick={onClear} className="ml-auto text-sm font-medium text-[#484848] underline underline-offset-2">Clear dates</button>}
          </div>
        </>
      ) : (
        <div className="flex min-h-[310px] flex-col items-center justify-center px-4 text-center">
          <h3 className="text-[21px] font-semibold text-[#222222]">How flexible are your dates?</h3>
          <p className="mt-2 max-w-md text-[15px] leading-6 text-[#717171]">Choose how much your travel dates can vary to explore more available stays.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {chips.slice(1).map((chip) => <button key={chip} type="button" onClick={() => setFlexibility(chip)} className={`rounded-full border px-5 py-3 text-sm font-medium ${flexibility === chip ? 'border-[#222222] bg-[#F7F7F7]' : 'border-[#DDDDDD] hover:border-[#222222]'}`}>{chip}</button>)}
          </div>
          <p className="mt-5 text-xs text-[#717171]">Date flexibility: {flexibility}</p>
        </div>
      )}
    </section>
  );
};
