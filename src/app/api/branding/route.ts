import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_BRANDING,
  DEFAULT_FAVICON_URL,
  DEFAULT_SITE_LOGO_URL,
  SiteBranding,
} from '@/data/listings';
import {
  readServerBranding,
  sanitizeBranding,
  writeServerBranding,
} from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  const branding = await readServerBranding();
  return NextResponse.json({ branding }, { headers: NO_STORE_HEADERS });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SiteBranding>;
    const current = await readServerBranding();

    const nextRevision =
      typeof body.revision === 'number' && body.revision > current.revision
        ? body.revision
        : Math.max(Date.now(), current.revision + 1);

    const merged = sanitizeBranding({
      ...current,
      ...body,
      logoUrl:
        body.logoUrl === null
          ? null
          : typeof body.logoUrl === 'string'
          ? body.logoUrl.trim() || null
          : current.logoUrl,
      faviconUrl:
        body.faviconUrl === null
          ? null
          : typeof body.faviconUrl === 'string'
          ? body.faviconUrl.trim() || null
          : current.faviconUrl,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });

    const saved = await writeServerBranding(merged);
    return NextResponse.json({ branding: saved }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: 'Invalid branding payload' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const reset = req.nextUrl.searchParams.get('reset') === 'true';
  const target = req.nextUrl.searchParams.get('target');
  const current = await readServerBranding();
  const nextRevision = Math.max(Date.now(), current.revision + 1);

  if (target === 'favicon') {
    const updatedFavicon = await writeServerBranding({
      ...current,
      faviconUrl: reset ? DEFAULT_FAVICON_URL : null,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { branding: updatedFavicon },
      { headers: NO_STORE_HEADERS }
    );
  }

  if (target === 'logo') {
    const updatedLogo = await writeServerBranding({
      ...current,
      logoUrl: reset ? DEFAULT_SITE_LOGO_URL : null,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { branding: updatedLogo },
      { headers: NO_STORE_HEADERS }
    );
  }

  if (reset) {
    const restored = await writeServerBranding({
      ...DEFAULT_BRANDING,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ branding: restored }, { headers: NO_STORE_HEADERS });
  }

  const removed = await writeServerBranding({
    ...current,
    logoUrl: null,
    revision: nextRevision,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ branding: removed }, { headers: NO_STORE_HEADERS });
}
