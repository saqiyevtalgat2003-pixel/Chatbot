// app/dashboard/users/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function togglePremiumAction(userId: string, isPremium: boolean) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      is_premium: isPremium,
      premium_until: isPremium
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    adminId: admin.id,
    action: isPremium ? 'user_premium_granted' : 'user_premium_revoked',
    targetTable: 'profiles',
    targetId: userId,
  });

  revalidatePath('/dashboard/users');
  revalidatePath('/dashboard');
  return { success: true };
}
