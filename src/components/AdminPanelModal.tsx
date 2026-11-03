'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  Crop,
  Eraser,
  ExternalLink,
  ImagePlus,
  LayoutGrid,
  Pencil,
  RotateCcw,
  Shield,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  DEFAULT_BRANDING,
  DEFAULT_SITE_LOGO_URL,
  LogoSizePreset,
  QaagaListing,
  SiteBranding,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';
import { ListingImage } from './ListingCard';

interface AdminPanelProps {
  branding: SiteBranding;
  onUpdateBranding: (next: SiteBranding, toastMsg?: string) => Promise<void> | void;
  onRemoveLogo: () => Promise<void> | void;
  onRestoreDefaultLogo: () => Promise<void> | void;
  allListings?: QaagaListing[];
  customListings?: QaagaListing[];
  onDeleteCustomListing?: (id: string) => void;
  onOpenHostModal?: () => void;
  bookings?: BookingRecord[];
  onCancelBooking?: (id: string) => void;
  standalone?: boolean;
  onClose?: () => void;
}

const SIZE_OPTIONS: { id: LogoSizePreset; label: string; hint: string }[] = [
  { id: 'sm', label: 'Small', hint: '36–40px' },
  { id: 'md', label: 'Default', hint: '44–52px' },
  { id: 'lg', label: 'Large', hint: '52–64px' },
  { id: 'xl', label: 'Extra Large', hint: '60–74px' },
];

function readImageFileOptimized(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 500;
        let targetW = img.naturalWidth || img.width;
        let targetH = img.naturalHeight || img.height;
        if (targetW > maxWidth || targetH > maxHeight) {
          const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
          targetW = Math.max(1, Math.round(targetW * ratio));
          targetH = Math.max(1, Math.round(targetH * ratio));
        }
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function processLogoCanvas(
  sourceUrl: string,
  mode: 'trim' | 'transparent-bg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const { data } = imageData;

      if (mode === 'transparent-bg') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r >= 242 && g >= 242 && b >= 242) {
            data[i + 3] = 0;
          } else if (r >= 228 && g >= 228 && b >= 228) {
            const lightness = (r + g + b) / 3;
            const factor = Math.max(0, (245 - lightness) / 17);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // Auto-trim empty / near-white outer margin
      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          const isContent = a > 20 && !(r > 243 && g > 243 && b > 243);
          if (isContent) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX <= minX || maxY <= minY) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      const pad = Math.round(Math.max(w, h) * 0.02);
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(w - cropX, maxX - minX + pad * 2);
      const cropH = Math.min(h - cropY, maxY - minY + pad * 2);

      const out = document.createElement('canvas');
      out.width = cropW;
      out.height = cropH;
      const outCtx = out.getContext('2d');
      if (!outCtx) {
        resolve(canvas.toDataURL('image/png'));
        return;
      }
      outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      resolve(out.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not load logo image for editing'));
    img.src = sourceUrl;
  });
}

