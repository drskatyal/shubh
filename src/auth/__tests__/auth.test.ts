import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { isSupabaseConfigured } from '../config';
import { sendPhoneOtp, toIndiaE164, verifyPhoneOtp } from '../phone';
import { getAuthUser, resetAuthMemory } from '../session';

describe('auth placeholders', () => {
  it('treats empty keys as unsigned and does not send OTP', async () => {
    resetAuthMemory();
    expect(isSupabaseConfigured()).toBe(false);
    expect(await getAuthUser()).toBeNull();
    expect(await sendPhoneOtp('9876543210')).toEqual({
      ok: false,
      reason: 'not_configured',
    });
    expect(await verifyPhoneOtp('9876543210', '123456')).toEqual({
      ok: false,
      reason: 'not_configured',
    });
  });

  it('normalizes India phone numbers', () => {
    expect(toIndiaE164('9876543210')).toBe('+919876543210');
    expect(toIndiaE164('+91 98765 43210')).toBe('+919876543210');
    expect(toIndiaE164('919876543210')).toBe('+919876543210');
    expect(toIndiaE164('123')).toBeNull();
  });
});

describe('schema files', () => {
  const sql = readFileSync(
    new URL('../../../supabase/migrations/20260815223400_init_profiles_credits_reminders.sql', import.meta.url),
    'utf8',
  );

  it('never reads a service role in the app client', () => {
    const env = readFileSync(new URL('../../config/env.ts', import.meta.url), 'utf8');
    const client = readFileSync(new URL('../client.ts', import.meta.url), 'utf8');
    expect(env).not.toMatch(/service_role|SERVICE_ROLE/);
    expect(client).not.toMatch(/service_role|SERVICE_ROLE/);
  });

  it('declares the three tables, RLS, and private consume', () => {
    expect(sql).toContain('create table public.profiles');
    expect(sql).toContain('create table public.credit_ledger');
    expect(sql).toContain('create table public.reminder_prefs');
    expect(sql).toContain('ask_consume');
    expect(sql).toContain('pack_grant');
    expect(sql).toContain('monthly_grant');
    expect(sql).toContain('monthly_reset');
    expect(sql).toContain('enable row level security');
    expect(sql).toContain('private.consume_ask_credit');
    expect(sql).toContain('security definer');
    expect(sql).not.toMatch(/remaining_count|asks_remaining|remaining_asks/);
    expect(sql).not.toMatch(/janam|naam|birth_date|birth_time|birth_place/i);
  });
});
