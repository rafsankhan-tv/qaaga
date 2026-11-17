import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthenticatedSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const CreateBookingSchema = z.object({
  listingId: z.string().min(1),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(30),
  specialRequests: z.string().max(1000).optional(),
});

function toIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Unable to load your bookings.' }, { status: 502 });
  }

  const bookings = (data || []).map((row: any) => ({
    id: row.id,
    confirmationCode: row.confirmation_code,
    listingId: row.property_id || row.listing_id,
    title: row.title,
    area: row.area,
    image: row.image,
    checkInDate: row.check_in,
    checkOutDate: row.check_out,
    checkInLabel: row.check_in_label,
    nights: Number(row.nights),
    guests: Number(row.guests),
    totalUsd: Number(row.total_usd),
    hostName: row.host_name,
    status: row.status,
  }));

  return NextResponse.json({ bookings, count: bookings.length, status: bookings.length ? 'ok' : 'empty' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = CreateBookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid booking request.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { listingId, checkInDate, checkOutDate, guests, specialRequests } = parsed.data;
  const start = new Date(checkInDate + 'T00:00:00');
  const end = new Date(checkOutDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start < today || end <= start) {
    return NextResponse.json({ error: 'Choose a valid future check-in and check-out date.' }, { status: 400 });
  }

  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (nights < 1 || nights > 90) {
    return NextResponse.json({ error: 'Bookings must be between 1 and 90 nights.' }, { status: 400 });
  }

  const { data: property, error: propertyError } = await auth.supabase
    .from('properties')
    .select('id,title,area,city,image,host_email,host_name,max_guests,two_night_price_usd,price_daily,status')
    .eq('id', listingId)
    .eq('status', 'active')
    .maybeSingle();

  if (propertyError || !property) {
    return NextResponse.json({ error: 'This property is not available for booking.' }, { status: 404 });
  }

  if (guests > Number(property.max_guests || 1)) {
    return NextResponse.json({ error: 'Guest count exceeds this property’s capacity.' }, { status: 400 });
  }

  const profile = await auth.supabase
    .from('profiles')
    .select('full_name,status')
    .eq('email', auth.user.email!.toLowerCase())
    .maybeSingle();

  if (profile.data?.status === 'suspended') {
    return NextResponse.json({ error: 'This account cannot create bookings.' }, { status: 403 });
  }

  const fullName =
    profile.data?.full_name ||
    String(auth.user.user_metadata?.full_name || auth.user.user_metadata?.name || auth.user.email!.split('@')[0]);

  const total = Number(property.two_night_price_usd || 0) / 2 * nights;
  const confirmationCode = 'QG-' + crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  const payload = {
    id: crypto.randomUUID(),
    confirmation_code: confirmationCode,
    property_id: property.id,
    listing_id: property.id,
    customer_email: auth.user.email!.toLowerCase(),
    guest_email: auth.user.email!.toLowerCase(),
    customer_name: fullName,
    guest_name: fullName,
    title: property.title,
    area: [property.area, property.city].filter(Boolean).join(', '),
    image: property.image,
    host_email: property.host_email.toLowerCase(),
    host_name: property.host_name,
    check_in: checkInDate,
    check_out: checkOutDate,
    check_in_label: checkInDate + ' – ' + checkOutDate,
    nights,
    guests,
    total_usd: Math.round(total * 100) / 100,
    currency: 'USD',
    status: 'Pending',
    special_requests: specialRequests || null,
  };

  const { data, error } = await auth.supabase.from('bookings').insert(payload).select().single();
  if (error || !data) {
    return NextResponse.json({ error: 'Your booking request could not be saved.' }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: data.id,
      confirmationCode: data.confirmation_code,
      listingId: data.property_id,
      checkInDate: data.check_in,
      checkOutDate: data.check_out,
      nights: Number(data.nights),
      guests: Number(data.guests),
      totalUsd: Number(data.total_usd),
      status: data.status,
    },
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthenticatedSupabase(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing booking ID.' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('bookings')
    .update({ status: 'Cancelled', cancelled_by: auth.user.email!.toLowerCase(), cancelled_at: new Date().toISOString() })
    .eq('id', id)
    .eq('customer_email', auth.user.email!.toLowerCase())
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking could not be cancelled.' }, { status: 403 });
  }

  return NextResponse.json({ success: true, message: 'Booking cancelled.' });
}
