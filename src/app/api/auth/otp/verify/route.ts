import { NextRequest, NextResponse } from 'next/server';
import { createPublicServerSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'A valid email and six-digit code are required.' }, { status: 400 });
    }

    const supabase = createPublicServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Authentication service is not configured.' }, { status: 503 });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
    }

    // Do not infer admin privileges from an email address or return a client-controlled role.
    return NextResponse.json({
      success: true,
      verified: true,
      user: { id: data.user.id, email: data.user.email },
      session: data.session,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to verify this code.' }, { status: 400 });
  }
}
