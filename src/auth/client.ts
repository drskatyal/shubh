import { getAuthSession } from './session';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from './config';

/**
 * Thin fetch wrapper. Returns null when URL/anon key are empty so the app
 * never constructs a client against a made-up project.
 */
export async function supabaseRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response | null> {
  if (!isSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) return null;
  const session = await getAuthSession();
  const headers = new Headers(init.headers);
  headers.set('apikey', anon);
  headers.set('Authorization', `Bearer ${session?.accessToken ?? anon}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${url.replace(/\/$/, '')}${path}`, { ...init, headers });
}
