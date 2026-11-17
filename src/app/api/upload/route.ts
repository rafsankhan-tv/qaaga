import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_BUCKETS = new Set(['qaaga-listings', 'qaaga-avatars', 'qaaga-branding']);

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: 'Invalid upload form.' }, { status: 400 });

  const file = formData.get('file');
  const requestedBucket = String(formData.get('bucket') || 'qaaga-listings');

  if (!(file instanceof File)) return NextResponse.json({ error: 'No valid file was provided.' }, { status: 400 });
  if (!ALLOWED_BUCKETS.has(requestedBucket)) return NextResponse.json({ error: 'This storage bucket is not permitted.' }, { status: 400 });
  if (requestedBucket === 'qaaga-branding' && auth.user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Administrator access is required for brand assets.' }, { status: 403 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WebP or AVIF images are accepted.' }, { status: 400 });
  }
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File size must be between 1 byte and 10 MB.' }, { status: 400 });
  }

  const extensionByMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  const objectPath = auth.user.id + '/' + crypto.randomUUID() + '.' + extensionByMime[file.type];
  const { data, error } = await auth.supabase.storage
    .from(requestedBucket)
    .upload(objectPath, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

  if (error || !data) {
    return NextResponse.json({ error: 'Image could not be uploaded to Supabase Storage.' }, { status: 502 });
  }

  const { data: publicUrl } = auth.supabase.storage.from(requestedBucket).getPublicUrl(data.path);
  return NextResponse.json({ url: publicUrl.publicUrl, path: data.path }, { status: 201 });
}
