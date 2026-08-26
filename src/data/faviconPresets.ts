import { FaviconPreset, PlatformSystemSettings } from '../types';

export const DEFAULT_SITE_TITLE = "qaaga.com is Bangladesh's verified multi-service super marketplace";
export const DEFAULT_SITE_NAME = "qaaga.com";
export const DEFAULT_SITE_TAGLINE = "Bangladesh's verified multi-service super marketplace";
export const DEFAULT_SITE_DESCRIPTION = "QAAGA is Bangladesh's 1st verified multi-service super marketplace for on-demand services, home care, certified doctors, luxury hotels, authentic products, eBooks, and verified jobs.";

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const FAVICON_PRESETS: FaviconPreset[] = [
  {
    id: 'qaaga-purple-q',
    name: 'QAAGA Super Q (Official Brand)',
    nameBangla: 'অফিসিয়াল পার্পল সুপার কিউ (QAAGA Monogram)',
    category: 'official',
    previewColor: '#7c3aed',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="qg_official" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7c3aed"/>
            <stop offset="50%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#qg_official)"/>
        <circle cx="32" cy="28" r="14" fill="none" stroke="#ffffff" stroke-width="6"/>
        <path d="M37 34 L48 45" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <circle cx="48" cy="16" r="4.5" fill="#facc15"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-shield-gold',
    name: 'Verified Gold Shield',
    nameBangla: 'ভেরিফাইড গোল্ড শিল্ড (নিরাপদ ট্রাস্ট ব্যাজ)',
    category: 'gold',
    previewColor: '#f59e0b',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="sg_gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#090d16"/>
        <path d="M32 10 L48 18 V31 C48 42 41 50 32 54 C23 50 16 42 16 31 V18 Z" fill="url(#sg_gold)"/>
        <path d="M25 31 L30 36 L39 25" stroke="#090d16" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-rose-super',
    name: 'Rose Crimson Super Badge',
    nameBangla: 'রোজ ক্রিমসন মার্কেটপ্লেস ব্যাজ',
    category: 'rose',
    previewColor: '#f43f5e',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="rg_rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#be185d"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#rg_rose)"/>
        <text x="32" y="44" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="#ffffff">Q</text>
        <polygon points="46,12 48,18 54,18 49,22 51,28 46,24 41,28 43,22 38,18 44,18" fill="#facc15"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-emerald-health',
    name: 'Emerald Health & Care',
    nameBangla: 'এমারেল্ড হেলথ ও নার্সিং হাব',
    category: 'emerald',
    previewColor: '#10b981',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="eg_green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981"/>
            <stop offset="100%" stop-color="#047857"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#eg_green)"/>
        <circle cx="32" cy="32" r="16" fill="#ffffff"/>
        <path d="M32 22 V42 M22 32 H42" stroke="#047857" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-cute-cat',
    name: 'Cute Kitty Cat AI Hub',
    nameBangla: 'কিউট কিটি ক্যাট এআই (Mew Mew)',
    category: 'cat',
    previewColor: '#f59e0b',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="16" fill="#f59e0b"/>
        <polygon points="18,14 28,28 14,28" fill="#d97706"/>
        <polygon points="46,14 50,28 36,28" fill="#d97706"/>
        <circle cx="32" cy="38" r="18" fill="#ffffff"/>
        <circle cx="26" cy="36" r="3" fill="#1e293b"/>
        <circle cx="38" cy="36" r="3" fill="#1e293b"/>
        <polygon points="32,41 29,44 35,44" fill="#f43f5e"/>
        <path d="M29 45 Q32 48 35 45" stroke="#1e293b" stroke-width="2" fill="none"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-cyan-tech',
    name: 'Cyan Electric On-Demand Hub',
    nameBangla: 'ইলেকট্রিক সায়ান টেকনোলজি হাব',
    category: 'cyan',
    previewColor: '#06b6d4',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="cg_cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#0f172a"/>
        <circle cx="32" cy="28" r="14" fill="none" stroke="url(#cg_cyan)" stroke-width="6"/>
        <path d="M37 34 L48 45" stroke="url(#cg_cyan)" stroke-width="6" stroke-linecap="round"/>
        <circle cx="32" cy="28" r="4.5" fill="#38bdf8"/>
      </svg>
    `)
  },
  {
    id: 'qaaga-minimal-black',
    name: 'Obsidian Minimalist Q',
    nameBangla: 'অবসিডিয়ান ব্ল্যাক মিনিমালিস্ট কিউ',
    category: 'minimal',
    previewColor: '#0f172a',
    svgDataUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="16" fill="#020617"/>
        <circle cx="32" cy="28" r="14" fill="none" stroke="#f8fafc" stroke-width="5.5"/>
        <path d="M38 34 L47 45" stroke="#f8fafc" stroke-width="5.5" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="3.5" fill="#38bdf8"/>
      </svg>
    `)
  }
];

/**
 * Returns the active favicon URI based on system settings
 */
export function getActiveFaviconHref(settings?: Partial<PlatformSystemSettings>): string {
  if (!settings) {
    return FAVICON_PRESETS[0].svgDataUri;
  }

  if (settings.faviconType === 'custom_upload' && settings.customFaviconUpload) {
    return settings.customFaviconUpload;
  }

  if (settings.faviconType === 'custom_url' && settings.faviconUrl) {
    return settings.faviconUrl;
  }

  if (settings.faviconPresetId) {
    const matched = FAVICON_PRESETS.find((p) => p.id === settings.faviconPresetId);
    if (matched) return matched.svgDataUri;
  }

  if (settings.faviconUrl) {
    return settings.faviconUrl;
  }

  return FAVICON_PRESETS[0].svgDataUri;
}

/**
 * Synchronously applies favicon and browser document.title in DOM
 */
export function applyFaviconAndTitle(settings: PlatformSystemSettings): void {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  const title = (settings.siteTitle && settings.siteTitle.trim().length > 0)
    ? settings.siteTitle.trim()
    : DEFAULT_SITE_TITLE;
  document.title = title;

  // 2. Update Favicon
  const href = getActiveFaviconHref(settings);
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0]?.appendChild(link);
  }
  
  link.type = href.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/x-icon';
  link.href = href;

  // 3. Update Meta Description
  const metaDesc = document.querySelector("meta[name='description']");
  if (metaDesc) {
    metaDesc.setAttribute('content', settings.siteDescription || DEFAULT_SITE_DESCRIPTION);
  }

  // 4. Update OpenGraph Title
  const ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }
}