export const AdminPanelModal: React.FC<AdminPanelProps> = ({
  branding,
  onUpdateBranding,
  onRemoveLogo,
  onRestoreDefaultLogo,
  allListings = [],
  customListings = [],
  onDeleteCustomListing,
  onOpenHostModal,
  bookings = [],
  onCancelBooking,
  standalone = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'listings' | 'bookings'>(
    'branding'
  );
  const [urlInput, setUrlInput] = useState<string>(branding.logoUrl || '');
  const [altText, setAltText] = useState<string>(branding.altText);
  const [fallbackText, setFallbackText] = useState<string>(branding.fallbackText);
  const [fallbackDomain, setFallbackDomain] = useState<string>(branding.fallbackDomain);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUrlInput(branding.logoUrl?.startsWith('data:') ? '' : branding.logoUrl || '');
    setAltText(branding.altText);
    setFallbackText(branding.fallbackText);
    setFallbackDomain(branding.fallbackDomain);
  }, [branding]);

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flashBanner('Please select a valid PNG, JPG, WEBP, or SVG image file.');
      return;
    }
    setIsProcessing(true);
    try {
      const optimizedDataUrl = await readImageFileOptimized(file);
      await onUpdateBranding(
        {
          ...branding,
          logoUrl: optimizedDataUrl,
          updatedAt: new Date().toISOString(),
        },
        `Uploaded new logo "${file.name}"`
      );
      flashBanner(`Logo "${file.name}" uploaded and applied live!`);
    } catch {
      flashBanner('Could not process that image file. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCanvasEdit = async (mode: 'trim' | 'transparent-bg') => {
    if (!branding.logoUrl) return;
    setIsProcessing(true);
    try {
      const editedDataUrl = await processLogoCanvas(branding.logoUrl, mode);
      await onUpdateBranding(
        {
          ...branding,
          logoUrl: editedDataUrl,
          blendMultiply: mode === 'transparent-bg' ? false : branding.blendMultiply,
          updatedAt: new Date().toISOString(),
        },
        mode === 'trim'
          ? 'Cropped excess logo whitespace'
          : 'Removed white background from logo'
      );
      flashBanner(
        mode === 'trim'
          ? 'Auto-cropped logo margins and saved live!'
          : 'Converted white background to transparent PNG!'
      );
    } catch {
      flashBanner('Unable to edit remote image due to browser CORS restrictions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    await onUpdateBranding(
      {
        ...branding,
        logoUrl: trimmed,
        updatedAt: new Date().toISOString(),
      },
      'Updated logo image URL'
    );
    flashBanner('Custom logo URL applied live!');
  };

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateBranding(
      {
        ...branding,
        altText: altText.trim() || 'qaaga.com',
        fallbackText: fallbackText.trim() || 'qaaga',
        fallbackDomain: fallbackDomain.trim(),
        updatedAt: new Date().toISOString(),
      },
      'Saved brand text & edit settings'
    );
    flashBanner('Brand settings saved!');
  };

  const panelCard = (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`bg-white border border-slate-200 w-full ${
        standalone
          ? 'max-w-5xl mx-auto rounded-3xl shadow-sm my-6'
          : 'max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden'
      }`}
    >
      {/* Top Admin Header */}
      <div className="px-5 sm:px-7 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#C72B62] text-white flex items-center justify-center shrink-0">
            <Shield size={20} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-950">
              qaaga.com Admin Panel
            </h2>
            <p className="text-xs text-slate-500">
              Logo Upload, Edit & Remove · Site Branding & Marketplace Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {standalone ? (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </a>
          ) : (
            <>
              <a
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-300 hover:border-slate-900 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Open /admin</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                aria-label="Close admin panel"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="px-5 sm:px-7 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'branding'
              ? 'border-[#C72B62] text-[#C72B62]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImagePlus size={16} />
          <span>Logo & Branding</span>
        </button>

        {allListings.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Listings ({allListings.length})</span>
          </button>
        )}

        {bookings.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#C72B62] text-[#C72B62]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 size={16} />
            <span>Reservations ({bookings.length})</span>
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
        {statusBanner && (
          <div
            role="status"
            className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2"
          >
            <span className="inline-flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>{statusBanner}</span>
            </span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 1: LOGO UPLOAD, EDIT & REMOVE                               */}
        {/* =============================================================== */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Live Website Header Preview */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Live Header Logo Preview</span>
                <span className="text-slate-500">
                  {branding.logoUrl
                    ? branding.logoUrl === DEFAULT_SITE_LOGO_URL
                      ? 'Active: Official qaaga.com Logo'
                      : 'Active: Custom Uploaded / Edited Logo'
                    : 'Logo Removed (No Image Active)'}
                </span>
              </div>

              <div className="p-5 bg-white flex flex-wrap items-center justify-between gap-4">
                <div className="min-h-[52px] flex items-center">
                  <BrandLogo branding={branding} variant="header" />
                </div>

                <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-400 select-none">
                  <span className="text-slate-900 border-b-2 border-slate-900 pb-1">
                    All
                  </span>
                  <span>Stay</span>
                  <span>Experiences</span>
                  <span>Services</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Hidden file input shared by Upload & Edit buttons */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>{branding.logoUrl ? 'Change / Upload' : 'Upload Logo'}</span>
                  </button>

                  {branding.logoUrl && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={async () => {
                        await onRemoveLogo();
                        flashBanner('Logo removed from header & footer!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>Remove Logo</span>
                    </button>
                  )}

                  {branding.logoUrl !== DEFAULT_SITE_LOGO_URL && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={async () => {
                        await onRestoreDefaultLogo();
                        flashBanner('Restored official qaaga.com logo!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-900 bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Restore Default</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Two-Column Controls: Left = Upload & Image Edit, Right = Size & Fallback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: UPLOAD DROPZONE + IMAGE EDITING */}
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-[#C72B62] bg-[#C72B62]/[0.05]'
                      : 'border-slate-300 hover:border-[#C72B62] bg-slate-50/50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#C72B62]/10 text-[#C72B62] flex items-center justify-center mx-auto mb-2.5">
                    <ImagePlus size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Click to upload new logo or drag & drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, SVG, WEBP, or JPG · Instant live update
                  </p>
                </div>

                {/* Edit Active Logo Tools */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Pencil size={14} className="text-[#C72B62]" />
                      <span>Edit Active Logo</span>
                    </p>
                    {isProcessing && (
                      <span className="text-[11px] font-semibold text-[#C72B62]">
                        Processing...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={!branding.logoUrl || isProcessing}
                      onClick={() => handleCanvasEdit('trim')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:border-[#C72B62] hover:text-[#C72B62] text-xs font-semibold text-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <Crop size={14} />
                      <span>Auto-Crop Margin</span>
                    </button>

                    <button
                      type="button"
                      disabled={!branding.logoUrl || isProcessing}
                      onClick={() => handleCanvasEdit('transparent-bg')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:border-[#C72B62] hover:text-[#C72B62] text-xs font-semibold text-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <Eraser size={14} />
                      <span>Transparent BG</span>
                    </button>
                  </div>

                  {/* Direct Logo URL Edit */}
                  <form onSubmit={handleApplyUrl} className="space-y-1.5 pt-1">
                    <label
                      htmlFor="admin-logo-url"
                      className="block text-[11px] font-semibold text-slate-600"
                    >
                      Or edit / paste Logo Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="admin-logo-url"
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="/assets/aistudio/Screenshot_2026-11-04_at_2.55.29_AM_bd5ef49c.png"
                        className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Apply URL
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT: DISPLAY SIZE, BLEND & FALLBACK BRAND SETTINGS */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3.5">
                  <p className="text-xs font-bold text-slate-900">Logo Display Size</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map((opt) => {
                      const active = branding.size === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            onUpdateBranding(
                              {
                                ...branding,
                                size: opt.id,
                                updatedAt: new Date().toISOString(),
                              },
                              `Logo size set to ${opt.label}`
                            )
                          }
                          className={`py-2 px-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#C72B62] bg-[#C72B62]/[0.07] text-[#C72B62]'
                              : 'border-slate-200 hover:border-slate-400 text-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-bold">{opt.label}</span>
                          <span className="block text-[10px] text-slate-500">
                            {opt.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Seamless White-Background Blend
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Blends white screenshot backgrounds smoothly into header
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      aria-label="Seamless White-Background Blend"
                      checked={branding.blendMultiply}
                      onChange={(e) =>
                        onUpdateBranding({
                          ...branding,
                          blendMultiply: e.target.checked,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="w-4 h-4 accent-[#C72B62] cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Show text fallback when logo is removed
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Displays text wordmark if image logo is removed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      aria-label="Show text fallback when logo is removed"
                      checked={branding.showTextWhenRemoved}
                      onChange={(e) =>
                        onUpdateBranding({
                          ...branding,
                          showTextWhenRemoved: e.target.checked,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="w-4 h-4 accent-[#C72B62] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Brand Alt & Fallback Text Form */}
                <form
                  onSubmit={handleSaveTextSettings}
                  className="p-4 rounded-2xl border border-slate-200 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-900">
                    Brand Alt Text & Fallback Wordmark
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={fallbackText}
                        onChange={(e) => setFallbackText(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Extension
                      </label>
                      <input
                        type="text"
                        value={fallbackDomain}
                        onChange={(e) => setFallbackDomain(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Save Brand Details
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: MANAGE LISTINGS                                          */}
        {/* =============================================================== */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Marketplace Listings ({allListings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {customListings.length} custom host listings ·{' '}
                  {allListings.length - customListings.length} verified KL catalog listings
                </p>
              </div>
              {onOpenHostModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onOpenHostModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer"
                >
                  + Add New Listing
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              {allListings.map((item) => {
                const isCustom = customListings.some((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ListingImage
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.area} · {item.category} · ${item.twoNightPriceUsd} / 2 nights
                        </p>
                      </div>
                    </div>

                    {isCustom && onDeleteCustomListing ? (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomListing(item.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        Core catalog
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: RESERVATIONS OVERVIEW                                    */}
        {/* =============================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Confirmed Guest Reservations ({bookings.length})
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-3.5 flex items-center justify-between gap-3 bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ListingImage
                      src={bk.image}
                      alt={bk.title}
                      className="w-12 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {bk.title} · <span className="font-mono">{bk.confirmationCode}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {bk.checkInLabel} · {bk.nights} nights · ${bk.totalUsd}
                      </p>
                    </div>
                  </div>
                  {onCancelBooking && (
                    <button
                      type="button"
                      onClick={() => onCancelBooking(bk.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-rose-400 hover:text-rose-600 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        {panelCard}
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
    >
      {panelCard}
    </div>
  );
};

export { DEFAULT_BRANDING };
