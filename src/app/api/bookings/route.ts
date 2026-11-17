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

  if (!auth.user.email_confirmed_at) {
    return NextResponse.json({ error: 'Verify your email before sending a booking request.' }, { status: 403 });
  }

  const { listingId, checkInDate, checkOutDate, guests, specialRequests } = parsed.data;
  const startTime = Date.parse(checkInDate + 'T00:00:00Z');
  const endTime = Date.parse(checkOutDate + 'T00:00:00Z');
  const nights = Math.round((endTime - startTime) / 86400000);

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || nights < 1 || nights > 90) {
    return NextResponse.json({ error: 'Choose a valid date range between 1 and 90 nights.' }, { status: 400 });
  }

  // Booking creation runs inside a SECURITY DEFINER RPC. The database resolves host_email,
  // validates the property and account, and inserts the booking without returning private host data.
  const { data: booking, error } = await auth.supabase.rpc('create_booking_request', {
    p_listing_id: listingId,
    p_check_in: checkInDate,
    p_check_out: checkOutDate,
    p_guests: guests,
    p_special_requests: specialRequests?.trim() || null,
  });

  if (error || !booking) {
    const message = error?.message || 'Your booking request could not be saved.';
    const normalized = message.toLowerCase();
    const status =
      normalized.includes('no longer available') ? 409 :
      normalized.includes('not available') ? 404 :
      normalized.includes('verify your email') ||
      normalized.includes('suspended') ||
      normalized.includes('own property') ? 403 : 400;

    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ success: true, booking }, { status: 201 });
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
