'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMaintenanceFlags } from '@/lib/settings';

export type AuthState = { error: string | null };

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const locale = String(formData.get('locale') || 'kk');
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  // Defense in depth: even if someone bypasses the UI notice, the server
  // action itself refuses to authenticate while auth maintenance is on.
  const { auth: authMaintenance } = await getMaintenanceFlags();
  if (authMaintenance) {
    return { error: 'maintenance' };
  }

  const supabase = createClient();

  // Rate limit: 15 минутта осы email үшін 5-тен көп сәтсіз әрекетке жол берілмейді.
  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    'check_login_rate_limit',
    { p_identifier: email }
  );

  if (rateLimitError) {
    return { error: 'serverError' };
  }
  if (allowed === false) {
    return { error: 'tooManyAttempts' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Сәтті кіру — осы email үшін есептегішті тазалау
  await supabase.rpc('reset_login_rate_limit', { p_identifier: email });

  revalidatePath(`/${locale}`, 'layout');
  redirect(`/${locale}/dashboard`);
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const locale = String(formData.get('locale') || 'kk');
  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const { auth: authMaintenance } = await getMaintenanceFlags();
  if (authMaintenance) {
    return { error: 'maintenance' };
  }

  if (password.length < 10) {
    return { error: 'weakPassword' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, preferred_language: locale },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?locale=${locale}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Email confirmation is on: no active session yet.
  if (data.session === null) {
    redirect(`/${locale}/signup/check-email`);
  }

  revalidatePath(`/${locale}`, 'layout');
  redirect(`/${locale}/dashboard`);
}

export async function signInWithGoogleAction(locale: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?locale=${locale}`,
    },
  });

  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth`);
  }

  redirect(data.url);
}

export async function logoutAction(locale: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath(`/${locale}`, 'layout');
  redirect(`/${locale}`);
}
