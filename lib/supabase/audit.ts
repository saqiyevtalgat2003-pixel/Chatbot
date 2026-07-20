import { createAdminClient } from './admin';

/**
 * Admin панельдегі кез келген жазу әрекетінен кейін audit_log-қа
 * жазба қосу үшін қолданылады. Қате шықса да негізгі әрекетті
 * бұзбау үшін жұту (swallow) жасалады — тек консольге лог жазады.
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('audit_log').insert({
      admin_id: params.adminId,
      action: params.action,
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}
