import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role клиент — RLS-ті айналып өтеді, барлық пайдаланушылардың
 * деректерін көру/өзгерту үшін қолданылады.
 *
 * ҚАУІПСІЗДІК ЕСКЕРТУІ: бұл клиентті тек `requireAdmin()` арқылы
 * is_admin=true екені расталған server action/route handler ішінде
 * қолдан. Клиент компоненттерге немесе браузерге ешқашан жеткізбе.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
