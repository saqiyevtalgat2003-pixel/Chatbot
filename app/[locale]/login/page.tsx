import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthShell from '@/components/auth/AuthShell';
import AuthForm from '@/components/auth/AuthForm';
import GoogleButton from '@/components/auth/GoogleButton';
import AuthMaintenanceNotice from '@/components/auth/AuthMaintenanceNotice';
import { getMaintenanceFlags } from '@/lib/settings';

export default async function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Auth');
  const { auth: authMaintenance } = await getMaintenanceFlags();

  return (
    <AuthShell
      locale={locale}
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link href={`/${locale}/signup`} className="text-azure font-semibold hover:underline">
            {t('signupLink')}
          </Link>
        </>
      }
    >
      {authMaintenance ? (
        <AuthMaintenanceNotice />
      ) : (
        <div className="flex flex-col gap-4">
          <GoogleButton locale={locale} label={t('continueWithGoogle')} />
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-ink-soft/15" />
            {t('or')}
            <span className="h-px flex-1 bg-ink-soft/15" />
          </div>
          <AuthForm mode="login" locale={locale} />
        </div>
      )}
    </AuthShell>
  );
}
