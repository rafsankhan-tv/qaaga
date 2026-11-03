'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_BRANDING,
  SiteBranding,
  STORAGE_KEYS,
} from '@/data/listings';
import { AdminPanelModal } from '@/components/AdminPanelModal';

export default function AdminPage() {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.branding);
      if (local) {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(local) });
      }
    } catch {}

    fetch('/api/branding')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.branding) {
          setBranding(data.branding);
          try {
            localStorage.setItem(
              STORAGE_KEYS.branding,
              JSON.stringify(data.branding)
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const persistBranding = useCallback(async (next: SiteBranding) => {
    setBranding(next);
    try {
      localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(next));
      window.dispatchEvent(new Event('qaaga-branding-updated'));
    } catch {}
    try {
      await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } catch {}
  }, []);

  const handleRemoveLogo = useCallback(async () => {
    const removed: SiteBranding = {
      ...branding,
      logoUrl: null,
      updatedAt: new Date().toISOString(),
    };
    setBranding(removed);
    try {
      localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(removed));
      window.dispatchEvent(new Event('qaaga-branding-updated'));
    } catch {}
    try {
      await fetch('/api/branding?target=logo', { method: 'DELETE' });
    } catch {}
  }, [branding]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    const restored: SiteBranding = {
      ...branding,
      logoUrl: DEFAULT_BRANDING.logoUrl,
      updatedAt: new Date().toISOString(),
    };
    setBranding(restored);
    try {
      localStorage.setItem(STORAGE_KEYS.branding, JSON.stringify(restored));
      window.dispatchEvent(new Event('qaaga-branding-updated'));
    } catch {}
    try {
      await fetch('/api/branding?target=logo&reset=true', { method: 'DELETE' });
    } catch {}
  }, [branding]);

  return (
    <AdminPanelModal
      branding={branding}
      onUpdateBranding={persistBranding}
      onRemoveLogo={handleRemoveLogo}
      onRestoreDefaultLogo={handleRestoreDefaultLogo}
      standalone={true}
    />
  );
}
