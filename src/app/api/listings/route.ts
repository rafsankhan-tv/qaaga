import { NextRequest, NextResponse } from 'next/server';
import { QaagaListing } from '@/data/listings';
import { ListingSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function mapListingRow(row: any): QaagaListing {
  return {
    id: String(row.id),
    title: row.title || 'Untitled Listing',
    area: row.area || 'Kuala Lumpur',
    city: row.city || 'Kuala Lumpur',
    subType: row.sub_type || row.property_type || 'Apartment',
    category: row.category || 'stay',
    twoNightPriceUsd:
      Number(row.two_night_price_usd) ||
      (Number(row.price_daily) ? Number(row.price_daily) * 2 : 120),
    rating: String(row.rating || '5.0'),
    reviewsCount: Number(row.reviews_count) || 0,
    guestFavorite: Boolean(row.guest_favorite ?? row.is_featured),
    image: row.image || '/assets/kl-ui/kl-1.jpg',
    gallery:
      Array.isArray(row.gallery) && row.gallery.length > 0
        ? row.gallery
        : [row.image || '/assets/kl-ui/kl-1.jpg'],
    maxGuests: Number(row.max_guests) || 2,
    bedrooms: row.bedrooms || '1 bedroom',
    hostName: row.host_name || 'Host',
    hostYears: Number(row.host_years) || 1,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description || '',
    inPopularKL: Boolean(row.in_popular_kl),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase().trim();
  const sort = searchParams.get('sort');

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { listings: [], total: 0, status: 'error', error: 'Supabase not configured' },
      { status: 200 }
    );
  }

  let items: QaagaListing[] = [];
  let status: 'ok' | 'empty' | 'error' = 'empty';

  try {
    const [listingsRes, propsRes] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
    ]);

    const merged = new Map<string, QaagaListing>();

    if (!listingsRes.error && Array.isArray(listingsRes.data)) {
      for (const row of listingsRes.data) {
        if (row.is_active === false) continue;
        const mapped = mapListingRow(row);
        merged.set(mapped.id, mapped);
      }
    }

    if (!propsRes.error && Array.isArray(propsRes.data)) {
      for (const row of propsRes.data) {
        const mapped = mapListingRow(row);
        if (!merged.has(mapped.id)) {
          merged.set(mapped.id, mapped);
        }
      }
    }

    if (listingsRes.error && propsRes.error) {
      status = 'error';
    } else {
      items = Array.from(merged.values());
      status = items.length > 0 ? 'ok' : 'empty';
    }
  } catch {
    status = 'error';
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

  return NextResponse.json(
    { listings: items, total: items.length, status },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
      },
    }
  );
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

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

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

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to save listing in Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, listing: mapListingRow(data) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
