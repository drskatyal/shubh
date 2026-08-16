import { isSupabaseConfigured } from './config';
import { supabaseRequest } from './client';
import { setAuthSession, type AuthUser } from './session';

export type AuthResult =
  | { ok: true; user?: AuthUser }
  | { ok: false; reason: 'not_configured' | 'invalid_phone' | 'request_failed' };

/** India E.164. Ten digits, or already +91. */
export function toIndiaE164(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (trimmed.startsWith('+91') && digits.length === 12) return `+${digits}`;
  return null;
}

export async function sendPhoneOtp(phone: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not_configured' };
  const e164 = toIndiaE164(phone);
  if (!e164) return { ok: false, reason: 'invalid_phone' };
  const res = await supabaseRequest('/auth/v1/otp', {
    method: 'POST',
    body: JSON.stringify({ phone: e164 }),
  });
  if (!res) return { ok: false, reason: 'not_configured' };
  if (!res.ok) return { ok: false, reason: 'request_failed' };
  return { ok: true };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not_configured' };
  const e164 = toIndiaE164(phone);
  if (!e164) return { ok: false, reason: 'invalid_phone' };
  const res = await supabaseRequest('/auth/v1/verify', {
    method: 'POST',
    body: JSON.stringify({ phone: e164, token, type: 'sms' }),
  });
  if (!res) return { ok: false, reason: 'not_configured' };
  if (!res.ok) return { ok: false, reason: 'request_failed' };
  try {
    const data = (await res.json()) as {
      access_token?: string;
      user?: { id?: string; phone?: string | null };
    };
    if (!data.access_token || !data.user?.id) return { ok: false, reason: 'request_failed' };
    const user: AuthUser = { id: data.user.id, phone: data.user.phone ?? e164 };
    await setAuthSession({ user, accessToken: data.access_token });
    return { ok: true, user };
  } catch {
    return { ok: false, reason: 'request_failed' };
  }
}
