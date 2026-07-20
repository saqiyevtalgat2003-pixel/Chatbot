'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function deleteResumeAction(resumeId: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
  if (error) return { error: error.message };

  await logAdminAction({
    adminId: admin.id,
    action: 'resume_deleted',
    targetTable: 'resumes',
    targetId: resumeId,
  });

  revalidatePath('/dashboard/resumes');
  revalidatePath('/dashboard');
  return { success: true };
}
