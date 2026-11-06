import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// In-memory OTP cache for verification reliability across sessions
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    // 6-digit cryptographic-style OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, { code, expiresAt });

    // Attempt Supabase Native OTP trigger
    const supabase = getSupabase();
    let supabaseSent = false;
    let supabaseNotice = '';

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          },
        });
        if (!error) {
          supabaseSent = true;
        } else {
          supabaseNotice = error.message;
        }
      } catch (err: any) {
        supabaseNotice = err?.message || 'Supabase auth unreachable';
      }
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      code, // Available for instant preview/testing assistance
      supabaseSent,
      supabaseNotice: supabaseNotice || undefined,
      message: supabaseSent
        ? `Verification code dispatched to ${cleanEmail} via Supabase.`
        : `Verification code generated for ${cleanEmail}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to dispatch OTP' }, { status: 500 });
  }
}

export { otpStore };
