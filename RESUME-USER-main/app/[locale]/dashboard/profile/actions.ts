'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileState = { error: string | null; success: boolean };

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const locale = String(formData.get('locale') || 'kk');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'notAuthenticated', success: false };
  }

  const fullName = String(formData.get('fullName') || '').trim();
  const preferredLanguage = String(formData.get('preferredLanguage') || locale);

  if (!fullName) {
    return { error: 'nameRequired', success: false };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, preferred_language: preferredLanguage })
    .eq('id', user.id);

  if (error) {
    return { error: 'generic', success: false };
  }

  revalidatePath(`/${locale}/dashboard/profile`);
  revalidatePath(`/${locale}/dashboard`);
  return { error: null, success: true };
}
