import { NextRequest, NextResponse } from 'next/server';
import { ReviewSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ reviews: [], status: 'error' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ reviews: [], status: 'error', error: error.message });
    }

    const reviews = Array.isArray(data)
      ? data.map((r: any) => ({
          id: String(r.id),
          author: r.author,
          date: new Date(r.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          rating: Number(r.rating),
          comment: r.comment,
        }))
      : [];

    return NextResponse.json({ reviews, status: reviews.length > 0 ? 'ok' : 'empty' });
  } catch (err: any) {
    return NextResponse.json({ reviews: [], status: 'error', error: err?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ReviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid review payload', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { listingId, author, rating, comment } = validated.data;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        listing_id: listingId,
        author,
        rating,
        comment,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to save review' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        review: {
          id: String(data.id),
          author: data.author,
          date: new Date(data.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          rating: Number(data.rating),
          comment: data.comment,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
