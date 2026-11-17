import { NextRequest, NextResponse } from 'next/server';
import { createPublicServerSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const supabase = createPublicServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Authentication service is not configured.' }, { status: 503 });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      return NextResponse.json({ error: 'Unable to send verification email. Please try again.' }, { status: 502 });
    }

    // Never return an OTP, test code, role, or account privilege to the browser.
    return NextResponse.json({
      success: true,
      email,
      message: 'If the address is eligible, a verification email has been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process the verification request.' }, { status: 400 });
  }
}
