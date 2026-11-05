import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_LISTINGS, QaagaListing } from '@/data/listings';
import { ListingSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase().trim();
  const sort = searchParams.get('sort');

  let items: QaagaListing[] = INITIAL_LISTINGS;

  // Attempt Supabase DB fetch
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        items = data.map((row: any) => ({
          id: String(row.id),
          title: row.title,
          area: row.area,
          city: row.city || 'Kuala Lumpur',
          subType: row.sub_type || 'Apartment',
          category: row.category,
          twoNightPriceUsd: Number(row.two_night_price_usd) || 120,
          rating: String(row.rating || '5.0'),
          reviewsCount: Number(row.reviews_count) || 0,
          guestFavorite: Boolean(row.guest_favorite),
          image: row.image,
          gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image],
          maxGuests: Number(row.max_guests) || 2,
          bedrooms: row.bedrooms || '1 bedroom',
          hostName: row.host_name || 'Host',
          hostYears: Number(row.host_years) || 1,
          amenities: Array.isArray(row.amenities) ? row.amenities : [],
          description: row.description || '',
          inPopularKL: Boolean(row.in_popular_kl),
        }));
      }
    } catch {
      // Fallback to in-memory items
    }
  }

  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }

  if (q) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-asc') {
    items.sort((a, b) => a.twoNightPriceUsd - b.twoNightPriceUsd);
  } else if (sort === 'price-desc') {
    items.sort((a, b) => b.twoNightPriceUsd - a.twoNightPriceUsd);
  } else if (sort === 'rating') {
    items.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }

  return NextResponse.json({ listings: items, total: items.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ListingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    const listing = validated.data;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('listings')
          .insert({
            id: listing.id,
            title: listing.title,
            area: listing.area,
            city: listing.city,
            sub_type: listing.subType,
            category: listing.category,
            two_night_price_usd: listing.twoNightPriceUsd,
            rating: listing.rating,
            reviews_count: listing.reviewsCount,
            guest_favorite: listing.guestFavorite,
            image: listing.image,
            gallery: listing.gallery,
            max_guests: listing.maxGuests,
            bedrooms: listing.bedrooms,
            host_name: listing.hostName,
            host_years: listing.hostYears,
            amenities: listing.amenities,
            description: listing.description,
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, listing }, { status: 201 });
        }
      } catch (dbErr) {
        console.warn('Supabase DB listing insert error:', dbErr);
      }
    }

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
