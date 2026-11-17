import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_BRANDING, DEFAULT_FAVICON_URL, DEFAULT_SITE_LOGO_URL, SiteBranding } from '@/data/listings';
import { createPublicServerSupabase, requireAuthenticatedSupabase } from '@/lib/supabaseServer';
import { sanitizeBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function mapBranding(row: any): SiteBranding {
  return sanitizeBranding({
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    altText: row.alt_text,
    fallbackText: row.fallback_text,
    fallbackDomain: row.fallback_domain,
    showTextWhenRemoved: row.show_text_when_removed,
    size: row.size,
    blendMultiply: row.blend_multiply,
    revision: Number(row.revision) || 1,
    updatedAt: row.updated_at,
  });
}

async function loadBranding(supabase: NonNullable<ReturnType<typeof createPublicServerSupabase>>) {
  const { data, error } = await supabase
    .from('site_branding')
    .select('*')
    .eq('id', 'default_branding')
    .maybeSingle();

  if (error) {
    // The table may not exist until the reviewed production migration is applied.
    return { branding: { ...DEFAULT_BRANDING }, error };
  }
  return { branding: data ? mapBranding(data) : { ...DEFAULT_BRANDING }, error: null };
}

async function saveBranding(
  supabase: NonNullable<ReturnType<typeof createPublicServerSupabase>>,
  branding: SiteBranding
) {
  const row = {
    id: 'default_branding',
    logo_url: branding.logoUrl,
    favicon_url: branding.faviconUrl,
    alt_text: branding.altText,
    fallback_text: branding.fallbackText,
    fallback_domain: branding.fallbackDomain,
    show_text_when_removed: branding.showTextWhenRemoved,
    size: branding.size,
    blend_multiply: branding.blendMultiply,
    revision: branding.revision,
    updated_at: branding.updatedAt,
  };

  const { data, error } = await supabase
    .from('site_branding')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error || !data) throw new Error('Unable to save site branding to Supabase.');
  return mapBranding(data);
}

async function requireAdmin(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return { ok: false as const, response: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  if (auth.user.app_metadata?.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Administrator permission is required.' }, { status: 403 }) };
  }
  return { ok: true as const, supabase: auth.supabase };
}

export async function GET() {
  const supabase = createPublicServerSupabase();
  if (!supabase) {
    return NextResponse.json({ branding: { ...DEFAULT_BRANDING } }, { headers: NO_STORE_HEADERS });
  }
  const { branding } = await loadBranding(supabase);
  return NextResponse.json({ branding }, { headers: NO_STORE_HEADERS });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as Partial<SiteBranding>;
    const { branding: current } = await loadBranding(auth.supabase);
    const nextRevision =
      typeof body.revision === 'number' && body.revision > current.revision
        ? body.revision
        : Math.max(Date.now(), current.revision + 1);

    const merged = sanitizeBranding({
      ...current,
      ...body,
      logoUrl: body.logoUrl === null
        ? null
        : typeof body.logoUrl === 'string' ? body.logoUrl.trim() || null : current.logoUrl,
      faviconUrl: body.faviconUrl === null
        ? null
        : typeof body.faviconUrl === 'string' ? body.faviconUrl.trim() || null : current.faviconUrl,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });

    const saved = await saveBranding(auth.supabase, merged);
    return NextResponse.json({ branding: saved }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json({ error: 'Branding could not be saved.' }, { status: 502, headers: NO_STORE_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const reset = req.nextUrl.searchParams.get('reset') === 'true';
    const target = req.nextUrl.searchParams.get('target');
    const { branding: current } = await loadBranding(auth.supabase);
    const nextRevision = Math.max(Date.now(), current.revision + 1);
    let next: SiteBranding;

    if (target === 'favicon') {
      next = { ...current, faviconUrl: reset ? DEFAULT_FAVICON_URL : null };
    } else if (target === 'logo') {
      next = { ...current, logoUrl: reset ? DEFAULT_SITE_LOGO_URL : null };
    } else if (reset) {
      next = { ...DEFAULT_BRANDING };
    } else {
      next = { ...current, logoUrl: null };
    }

    const saved = await saveBranding(auth.supabase, {
      ...next,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ branding: saved }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json({ error: 'Branding could not be updated.' }, { status: 502, headers: NO_STORE_HEADERS });
  }
}
