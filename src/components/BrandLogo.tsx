'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_SITE_LOGO_URL, LogoSizePreset, SiteBranding } from '@/data/listings';

const HEADER_SIZE_CLASSES: Record<LogoSizePreset, string> = {
  sm: 'h-10 sm:h-11 max-w-[175px]',
  md: 'h-12 sm:h-[58px] max-w-[225px]',
  lg: 'h-14 sm:h-[68px] max-w-[265px]',
  xl: 'h-16 sm:h-20 max-w-[305px]',
};

const FOOTER_SIZE_CLASSES: Record<LogoSizePreset, string> = {
  sm: 'h-8 max-w-[140px]',
  md: 'h-11 max-w-[190px]',
  lg: 'h-13 max-w-[225px]',
  xl: 'h-15 max-w-[255px]',
};

interface BrandLogoProps {
  branding: SiteBranding;
  variant?: 'header' | 'footer';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  branding,
  variant = 'header',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [branding.logoUrl]);

  const hasValidLogo = Boolean(branding.logoUrl) && !imgFailed;
  const isDefaultScreenshotAsset = branding.logoUrl === DEFAULT_SITE_LOGO_URL;

  if (hasValidLogo && branding.logoUrl) {
    const sizeClasses =
      variant === 'header'
        ? HEADER_SIZE_CLASSES[branding.size]
        : FOOTER_SIZE_CLASSES[branding.size];

    return (
      <img
        src={branding.logoUrl}
        alt={branding.altText || 'qaaga.com'}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${sizeClasses} w-auto object-contain object-left select-none transition-all ${
          branding.blendMultiply
            ? 'mix-blend-multiply brightness-[1.02] contrast-[1.04]'
            : ''
        } ${isDefaultScreenshotAsset ? '-ml-2 sm:-ml-2.5' : ''}`}
      />
    );
  }

  if (!branding.showTextWhenRemoved) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-400">
        No logo
      </span>
    );
  }

  if (variant === 'footer') {
    return (
      <span className="inline-flex items-baseline leading-none whitespace-nowrap">
        <span className="text-xl font-bold tracking-[-0.03em] text-[#C72B62]">
          {branding.fallbackText || 'qaaga'}
        </span>
        {branding.fallbackDomain && (
          <span className="text-xs font-bold text-[#C72B62] ml-0.5">
            {branding.fallbackDomain}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline leading-none whitespace-nowrap">
      <span className="text-[27px] sm:text-[28px] font-bold tracking-[-0.035em] text-[#C72B62]">
        {branding.fallbackText || 'qaaga'}
      </span>
      {branding.fallbackDomain && (
        <span className="text-[15.5px] sm:text-[16px] font-bold tracking-[-0.02em] text-[#C72B62] ml-0.5">
          {branding.fallbackDomain}
        </span>
      )}
    </span>
  );
};
