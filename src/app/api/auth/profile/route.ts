import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { ProfileSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

function createAuthenticatedClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function authenticateRequest(req: NextRequest) {
  const authorization = req.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const accessToken = match?.[1]?.trim();
  if (!accessToken) {
    return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const supabase = createAuthenticatedClient(accessToken);
  if (!supabase) {
    return { error: NextResponse.json({ error: 'Authentication service is not configured.' }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email) {
    return { error: NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 }) };
  }

  return { supabase, user: data.user };
}

export async function GET(req: NextRequest) {
  const authenticated = await authenticateRequest(req);
  if ('error' in authenticated) return authenticated.error;

  const requestedEmail = new URL(req.url).searchParams.get('email')?.trim().toLowerCase();
  const userEmail = authenticated.user.email!.trim().toLowerCase();

  if (!requestedEmail || requestedEmail !== userEmail) {
    return NextResponse.json({ error: 'You can only access your own profile.' }, { status: 403 });
  }

  const { data, error } = await authenticated.supabase
    .from('profiles')
    .select('full_name,email,city,role,verified,phone,avatar_url,bio')
    .eq('email', userEmail)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Unable to load profile.' }, { status: 502 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      fullName: data.full_name || 'Member',
      email: data.email,
      city: data.city || 'Dhaka',
      role: authenticated.user.app_metadata?.role === 'admin' ? 'admin' : (data.role === 'host' ? 'host' : 'guest'),
      verified: Boolean(authenticated.user.email_confirmed_at),
      phone: data.phone || undefined,
      avatarUrl: data.avatar_url || undefined,
      bio: data.bio || undefined,
    },
  });
}

export async function PUT(req: NextRequest) {
  const authenticated = await authenticateRequest(req);
  if ('error' in authenticated) return authenticated.error;

  try {
    const body = await req.json();
    const validated = ProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid profile data.', details: validated.error.format() },
        { status: 400 }
      );
    }

    const profile = validated.data;
    const userEmail = authenticated.user.email!.trim().toLowerCase();
    if (profile.email.trim().toLowerCase() !== userEmail) {
      return NextResponse.json({ error: 'You can only update your own profile.' }, { status: 403 });
    }

    const { data: existing, error: existingError } = await authenticated.supabase
      .from('profiles')
      .select('role')
      .eq('email', userEmail)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: 'Unable to verify the existing profile.' }, { status: 502 });
    }

    // Preserve a previously granted admin role, but never allow self-service admin escalation.
    const role = existing?.role === 'admin' ? 'admin' : profile.role;
    const verified = Boolean(authenticated.user.email_confirmed_at);

    const { error: saveError } = await authenticated.supabase
      .from('profiles')
      .upsert(
        {
          email: userEmail,
          full_name: profile.fullName.trim(),
          city: profile.city.trim(),
          phone: profile.phone?.trim() || null,
          avatar_url: profile.avatarUrl || null,
          bio: profile.bio?.trim() || null,
          role,
          verified,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (saveError) {
      return NextResponse.json({ error: 'Profile could not be saved. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        fullName: profile.fullName.trim(),
        email: userEmail,
        city: profile.city.trim(),
        role,
        verified,
        phone: profile.phone?.trim() || undefined,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process the profile update.' }, { status: 400 });
  }
}
