import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import { otpStore } from '../send/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    // 1. Check Supabase Native verifyOtp
    const supabase = getSupabase();
    let verified = false;
    let authUser: any = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: 'email',
        });
        if (!error && data?.user) {
          verified = true;
          authUser = data.user;
        }
      } catch {
        // Fallback to in-memory check
      }
    }

    // 2. Check in-memory store or developer master code 123456
    const cached = otpStore.get(cleanEmail);
    if (!verified) {
      if (cleanCode === '123456') {
        verified = true;
      } else if (cached && cached.code === cleanCode && Date.now() < cached.expiresAt) {
        verified = true;
      }
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Clear used OTP
    otpStore.delete(cleanEmail);

    const isAdmin = cleanEmail === 'rafsankhan.tv@gmail.com';

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      verified: true,
      isAdmin,
      role: isAdmin ? 'admin' : 'guest',
      user: authUser,
      message: isAdmin
        ? 'Super Admin verified successfully. Admin dashboard access granted.'
        : 'Email verified successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification error' }, { status: 500 });
  }
}
