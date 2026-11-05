import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'qaaga-listings';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, SVG, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 10MB limit.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true,
          });

        if (!error && data) {
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(fileName);

          return NextResponse.json({ url: publicUrl, fileName }, { status: 201 });
        }
      } catch (storageErr) {
        console.warn('Notice: Supabase server storage upload exception:', storageErr);
      }
    }

    // Convert to Base64 data URL if storage bucket is not configured or in development
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl, fileName: file.name }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
