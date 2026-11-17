import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export type AuthenticatedSupabase =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; status: 401 | 503; error: string };

function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !key) return null;
  return { url, key };
}

export function createPublicServerSupabase(): SupabaseClient | null {
  const config = getPublicConfig();
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function requireAuthenticatedSupabase(
  request: NextRequest
): Promise<AuthenticatedSupabase> {
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const accessToken = match?.[1]?.trim();

  if (!accessToken) {
    return { ok: false, status: 401, error: 'Authentication required.' };
  }

  const config = getPublicConfig();
  if (!config) {
    return { ok: false, status: 503, error: 'Supabase is not configured.' };
  }

  const supabase = createClient(config.url, config.key, {
    global: {
      headers: { Authorization: 'Bearer ' + accessToken },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email) {
    return { ok: false, status: 401, error: 'Your session is invalid or expired.' };
  }

  return { ok: true, supabase, user: data.user };
}
