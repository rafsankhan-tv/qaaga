import { promises as fs } from 'fs';
import path from 'path';
import {
  DEFAULT_BRANDING,
  LogoSizePreset,
  SiteBranding,
} from '@/data/listings';

const WORKSPACE_STORAGE_DIR = path.join(process.cwd(), 'storage');
const PRIMARY_BRANDING_PATH = path.join(WORKSPACE_STORAGE_DIR, 'site-branding.json');
const FALLBACK_BRANDING_PATH = '/tmp/qaaga-site-branding.json';

const VALID_SIZES: LogoSizePreset[] = ['sm', 'md', 'lg', 'xl'];

export function sanitizeBranding(raw: Partial<SiteBranding> | null | undefined): SiteBranding {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_BRANDING };
  }

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
    size:
      raw.size && VALID_SIZES.includes(raw.size)
        ? raw.size
        : DEFAULT_BRANDING.size,
    blendMultiply:
      typeof raw.blendMultiply === 'boolean'
        ? raw.blendMultiply
        : DEFAULT_BRANDING.blendMultiply,
    revision:
      typeof raw.revision === 'number' && Number.isFinite(raw.revision) && raw.revision >= 0
        ? raw.revision
        : 0,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt
        ? raw.updatedAt
        : DEFAULT_BRANDING.updatedAt,
  };
}

async function tryReadJson(filePath: string): Promise<SiteBranding | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as Partial<SiteBranding>;
    return sanitizeBranding(parsed);
  } catch {
    return null;
  }
}

export async function readServerBranding(): Promise<SiteBranding> {
  const [primary, fallback] = await Promise.all([
    tryReadJson(PRIMARY_BRANDING_PATH),
    tryReadJson(FALLBACK_BRANDING_PATH),
  ]);

  if (primary && fallback) {
    return primary.revision >= fallback.revision ? primary : fallback;
  }
  if (primary) return primary;
  if (fallback) return fallback;
  return { ...DEFAULT_BRANDING };
}

export async function writeServerBranding(next: SiteBranding): Promise<SiteBranding> {
  const clean = sanitizeBranding(next);
  const serialized = JSON.stringify(clean, null, 2);

  let wrotePrimary = false;
  try {
    await fs.mkdir(WORKSPACE_STORAGE_DIR, { recursive: true });
    const tmpPath = `${PRIMARY_BRANDING_PATH}.tmp`;
    await fs.writeFile(tmpPath, serialized, 'utf-8');
    await fs.rename(tmpPath, PRIMARY_BRANDING_PATH);
    wrotePrimary = true;
  } catch {
    // Fallback if container root filesystem is read-only
  }

  try {
    const fallbackTmp = `${FALLBACK_BRANDING_PATH}.tmp`;
    await fs.writeFile(fallbackTmp, serialized, 'utf-8');
    await fs.rename(fallbackTmp, FALLBACK_BRANDING_PATH);
  } catch {
    if (!wrotePrimary) {
      throw new Error('Unable to persist site branding state on server');
    }
  }

  return clean;
}
