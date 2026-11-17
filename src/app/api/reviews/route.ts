import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPublicServerSupabase, requireAuthenticatedSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const CreateReviewSchema = z.object({
  listingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(4).max(1000),
});

export async function GET(req: NextRequest) {
  const listingId = new URL(req.url).searchParams.get('listingId');
  if (!listingId) return NextResponse.json({ error: 'Missing listingId.' }, { status: 400 });

  const supabase = createPublicServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Unable to load reviews.' }, { status: 502 });

  const reviews = (data || []).map((r: any) => ({
    id: String(r.id),
    author: r.author,
    date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    rating: Number(r.rating),
    comment: r.comment,
  }));

  return NextResponse.json({ reviews, status: reviews.length ? 'ok' : 'empty' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = CreateReviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review payload.' }, { status: 400 });

  const { listingId, rating, comment } = parsed.data;
  const email = auth.user.email!.toLowerCase();

  const { data: booking, error: bookingError } = await auth.supabase
    .from('bookings')
    .select('id')
    .eq('property_id', listingId)
    .eq('customer_email', email)
    .eq('status', 'Completed')
    .limit(1)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'A completed stay is required before reviewing this listing.' }, { status: 403 });
  }

  const profile = await auth.supabase
    .from('profiles')
    .select('full_name')
    .eq('email', email)
    .maybeSingle();

  const author = profile.data?.full_name || String(auth.user.user_metadata?.full_name || email.split('@')[0]);
  const { data, error } = await auth.supabase
    .from('reviews')
    .insert({
      property_id: listingId,
      listing_id: listingId,
      author,
      author_email: email,
      rating,
      comment,
    })
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: 'Review could not be saved.' }, { status: 502 });

  return NextResponse.json({
    success: true,
    review: {
      id: String(data.id),
      author: data.author,
      date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      rating: Number(data.rating),
      comment: data.comment,
    },
  }, { status: 201 });
}
