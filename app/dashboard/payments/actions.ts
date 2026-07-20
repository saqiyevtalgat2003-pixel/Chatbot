'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function reviewPaymentAction(
  paymentId: string,
  decision: 'approved' | 'rejected'
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  // Алдымен төлемнің өзін оқып аламыз — type және user_id керек болады
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, user_id, type, status')
    .eq('id', paymentId)
    .single();

  if (fetchError || !payment) {
    return { error: fetchError?.message ?? 'Төлем табылмады' };
  }

  if (payment.status !== 'pending') {
    return { error: 'Бұл төлем бұрын қаралған' };
  }

  const { error } = await supabase
    .from('payments')
    .update({
      status: decision,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) {
    return { error: error.message };
  }

  // Растаса — тарифке байланысты пайдаланушыға нақты құқық ашамыз
  if (decision === 'approved') {
    if (payment.type === 'premium_month') {
      const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_premium: true, premium_until: premiumUntil })
        .eq('id', payment.user_id);

      if (profileError) {
        // Төлем статусы жаңарса да, пайдаланушыға premium берілмесе — админге хабарлаймыз
        return { error: `Төлем расталды, бірақ premium берілмеді: ${profileError.message}` };
      }
    }
    // 'single_resume' түріне жеке резюме лимитін ашатын өріс схемада жоқ —
    // бұл кейін жеке миграция/өріс қосуды қажет етеді.
  }

  await logAdminAction({
    adminId: admin.id,
    action: decision === 'approved' ? 'payment_approved' : 'payment_rejected',
    targetTable: 'payments',
    targetId: paymentId,
    details: decision === 'approved' ? { type: payment.type } : undefined,
  });

  revalidatePath('/dashboard/payments');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/users');
  return { success: true };
}
