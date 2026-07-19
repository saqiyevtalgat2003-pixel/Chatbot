'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getPremiumPriceKzt } from '@/lib/settings';

export type PaymentState = { error: string | null; success: boolean };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function submitReceiptAction(
  _prevState: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const locale = String(formData.get('locale') || 'kk');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'notAuthenticated', success: false };
  }

  const file = formData.get('receipt');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'fileRequired', success: false };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'fileTooLarge', success: false };
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'fileInvalidType', success: false };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: 'uploadFailed', success: false };
  }

  const amount = await getPremiumPriceKzt();

  const { error: insertError } = await supabase.from('payments').insert({
    user_id: user.id,
    type: 'premium_month',
    amount,
    receipt_url: path,
    status: 'pending',
  });

  if (insertError) {
    return { error: 'generic', success: false };
  }

  revalidatePath(`/${locale}/pricing`);
  return { error: null, success: true };
}
