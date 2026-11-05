import { NextRequest, NextResponse } from 'next/server';
import { BookingSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';
import { INITIAL_BOOKINGS } from '@/data/listings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (email) {
        query = query.eq('guest_email', email);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const bookings = data.map((row: any) => ({
          id: row.id,
          confirmationCode: row.confirmation_code,
          listingId: row.listing_id,
          title: row.title,
          area: row.area,
          image: row.image,
          checkInLabel: row.check_in_label,
          nights: Number(row.nights),
          guests: Number(row.guests),
          totalUsd: Number(row.total_usd),
          hostName: row.host_name,
          status: row.status,
        }));
        return NextResponse.json({ bookings, count: bookings.length });
      }
    } catch (err) {
      console.warn('Notice: Error fetching bookings from Supabase:', err);
    }
  }

  return NextResponse.json({ bookings: INITIAL_BOOKINGS, count: INITIAL_BOOKINGS.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = BookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validated.error.format() },
        { status: 400 }
      );
    }

    const b = validated.data;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            id: b.id,
            confirmation_code: b.confirmationCode,
            listing_id: b.listingId,
            guest_email: b.guestEmail,
            guest_name: b.guestName,
            title: b.title,
            area: b.area,
            image: b.image,
            check_in_label: b.checkInLabel,
            nights: b.nights,
            guests: b.guests,
            total_usd: b.totalUsd,
            host_name: b.hostName,
            status: b.status,
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, booking: b }, { status: 201 });
        }
      } catch (dbErr) {
        console.warn('Notice: Supabase insert booking exception:', dbErr);
      }
    }

    return NextResponse.json({ success: true, booking: b }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', id);
    } catch {
      // fallback
    }
  }

  return NextResponse.json({ success: true, message: 'Booking cancelled' });
}
