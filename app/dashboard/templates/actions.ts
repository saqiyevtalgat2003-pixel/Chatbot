'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function toggleTemplatePremiumAction(templateId: string, nextValue: boolean) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('templates')
    .update({ is_premium: nextValue })
    .eq('id', templateId);

  if (error) return { error: error.message };

  await logAdminAction({
    adminId: admin.id,
    action: nextValue ? 'template_marked_premium' : 'template_marked_free',
    targetTable: 'templates',
    targetId: templateId,
  });

  revalidatePath('/dashboard/templates');
  return { success: true };
}
