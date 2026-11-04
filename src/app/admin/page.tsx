'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_BRANDING, SiteBranding } from '@/data/listings';
import { AdminPanelModal } from '@/components/AdminPanelModal';
import {
  persistBrandingEverywhere,
  readSyncLocalBranding,
  reconcileBrandingOnLoad,
} from '@/lib/brandingStorage.client';

export default function AdminPage() {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);
  const brandingRef = useRef<SiteBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    brandingRef.current = branding;
  }, [branding]);

  useEffect(() => {
    const syncLocal = readSyncLocalBranding();
    if (syncLocal) {
      setBranding(syncLocal);
      brandingRef.current = syncLocal;
    }

    reconcileBrandingOnLoad().then((resolved) => {
      setBranding(resolved);
      brandingRef.current = resolved;
    });
  }, []);

  const persistBranding = useCallback(async (next: SiteBranding) => {
    setBranding(next);
    brandingRef.current = next;
    const saved = await persistBrandingEverywhere(next);
    setBranding(saved);
    brandingRef.current = saved;
  }, []);

  const handleRemoveLogo = useCallback(async () => {
    const removed: SiteBranding = {
      ...brandingRef.current,
      logoUrl: null,
    };
    await persistBranding(removed);
  }, [persistBranding]);

  const handleRestoreDefaultLogo = useCallback(async () => {
    const restored: SiteBranding = {
      ...brandingRef.current,
      logoUrl: DEFAULT_BRANDING.logoUrl,
    };
    await persistBranding(restored);
  }, [persistBranding]);

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
