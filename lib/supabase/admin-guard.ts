import { redirect } from 'next/navigation';
import { createClient } from './server';

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
};

/**
 * Ағымдағы сессияны тексереді және профильдің is_admin=true екенін
 * растайды. Расталмаса — /login-ге бағыттайды.
 *
 * Server Component / Server Action ішінде әрдайым осыны шақыр,
 * тек middleware-ге сенбе (middleware тек сессияны жаңартады).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/login?error=not_admin');
  }

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile.full_name || '',
  };
}
