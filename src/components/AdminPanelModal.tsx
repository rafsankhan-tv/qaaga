import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Crop,
  Database,
  Eraser,
  ExternalLink,
  Globe,
  ImagePlus,
  LayoutGrid,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  CloudUpload,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  DEFAULT_BRANDING,
  DEFAULT_FAVICON_URL,
  DEFAULT_SITE_LOGO_URL,
  GuestProfile,
  LogoSizePreset,
  QaagaListing,
  SiteBranding,
} from '@/data/listings';
import { BrandLogo } from './BrandLogo';
import { ListingImage } from './ListingCard';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SupabaseTestResult,
} from '@/lib/supabaseClient';
import {
  AdminPlatformStats,
  getAdminPlatformStats,
  getAllUsersFromDatabase,
  updateUserRoleInDatabase,
  uploadBrandingAssetToSupabase,
  saveBrandingToSupabase,
} from '@/lib/supabaseService';

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
        const maxWidth = 720;
        const maxHeight = 260;
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

function readFaviconFileSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read favicon file'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.ico')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        const w = img.naturalWidth || img.width || size;
        const h = img.naturalHeight || img.height || size;
        const scale = Math.min((size - 6) / w, (size - 6) / h);
        const drawW = Math.round(w * scale);
        const drawH = Math.round(h * scale);
        const dx = Math.round((size - drawW) / 2);
        const dy = Math.round((size - drawH) / 2);
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, dx, dy, drawW, drawH);
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

