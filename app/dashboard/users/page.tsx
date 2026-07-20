// app/dashboard/users/page.tsx
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import UserRow from './UserRow';

export default async function UsersPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_premium, is_admin, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Пайдаланушылар</h1>
      <p className="text-sm text-muted mb-8">Барлық тіркелген пайдаланушылар тізімі</p>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      {!error && (!users || users.length === 0) && (
        <p className="text-muted text-sm">Әзірге пайдаланушылар жоқ.</p>
      )}

      {users && users.length > 0 && (
        <div className="rounded-card border border-ink-soft/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide bg-bg">
                <th className="px-4 py-3 font-medium">Пайдаланушы</th>
                <th className="px-4 py-3 font-medium">Тіркелген күні</th>
                <th className="px-4 py-3 font-medium">Тариф</th>
                <th className="px-4 py-3 font-medium">Рөлі</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
