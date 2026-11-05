import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_KEY = 'sb_publishable_d7m4vOhy66QCwYxlspMZjQ_dyNAdFbM';

export function getSupabaseConfig(): { url: string; key: string } {
  let storedUrl = '';
  let storedKey = '';

  if (typeof window !== 'undefined') {
    try {
      storedUrl = localStorage.getItem('qaaga_supabase_url') || '';
      storedKey = localStorage.getItem('qaaga_supabase_key') || '';
    } catch {
      // ignore
    }
  }

  const url =
    storedUrl.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://d7m4vohy66qcwyxlspmz.supabase.co'; // Fallback inferred endpoint

  const key =
    storedKey.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  return { url, key };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) return null;

  if (cachedClient && url === lastUrl && key === lastKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Supabase client initialization notice:', err);
    return null;
  }
}
