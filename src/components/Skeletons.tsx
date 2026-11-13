'use client';

import React from 'react';

interface ListingCardSkeletonProps {
  carouselItem?: boolean;
  variant?: 'recent' | 'wishlist' | 'default';
}

export const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({
  carouselItem = false,
  variant = 'default',
}) => {
  let responsiveWidthClass = '';
  if (carouselItem) {
    if (variant === 'recent') {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-36px)/3.25)] min-[540px]:w-[calc((100%-48px)/4.25)] sm:w-[calc((100%-60px)/5.25)] md:w-[calc((100%-80px)/6)] lg:w-[calc((100%-112px)/8)]';
    } else if (variant === 'wishlist') {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-14px)/2)] min-[500px]:w-[calc((100%-28px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)]';
    } else {
      responsiveWidthClass =
        'snap-start shrink-0 w-[calc((100%-14px)/2)] min-[500px]:w-[calc((100%-28px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] xl:w-[calc((100%-80px)/6)] 2xl:w-[calc((100%-100px)/7)]';
    }
  }

  return (
    <div
      aria-hidden="true"
      className={`flex flex-col text-left rounded-[16px] sm:rounded-[20px] ${responsiveWidthClass}`}
    >
      <div className="w-full aspect-[1.05/1] rounded-[16px] sm:rounded-[20px] qaaga-skeleton" />
      <div className="pt-2 sm:pt-2.5 px-0.5 space-y-1.5">
        <div className="h-3.5 w-[78%] rounded-md qaaga-skeleton" />
        <div className="h-3 w-[56%] rounded-md qaaga-skeleton" />
      </div>
    </div>
  );
};

export const CarouselSectionSkeleton: React.FC<{
  titleWidth?: string;
  count?: number;
  variant?: 'recent' | 'wishlist' | 'default';
}> = ({ titleWidth = 'w-48', count = 6, variant = 'wishlist' }) => (
  <section aria-hidden="true" className="space-y-3.5">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className={`h-6 ${titleWidth} rounded-lg qaaga-skeleton`} />
        <div className="h-3.5 w-60 rounded-md qaaga-skeleton" />
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-8 h-8 rounded-full qaaga-skeleton" />
        <div className="w-8 h-8 rounded-full qaaga-skeleton" />
      </div>
    </div>
    <div className="flex gap-3.5 sm:gap-4 overflow-hidden pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} carouselItem={true} variant={variant} />
      ))}
    </div>
  </section>
);

export const SearchGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <section aria-label="Loading properties" className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="h-6 w-52 rounded-lg qaaga-skeleton" />
        <div className="h-3.5 w-72 rounded-md qaaga-skeleton" />
      </div>
      <div className="h-9 w-28 rounded-full qaaga-skeleton" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 gap-x-5 gap-y-7">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

export const DashboardSkeleton: React.FC = () => (
  <div aria-label="Loading dashboard" className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
    {/* Hero Banner Skeleton */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl qaaga-skeleton shrink-0" />
        <div className="space-y-2">
          <div className="h-6 w-56 rounded-lg qaaga-skeleton" />
          <div className="h-3.5 w-72 rounded-md qaaga-skeleton" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-36 rounded-xl qaaga-skeleton" />
        <div className="h-10 w-32 rounded-xl qaaga-skeleton" />
      </div>
    </div>

    {/* Tab Row Skeleton */}
    <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-5 w-28 rounded-md qaaga-skeleton" />
      ))}
    </div>

    {/* Content Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3">
          <div className="w-full aspect-video rounded-2xl qaaga-skeleton" />
          <div className="h-4 w-3/4 rounded-md qaaga-skeleton" />
          <div className="h-3.5 w-1/2 rounded-md qaaga-skeleton" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div aria-label="Loading profile" className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl qaaga-skeleton shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-44 rounded-md qaaga-skeleton" />
        <div className="h-3.5 w-60 rounded-md qaaga-skeleton" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="h-10 rounded-xl qaaga-skeleton" />
      <div className="h-10 rounded-xl qaaga-skeleton" />
      <div className="h-10 rounded-xl qaaga-skeleton" />
      <div className="h-10 rounded-xl qaaga-skeleton" />
    </div>
    <div className="h-24 rounded-xl qaaga-skeleton" />
  </div>
);
