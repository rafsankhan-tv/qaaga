import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { DEFAULT_BRANDING, LogoSizePreset, SiteBranding } from '@/data/listings';

const BRANDING_FILE_PATH = '/tmp/qaaga-branding-state.json';
const VALID_SIZES: LogoSizePreset[] = ['sm', 'md', 'lg', 'xl'];

async function readBrandingState(): Promise<SiteBranding> {
  try {
    const raw = await fs.readFile(BRANDING_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SiteBranding>;
    return {
      logoUrl:
        parsed.logoUrl === null
          ? null
          : typeof parsed.logoUrl === 'string' && parsed.logoUrl.trim()
          ? parsed.logoUrl
          : DEFAULT_BRANDING.logoUrl,
      altText:
        typeof parsed.altText === 'string' && parsed.altText.trim()
          ? parsed.altText.trim()
          : DEFAULT_BRANDING.altText,
      fallbackText:
        typeof parsed.fallbackText === 'string'
          ? parsed.fallbackText
          : DEFAULT_BRANDING.fallbackText,
      fallbackDomain:
        typeof parsed.fallbackDomain === 'string'
          ? parsed.fallbackDomain
          : DEFAULT_BRANDING.fallbackDomain,
      showTextWhenRemoved:
        typeof parsed.showTextWhenRemoved === 'boolean'
          ? parsed.showTextWhenRemoved
          : DEFAULT_BRANDING.showTextWhenRemoved,
      size:
        parsed.size && VALID_SIZES.includes(parsed.size)
          ? parsed.size
          : DEFAULT_BRANDING.size,
      blendMultiply:
        typeof parsed.blendMultiply === 'boolean'
          ? parsed.blendMultiply
          : DEFAULT_BRANDING.blendMultiply,
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : DEFAULT_BRANDING.updatedAt,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

async function writeBrandingState(next: SiteBranding): Promise<void> {
  await fs.writeFile(BRANDING_FILE_PATH, JSON.stringify(next, null, 2), 'utf-8');
}

export async function GET() {
  const branding = await readBrandingState();
  return NextResponse.json({ branding });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SiteBranding>;
    const current = await readBrandingState();

    const updated: SiteBranding = {
      logoUrl:
        body.logoUrl === null
          ? null
          : typeof body.logoUrl === 'string'
          ? body.logoUrl.trim() || null
          : current.logoUrl,
      altText:
        typeof body.altText === 'string' ? body.altText.trim() || 'qaaga.com' : current.altText,
      fallbackText:
        typeof body.fallbackText === 'string' ? body.fallbackText : current.fallbackText,
      fallbackDomain:
        typeof body.fallbackDomain === 'string' ? body.fallbackDomain : current.fallbackDomain,
      showTextWhenRemoved:
        typeof body.showTextWhenRemoved === 'boolean'
          ? body.showTextWhenRemoved
          : current.showTextWhenRemoved,
      size: body.size && VALID_SIZES.includes(body.size) ? body.size : current.size,
      blendMultiply:
        typeof body.blendMultiply === 'boolean' ? body.blendMultiply : current.blendMultiply,
      updatedAt: new Date().toISOString(),
    };

    await writeBrandingState(updated);
    return NextResponse.json({ branding: updated });
  } catch {
    return NextResponse.json(
      { error: 'Invalid branding payload' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const reset = req.nextUrl.searchParams.get('reset') === 'true';
  if (reset) {
    const restored: SiteBranding = {
      ...DEFAULT_BRANDING,
      updatedAt: new Date().toISOString(),
    };
    await writeBrandingState(restored);
    return NextResponse.json({ branding: restored });
  }

  const current = await readBrandingState();
  const removed: SiteBranding = {
    ...current,
    logoUrl: null,
    updatedAt: new Date().toISOString(),
  };
  await writeBrandingState(removed);
  return NextResponse.json({ branding: removed });
}
