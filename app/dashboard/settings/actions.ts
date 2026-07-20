'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function updateSettingAction(key: string, value: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  // value жолды JSON ретінде сақтаймыз (сан/буль/жол бәрі jsonb өрісіне сияды)
  let parsed: unknown = value;
  if (value === 'true' || value === 'false') {
    parsed = value === 'true';
  } else if (!Number.isNaN(Number(value)) && value.trim() !== '') {
    parsed = Number(value);
  }

  const { error } = await supabase
    .from('settings')
    .update({ value: parsed, updated_at: new Date().toISOString(), updated_by: admin.id })
    .eq('key', key);

  if (error) return { error: error.message };

  await logAdminAction({
    adminId: admin.id,
    action: 'settings_updated',
    targetTable: 'settings',
    details: { key, value: parsed },
  });

  revalidatePath('/dashboard/settings');
  return { success: true };
}
