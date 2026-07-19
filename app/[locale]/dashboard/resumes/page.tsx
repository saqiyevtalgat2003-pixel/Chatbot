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

export default async function ResumesPage({
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
    supabase.from('profiles').select('full_name, is_premium').eq('id', user.id).single(),
    supabase
      .from('resumes')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    getMaintenanceFlags(),
  ]);

  const isPremium = profile?.is_premium ?? false;
  const resumeList = resumes ?? [];

  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? 'kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={profile?.full_name || ''}
        email={user.email ?? ''}
        isPremium={isPremium}
        newResumeMaintenanceEnabled={maintenanceFlags.newResume}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mb-8">
          {t('myResumesTitle')}
        </h1>

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
      </main>
    </div>
  );
}
