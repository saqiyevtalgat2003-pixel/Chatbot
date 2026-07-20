import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

const ACTION_LABEL: Record<string, string> = {
  payment_approved: 'Төлемді растады',
  payment_rejected: 'Төлемнен бас тартты',
  user_premium_granted: 'Пайдаланушыға premium берді',
  user_premium_revoked: 'Пайдаланушыдан premium алды',
  template_marked_premium: 'Шаблонды premium қылды',
  template_marked_free: 'Шаблонды тегін қылды',
  ticket_replied: 'Тікетке жауап берді',
  resume_deleted: 'Резюмені жойды',
  settings_updated: 'Баптауларды өзгертті',
};

export default async function AuditLogPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('id, action, target_table, target_id, details, created_at, profiles:admin_id(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Audit log</h1>
      <p className="text-sm text-muted mb-8">Admin әрекеттерінің соңғы тарихы (соңғы 200 жазба)</p>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      {!error && (!logs || logs.length === 0) && (
        <p className="text-muted text-sm">Әзірге жазба жоқ. Admin алғашқы әрекетті жасаған соң осында пайда болады.</p>
      )}

      <div className="flex flex-col gap-2">
        {logs?.map((log: any) => (
          <div
            key={log.id}
            className="rounded-card border border-ink-soft/10 bg-white px-5 py-3 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm text-ink font-medium">
                {ACTION_LABEL[log.action] || log.action}
              </p>
              <p className="text-xs text-muted truncate">
                {log.profiles?.full_name || log.profiles?.email || 'Белгісіз admin'}
                {log.target_table && ` · ${log.target_table}`}
                {log.target_id && ` · ${log.target_id.slice(0, 8)}…`}
              </p>
            </div>
            <span className="text-xs text-muted shrink-0">
              {new Date(log.created_at).toLocaleString('kk-KZ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
