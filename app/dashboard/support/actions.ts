'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/supabase/audit';

export async function replyTicketAction(ticketId: string, reply: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('support_tickets')
    .update({
      admin_reply: reply,
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId);

  if (error) return { error: error.message };

  await logAdminAction({
    adminId: admin.id,
    action: 'ticket_replied',
    targetTable: 'support_tickets',
    targetId: ticketId,
    details: { reply },
  });

  revalidatePath('/dashboard/support');
  revalidatePath('/dashboard');
  return { success: true };
}
