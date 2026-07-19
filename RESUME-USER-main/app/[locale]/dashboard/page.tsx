import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getMaintenanceFlags } from '@/lib/settings';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ResumeCard from '@/components/dashboard/ResumeCard';

const FREE_RESUME_LIMIT = 1;

const DATE_LOCALES: Record<string, string> = {
  kk: 'kk-KZ',
  ru: 'ru-RU',
  uz: 'uz-UZ',
};

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, { data: resumes }, maintenanceFlags] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, is_premium, premium_until')
      .eq('id', user.id)
      .single(),
    supabase
      .from('resumes')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    getMaintenanceFlags(),
  ]);

  const fullName = profile?.full_name || user.email?.split('@')[0] || '';
  const isPremium = profile?.is_premium ?? false;
  const resumeList = resumes ?? [];
  const newResumeMaintenanceEnabled = maintenanceFlags.newResume;

  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? 'kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={fullName}
        email={user.email ?? ''}
        isPremium={isPremium}
        newResumeMaintenanceEnabled={newResumeMaintenanceEnabled}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mb-1">
          {fullName ? t('greeting', { name: fullName }) : t('greetingFallback')}
        </h1>

        {/* Тариф жолағы */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-soft/10 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${isPremium ? 'bg-success' : 'bg-muted'}`}
            />
            <span className="font-medium text-sm text-ink">
              {isPremium ? t('tariffPremiumLabel') : t('tariffFreeLabel')}
            </span>
            {isPremium && profile?.premium_until && (
              <span className="text-xs text-muted font-mono">
                · {t('tariffPremiumUntil', { date: dateFormatter.format(new Date(profile.premium_until)) })}
              </span>
            )}
          </div>
          {!isPremium && (
            <Link
              href={`/${locale}/pricing`}
              className="text-sm font-semibold text-azure hover:text-azure-deep transition-colors"
            >
              {t('upgradeCta')}
            </Link>
          )}
        </div>

        {/* Жаңа резюме CTA */}
        {newResumeMaintenanceEnabled ? (
          <div className="mt-6 flex items-center justify-between rounded-card bg-ink-soft/10 text-ink-soft/60 px-6 py-5 cursor-not-allowed">
            <div>
              <p className="font-display font-semibold text-lg">{t('newResumeTitle')}</p>
              <p className="text-sm text-ink-soft/50 mt-1">{t('newResumeMaintenanceDesc')}</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-gold-deep bg-gold/15 px-2 py-1 rounded shrink-0">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-gold-deep animate-pulse motion-reduce:animate-none"
              />
              {t('newResumeMaintenanceBadge')}
            </span>
          </div>
        ) : (
          <Link
            href={`/${locale}/dashboard/new`}
            className="mt-6 flex items-center justify-between rounded-card bg-ink text-bg px-6 py-5 hover:bg-ink-soft transition-colors group"
          >
            <div>
              <p className="font-display font-semibold text-lg">{t('newResumeTitle')}</p>
              <p className="text-sm text-bg/70 mt-1">{t('newResumeDesc')}</p>
            </div>
            <span
              aria-hidden="true"
              className="text-2xl group-hover:translate-x-1 transition-transform motion-reduce:transform-none"
            >
              ＋
            </span>
          </Link>
        )}

        {/* Резюмелер тізімі */}
        <section className="mt-10">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">{t('myResumesTitle')}</h2>

          {resumeList.length === 0 ? (
            <div className="rounded-card border border-dashed border-ink-soft/20 px-6 py-12 text-center">
              <p className="font-medium text-ink">{t('emptyTitle')}</p>
              <p className="text-sm text-muted mt-1">{t('emptyDesc')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumeList.map((resume, index) => (
                <ResumeCard
                  key={resume.id}
                  locale={locale}
                  id={resume.id}
                  title={resume.title || t('untitledResume')}
                  updatedAt={dateFormatter.format(new Date(resume.updated_at))}
                  locked={!isPremium && index >= FREE_RESUME_LIMIT}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
