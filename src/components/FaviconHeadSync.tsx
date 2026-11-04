'use client';

import { useEffect } from 'react';
import { SiteBranding } from '@/data/listings';
import {
  loadBestClientBranding,
  reconcileBrandingOnLoad,
} from '@/lib/brandingStorage.client';

const BLANK_TRANSPARENT_ICON =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function buildCrispSquareFavicon(src: string): Promise<string> {
  return new Promise((resolve) => {
    if (!src || src.startsWith('data:image/svg+xml') || src.endsWith('.svg')) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        const w = img.naturalWidth || img.width || size;
        const h = img.naturalHeight || img.height || size;

        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = w;
        srcCanvas.height = h;
        const srcCtx = srcCanvas.getContext('2d');
        if (!srcCtx) {
          resolve(src);
          return;
        }
        srcCtx.drawImage(img, 0, 0, w, h);
        const imgData = srcCtx.getImageData(0, 0, w, h);
        const { data } = imgData;

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (r >= 242 && g >= 242 && b >= 242) {
              data[i + 3] = 0;
            } else if (r >= 226 && g >= 226 && b >= 226) {
              const lightness = (r + g + b) / 3;
              const factor = Math.max(0, (244 - lightness) / 18);
              data[i + 3] = Math.round(a * factor);
            }

            if (data[i + 3] > 20) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        srcCtx.putImageData(imgData, 0, 0);

        const contentW = maxX >= minX ? maxX - minX + 1 : w;
        const contentH = maxY >= minY ? maxY - minY + 1 : h;
        const sx = maxX >= minX ? minX : 0;
        const sy = maxY >= minY ? minY : 0;

        const pad = 4;
        const avail = size - pad * 2;
        const scale = Math.min(avail / contentW, avail / contentH);
        const drawW = Math.round(contentW * scale);
        const drawH = Math.round(contentH * scale);
        const dx = Math.round((size - drawW) / 2);
        const dy = Math.round((size - drawH) / 2);

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(srcCanvas, sx, sy, contentW, contentH, dx, dy, drawW, drawH);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

function applyFaviconHref(href: string, activeState: 'active' | 'removed') {
  if (typeof document === 'undefined') return;
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];

  rels.forEach((rel) => {
    const existingAll = document.head.querySelectorAll<HTMLLinkElement>(
      `link[rel="${rel}"]`
    );
    if (existingAll.length === 0) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.dataset.qaagaFaviconState = activeState;
      document.head.appendChild(link);
    } else {
      existingAll.forEach((link, idx) => {
        if (idx === 0) {
          link.href = href;
          link.dataset.qaagaFaviconState = activeState;
        } else {
          link.remove();
        }
      });
    }
  });
}

export function FaviconHeadSync({
  initialBranding,
}: {
  initialBranding?: SiteBranding;
}) {
  useEffect(() => {
    let cancelled = false;

    const syncFavicon = async (faviconUrl: string | null | undefined) => {
      if (cancelled) return;
      if (!faviconUrl) {
        applyFaviconHref(BLANK_TRANSPARENT_ICON, 'removed');
        return;
      }
      const optimizedHref = await buildCrispSquareFavicon(faviconUrl);
      if (!cancelled) {
        applyFaviconHref(optimizedHref, 'active');
      }
    };

    reconcileBrandingOnLoad(initialBranding).then((resolved) => {
      if (!cancelled) {
        syncFavicon(resolved.faviconUrl);
      }
    });

    const onBrandingUpdated = (evt: Event) => {
      const custom = evt as CustomEvent<SiteBranding | undefined>;
      if (custom?.detail) {
        syncFavicon(custom.detail.faviconUrl);
      } else {
        loadBestClientBranding().then((best) => {
          if (best && !cancelled) {
            syncFavicon(best.faviconUrl);
          }
        });
      }
    };

    window.addEventListener('qaaga-branding-updated', onBrandingUpdated);
    window.addEventListener('storage', onBrandingUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('qaaga-branding-updated', onBrandingUpdated);
      window.removeEventListener('storage', onBrandingUpdated);
    };
  }, [initialBranding]);

  return null;
}