const AdminPanelModalInner: React.FC<AdminPanelProps> = ({
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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'database' | 'branding' | 'listings' | 'bookings'
  >('overview');
  const [users, setUsers] = useState<GuestProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [platformStats, setPlatformStats] = useState<AdminPlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'guest' | 'host' | 'admin'>('all');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const [urlInput, setUrlInput] = useState<string>(branding.logoUrl || '');
  const [faviconUrlInput, setFaviconUrlInput] = useState<string>(
    branding.faviconUrl || ''
  );
  const [altText, setAltText] = useState<string>(branding.altText);
  const [fallbackText, setFallbackText] = useState<string>(branding.fallbackText);
  const [fallbackDomain, setFallbackDomain] = useState<string>(branding.fallbackDomain);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFaviconDragging, setIsFaviconDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const faviconFileInputRef = useRef<HTMLInputElement | null>(null);
  const latestBrandingRef = useRef<SiteBranding>(branding);

  useEffect(() => {
    latestBrandingRef.current = branding;
    setUrlInput(branding.logoUrl?.startsWith('data:') ? '' : branding.logoUrl || '');
    setFaviconUrlInput(
      branding.faviconUrl?.startsWith('data:') ? '' : branding.faviconUrl || ''
    );
    setAltText(branding.altText);
    setFallbackText(branding.fallbackText);
    setFallbackDomain(branding.fallbackDomain);
  }, [branding]);

  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    setLoadingStats(true);

    Promise.all([getAllUsersFromDatabase(), getAdminPlatformStats(), testSupabaseConnection()])
      .then(([dbUsers, stats, conn]) => {
        if (!mounted) return;
        setUsers(dbUsers || []);
        setPlatformStats(stats);
        setTestResult(conn);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingUsers(false);
        setLoadingStats(false);
      });

    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url);
    setSupabaseKey(cfg.key);

    return () => {
      mounted = false;
    };
  }, []);

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
    flashBanner(res.message);
  };

  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    flashBanner('Supabase credentials saved successfully');
    handleTestSupabase();
  };

  const handleChangeUserRole = async (
    email: string,
    nextRole: 'guest' | 'host' | 'admin'
  ) => {
    await updateUserRoleInDatabase(email, nextRole);
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role: nextRole } : u))
    );
    flashBanner(`Updated ${email} role to ${nextRole}`);
  };

  const handleToggleUserStatus = async (email: string) => {
    const user = users.find((u) => u.email === email);
    const nextStatus = user?.status === 'suspended' ? 'active' : 'suspended';
    await updateUserRoleInDatabase(email, user?.role || 'guest', nextStatus);
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, status: nextStatus } : u))
    );
    flashBanner(`User ${email} status changed to ${nextStatus}`);
  };

  const commitBrandingPatch = async (
    patch: Partial<SiteBranding>,
    toastMsg?: string
  ) => {
    const merged: SiteBranding = {
      ...latestBrandingRef.current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    latestBrandingRef.current = merged;
    await onUpdateBranding(merged, toastMsg);
  };

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flashBanner('Please select a valid PNG, JPG, WEBP, or SVG image file.');
      return;
    }
    setIsProcessing(true);
    setProcessingMessage('Uploading Logo to Supabase...');
    try {
      // Step 1: Upload to Supabase Storage or read image
      const sbResult = await uploadBrandingAssetToSupabase(file, 'logo');
      let finalLogoUrl = sbResult.url;

      // Fallback to high-quality optimized image reader if Supabase Storage is offline/not provisioned
      if (sbResult.storageType !== 'supabase-storage' || !finalLogoUrl) {
        finalLogoUrl = await readImageFileOptimized(file);
      }

      // Step 2: Commit branding update locally and to server
      await commitBrandingPatch(
        { logoUrl: finalLogoUrl },
        `Logo "${file.name}" saved to Supabase & active`
      );

      // Step 3: Explicitly sync to Supabase database table
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        logoUrl: finalLogoUrl,
      });

      flashBanner(
        sbResult.storageType === 'supabase-storage'
          ? `Logo "${file.name}" uploaded to Supabase Storage & synced!`
          : `Logo "${file.name}" uploaded & saved to Supabase permanently!`
      );
    } catch {
      flashBanner('Could not process that image file. Please try another file.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCanvasEdit = async (mode: 'trim' | 'transparent-bg') => {
    const activeLogo = latestBrandingRef.current.logoUrl;
    if (!activeLogo) return;
    setIsProcessing(true);
    setProcessingMessage('Processing & saving logo...');
    try {
      const editedDataUrl = await processLogoCanvas(activeLogo, mode);
      await commitBrandingPatch(
        {
          logoUrl: editedDataUrl,
          blendMultiply:
            mode === 'transparent-bg'
              ? false
              : latestBrandingRef.current.blendMultiply,
        },
        mode === 'trim'
          ? 'Cropped excess logo whitespace permanently'
          : 'Removed white background permanently'
      );
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        logoUrl: editedDataUrl,
      });
      flashBanner(
        mode === 'trim'
          ? 'Auto-cropped logo margins and saved to Supabase!'
          : 'Converted white background to transparent PNG & saved to Supabase!'
      );
    } catch {
      flashBanner('Unable to edit remote image due to browser CORS restrictions.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
    }
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsProcessing(true);
    try {
      await commitBrandingPatch({ logoUrl: trimmed }, 'Updated logo image URL');
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        logoUrl: trimmed,
      });
      flashBanner('Custom logo URL saved to Supabase permanently!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await commitBrandingPatch(
      {
        altText: altText.trim() || 'qaaga.com',
        fallbackText: fallbackText.trim() || 'qaaga',
        fallbackDomain: fallbackDomain.trim(),
      },
      'Saved brand text & edit settings'
    );
    await saveBrandingToSupabase({
      ...latestBrandingRef.current,
      altText: altText.trim() || 'qaaga.com',
      fallbackText: fallbackText.trim() || 'qaaga',
      fallbackDomain: fallbackDomain.trim(),
    });
    flashBanner('Brand settings saved to Supabase permanently!');
  };

  const handleFaviconFileUpload = async (file?: File | null) => {
    if (!file) return;
    const isIconFile =
      file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.ico');
    if (!isIconFile) {
      flashBanner('Please select a valid PNG, ICO, SVG, WEBP, or JPG favicon file.');
      return;
    }
    setIsProcessing(true);
    setProcessingMessage('Uploading Favicon to Supabase...');
    try {
      const squareDataUrl = await readFaviconFileSquare(file);
      const sbResult = await uploadBrandingAssetToSupabase(file, 'favicon');
      const finalFaviconUrl =
        sbResult.storageType === 'supabase-storage' && sbResult.url
          ? sbResult.url
          : squareDataUrl;

      await commitBrandingPatch(
        { faviconUrl: finalFaviconUrl },
        `Favicon "${file.name}" saved to Supabase & active`
      );

      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        faviconUrl: finalFaviconUrl,
      });

      flashBanner(
        sbResult.storageType === 'supabase-storage'
          ? `Favicon "${file.name}" uploaded to Supabase Storage & browser tab updated!`
          : `Favicon "${file.name}" uploaded & saved to Supabase permanently!`
      );
    } catch {
      flashBanner('Could not process that favicon file. Please try another image.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleApplyFaviconUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = faviconUrlInput.trim();
    if (!trimmed) return;
    setIsProcessing(true);
    try {
      await commitBrandingPatch({ faviconUrl: trimmed }, 'Updated site favicon URL');
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        faviconUrl: trimmed,
      });
      flashBanner('Custom favicon URL saved to Supabase permanently!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFaviconClick = async () => {
    setIsProcessing(true);
    try {
      await commitBrandingPatch(
        { faviconUrl: null },
        'Favicon removed permanently'
      );
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        faviconUrl: null,
      });
      flashBanner('Favicon removed & synced to Supabase!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreFaviconClick = async () => {
    setIsProcessing(true);
    try {
      await commitBrandingPatch(
        { faviconUrl: DEFAULT_FAVICON_URL },
        'Restored official qaaga.com favicon'
      );
      await saveBrandingToSupabase({
        ...latestBrandingRef.current,
        faviconUrl: DEFAULT_FAVICON_URL,
      });
      flashBanner('Restored official qaaga.com Q-pin favicon & synced to Supabase!');
    } finally {
      setIsProcessing(false);
    }
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
              Logo & Favicon Upload, Edit & Remove · Site Branding Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {standalone ? (
            <Link
              href="/"
              prefetch={true}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </Link>
          ) : (
            <>
              <Link
                href="/admin"
                prefetch={true}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-300 hover:border-slate-900 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Open /admin</span>
                <ExternalLink size={12} />
              </Link>
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
          onClick={() => setActiveTab('overview')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#C72B62] text-[#C72B62]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#C72B62] text-[#C72B62]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>Users ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'database'
              ? 'border-[#C72B62] text-[#C72B62]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database size={16} />
          <span>Supabase & DB</span>
          {testResult?.connected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

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
        {/* TAB: OVERVIEW & SYSTEM KPIS                                     */}
        {/* =============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Platform Revenue</span>
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp size={16} />
                  </span>
                </div>
                {loadingStats ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-7 w-24 rounded-md qaaga-skeleton" />
                    <div className="h-3 w-28 rounded-md qaaga-skeleton" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      ${platformStats
                        ? platformStats.totalGrossRevenueUsd
                        : bookings
                            .filter((b) => b.status !== 'Cancelled' && b.status !== 'Rejected')
                            .reduce((sum, b) => sum + (b.totalUsd || 0), 0)}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">
                      {platformStats?.confirmedBookings ??
                        bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Accepted').length}{' '}
                      confirmed bookings
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
                  <span className="p-2 rounded-xl bg-[#C72B62]/10 text-[#C72B62]">
                    <CalendarCheck2 size={16} />
                  </span>
                </div>
                {loadingStats ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-7 w-16 rounded-md qaaga-skeleton" />
                    <div className="h-3 w-28 rounded-md qaaga-skeleton" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      {platformStats ? platformStats.totalBookings : bookings.length}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      {platformStats?.pendingBookings ??
                        bookings.filter((b) => b.status === 'Pending').length}{' '}
                      pending approval
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Properties</span>
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <LayoutGrid size={16} />
                  </span>
                </div>
                {loadingStats ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-7 w-16 rounded-md qaaga-skeleton" />
                    <div className="h-3 w-28 rounded-md qaaga-skeleton" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      {platformStats ? platformStats.totalProperties : allListings.length}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">
                      {platformStats ? platformStats.activeProperties : allListings.length} active ·{' '}
                      {customListings.length} hosted
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Registered Users</span>
                  <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
                    <Users size={16} />
                  </span>
                </div>
                {loadingStats ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-7 w-16 rounded-md qaaga-skeleton" />
                    <div className="h-3 w-28 rounded-md qaaga-skeleton" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      {platformStats ? platformStats.totalUsers : users.length}
                    </p>
                    <p className="text-[11px] text-violet-600 font-medium mt-1">
                      {users.filter((u) => u.role === 'admin').length} Admins ·{' '}
                      {platformStats?.totalHosts ?? users.filter((u) => u.role === 'host').length} Hosts
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Supabase Connection Status Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Supabase Cloud Database & Auth</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                    Production Ready
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Endpoint: {supabaseUrl || 'https://d7m4vohy66qcwyxlspmz.supabase.co'}
                </p>
                <p className="text-xs text-slate-400">
                  Key: <span className="font-mono">{supabaseKey ? `${supabaseKey.slice(0, 20)}...` : 'Configured'}</span>
                  {testResult && ` · ${testResult.message}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                  <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  className="px-3.5 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-xs font-semibold text-white cursor-pointer transition-colors shadow-sm"
                >
                  Configure Supabase
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Management Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer group shadow-2xs hover:shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#C72B62]/10 text-[#C72B62] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Users size={18} />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900">User Management</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View registered users, change roles (Admin, Host, Guest), and monitor verification.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer group shadow-2xs hover:shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <ImagePlus size={18} />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900">Brand & Logo Editor</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize qaaga.com logos, presets, favicon, alt text, and domain fallback.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer group shadow-2xs hover:shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <LayoutGrid size={18} />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900">Listings & Host Studio</h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review published properties, add new stays, edit pricing, or remove listings.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB: USER MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC)         */}
        {/* =============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Registered Members & Profiles ({users.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Manage accounts, promote users to Admin or Host, and control platform access.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C72B62]"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="host">Hosts</option>
                  <option value="guest">Guests</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5">User Profile</th>
                      <th className="p-3.5">Contact & City</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingUsers ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="p-3.5" colSpan={5}>
                            <div className="h-9 w-full rounded-xl qaaga-skeleton" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-slate-500">
                          No registered user profiles returned from Supabase yet.
                        </td>
                      </tr>
                    ) : (
                      users
                        .filter((u) => {
                          const matchesSearch =
                            u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(userSearch.toLowerCase());
                          const matchesRole =
                            userRoleFilter === 'all' || u.role === userRoleFilter;
                          return matchesSearch && matchesRole;
                        })
                        .map((u) => (
                          <tr key={u.email} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.fullName}
                                    width={36}
                                    height={36}
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-[#C72B62] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {u.fullName.charAt(0) || 'U'}
                                  </div>
                                )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                  {u.verified && (
                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            <p className="font-medium text-slate-800">{u.city || 'Kuala Lumpur'}</p>
                            <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-rose-100 text-rose-700'
                                  : u.role === 'host'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role || 'guest'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                u.status === 'suspended'
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'suspended'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              {u.status === 'suspended' ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <select
                                value={u.role || 'guest'}
                                onChange={(e) =>
                                  handleChangeUserRole(u.email, e.target.value as any)
                                }
                                className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 bg-white cursor-pointer"
                              >
                                <option value="guest">Make Guest</option>
                                <option value="host">Make Host</option>
                                <option value="admin">Make Admin</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u.email)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                                  u.status === 'suspended'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-amber-700'
                                }`}
                              >
                                {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB: SUPABASE DATABASE & REALTIME SETTINGS                      */}
        {/* =============================================================== */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Supabase Database & Authentication Configuration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connect your Supabase project URL and API publishable key to persist listings, bookings, and OTP accounts.
                  </p>
                </div>
                {testResult?.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 size={14} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                    <Activity size={14} /> Ready to Connect
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="admin-supabase-url" className="block text-xs font-bold text-slate-800 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    id="admin-supabase-url"
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#C72B62]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found in your Supabase Dashboard under Project Settings → API
                  </p>
                </div>

                <div>
                  <label htmlFor="admin-supabase-key" className="block text-xs font-bold text-slate-800 mb-1">
                    Supabase Publishable Key
                  </label>
                  <input
                    id="admin-supabase-key"
                    type="text"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#C72B62]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Safe to use on client-side. Protects all tables using Row Level Security (RLS).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSupabase}
                  className="px-4 py-2.5 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  Save & Connect Supabase
                </button>
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isTesting ? 'Testing connection...' : 'Test Connection'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium border ${
                    testResult.connected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <p className="font-bold">{testResult.message}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Target: <span className="font-mono">{testResult.url}</span> · Key: <span className="font-mono">{testResult.keyPrefix}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Database Tables & Schema Overview */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Integrated Supabase PostgreSQL Tables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'profiles', records: `${platformStats?.totalUsers ?? users.length} profiles`, desc: 'User accounts, emails, roles, & avatar' },
                  { name: 'listings', records: `${platformStats?.totalProperties ?? allListings.length} stays`, desc: 'Properties, amenities, images, & pricing' },
                  { name: 'bookings', records: `${platformStats?.totalBookings ?? bookings.length} reservations`, desc: 'Guest dates, codes, & payment total' },
                  { name: 'reviews', records: 'Live table', desc: 'Ratings, guest comments, & badges' },
                  { name: 'threads', records: 'Live table', desc: 'Realtime messaging with hosts' },
                  { name: 'site_branding', records: 'Active config', desc: 'Custom logos, alt text, & domain' },
                ].map((tbl) => (
                  <div key={tbl.name} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{tbl.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                        {tbl.records}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{tbl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB: LOGO & FAVICON UPLOAD (SUPABASE CLOUD BRANDING)            */}
        {/* =============================================================== */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Supabase Cloud Status Header Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      Supabase Cloud Branding Engine
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Supabase Storage &amp; Database Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Logo and Favicon files uploaded here are saved directly to Supabase Storage (bucket <code className="text-emerald-300 font-mono text-[11px]">qaaga-branding</code>) and synced to the <code className="text-emerald-300 font-mono text-[11px]">site_branding</code> table.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  View Supabase Config
                </button>
              </div>
            </div>

            {/* Live Website Header Preview */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Live Header Logo Preview</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} />
                    Supabase Connected
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  {branding.logoUrl
                    ? branding.logoUrl === DEFAULT_SITE_LOGO_URL
                      ? 'Active: Official qaaga.com Logo'
                      : 'Active: Custom Logo in Supabase'
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

                <div className="flex items-center gap-2 flex-wrap">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <CloudUpload size={14} />
                    <span>{branding.logoUrl ? 'Upload New Logo (Supabase)' : 'Upload Logo to Supabase'}</span>
                  </button>

                  {branding.logoUrl && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={async () => {
                        await onRemoveLogo();
                        await saveBrandingToSupabase({
                          ...latestBrandingRef.current,
                          logoUrl: null,
                        });
                        flashBanner('Logo removed & synced to Supabase!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}

                  {branding.logoUrl !== DEFAULT_SITE_LOGO_URL && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={async () => {
                        await onRestoreDefaultLogo();
                        await saveBrandingToSupabase({
                          ...latestBrandingRef.current,
                          logoUrl: DEFAULT_SITE_LOGO_URL,
                        });
                        flashBanner('Restored official qaaga.com logo & synced to Supabase!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-900 bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} />
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
                  className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer relative ${
                    isDragging
                      ? 'border-[#C72B62] bg-[#C72B62]/[0.05] scale-[0.99]'
                      : 'border-slate-300 hover:border-[#C72B62] bg-slate-50/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#C72B62]/10 text-[#C72B62] flex items-center justify-center mx-auto mb-3">
                    <CloudUpload size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Upload Website Logo to Supabase
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Drag and drop file here or click to browse
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                    <Database size={11} className="text-emerald-600" />
                    <span>Supports SVG, PNG, WebP, JPG · Instant Supabase Sync</span>
                  </div>

                  {isProcessing && processingMessage?.includes('Logo') && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="text-[#C72B62] animate-spin" />
                      <p className="text-xs font-bold text-slate-800">{processingMessage}</p>
                    </div>
                  )}
                </div>

                {/* Edit Active Logo Tools */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3.5 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Pencil size={14} className="text-[#C72B62]" />
                      <span>Edit &amp; Optimize Logo</span>
                    </p>
                    {isProcessing && (
                      <span className="text-[11px] font-semibold text-[#C72B62]">
                        {processingMessage || 'Processing...'}
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
                      Or paste Direct Logo URL (Supabase CDN or External)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="admin-logo-url"
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://... or /assets/..."
                        className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                      >
                        Save to Supabase
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT: DISPLAY SIZE, BLEND & FALLBACK BRAND SETTINGS */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3.5 bg-white">
                  <p className="text-xs font-bold text-slate-900">Logo Display Size</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map((opt) => {
                      const active = branding.size === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={async () => {
                            await commitBrandingPatch(
                              { size: opt.id },
                              `Logo size set to ${opt.label}`
                            );
                            await saveBrandingToSupabase({
                              ...latestBrandingRef.current,
                              size: opt.id,
                            });
                          }}
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
                      onChange={async (e) => {
                        const nextVal = e.target.checked;
                        await commitBrandingPatch({ blendMultiply: nextVal });
                        await saveBrandingToSupabase({
                          ...latestBrandingRef.current,
                          blendMultiply: nextVal,
                        });
                      }}
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
                      onChange={async (e) => {
                        const nextVal = e.target.checked;
                        await commitBrandingPatch({ showTextWhenRemoved: nextVal });
                        await saveBrandingToSupabase({
                          ...latestBrandingRef.current,
                          showTextWhenRemoved: nextVal,
                        });
                      }}
                      className="w-4 h-4 accent-[#C72B62] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Brand Alt & Fallback Text Form */}
                <form
                  onSubmit={handleSaveTextSettings}
                  className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white"
                >
                  <p className="text-xs font-bold text-slate-900">
                    Brand Alt Text &amp; Fallback Wordmark
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
                    Save Details to Supabase
                  </button>
                </form>
              </div>
            </div>

            {/* ============================================================= */}
            {/* SITE FAVICON (BROWSER TAB ICON) — SUPABASE UPLOAD & PREVIEW   */}
            {/* ============================================================= */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Site Favicon (Browser Tab Icon)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} />
                    Supabase Synced
                  </span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-slate-500 text-[11px]">
                    {branding.faviconUrl
                      ? branding.faviconUrl === DEFAULT_FAVICON_URL
                        ? 'Active: Official qaaga.com Q-Pin Favicon'
                        : 'Active: Custom Favicon in Supabase'
                      : 'Favicon Removed (No Browser Tab Icon)'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={faviconFileInputRef}
                    data-testid="favicon-file-input"
                    type="file"
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp,image/jpeg,.ico"
                    onChange={(e) => handleFaviconFileUpload(e.target.files?.[0])}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => faviconFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C72B62] hover:bg-[#ad2253] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <CloudUpload size={14} />
                    <span>
                      {branding.faviconUrl ? 'Change Favicon (Supabase)' : 'Upload Favicon to Supabase'}
                    </span>
                  </button>

                  {branding.faviconUrl && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleRemoveFaviconClick}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}

                  {branding.faviconUrl !== DEFAULT_FAVICON_URL && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleRestoreFaviconClick}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-900 bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Restore Default</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                {/* Left: Realistic Browser Tab Preview + Icon Badge */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-600">
                    Live Browser Tab Preview Simulation
                  </p>
                  <div className="rounded-2xl bg-slate-200/80 pt-2.5 px-3 pb-0 border border-slate-300/80">
                    <div className="inline-flex items-center gap-2.5 bg-white rounded-t-xl px-3.5 py-2 shadow-2xs max-w-full">
                      {branding.faviconUrl ? (
                        <img
                          src={branding.faviconUrl}
                          alt="Favicon preview"
                          width={16}
                          height={16}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 object-contain mix-blend-multiply shrink-0"
                        />
                      ) : (
                        <Globe size={15} className="text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        QAAGA Super Marketplace
                      </span>
                      <X size={12} className="text-slate-400 shrink-0 ml-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                      {branding.faviconUrl ? (
                        <img
                          src={branding.faviconUrl}
                          alt="Active favicon"
                          width={40}
                          height={40}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight">
                          None
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Automatically square-scaled (64×64) for browser tabs, bookmarks, and mobile home screen shortcuts. Stored permanently in Supabase.
                    </p>
                  </div>
                </div>

                {/* Right: Favicon Drag & Drop + Custom URL */}
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsFaviconDragging(true);
                    }}
                    onDragLeave={() => setIsFaviconDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsFaviconDragging(false);
                      handleFaviconFileUpload(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => faviconFileInputRef.current?.click()}
                    className={`p-4 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer relative ${
                      isFaviconDragging
                        ? 'border-[#C72B62] bg-[#C72B62]/[0.05] scale-[0.99]'
                        : 'border-slate-300 hover:border-[#C72B62] bg-slate-50/60'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#C72B62]/10 text-[#C72B62] flex items-center justify-center mx-auto mb-1.5">
                      <CloudUpload size={18} />
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      Upload Favicon Icon to Supabase (PNG, ICO, SVG, WEBP)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Updates browser tab icon immediately &amp; persists in Supabase Cloud
                    </p>

                    {isProcessing && processingMessage?.includes('Favicon') && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={20} className="text-[#C72B62] animate-spin" />
                        <p className="text-xs font-bold text-slate-800">{processingMessage}</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleApplyFaviconUrl} className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="Favicon image URL"
                      value={faviconUrlInput}
                      onChange={(e) => setFaviconUrlInput(e.target.value)}
                      placeholder="https://... or /assets/..."
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#C72B62]"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      Save Favicon to Supabase
                    </button>
                  </form>
                </div>
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

export const AdminPanelModal = React.memo(AdminPanelModalInner);
export { DEFAULT_BRANDING };
