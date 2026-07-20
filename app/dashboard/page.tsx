import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

async function getStats() {
  const supabase = createAdminClient();

  const [users, premiumUsers, resumes, pendingPayments, openTickets] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('resumes').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return {
    totalUsers: users.count ?? 0,
    premiumUsers: premiumUsers.count ?? 0,
    totalResumes: resumes.count ?? 0,
    pendingPayments: pendingPayments.count ?? 0,
    openTickets: openTickets.count ?? 0,
  };
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-5">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-gold-deep' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Сәлем, {admin.fullName || admin.email}</h1>
      <p className="text-sm text-muted mb-8">KZ Resume жалпы статистикасы</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Барлық пайдаланушылар" value={stats.totalUsers} />
        <StatCard label="Premium пайдаланушылар" value={stats.premiumUsers} accent />
        <StatCard label="Барлық резюмелер" value={stats.totalResumes} />
        <StatCard label="Күтудегі төлемдер" value={stats.pendingPayments} accent={stats.pendingPayments > 0} />
        <StatCard label="Ашық тікеттер" value={stats.openTickets} accent={stats.openTickets > 0} />
      </div>
    </div>
  );
}
