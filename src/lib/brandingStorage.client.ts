'use client';

import {
  DEFAULT_BRANDING,
  SiteBranding,
  STORAGE_KEYS,
} from '@/data/listings';
import {
  saveBrandingToSupabase,
  getBrandingFromSupabase,
} from './supabaseService';

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
  const stamped: SiteBranding = {
    ...draft,
    revision: Math.max(Date.now(), (draft.revision || 0) + 1),
    updatedAt: new Date().toISOString(),
  };

  writeSyncLocalBranding(stamped);
  await writeIdbBranding(stamped);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('qaaga-branding-updated', { detail: stamped })
    );
  }

  // Also push to Supabase site_branding table
  saveBrandingToSupabase(stamped).catch(() => {});

  try {
    const body = JSON.stringify(stamped);
    const res = await fetch('/api/branding', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
      keepalive: body.length < 60000,
      body,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.branding) {
        writeSyncLocalBranding(data.branding);
        await writeIdbBranding(data.branding);
        saveBrandingToSupabase(data.branding).catch(() => {});
        return data.branding as SiteBranding;
      }
    }
  } catch {}

  return stamped;
}

export async function reconcileBrandingOnLoad(
  ssrBranding?: SiteBranding
): Promise<SiteBranding> {
  const clientBest = await loadBestClientBranding();

  let serverLatest: SiteBranding | null = ssrBranding || null;
  try {
    const res = await fetch(`/api/branding?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
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

  // Reconcile highest revision among client, server, and Supabase
  const candidates = [clientBest, serverLatest, supabaseLatest].filter(
    (c): c is SiteBranding => c !== null && c !== undefined
  );

  if (candidates.length > 0) {
    const winner = candidates.reduce((best, curr) =>
      curr.revision > best.revision ? curr : best
    );

    if (winner.revision > 0) {
      writeSyncLocalBranding(winner);
      await writeIdbBranding(winner);
      // Ensure server has latest
      fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(winner),
      }).catch(() => {});
    }
    return winner;
  }

  // Case 1: Both client and server exist — pick higher revision, never let default (rev 0) clobber custom (rev > 0)!
  if (clientBest && serverLatest) {
    if (clientBest.revision > serverLatest.revision) {
      // Heal stateless server container with client's newer permanent branding
      fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(clientBest),
      }).catch(() => {});
      writeSyncLocalBranding(clientBest);
      await writeIdbBranding(clientBest);
      return clientBest;
    }

    if (serverLatest.revision > 0) {
      writeSyncLocalBranding(serverLatest);
      await writeIdbBranding(serverLatest);
    }
    return serverLatest;
  }

  if (clientBest) {
    fetch('/api/branding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(clientBest),
    }).catch(() => {});
    return clientBest;
  }

  if (serverLatest) {
    if (serverLatest.revision > 0) {
      writeSyncLocalBranding(serverLatest);
      await writeIdbBranding(serverLatest);
    }
    return serverLatest;
  }

  return { ...DEFAULT_BRANDING };
}
