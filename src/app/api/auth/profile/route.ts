import { NextRequest, NextResponse } from 'next/server';
import { ProfileSchema } from '@/lib/validations';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!error && data) {
        return NextResponse.json({
          profile: {
            fullName: data.full_name,
            email: data.email,
            city: data.city || 'Kuala Lumpur',
            role: data.role || 'guest',
            verified: Boolean(data.verified),
          },
        });
      }
    } catch {
      // fallback
    }
  }

  return NextResponse.json({
    profile: {
      fullName: 'Guest User',
      email,
      city: 'Kuala Lumpur',
      role: 'guest',
      verified: true,
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, city, role, verified } = validated.data;
    const supabase = getSupabase();

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            {
              full_name: fullName,
              email,
              city,
              role,
              verified,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
      } catch (dbErr) {
        console.warn('Notice: Supabase profile upsert exception:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      profile: { fullName, email, city, role, verified },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
