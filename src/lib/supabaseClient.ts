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

export interface SupabaseTestResult {
  connected: boolean;
  url: string;
  keyPrefix: string;
  latencyMs: number;
  message: string;
  details?: Record<string, any>;
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('qaaga_supabase_url', url.trim());
      localStorage.setItem('qaaga_supabase_key', key.trim());
    } catch {
      // ignore
    }
  }
  // Clear cached client so next getSupabase() reinitializes
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const { url, key } = getSupabaseConfig();
  const startTime = Date.now();
  const keyPrefix = key ? `${key.slice(0, 16)}...` : 'None';

  if (!url || !key) {
    return {
      connected: false,
      url: url || 'Not configured',
      keyPrefix,
      latencyMs: 0,
      message: 'Supabase URL or Key is missing.',
    };
  }

  try {
    const client = getSupabase();
    if (!client) {
      throw new Error('Failed to initialize Supabase client');
    }

    const { data, error } = await client.auth.getSession();
    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        connected: false,
        url,
        keyPrefix,
        latencyMs,
        message: `Connection error: ${error.message}`,
      };
    }

    return {
      connected: true,
      url,
      keyPrefix,
      latencyMs,
      message: `Supabase connected successfully (${latencyMs}ms)`,
      details: { hasSession: Boolean(data?.session) },
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      url,
      keyPrefix,
      latencyMs,
      message: `Notice: ${err?.message || 'Network/CORS unreachable'}`,
    };
  }
}
