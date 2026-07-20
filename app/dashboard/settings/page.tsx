import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import SettingRow from './SettingRow';
import MaintenanceToggle from './MaintenanceToggle';

const SETTING_LABEL: Record<string, string> = {
  premium_price_kzt: 'Premium бағасы (₸)',
  premium_duration_days: 'Premium ұзақтығы (күн)',
  trial_enabled: 'Тегін сынақ мерзімі қосулы ма',
};

// Осы кілттер төмендегі "Тех жұмыс режимі" бөлімінде арнайы қосқыш ретінде
// көрсетіледі, сондықтан оларды жалпы тізімнен алып тастаймыз.
const MAINTENANCE_SETTINGS: Array<{ key: string; label: string; description: string }> = [
  {
    key: 'maintenance_auth_enabled',
    label: 'Кіру / тіркелу тех жұмыс',
    description: 'Қосылса, пайдаланушылар кіру және тіркелу беттерінде "тех жұмыс" хабарламасын көреді.',
  },
  {
    key: 'maintenance_new_resume_enabled',
    label: 'Жаңа резюме жасау тех жұмыс',
    description: 'Қосылса, "Жаңа резюме жасау" батырмасы уақытша өшіріледі.',
  },
  {
    key: 'maintenance_full_enabled',
    label: 'Толық сайт тех жұмыс',
    description: 'Қосылса, барлық пайдаланушыға толық экранды "тех жұмыс" беті көрсетіледі.',
  },
];

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from('settings')
    .select('key, value, updated_at')
    .order('key');

  const maintenanceKeys = new Set(MAINTENANCE_SETTINGS.map((m) => m.key));
  const genericSettings = settings?.filter((s) => !maintenanceKeys.has(s.key));
  const maintenanceValues = new Map(settings?.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Баптаулар</h1>
      <p className="text-sm text-muted mb-8">Admin аккаунт және жоба баптаулары</p>

      <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-5 max-w-md mb-6">
        <p className="text-sm text-muted mb-1">Аты</p>
        <p className="font-medium text-ink mb-4">{admin.fullName || '—'}</p>
        <p className="text-sm text-muted mb-1">Email</p>
        <p className="font-medium text-ink">{admin.email}</p>
      </div>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      <h2 className="font-semibold text-ink mb-3">Тех жұмыс режимі</h2>
      <div className="flex flex-col gap-3 max-w-md mb-8">
        {MAINTENANCE_SETTINGS.map((m) => (
          <MaintenanceToggle
            key={m.key}
            settingKey={m.key}
            label={m.label}
            description={m.description}
            initialValue={maintenanceValues.get(m.key) === true}
          />
        ))}
      </div>

      <h2 className="font-semibold text-ink mb-3">Жоба баптаулары</h2>
      <div className="flex flex-col gap-3 max-w-md">
        {genericSettings?.map((s) => (
          <SettingRow
            key={s.key}
            settingKey={s.key}
            label={SETTING_LABEL[s.key] || s.key}
            value={s.value}
          />
        ))}
      </div>
    </div>
  );
}
