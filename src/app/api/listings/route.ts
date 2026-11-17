import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPublicServerSupabase, requireAuthenticatedSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const ListingInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(5000).optional().default(''),
  area: z.string().min(2).max(120),
  city: z.string().min(2).max(80).default('Dhaka'),
  propertyType: z.enum(['Apartment', 'Studio', 'Private Room', 'Sky Condo', 'Villa', 'Suite', 'Penthouse']).default('Apartment'),
  category: z.enum(['stay', 'experiences', 'services']).default('stay'),
  pricePerNight: z.number().positive().max(100000),
  maxGuests: z.number().int().min(1).max(30).default(2),
  bedrooms: z.string().max(80).default('1 bedroom'),
  image: z.string().url(),
  gallery: z.array(z.string().url()).max(20).default([]),
  amenities: z.array(z.string().max(80)).max(50).default([]),
});

function mapProperty(row: any) {
  return {
    id: String(row.id),
    hostEmail: row.host_email,
    title: row.title,
    area: row.area,
    city: row.city || 'Dhaka',
    subType: row.property_type || 'Apartment',
    category: row.category || 'stay',
    twoNightPriceUsd: Number(row.two_night_price_usd || 0),
    rating: String(row.rating || 0),
    reviewsCount: Number(row.reviews_count || 0),
    guestFavorite: Boolean(row.guest_favorite),
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    maxGuests: Number(row.max_guests || 2),
    bedrooms: row.bedrooms || '1 bedroom',
    hostName: row.host_name || 'Host',
    hostYears: 0,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description || '',
    inPopularKL: false,
    status: row.status,
  };
}

export async function GET(req: NextRequest) {
  const supabase = createPublicServerSupabase();
  if (!supabase) {
    return NextResponse.json({ listings: [], total: 0, status: 'error', error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.trim().toLowerCase();
  const sort = searchParams.get('sort');

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ listings: [], total: 0, status: 'error', error: 'Unable to load published listings.' }, { status: 502 });
  }

  let listings = (data || []).map(mapProperty);
  if (category && category !== 'all') listings = listings.filter((item) => item.category === category);
  if (query) listings = listings.filter((item) =>
    item.title.toLowerCase().includes(query) ||
    item.area.toLowerCase().includes(query) ||
    item.city.toLowerCase().includes(query)
  );
  if (sort === 'price-asc') listings.sort((a, b) => a.twoNightPriceUsd - b.twoNightPriceUsd);
  if (sort === 'price-desc') listings.sort((a, b) => b.twoNightPriceUsd - a.twoNightPriceUsd);
  if (sort === 'rating') listings.sort((a, b) => Number(b.rating) - Number(a.rating));

  return NextResponse.json(
    { listings, total: listings.length, status: listings.length ? 'ok' : 'empty' },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' } }
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = ListingInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid listing details.', details: parsed.error.flatten() }, { status: 400 });

  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('full_name,status')
    .eq('email', auth.user.email!.toLowerCase())
    .maybeSingle();

  if (profile?.status === 'suspended') {
    return NextResponse.json({ error: 'This account cannot publish listings.' }, { status: 403 });
  }

  const input = parsed.data;
  const id = crypto.randomUUID();
  const payload = {
    id,
    host_email: auth.user.email!.toLowerCase(),
    host_name: profile?.full_name || auth.user.user_metadata?.full_name || auth.user.email!.split('@')[0],
    title: input.title,
    description: input.description,
    property_type: input.propertyType,
    room_type: input.propertyType === 'Private Room' ? 'Private room' : 'Entire place',
    category: input.category,
    city: input.city,
    area: input.area,
    two_night_price_usd: input.pricePerNight * 2,
    price_daily: input.pricePerNight,
    currency: 'USD',
    max_guests: input.maxGuests,
    bedrooms: input.bedrooms,
    rating: 0,
    reviews_count: 0,
    guest_favorite: false,
    in_popular_kl: false,
    is_featured: false,
    status: 'pending_approval',
    image: input.image,
    gallery: input.gallery.length ? input.gallery : [input.image],
    amenities: input.amenities,
  };

  const { data, error } = await auth.supabase.from('properties').insert(payload).select().single();
  if (error || !data) return NextResponse.json({ error: 'Listing could not be submitted.' }, { status: 502 });

  return NextResponse.json({ success: true, listing: mapProperty(data) }, { status: 201 });
}
