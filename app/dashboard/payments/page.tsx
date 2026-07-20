import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import PaymentRow from './PaymentRow';

export default async function PaymentsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, user_id, type, amount, receipt_url, status, created_at, profiles:user_id(email, full_name)')
    .order('created_at', { ascending: false });

  // receipt_url бағанында тек Storage жолы сақталады (`receipts` bucket жабық),
  // сондықтан әр чек үшін уақытша (1 сағат) қолжетімді signed URL жасаймыз.
  const paymentsWithSignedUrls = payments
    ? await Promise.all(
        payments.map(async (p: any) => {
          if (!p.receipt_url) return p;
          const { data: signed } = await supabase.storage
            .from('receipts')
            .createSignedUrl(p.receipt_url, 60 * 60);
          return { ...p, receipt_url: signed?.signedUrl ?? null };
        })
      )
    : payments;

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Күтудегі төлемдер</h1>
      <p className="text-sm text-muted mb-8">Пайдаланушылардың төлем түбіртектерін тексеру</p>

      {error && (
        <p className="text-danger text-sm mb-4">Қате: {error.message}</p>
      )}

      {!error && (!payments || payments.length === 0) && (
        <p className="text-muted text-sm">Әзірге төлемдер жоқ.</p>
      )}

      <div className="flex flex-col gap-3">
        {paymentsWithSignedUrls?.map((p: any) => (
          <PaymentRow key={p.id} payment={p} />
        ))}
      </div>
    </div>
  );
}
