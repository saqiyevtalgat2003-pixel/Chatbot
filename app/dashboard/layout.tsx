import { requireAdmin } from '@/lib/supabase/admin-guard';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <Sidebar fullName={admin.fullName} email={admin.email} />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
