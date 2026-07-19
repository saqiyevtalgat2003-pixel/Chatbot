'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type TicketState = { error: string | null; success: boolean };

export async function createTicketAction(
  _prevState: TicketState,
  formData: FormData
): Promise<TicketState> {
  const locale = String(formData.get('locale') || 'kk');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'notAuthenticated', success: false };
  }

  // Ашық (open) тікет бар болса жаңа жіберуге тыйым
  const { data: openTicket } = await supabase
    .from('support_tickets')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .limit(1)
    .maybeSingle();

  if (openTicket) {
    return { error: 'hasOpenTicket', success: false };
  }

  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!subject || !message) {
    return { error: 'fieldsRequired', success: false };
  }

  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    subject,
    message,
    status: 'open',
  });

  if (error) {
    return { error: 'generic', success: false };
  }

  revalidatePath(`/${locale}/dashboard/support`);
  return { error: null, success: true };
}
