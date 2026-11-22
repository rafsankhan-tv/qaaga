'use client';

import {
  DEFAULT_BRANDING,
  SiteBranding,
  STORAGE_KEYS,
} from '@/data/listings';
import { getBrandingFromSupabase } from './supabaseService';
import { getSupabase } from './supabaseClient';

const IDB_NAME = 'qaaga_permanent_branding_db';
const IDB_STORE = 'site_branding';
const IDB_KEY = 'active_branding';

function normalizeClientBranding(raw: Partial<SiteBranding> | null | undefined): SiteBranding | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    logoUrl:
      raw.logoUrl === null
        ? null
        : typeof raw.logoUrl === 'string' && raw.logoUrl.trim()
        ? raw.logoUrl.trim()
        : DEFAULT_BRANDING.logoUrl,
    faviconUrl:
      raw.faviconUrl === null
        ? null
        : typeof raw.faviconUrl === 'string' && raw.faviconUrl.trim()
        ? raw.faviconUrl.trim()
        : DEFAULT_BRANDING.faviconUrl,
    altText:
      typeof raw.altText === 'string' && raw.altText.trim()
        ? raw.altText.trim()
        : DEFAULT_BRANDING.altText,
    fallbackText:
      typeof raw.fallbackText === 'string'
        ? raw.fallbackText
        : DEFAULT_BRANDING.fallbackText,
    fallbackDomain:
      typeof raw.fallbackDomain === 'string'
        ? raw.fallbackDomain
        : DEFAULT_BRANDING.fallbackDomain,
    showTextWhenRemoved:
      typeof raw.showTextWhenRemoved === 'boolean'
        ? raw.showTextWhenRemoved
        : DEFAULT_BRANDING.showTextWhenRemoved,
    size: raw.size || DEFAULT_BRANDING.size,
    blendMultiply:
      typeof raw.blendMultiply === 'boolean'
        ? raw.blendMultiply
        : DEFAULT_BRANDING.blendMultiply,
    revision:
      typeof raw.revision === 'number' && Number.isFinite(raw.revision)
        ? raw.revision
        : 1,
    updatedAt:
      typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : DEFAULT_BRANDING.updatedAt,
  };
}

function openBrandingDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open error'));
  });
}

async function readIdbBranding(): Promise<SiteBranding | null> {
  try {
    const db = await openBrandingDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(IDB_KEY);
      getReq.onsuccess = () => {
        db.close();
        resolve(normalizeClientBranding(getReq.result));
      };
      getReq.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

async function writeIdbBranding(branding: SiteBranding): Promise<void> {
  try {
    const db = await openBrandingDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(branding, IDB_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {}
}

export function readSyncLocalBranding(): SiteBranding | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.branding);
    if (!raw) return null;
    return normalizeClientBranding(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeSyncLocalBranding(branding: SiteBranding): void {
  try {
    localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(branding));
  } catch {
    // Even if localStorage hits 5MB quota on very large SVG/PNGs, IndexedDB + server store it permanently
  }
}

export async function loadBestClientBranding(): Promise<SiteBranding | null> {
  const syncLocal = readSyncLocalBranding();
  const idbVal = await readIdbBranding();

  if (syncLocal && idbVal) {
    return idbVal.revision >= syncLocal.revision ? idbVal : syncLocal;
  }
  return idbVal || syncLocal;
}

export async function persistBrandingEverywhere(
  draft: SiteBranding
): Promise<SiteBranding> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Authentication service is not configured.');

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (sessionError || !accessToken) {
    throw new Error('Please sign in as a platform administrator before changing branding.');
  }

  const stamped: SiteBranding = {
    ...draft,
    revision: Math.max(Date.now(), (draft.revision || 0) + 1),
    updatedAt: new Date().toISOString(),
  };

  const body = JSON.stringify(stamped);
  const response = await fetch('/api/branding', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
    cache: 'no-store',
    keepalive: body.length < 60000,
    body,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.branding) {
    throw new Error(result?.error || 'Branding could not be saved to the QAAGA database.');
  }

  const saved = normalizeClientBranding(result.branding);
  if (!saved) throw new Error('Server returned invalid branding data.');

  invalidateBrandingCache();
  writeSyncLocalBranding(saved);
  await writeIdbBranding(saved);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('qaaga-branding-updated', { detail: saved })
    );
  }

  return saved;
}

let brandingReconcilePromise: Promise<SiteBranding> | null = null;
let brandingReconcileTimestamp = 0;
let cachedResolvedBranding: SiteBranding | null = null;
const BRANDING_CACHE_TTL_MS = 15000;

export function invalidateBrandingCache(): void {
  brandingReconcilePromise = null;
  brandingReconcileTimestamp = 0;
  cachedResolvedBranding = null;
}

export async function reconcileBrandingOnLoad(
  ssrBranding?: SiteBranding
): Promise<SiteBranding> {
  const now = Date.now();
  if (cachedResolvedBranding && now - brandingReconcileTimestamp < BRANDING_CACHE_TTL_MS) {
    return cachedResolvedBranding;
  }

  if (brandingReconcilePromise) {
    return brandingReconcilePromise;
  }

  brandingReconcilePromise = (async () => {
    const clientBest = await loadBestClientBranding();

    let serverLatest: SiteBranding | null = ssrBranding || null;
    try {
      const res = await fetch('/api/branding', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.branding) {
          serverLatest = normalizeClientBranding(data.branding);
        }
      }
    } catch {}

    // Check Supabase site_branding table for cloud source of truth
    let supabaseLatest: SiteBranding | null = null;
    try {
      const sbData = await getBrandingFromSupabase();
      if (sbData) {
        supabaseLatest = normalizeClientBranding(sbData);
      }
    } catch {}

    // Supabase is the cross-device source of truth. Browser storage is only a
    // resilience fallback and must never override a newer admin-selected asset.
    const winner = supabaseLatest || serverLatest || clientBest;

    if (winner) {
      writeSyncLocalBranding(winner);
      await writeIdbBranding(winner);
      cachedResolvedBranding = winner;
      brandingReconcileTimestamp = Date.now();
      return winner;
    }

    const fallback = { ...DEFAULT_BRANDING };
    cachedResolvedBranding = fallback;
    brandingReconcileTimestamp = Date.now();
    return fallback;
  })();

  try {
    return await brandingReconcilePromise;
  } finally {
    brandingReconcilePromise = null;
  }
}
