import { getTranslations } from 'next-intl/server';

/**
 * Shown instead of the login/signup form when the admin turns on
 * "Тіркелу/кіру тех жұмыс" in the admin dashboard.
 */
export default async function AuthMaintenanceNotice() {
  const t = await getTranslations('Auth');

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="relative mb-5 h-14 w-14">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping motion-reduce:animate-none"
        />
        <div className="relative h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
          <span className="text-2xl animate-maintenance-spin motion-reduce:animate-none inline-block">
            🛠️
          </span>
        </div>
      </div>
      <p className="font-display font-semibold text-ink">{t('maintenanceTitle')}</p>
      <p className="mt-1.5 text-sm text-muted">{t('maintenanceDesc')}</p>
    </div>
  );
}
