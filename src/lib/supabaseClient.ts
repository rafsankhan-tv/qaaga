import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseConfig(): { url: string; key: string } {
  let storedUrl = '';
  let storedKey = '';

  if (typeof window !== 'undefined') {
    try {
      storedUrl = localStorage.getItem('qaaga_supabase_url') || '';
      storedKey = localStorage.getItem('qaaga_supabase_key') || '';
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  const url = storedUrl.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    storedKey.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return { url, key };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  // Fail closed: never silently connect to an old or unrelated project.
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
    console.warn('Supabase client initialization failed:', err);
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
      // Storage can be unavailable in restricted browser contexts.
    }
  }
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const { url, key } = getSupabaseConfig();
  const startTime = Date.now();
  const keyPrefix = key ? `${key.slice(0, 12)}…` : 'Not configured';

  if (!url || !key) {
    return {
      connected: false,
      url: url || 'Not configured',
      keyPrefix,
      latencyMs: 0,
      message: 'Supabase URL or publishable key is missing.',
    };
  }

  try {
    const client = getSupabase();
    if (!client) throw new Error('Failed to initialize Supabase client');
    const { error } = await client.auth.getSession();
    const latencyMs = Date.now() - startTime;

    if (error) {
      return { connected: false, url, keyPrefix, latencyMs, message: `Connection error: ${error.message}` };
    }

    return {
      connected: true,
      url,
      keyPrefix,
      latencyMs,
      message: `Supabase client reachable (${latencyMs}ms)`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      url,
      keyPrefix,
      latencyMs,
      message: err?.message || 'Unable to reach Supabase.',
    };
  }
}
