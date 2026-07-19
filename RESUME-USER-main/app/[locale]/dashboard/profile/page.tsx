import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getMaintenanceFlags } from '@/lib/settings';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileForm from '@/components/dashboard/ProfileForm';

export default async function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Profile');

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, maintenanceFlags] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, is_premium, preferred_language')
      .eq('id', user.id)
      .single(),
    getMaintenanceFlags(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        locale={locale}
        fullName={profile?.full_name || ''}
        email={user.email ?? ''}
        isPremium={profile?.is_premium ?? false}
        newResumeMaintenanceEnabled={maintenanceFlags.newResume}
      />

      <main className="flex-1 max-w-lg w-full mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-ink mb-1">
          {t('title')}
        </h1>
        <p className="text-sm text-muted mb-8">{t('subtitle')}</p>

        <ProfileForm
          locale={locale}
          email={user.email ?? ''}
          fullName={profile?.full_name || ''}
          preferredLanguage={profile?.preferred_language || locale}
        />
      </main>
    </div>
  );
}
