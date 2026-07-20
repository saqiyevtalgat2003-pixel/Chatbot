import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import TicketCard from './TicketCard';

export default async function SupportPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('id, subject, message, status, admin_reply, created_at, profiles:user_id(email, full_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Қолдау тікеттері</h1>
      <p className="text-sm text-muted mb-8">Пайдаланушылардың сұрақтары мен өтініштері</p>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      {!error && (!tickets || tickets.length === 0) && (
        <p className="text-muted text-sm">Әзірге тікеттер жоқ.</p>
      )}

      <div className="flex flex-col gap-3">
        {tickets?.map((t: any) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
