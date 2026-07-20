'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'fieldsRequired' };
  }

  const supabase = createClient();

  // Rate limit: 15 минутта осы email үшін 5-тен көп сәтсіз әрекетке жол берілмейді.
  // Admin панель — жоғары мәртебелі мақсат болғандықтан бұл әсіресе маңызды.
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'invalidCredentials' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    return { error: 'notAdmin' };
  }

  // Сәтті кіру — осы email үшін есептегішті тазалау
  await supabase.rpc('reset_login_rate_limit', { p_identifier: email });

  redirect('/dashboard');
}
