import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getTemplates } from '@/lib/templates';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getMaintenanceFlags } from '@/lib/settings';
import TemplateThumbnail from '@/components/TemplateThumbnail';

export default async function TemplatesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('TemplatesPage');

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, templates, maintenanceFlags] = await Promise.all([
    supabase.from('profiles').select('full_name, is_premium').eq('id', user.id).single(),
    getTemplates(),
    getMaintenanceFlags(),
  ]);

  const isPremium = profile?.is_premium ?? false;
  const fullName = profile?.full_name || user.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={fullName}
        email={user.email ?? ''}
        isPremium={isPremium}
        newResumeMaintenanceEnabled={maintenanceFlags.newResume}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <Link
          href={`/${locale}/dashboard`}
          className="text-sm text-ink-soft hover:text-azure transition-colors"
        >
          ← {t('backToDashboard')}
        </Link>

        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mt-3">{t('title')}</h1>
        <p className="text-sm text-muted mt-1">{t('subtitle')}</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((template) => {
            const locked = template.isPremium && !isPremium;
            return (
              <div
                key={template.id}
                className="group relative bg-white rounded-card border border-ink-soft/10 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] relative">
                  <TemplateThumbnail slug={template.slug} />
                  {locked && (
                    <div className="absolute inset-0 bg-ink/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 text-center px-4">
                      <span className="text-2xl" aria-hidden="true">
                        🔒
                      </span>
                      <p className="text-xs text-white/90">{t('lockedNote')}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-ink">{template.name}</span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                        template.isPremium ? 'bg-gold/20 text-gold-deep' : 'bg-success/15 text-success'
                      }`}
                    >
                      {template.isPremium ? t('premiumBadge') : t('freeBadge')}
                    </span>
                  </div>
                  {locked ? (
                    <Link
                      href={`/${locale}/pricing`}
                      className="text-sm font-semibold text-azure hover:text-azure-deep transition-colors"
                    >
                      {t('unlockAction')} →
                    </Link>
                  ) : (
                    <Link
                      href={`/${locale}/dashboard/new?template=${template.id}`}
                      className="text-sm font-semibold text-ink hover:text-azure transition-colors"
                    >
                      {t('useAction')} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
